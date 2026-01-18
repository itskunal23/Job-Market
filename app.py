"""
RoleWithAI Backend Server
Flask-based REST API server for truth score calculation and ghosting reports
"""

import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import uuid
from werkzeug.utils import secure_filename

# Add scripts directory to path for imports
scripts_dir = Path(__file__).parent / "scripts"
sys.path.insert(0, str(scripts_dir))

try:
    from truth_score_calculator import calculate_truth_score, get_days_since_posted
except ImportError:
    print("Warning: Could not import truth_score_calculator. Make sure scripts/truth_score_calculator.py exists.")
    sys.exit(1)

try:
    from resume_parser import ResumeParser, ResumeData, parse_resume
    from job_scraper import JobScraper, JobPosting
    from job_matcher import JobMatcher, MatchScore
    RESUME_PARSING_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Resume parsing modules not available: {e}")
    print("Some features may be limited. Install required packages: pip install PyPDF2 python-docx beautifulsoup4")
    RESUME_PARSING_AVAILABLE = False

try:
    from market_research import MarketResearcher, get_market_insights, get_role_market_data
    MARKET_RESEARCH_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Market research module not available: {e}")
    MARKET_RESEARCH_AVAILABLE = False

try:
    from job_scraper import JobScraper
    JOB_SCRAPER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Job scraper not available: {e}")
    JOB_SCRAPER_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configuration
PORT = int(os.environ.get('PORT', 5000))
HOST = os.environ.get('HOST', '0.0.0.0')
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

# File upload configuration
UPLOAD_FOLDER = Path(__file__).parent / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# In-memory storage for user data (in production, use a database)
user_data_store = {}
user_preferences_store = {}  # Store user role preferences

# Cache for market ticker data
market_ticker_cache = {
    'data': None,
    'timestamp': None,
    'ttl': 300  # Cache for 5 minutes (300 seconds)
}


def calculate_age_factor(posted_date: str) -> float:
    """Calculate age factor (0-100) based on posting date"""
    if not posted_date:
        return 50.0  # Neutral if no date provided
    
    days_old = get_days_since_posted(posted_date)
    
    # Fresh postings (< 7 days) get high score
    if days_old < 7:
        return 100.0
    # Recent postings (7-14 days) get good score
    elif days_old < 14:
        return 75.0
    # Moderate postings (14-30 days) get medium score
    elif days_old < 30:
        return 50.0
    # Old postings (> 30 days) get low score
    else:
        return 25.0


def get_response_rate(company: str) -> float:
    """Get response rate from community data (0-100)"""
    # TODO: Integrate with Supabase to get actual community data
    # For now, return a default value
    return 50.0


def get_ghost_signal(company: str, title: str) -> float:
    """Get ghost signal from external sources (0-100, lower is better)"""
    # TODO: Integrate with external APIs (Tavily, etc.)
    # For now, return a default value
    return 30.0


