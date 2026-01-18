# 💼 Career Capital Trading Terminal

**Trade Your Time Like a Pro. Eliminate Ghost Jobs. Maximize Career Equity.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Tech-Python%20%7C%20Next.js%20%7C%20Playwright-blue)](https://github.com)
[![Market Status](https://img.shields.io/badge/Market-VOLATILE-orange)](https://github.com)
[![Data Source](https://img.shields.io/badge/Data-Real%20Time%20Scraping-success)](https://github.com)

---

## 📋 Table of Contents

- [The Trading Floor](#-the-trading-floor)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏛 The Trading Floor

**Welcome to the Career Capital Trading Terminal** — where job hunting becomes strategic asset management.

You're no longer a job seeker. You're a **Career Capital Trader**. Every application is an investment. Every ghost job is a market crash. Every interview is realized profit.

This terminal transforms the chaotic job market into a high-density, data-driven trading desk where you make informed decisions based on real-time market intelligence.

---

## 🚨 The Problem

The job market is broken. **85% of job seekers report being "ghosted"** by employers—receiving no response after applying, even when positions remain posted for months. This "Ghost Job" epidemic wastes countless hours, erodes trust, and leaves candidates questioning their worth.

### Why Traditional Job Boards Fail

- **No Verification**: Job boards don't validate if companies are actually hiring
- **Evergreen Postings**: Companies keep listings active to build talent pipelines, not fill roles
- **Zero Accountability**: Recruiters face no consequences for ghosting candidates
- **Data Silos**: Each platform operates independently, hiding patterns of ghosting behavior
- **No Time Tracking**: No visibility into how long applications sit without response

**The result?** Job seekers apply to positions that were never real, wasting time and energy that could be spent on genuine opportunities.

---

## ✨ The Solution

**Career Capital Trading Terminal uses real-time web scraping and Market Price (Truth Score) analysis to separate Premium Assets from Penny Stocks.**

### Market Price (Truth Score) Explained

The **Market Price** (1-100) is your Truth Score—a real-time assessment of hiring intent calculated from live scraped data:

| Factor | Impact | Reasoning |
|--------|--------|-----------|
| **Recruiter Activity** | **+40** (High) / **+20** (Moderate) | Active recruiters indicate real hiring needs |
| **Repost Frequency** | **-30** (High) / **-10** (Low) | Frequent reposting suggests evergreen listings |
| **Posting Age** | **-20** (>30 days) / **-10** (>14 days) | Stale postings are likely abandoned |
| **Community Sentiment** | **-25** (Negative) / **+15** (Positive) | Community reports reveal ghosting patterns |

### Asset Classification

| Market Price | Classification | Recommendation |
|--------------|----------------|----------------|
| **90-100** | 🟢 **PREMIUM ASSET** | High-intent opportunity. Prioritize this application. |
| **80-89** | 🟢 **HIGH VALUE** | Strong signal. Worth your time capital. |
| **50-79** | 🟡 **STANDARD** | Worth applying, but keep expectations realistic. |
| **40-49** | 🔴 **PENNY STOCK** | Low confidence. Proceed with caution. |
| **1-39** | 🔴 **GHOST JOB** | Likely a ghost job. Focus energy elsewhere. |

---

## 🎯 Core Features

### 📊 Market Scanner

**Real-time job discovery from LinkedIn, Indeed, and Glassdoor**

- **Live Web Scraping**: Real-time data from multiple job boards (no mock data)
- **Dense Data Table**: Ticker, Role, Price (Market Price), 24h Δ, Vol, Action
- **Hover Intelligence**: Click role names to see detailed job information and direct links
- **Market Volatility Signals**: Community alerts, recruiter activity, posting age
- **Buy/Short Actions**: Execute trades directly from the scanner

### 💹 Buy/Short Logic

**Strategic position management**

- **BUY (Long Position)**: Apply to a job → Opens position at +0.0% P&L
- **SHORT (Bet Against)**: Hide company forever → Preserves time capital
- **Shorted Companies**: Automatically filtered from future scans
- **Position Tracking**: All BUY actions move to Open Positions

### 📈 Unrealized P&L Tracker

**Time-decay mechanic for application monitoring**

- **Time-Decay Formula**: -5% per day without response
- **Market Crash Threshold**: -80% P&L triggers alert
- **Visual Indicators**: Green for profit, red for loss, pulsing red for crashes
- **EXIT Button**: Appears at -80% to close position and protect mental capital
- **Auto-Archive**: Positions automatically move to Timeline of Peace after 21 days

### 🚨 Community Waze Ticker

**Real-time hazard alerts and momentum signals**

- **Ghost Alerts**: 🚨 Community reports of no response
- **Momentum Signals**: 🟢 Users moving to interview stage
- **Freeze Alerts**: ⚠️ Hiring freezes reported by community
- **Active Signals**: 🟢 Recruiter activity detected
- **Live Updates**: Refreshes every 30 seconds

### 📺 Market Watch Ticker

**Global market overview**

- **Company Tickers**: Real-time Market Prices from scraped jobs
- **24h Change**: Percentage change based on posting recency
- **Volume**: Applicant count indicators
- **Color Coding**: Green for bullish, red for bearish
- **Cached Performance**: 5-minute cache to minimize scraping

### 💼 Open Positions

**Active application portfolio**

- **Dense Table View**: Symbol, Entry Date, Status, Unrealized P&L, Action
- **Status Management**: Applied → Interview → Offer → Rejected/Ghosted
- **P&L Monitoring**: Real-time calculation of time-decay losses
- **Market Crash Alerts**: Visual warnings when P&L hits -80%

### 📜 Transaction History (Timeline of Peace)

**Realized losses and closed positions**

- **Auto-Archive**: Positions move here after 21 days of no response
- **Realized Loss Calculation**: Percentage loss based on time invested
- **Mental Health First**: Supportive messaging for closed positions
- **Dense Log Format**: Symbol, Role, Entry/Exit Dates, Realized Loss, Days Held

### 💰 Career Equity (Account Value)

**Gamified progress tracking**

- **Total Career Equity**: Accumulated from applications, interviews, community contributions
- **Daily P&L**: Profit/Loss indicator based on hiring velocity
- **Buying Power**: Visual representation of available capital
- **Impact Points**: Earned through applications, interviews, and hazard reports

### 🎨 Terminal Aesthetic

**High-density Wall Street design**

- **Deepest Black Canvas**: #000000 background for maximum contrast
- **Neon Financial Green**: #00FF00 for bullish signals and high Market Prices
- **Neon Financial Red**: #FF3333 for bearish signals and ghost risks
- **Monospaced Typography**: JetBrains Mono for all numerical data
- **Glassmorphism Panels**: 10% opacity with backdrop blur for depth
- **Sharp Edges**: No rounded corners, 1px borders, professional precision
- **Glow Effects**: Neon text shadows on high-value positions

---

## 🛠 Tech Stack

### Backend & Scraping
- **Python 3.9+** - Core logic and web scraping
- **Flask** - REST API server
- **Playwright** - Browser automation for LinkedIn, Indeed, Glassdoor
- **LangChain** - AI agent pipeline (optional, requires Ollama)

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom terminal theme
- **Framer Motion** - Smooth animations and transitions

### Data Sources
- **LinkedIn Guest Portal** - Real-time job scraping
- **Indeed** - Job board integration
- **Glassdoor** - Additional job source
- **Real-time Web Scraping** - No mock data, all live information

### Optional AI Features
- **Ollama** - Local LLM for AI-powered analysis
- **Google Gemini** - Optional cloud AI for insights
- **Supabase** - Community ghosting reports database

---

## 📦 Installation

### Prerequisites

- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Playwright** - For web scraping (installed via pip)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/echo.git
cd echo
```

2. **Set up Python environment**
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install Python dependencies
pip install -r scripts/requirements.txt

# Install Playwright browser (REQUIRED for scraping)
playwright install chromium
```

3. **Set up Node.js environment**
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

4. **Start the backend server**
```bash
# Start Flask backend server (REQUIRED for real data)
python app.py

# The server will run on http://localhost:5000
# Health check: http://localhost:5000/health
```

5. **Access the Terminal**
```bash
# Open http://localhost:3000
# You'll see the INITIALIZE TERMINAL screen
# Enter your TRADER NAME and MARKET SECTOR
# Click BOOT SYSTEM to begin
```

### Environment Variables (Optional)

Create a `.env.local` file in the project root for optional features:

```env
# Supabase (optional - for community ghosting reports)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini (optional - for cloud AI insights)
GOOGLE_AI_API_KEY=your_gemini_api_key

# Backend Server (default: localhost:5000)
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚀 Usage

### Terminal Initialization

1. **Boot Sequence**
   - Enter your **TRADER NAME** (e.g., "MochaSeeker")
   - Specify your **MARKET SECTOR** (e.g., "Data Scientist", "Software Engineer")
   - Optionally add **LOCATION** filter
   - Click **BOOT SYSTEM**

2. **Market Scan Animation**
   - Watch real-time scraping: `[SYSTEM] Scraping LinkedIn...`
   - System analyzes market conditions
   - Terminal initializes with: `[SYSTEM] ACCESS GRANTED. WELCOME, [NAME]. MARKET CONDITIONS: VOLATILE.`

### Market Scanner Workflow

1. **Browse Positions**
   - View jobs in dense table format
   - Columns: Ticker, Role, Price (Market Price), 24h Δ, Vol, Action
   - Hover over Price to see Market Volatility Signals

2. **View Job Details**
   - **Click on role name** to open detailed modal
   - See full job description, company info, platform source
   - View direct link to original job posting
   - Access BUY/SHORT actions

3. **Execute Trades**
   - **BUY**: Adds job to Open Positions with +0.0% P&L
   - **SHORT**: Hides company from future scans (preserves time capital)
   - Both actions refresh the terminal

### Open Positions Management

1. **Monitor P&L**
   - Watch Unrealized P&L decay: -5% per day
   - Green = Profit (interview received)
   - Red = Loss (time wasted)
   - Pulsing red = Market Crash (-80%)

2. **Update Status**
   - Change status: Applied → Interview → Offer → Rejected/Ghosted
   - P&L updates based on status changes
   - Interview status = positive P&L

3. **Exit Positions**
   - Click **EXIT** when P&L hits -80%
   - Position moves to Transaction History
   - Supportive message: "Position closed to protect mental capital"

### Community Features

1. **Report Hazards**
   - Click **REPORT HAZARD** button
   - Select type: [GHOSTING] [FREEZE] [ACTIVE]
   - Your anonymous alias flashes on global ticker
   - Earn Career Equity for community contributions

2. **View Waze Ticker**
   - Real-time alerts scroll at top of terminal
   - See ghost alerts, momentum signals, freeze warnings
   - Community intelligence protects the collective

### API Usage

#### Backend Endpoints

```bash
# Health check
GET http://localhost:5000/health

# Find jobs by role (real-time scraping)
POST http://localhost:5000/api/find-jobs-by-role
Body: {
  "role": "Data Scientist",
  "location": "Virginia",
  "maxResults": 50
}

# Get market ticker data
GET http://localhost:5000/api/market-ticker?limit=20

# Calculate truth score
POST http://localhost:5000/api/truth-score
Body: {
  "title": "Data Scientist",
  "company": "TechCorp",
  "postedDate": "2026-01-15T00:00:00Z",
  "recruiterActivity": "High",
  "repostFrequency": "None",
  "communitySentiment": "Positive"
}

# Report ghosting
POST http://localhost:5000/api/report-ghosting
Body: {
  "company": "TechCorp",
  "title": "Data Scientist",
  "daysSinceApplication": 30
}
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         Career Capital Trading Terminal Stack                │
└─────────────────────────────────────────────────────────────┘

Frontend (Next.js 15)
├── Trading Desk Layout
│   ├── Market Watch Ticker (Global market overview)
│   ├── Community Waze Ticker (Hazard alerts)
│   ├── Market Scanner (Left sidebar - job discovery)
│   └── Portfolio Management (Right panel)
│       ├── Account Value (Career Equity)
│       ├── Open Positions (Active applications)
│       └── Transaction History (Closed positions)
│
├── Terminal Components
│   ├── Job Detail Modal (Click role for details)
│   ├── Report Hazard Modal (Community reporting)
│   ├── Score Ring (Circular gauge with glow effects)
│   └── Glassmorphism Panels (Frosted glass aesthetic)
│
└── State Management
    ├── localStorage (Shorted companies, applications)
    ├── Real-time API calls (Backend integration)
    └── Auto-refresh (Market data updates)

Backend (Python Flask)
├── Web Scrapers
│   ├── LinkedIn Scraper (Playwright)
│   ├── Indeed Scraper (Playwright)
│   └── Glassdoor Scraper (Playwright)
│
├── Truth Score Calculator
│   ├── Recruiter Activity Analysis
│   ├── Repost Frequency Detection
│   ├── Posting Age Calculation
│   └── Community Sentiment Aggregation
│
├── Market Research
│   ├── Role Market Data (Real scraped analysis)
│   ├── Hiring Velocity Calculation
│   └── Demand Score Analysis
│
└── API Endpoints
    ├── /api/find-jobs-by-role (Real-time scraping)
    ├── /api/market-ticker (Company aggregation)
    ├── /api/truth-score (Market Price calculation)
    └── /api/report-ghosting (Community reports)

Data Flow
├── User Input → Frontend → Backend API
├── Backend → Web Scrapers → Real Job Boards
├── Scraped Data → Truth Score Calculation
└── Results → Frontend Display (Terminal UI)
```

### Key Design Principles

1. **Real Data Only**: No mock data fallbacks. System shows empty states if scraping fails.
2. **High-Density Layout**: Maximum information per pixel, trading desk aesthetic.
3. **Time as Currency**: P&L tracking emphasizes time investment value.
4. **Community Intelligence**: Waze-style hazard reporting protects collective.
5. **Mental Health First**: Auto-archive prevents "Pending Response" obsession.

---

## 📊 API Reference

### GET `/api/market-ticker`

Get real-time market ticker data from scraped jobs.

**Query Parameters:**
- `limit` (optional): Number of companies to return (default: 20)
- `force_refresh` (optional): Force cache refresh (default: false)

**Response:**
```json
{
  "success": true,
  "tickers": [
    {
      "ticker": "GOOG",
      "company": "Google",
      "price": 87.3,
      "change": 6.2,
      "changePercent": 7.6,
      "totalJobs": 15
    }
  ],
  "lastUpdated": "2026-01-18T15:30:00Z",
  "cached": false
}
```

### POST `/api/find-jobs-by-role`

Find jobs by role using real-time web scraping.

**Request Body:**
```json
{
  "role": "Data Scientist",
  "location": "Virginia",
  "maxResults": 50
}
```

**Response:**
```json
{
  "success": true,
  "role": "Data Scientist",
  "location": "Virginia",
  "totalJobsFound": 25,
  "marketData": {
    "demand_score": 85.5,
    "hiring_velocity": 12.3,
    "total_postings": 25,
    "growth_trend": "rising"
  },
  "jobs": [
    {
      "job": {
        "title": "Data Scientist",
        "company": "TechCorp",
        "location": "Virginia",
        "url": "https://linkedin.com/jobs/...",
        "platform": "LinkedIn",
        "description": "...",
        "posted_date": "2026-01-15T00:00:00Z"
      },
      "truthScore": 87.3,
      "ghostRisk": "LOW",
      "whyScore": "High recruiter activity detected..."
    }
  ]
}
```

### POST `/api/truth-score`

Calculate Market Price (Truth Score) for a job posting.

**Request Body:**
```json
{
  "title": "Data Scientist",
  "company": "TechCorp",
  "postedDate": "2026-01-15T00:00:00Z",
  "recruiterActivity": "High",
  "repostFrequency": "None",
  "communitySentiment": "Positive"
}
```

**Response:**
```json
{
  "truthScore": 87,
  "ghostRisk": "LOW",
  "insights": {
    "message": "This job has a LOW ghost risk.",
    "detailedAdvice": "High recruiter activity and positive community sentiment indicate strong hiring intent."
  },
  "breakdown": {
    "recruiterActivity": 40,
    "repostFrequency": 0,
    "postingAge": 0,
    "communitySignal": 15
  }
}
```

---

## 🗺 Future Roadmap

### Q2 2026: Advanced Trading Features
- **Portfolio Analytics**: Advanced P&L charts and trends
- **Risk Management**: Automated position sizing based on Market Price
- **Market Alerts**: Custom alerts for specific companies or roles
- **Backtesting**: Historical analysis of application success rates

### Q3 2026: Social Trading
- **Copy Trading**: Follow successful traders' application strategies
- **Leaderboards**: Top performers by Career Equity
- **Community Signals**: Enhanced Waze ticker with more signal types
- **Trading Groups**: Private groups for specific industries

### Q4 2026: AI-Powered Insights
- **Resume Optimization**: AI suggests resume tweaks based on Market Price
- **Cover Letter Generator**: Auto-generate cover letters using job data
- **Interview Prep**: AI-powered interview preparation based on company data
- **Salary Negotiation**: Market data-driven negotiation strategies

### 2027: Enterprise Features
- **Team Dashboards**: Track team application performance
- **Recruiter Integration**: Direct API access for recruiters
- **Company Analytics**: Detailed company hiring pattern analysis
- **Market Reports**: Weekly/monthly market intelligence reports

---

## 🤝 Contributing

We welcome contributions! The Career Capital Trading Terminal is built for traders, by traders.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** (follow our terminal aesthetic guidelines)
4. **Test with real scraping** (ensure no mock data)
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Areas We Need Help

- 🐛 **Bug Reports**: Found a scraping issue? Report it!
- 📊 **Scraper Improvements**: Enhance LinkedIn/Indeed/Glassdoor scrapers
- 🎨 **UI/UX Improvements**: Make the terminal even more high-density
- 🔧 **Performance**: Optimize scraping speed and caching
- 📝 **Documentation**: Improve guides, add examples
- 🌐 **New Job Sources**: Add more job board integrations

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Playwright** - For making browser automation accessible
- **Next.js Team** - For the excellent React framework
- **The Trading Community** - For feedback and feature requests
- **Job Seekers Everywhere** - For sharing ghosting experiences and making this tool possible

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/echo/issues)
- **Discussions**: [Join the trading floor conversation](https://github.com/yourusername/echo/discussions)

---

<div align="center">

**Built with precision for Career Capital Traders navigating volatile markets**

**[⭐ Star us on GitHub](https://github.com/yourusername/echo) | [📖 Read the Docs](./docs) | [🐛 Report a Bug](https://github.com/yourusername/echo/issues)**

**Remember: Time is currency. Trade wisely.**

</div>
