-- RoleWithAI Database Schema for Supabase (PostgreSQL)
-- Free tier: 500MB storage, sufficient for thousands of ghosting reports

-- Ghosting Reports Table
-- Stores community-reported ghosting incidents
CREATE TABLE IF NOT EXISTS ghosting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  job_title TEXT,
  job_url TEXT,
  platform TEXT DEFAULT 'linkedin',
  applied_date DATE,
  days_since_application INTEGER,
  got_response BOOLEAN DEFAULT false,
  user_id TEXT, -- Optional: for authenticated users
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Ghost Risk Cache
-- Aggregated ghost risk scores per company (updated daily)
CREATE TABLE IF NOT EXISTS company_ghost_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT UNIQUE NOT NULL,
  total_reports INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0, -- Percentage
  ghost_signal_score INTEGER DEFAULT 0, -- 0-100, lower is better
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Impact Points
-- Track user contributions to the community
CREATE TABLE IF NOT EXISTS user_impact_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  total_points INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Truth Scores Cache
-- Cache calculated truth scores for jobs (TTL: 7 days)
CREATE TABLE IF NOT EXISTS job_truth_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_url TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  job_title TEXT,
  truth_score INTEGER NOT NULL,
  ghost_risk TEXT NOT NULL, -- 'low', 'medium', 'high'
  age_factor INTEGER,
  response_rate INTEGER,
  ghost_signal INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ghosting_reports_company ON ghosting_reports(company);
CREATE INDEX IF NOT EXISTS idx_ghosting_reports_reported_at ON ghosting_reports(reported_at);
CREATE INDEX IF NOT EXISTS idx_ghosting_reports_user_id ON ghosting_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_company_ghost_risk_company ON company_ghost_risk(company);
CREATE INDEX IF NOT EXISTS idx_company_ghost_risk_last_updated ON company_ghost_risk(last_updated);

CREATE INDEX IF NOT EXISTS idx_job_truth_scores_url ON job_truth_scores(job_url);
CREATE INDEX IF NOT EXISTS idx_job_truth_scores_expires_at ON job_truth_scores(expires_at);

-- Function to update company ghost risk (called after new report)
CREATE OR REPLACE FUNCTION update_company_ghost_risk()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO company_ghost_risk (company, total_reports, response_rate, last_updated)
  SELECT 
    NEW.company,
    COUNT(*) as total_reports,
    ROUND(AVG(CASE WHEN got_response THEN 100.0 ELSE 0.0 END), 2) as response_rate,
    NOW()
  FROM ghosting_reports
  WHERE company = NEW.company
    AND reported_at > NOW() - INTERVAL '30 days'
  ON CONFLICT (company) 
  DO UPDATE SET
    total_reports = EXCLUDED.total_reports,
    response_rate = EXCLUDED.response_rate,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update company ghost risk
CREATE TRIGGER trigger_update_company_ghost_risk
AFTER INSERT ON ghosting_reports
FOR EACH ROW
EXECUTE FUNCTION update_company_ghost_risk();

-- Function to clean expired truth scores
CREATE OR REPLACE FUNCTION clean_expired_truth_scores()
RETURNS void AS $$
BEGIN
  DELETE FROM job_truth_scores WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE ghosting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_ghost_risk ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impact_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_truth_scores ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads for ghost risk data (public good)
CREATE POLICY "Allow public read on company_ghost_risk" ON company_ghost_risk
  FOR SELECT USING (true);

CREATE POLICY "Allow public read on job_truth_scores" ON job_truth_scores
  FOR SELECT USING (expires_at > NOW());

-- Allow anonymous inserts for ghosting reports (crowdsourcing)
CREATE POLICY "Allow public insert on ghosting_reports" ON ghosting_reports
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own impact points
CREATE POLICY "Users can read own impact points" ON user_impact_points
  FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NULL);