def determine_ghost_risk(truth_score: int) -> str:
    """Determine ghost risk level from truth score"""
    if truth_score >= 80:
        return 'LOW'
    elif truth_score >= 50:
        return 'MEDIUM'
    else:
        return 'HIGH'


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'RoleWithAI Backend',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/truth-score', methods=['POST'])
def calculate_truth_score_endpoint():
    """
    Calculate truth score for a job posting
    
    Expected JSON body:
    {
        "title": "Job Title",
        "company": "Company Name",
        "description": "Job description (optional)",
        "postedDate": "2026-01-15T00:00:00Z",
        "url": "https://...",
        "platform": "linkedin",
        "recruiterActivity": "High|Moderate|None",
        "repostFrequency": "High|Low|None",
        "communitySentiment": "Positive|Neutral|Negative"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract required fields
        title = data.get('title', '')
        company = data.get('company', '')
        url = data.get('url', '')
        platform = data.get('platform', 'unknown')
        
        if not title or not company:
            return jsonify({'error': 'Title and company are required'}), 400
        
        # Extract optional fields with defaults
        posted_date = data.get('postedDate', '')
        recruiter_activity = data.get('recruiterActivity', 'None')
        repost_frequency = data.get('repostFrequency', 'None')
        community_sentiment = data.get('communitySentiment', 'Neutral')
        
        # Calculate truth score using the Python calculator
        result = calculate_truth_score(
            recruiter_activity=recruiter_activity,
            repost_frequency=repost_frequency,
            posted_date=posted_date if posted_date else datetime.now().isoformat(),
            community_sentiment=community_sentiment
        )
        
        # Calculate additional metrics for compatibility with frontend
        age_factor = calculate_age_factor(posted_date)
        response_rate = get_response_rate(company)
        ghost_signal = get_ghost_signal(company, title)
        
        # Generate insights (simplified version)
        insights = {
            'message': f"This job has a {result.ghost_risk} ghost risk.",
            'detailedAdvice': result.why_score
        }
        
        # Format response to match frontend expectations
        response = {
            'truthScore': result.truth_score,
            'ghostRisk': result.ghost_risk.lower(),
            'insights': insights,
            'breakdown': {
                'ageFactor': age_factor,
                'responseRate': response_rate,
                'ghostSignal': ghost_signal,
                'recruiterActivity': result.breakdown.get('recruiter_activity', 0),
                'repostFrequency': result.breakdown.get('repost_frequency', 0),
                'postingAge': result.breakdown.get('posting_age', 0),
                'communitySignal': result.breakdown.get('community_signal', 0),
            },
            'whyScore': result.why_score
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error calculating truth score: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to calculate truth score',
            'message': str(e)
        }), 500


@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    """
    Upload and parse resume
    
    Expected form data:
    - file: Resume file (PDF or DOCX)
    - name: User's name (optional, will be extracted from resume if not provided)
    """
    if not RESUME_PARSING_AVAILABLE:
        return jsonify({'error': 'Resume parsing not available'}), 503
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        user_name = request.form.get('name', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PDF and DOCX are allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Parse resume
        parser = ResumeParser()
        resume_data = parser.parse(file_path)
        
        # Override name if provided
        if user_name:
            resume_data.name = user_name
        
        # Store user data
        user_id = str(uuid.uuid4())
        user_data_store[user_id] = {
            'name': resume_data.name,
            'resume_data': resume_data,
            'resume_file': unique_filename
        }
        
        # Clean up file after parsing (optional - you might want to keep it)
        # os.remove(file_path)
        
        return jsonify({
            'success': True,
            'userId': user_id,
            'resume': {
                'name': resume_data.name,
                'email': resume_data.email,
                'phone': resume_data.phone,
                'skills': resume_data.skills,
                'experience': resume_data.experience,
                'education': resume_data.education,
                'summary': resume_data.summary
            }
        })
        
    except Exception as e:
        print(f"Error uploading resume: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to parse resume',
            'message': str(e)
        }), 500


@app.route('/api/find-matches', methods=['POST'])
def find_matches():
    """
    Find job matches for a user based on their resume
    
    Expected JSON body:
    {
        "userId": "user-id-from-upload-resume",
        "keywords": ["python", "developer"],  // Optional, extracted from resume if not provided
        "location": "San Francisco, CA",  // Optional
        "maxResults": 50  // Optional, default 50
    }
    """
    if not RESUME_PARSING_AVAILABLE:
        return jsonify({'error': 'Job matching not available'}), 503
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        user_id = data.get('userId')
        if not user_id or user_id not in user_data_store:
            return jsonify({'error': 'Invalid user ID. Please upload resume first'}), 400
        
        user_data = user_data_store[user_id]
        resume_data = user_data['resume_data']
        
        # Extract keywords from resume if not provided
        keywords = data.get('keywords', [])
        if not keywords:
            # Use skills as keywords
            keywords = resume_data.skills[:10]  # Top 10 skills
        
        location = data.get('location', '')
        max_results = data.get('maxResults', 50)
        
        # Scrape jobs
        scraper = JobScraper()
        jobs = scraper.search_jobs(keywords, location, max_results)
        
        # Match jobs with resume
        matcher = JobMatcher(resume_data)
        matches = matcher.match_jobs([job.to_dict() for job in jobs], min_score=40.0)
        
        # Calculate truth scores for matched jobs
        matched_jobs_with_scores = []
        for job_dict, match_score in matches:
            # Calculate truth score for the job
            try:
                truth_result = calculate_truth_score(
                    recruiter_activity='Moderate',  # Default - could be enhanced
                    repost_frequency='None',
                    posted_date=job_dict.get('posted_date', datetime.now().isoformat()),
                    community_sentiment='Neutral'
                )
                
                matched_jobs_with_scores.append({
                    'job': job_dict,
                    'matchScore': match_score.overall_score,
                    'matchBreakdown': {
                        'skillMatch': match_score.skill_match,
                        'experienceMatch': match_score.experience_match,
                        'keywordMatch': match_score.keyword_match,
                        'matchedSkills': match_score.matched_skills,
                        'missingSkills': match_score.missing_skills[:5]  # Top 5 missing
                    },
                    'truthScore': truth_result.truth_score,
                    'ghostRisk': truth_result.ghost_risk,
                    'whyScore': truth_result.why_score
                })
            except Exception as e:
                print(f"Error calculating truth score for job: {str(e)}")
                # Include job anyway with default scores
                matched_jobs_with_scores.append({
                    'job': job_dict,
                    'matchScore': match_score.overall_score,
                    'matchBreakdown': {
                        'skillMatch': match_score.skill_match,
                        'experienceMatch': match_score.experience_match,
                        'keywordMatch': match_score.keyword_match,
                        'matchedSkills': match_score.matched_skills,
                        'missingSkills': match_score.missing_skills[:5]
                    },
                    'truthScore': 50,  # Default neutral score
                    'ghostRisk': 'MEDIUM',
                    'whyScore': 'Analysis pending'
                })
        
        return jsonify({
            'success': True,
            'userName': user_data['name'],
            'totalJobsFound': len(jobs),
            'matchedJobs': matched_jobs_with_scores[:max_results]  # Limit results
        })
        
    except Exception as e:
        print(f"Error finding matches: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to find job matches',
            'message': str(e)
        }), 500


@app.route('/api/report-ghosting', methods=['POST'])
def report_ghosting():
    """
    Report a ghosting incident
    
    Expected JSON body:
    {
        "company": "Company Name",
        "title": "Job Title",
        "url": "https://...",
        "platform": "linkedin",
        "appliedDate": "2026-01-15T00:00:00Z",
        "daysSinceApplication": 30,
        "userId": "optional-user-id"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        company = data.get('company', '')
        title = data.get('title', '')
        
        if not company or not title:
            return jsonify({'error': 'Company and title are required'}), 400
        
        # TODO: Store in Supabase database
        # For now, just acknowledge the report
        
        user_id = data.get('userId')
        impact_points = 10
        
        return jsonify({
            'success': True,
            'message': 'Thank you for helping the community! +10 Impact Points',
            'impactPoints': impact_points
        })
        
    except Exception as e:
        print(f"Error reporting ghosting: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': True,  # Still return success for graceful degradation
            'message': 'Thank you for your report!',
            'impactPoints': 10
        })


@app.route('/api/analyze-job', methods=['POST'])
def analyze_job():
    """
    Analyze a job using the AI agent pipeline (requires Ollama)
    
    Expected JSON body:
    {
        "jobTitle": "Job Title",
        "company": "Company Name",
        "jobDescription": "Natural language description..."
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        job_title = data.get('jobTitle', '')
        company = data.get('company', '')
        job_description = data.get('jobDescription', '')
        
        if not job_title or not company:
            return jsonify({'error': 'Job title and company are required'}), 400
        
        # Try to import and use the pipeline
        try:
            from pipeline import initialize_rolewithai_agent, analyze_job as pipeline_analyze_job
            
            # Initialize agent (this may take a moment)
            agent_chain = initialize_rolewithai_agent(model_name="llama3", temperature=0)
            
            # Analyze the job
            analysis = pipeline_analyze_job(
                agent_chain,
                job_title,
                company,
                job_description
            )
            
            return jsonify({
                'success': True,
                'analysis': analysis,
                'jobTitle': job_title,
                'company': company
            })
            
        except ImportError:
            return jsonify({
                'error': 'AI agent pipeline not available',
                'message': 'Make sure Ollama is installed and running'
            }), 503
        except Exception as e:
            return jsonify({
                'error': 'Failed to analyze job',
                'message': str(e)
            }), 500
        
    except Exception as e:
        print(f"Error analyzing job: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to analyze job',
            'message': str(e)
        }), 500


@app.route('/api/discover-jobs', methods=['GET'])
def discover_jobs():
    """
    Pre-scrape popular jobs from multiple sources
    Returns jobs that users can select from
    
    Query params:
    - location: Optional location filter
    - limit: Maximum number of jobs (default 50)
    """
    if not JOB_SCRAPER_AVAILABLE:
        return jsonify({'error': 'Job scraper not available'}), 503
    
    try:
        location = request.args.get('location', '')
        limit = int(request.args.get('limit', 50))
        
        scraper = JobScraper(use_all_sources=True)
        
        # Scrape popular jobs from multiple sources
        print(f"Discovering popular jobs (location: {location}, limit: {limit})...")
        jobs = scraper.scrape_popular_jobs(location=location, max_per_source=limit // 3)
        
        # Convert to dict format
        jobs_dict = [job.to_dict() for job in jobs[:limit]]
        
        # Calculate truth scores for each job
        jobs_with_scores = []
        for job_dict in jobs_dict:
            try:
                truth_result = calculate_truth_score(
                    recruiter_activity='Moderate',
                    repost_frequency='None',
                    posted_date=job_dict.get('posted_date', datetime.now().isoformat()),
                    community_sentiment='Neutral'
                )
                
                jobs_with_scores.append({
                    **job_dict,
                    'truthScore': truth_result.truth_score,
                    'ghostRisk': truth_result.ghost_risk,
                    'whyScore': truth_result.why_score
                })
            except Exception as e:
                jobs_with_scores.append({
                    **job_dict,
                    'truthScore': 50,
                    'ghostRisk': 'MEDIUM',
                    'whyScore': 'Analysis pending'
                })
        
        return jsonify({
            'success': True,
            'totalJobs': len(jobs_with_scores),
            'jobs': jobs_with_scores
        })
        
    except Exception as e:
        print(f"Error discovering jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to discover jobs',
            'message': str(e)
        }), 500


@app.route('/api/market-insights', methods=['GET'])
def get_market_insights_endpoint():
    """Get current market insights for job roles"""
    if not MARKET_RESEARCH_AVAILABLE:
        return jsonify({'error': 'Market research not available'}), 503
    
    try:
        insights = get_market_insights()
        return jsonify({
            'success': True,
            **insights
        })
    except Exception as e:
        print(f"Error getting market insights: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to get market insights',
            'message': str(e)
        }), 500


@app.route('/api/role-market-data', methods=['POST'])
def get_role_market_data_endpoint():
    """
    Get market data for a specific role
    
    Expected JSON body:
    {
        "role": "Software Engineer",
        "location": "San Francisco, CA"  // Optional
    }
    """
    if not MARKET_RESEARCH_AVAILABLE:
        return jsonify({'error': 'Market research not available'}), 503
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        role = data.get('role', '')
        location = data.get('location', '')
        
        if not role:
            return jsonify({'error': 'Role is required'}), 400
        
        market_data = get_role_market_data(role, location)
        
        return jsonify({
            'success': True,
            **market_data
        })
        
    except Exception as e:
        print(f"Error getting role market data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to get role market data',
            'message': str(e)
        }), 500


@app.route('/api/find-jobs-by-role', methods=['POST'])
def find_jobs_by_role():
    """
    Find jobs by role (replaces resume-based matching)
    
    Expected JSON body:
    {
        "role": "Software Engineer",
        "location": "San Francisco, CA",  // Optional
        "maxResults": 50  // Optional, default 50
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        role = data.get('role', '')
        location = data.get('location', '')
        max_results = data.get('maxResults', 50)
        
        if not role:
            return jsonify({'error': 'Role is required'}), 400
        
        # Extract keywords from role
        keywords = role.split()  # Simple keyword extraction
        
        # Scrape jobs from all sources
        scraper = JobScraper(use_all_sources=True)
        jobs = scraper.search_jobs(keywords, location, max_results, sources=['linkedin', 'indeed', 'glassdoor'])
        
        # Get market data for the role
        market_data = None
        if MARKET_RESEARCH_AVAILABLE:
            try:
                market_data = get_role_market_data(role, location)
            except Exception as e:
                print(f"Error getting market data: {str(e)}")
        
        # Calculate truth scores for jobs
        jobs_with_scores = []
        for job in jobs:
            try:
                truth_result = calculate_truth_score(
                    recruiter_activity='Moderate',  # Default - could be enhanced
                    repost_frequency='None',
                    posted_date=job.posted_date if job.posted_date else datetime.now().isoformat(),
                    community_sentiment='Neutral'
                )
                
                jobs_with_scores.append({
                    'job': job.to_dict(),
                    'truthScore': truth_result.truth_score,
                    'ghostRisk': truth_result.ghost_risk,
                    'whyScore': truth_result.why_score
                })
            except Exception as e:
                print(f"Error calculating truth score for job: {str(e)}")
                # Include job anyway with default scores
                jobs_with_scores.append({
                    'job': job.to_dict(),
                    'truthScore': 50,
                    'ghostRisk': 'MEDIUM',
                    'whyScore': 'Analysis pending'
                })
        
        return jsonify({
            'success': True,
            'role': role,
            'location': location,
            'totalJobsFound': len(jobs),
            'marketData': market_data,
            'jobs': jobs_with_scores[:max_results]
        })
        
    except Exception as e:
        print(f"Error finding jobs by role: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to find jobs',
            'message': str(e)
        }), 500


@app.route('/api/market-ticker', methods=['GET'])
def get_market_ticker():
    """
    Get real-time market ticker data from scraped jobs
    Aggregates companies from recent job postings and calculates their Market Prices (Truth Scores)
    Uses caching to avoid excessive scraping (5 minute cache)
    
    Query params:
    - limit: Number of companies to return (default 20)
    - force_refresh: Force refresh cache (default False)
    """
    try:
        limit = int(request.args.get('limit', 20))
        force_refresh = request.args.get('force_refresh', 'false').lower() == 'true'
        
        # Check cache first
        current_time = datetime.now().timestamp()
        if (not force_refresh and 
            market_ticker_cache['data'] is not None and 
            market_ticker_cache['timestamp'] is not None and
            (current_time - market_ticker_cache['timestamp']) < market_ticker_cache['ttl']):
            print("Returning cached market ticker data")
            cached_tickers = market_ticker_cache['data'][:limit]
            return jsonify({
                'success': True,
                'tickers': cached_tickers,
                'lastUpdated': datetime.fromtimestamp(market_ticker_cache['timestamp']).isoformat(),
                'cached': True
            })
        
        print("Scraping fresh market ticker data...")
        
        # Scrape popular jobs to get real company data
        # Use only LinkedIn for faster scraping (single source)
        scraper = JobScraper(use_all_sources=False)
        
        # Scrape one broad keyword to get diverse companies from real job postings
        # This ensures each company's data comes from actual scraped jobs
        print("Scraping LinkedIn jobs for market ticker...")
        all_jobs = scraper.search_jobs(['Software', 'Engineer'], '', 100, sources=['linkedin'])
        
        if not all_jobs:
            print("No jobs found from LinkedIn, trying Indeed...")
            all_jobs = scraper.search_jobs(['Software', 'Engineer'], '', 50, sources=['indeed'])
        
        print(f"Found {len(all_jobs)} jobs from {len(set(job.company for job in all_jobs))} unique companies")
        
        # Aggregate by company
        company_data = {}
        for job in all_jobs:
            company = job.company
            if company not in company_data:
                company_data[company] = {
                    'company': company,
                    'jobs': [],
                    'totalJobs': 0,
                    'avgTruthScore': 0,
                    'totalTruthScore': 0
                }
            
            # Calculate truth score for this job
            try:
                truth_result = calculate_truth_score(
                    recruiter_activity='Moderate',
                    repost_frequency='None',
                    posted_date=job.posted_date if job.posted_date else datetime.now().isoformat(),
                    community_sentiment='Neutral'
                )
                company_data[company]['jobs'].append({
                    'title': job.title,
                    'truthScore': truth_result.truth_score,
                    'postedDate': job.posted_date
                })
                company_data[company]['totalTruthScore'] += truth_result.truth_score
                company_data[company]['totalJobs'] += 1
            except Exception as e:
                print(f"Error calculating truth score for {company}: {str(e)}")
        
        # Calculate averages and generate tickers
        tickers = []
        for company, data in company_data.items():
            if data['totalJobs'] > 0:
                avg_score = data['totalTruthScore'] / data['totalJobs']
                
                # Generate ticker from company name
                words = company.split(' ')
                if len(words) == 1:
                    ticker = company[:4].upper().ljust(4, 'X')
                else:
                    ticker = ''.join(w[0] for w in words).upper()[:4].ljust(4, 'X')
                
                # Calculate 24h change (simulate based on job posting recency)
                recent_jobs = [j for j in data['jobs'] if j.get('postedDate')]
                if recent_jobs:
                    # More recent postings = positive change
                    days_ago = []
                    for job in recent_jobs:
                        if job.get('postedDate'):
                            try:
                                posted = datetime.fromisoformat(job['postedDate'].replace('Z', '+00:00'))
                                days = (datetime.now() - posted.replace(tzinfo=None)).days
                                days_ago.append(days)
                            except:
                                pass
                    
                    if days_ago:
                        avg_days = sum(days_ago) / len(days_ago)
                        # Recent postings (< 7 days) = positive change
                        change = max(-10, min(10, (7 - avg_days) * 1.5))
                    else:
                        change = 0
                else:
                    change = 0
                
                change_percent = (change / avg_score * 100) if avg_score > 0 else 0
                
                tickers.append({
                    'ticker': ticker,
                    'company': company,
                    'price': round(avg_score, 1),
                    'change': round(change, 1),
                    'changePercent': round(change_percent, 1),
                    'totalJobs': data['totalJobs']
                })
        
        # Sort by total jobs (most active companies first)
        tickers.sort(key=lambda x: x['totalJobs'], reverse=True)
        
        final_tickers = tickers[:limit]
        
        # Update cache
        market_ticker_cache['data'] = tickers  # Store all tickers, limit applied on return
        market_ticker_cache['timestamp'] = current_time
        
        return jsonify({
            'success': True,
            'tickers': final_tickers,
            'lastUpdated': datetime.now().isoformat(),
            'cached': False
        })
        
    except Exception as e:
        print(f"Error getting market ticker: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to get market ticker',
            'message': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("RoleWithAI Backend Server")
    print("=" * 60)
    print(f"Starting server on {HOST}:{PORT}")
    print(f"Debug mode: {DEBUG}")
    print(f"Health check: http://{HOST}:{PORT}/health")
    print(f"API endpoint: http://{HOST}:{PORT}/api/truth-score")
    print("=" * 60)
    
    app.run(host=HOST, port=PORT, debug=DEBUG)
