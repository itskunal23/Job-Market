# 🎯 RoleWithAI

**Navigate the Ghost Job Epidemic with AI-Powered Truth Scores**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Tech-Python%20%7C%20Next.js%20%7C%20LangChain-blue)](https://github.com)
[![Ghost Risk](https://img.shields.io/badge/Ghost%20Risk-LOW-green)](https://github.com)
[![Privacy](https://img.shields.io/badge/Privacy-Local%20LLM-success)](https://github.com)

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚨 The Problem

The job market is broken. **85% of job seekers report being "ghosted"** by employers—receiving no response after applying, even when positions remain posted for months. This "Ghost Job" epidemic wastes countless hours, erodes trust, and leaves candidates questioning their worth.

### Why Traditional Job Boards Fail

- **No Verification**: Job boards don't validate if companies are actually hiring
- **Evergreen Postings**: Companies keep listings active to build talent pipelines, not fill roles
- **Zero Accountability**: Recruiters face no consequences for ghosting candidates
- **Data Silos**: Each platform operates independently, hiding patterns of ghosting behavior

**The result?** Job seekers apply to positions that were never real, wasting time and energy that could be spent on genuine opportunities.

---

## ✨ The Solution

**RoleWithAI uses AI-powered Truth Scores to separate real opportunities from ghost jobs.**

### How the Truth Score Works

The Truth Score (1-100) analyzes multiple signals to determine hiring intent:

| Factor | Impact | Reasoning |
|--------|--------|-----------|
| **Recruiter Activity** | **+40** (High) / **+20** (Moderate) | Active recruiters indicate real hiring needs |
| **Repost Frequency** | **-30** (High) / **-10** (Low) | Frequent reposting suggests evergreen listings |
| **Posting Age** | **-20** (>30 days) / **-10** (>14 days) | Stale postings are likely abandoned |
| **Community Sentiment** | **-25** (Negative) / **+15** (Positive) | Community reports reveal ghosting patterns |

### Ghost Risk Classification

| Score Range | Risk Level | Recommendation |
|-------------|------------|----------------|
| **80-100** | 🟢 **LOW** | High-intent opportunity. Prioritize this application. |
| **50-79** | 🟡 **MEDIUM** | Worth applying, but keep expectations realistic. |
| **1-49** | 🔴 **HIGH** | Likely a ghost job. Focus energy elsewhere. |

### Example Calculation

```
Base Score: 50
+ Recruiter Activity (High): +40
+ Community Sentiment (Positive): +15
- Repost Frequency (Low): -10
- Posting Age (3 days old): 0
─────────────────────────────
Truth Score: 95/100 → LOW Ghost Risk ✅
```

---

## 🎯 Key Features

### 🤖 AI Agent Pipeline (ReAct Pattern)

RoleWithAI uses **LangChain** and **Ollama** to create autonomous agents that:

- **Reason** about job postings using natural language
- **Act** by calling the Truth Score Calculator tool
- **Observe** results and synthesize empathetic analysis
- **Remember** previous analyses in conversation context

### 🔒 Privacy-First Architecture

- **Local LLM Integration**: Uses Ollama (llama3/mistral) - no data leaves your machine
- **No API Costs**: Run entirely locally, no subscription fees
- **Data Sovereignty**: Your job search data stays private

### ⚡ Validation Engine

- **Real-time Analysis**: Calculate truth scores instantly
- **Community Signals**: Aggregate ghosting reports (privacy-preserving)
- **Automated Prioritization**: Auto-sort applications by truth score
- **Ledger Automation**: Move stale applications to "Low Priority" automatically

### 🎨 Café Study Interface

- **Low-Cognitive Load Design**: Warm, supportive UI that reduces job search anxiety
- **Visual Truth Scores**: Color-coded rings (Crema Gold for high-intent, Cold Brew for ghost jobs)
- **Empathetic Dialogue**: RoleWithAI frames ghosting as systemic failure, never personal blame

---

## 🛠 Tech Stack

### Backend & AI
- **Python 3.9+** - Core logic and AI agent pipeline
- **LangChain** - Agent orchestration and tool integration
- **Ollama** - Local LLM inference (llama3, mistral)
- **Supabase** - PostgreSQL database for ghosting reports

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth, viscous animations

### AI & Data
- **Google Gemini 1.5 Flash** - Optional cloud AI for insights
- **Tavily** - Web search for community sentiment
- **Chrome Extension** - In-situ job analysis on LinkedIn

---

## 📦 Installation

### Prerequisites

- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Ollama** ([Download](https://ollama.ai)) - For local LLM

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/rolewithai.git
cd rolewithai
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
```

3. **Set up Ollama (for AI Agent Pipeline)**
```bash
# Install Ollama from https://ollama.ai
# Then pull a model
ollama pull llama3
# Or use mistral
ollama pull mistral
```

4. **Set up Node.js environment**
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

5. **Verify installation**
```bash
# Test truth score calculator
python scripts/truth_score_calculator.py

# Test AI agent pipeline (requires Ollama)
python scripts/pipeline.py
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase (optional - for ghosting reports)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini (optional - for cloud AI insights)
GOOGLE_AI_API_KEY=your_gemini_api_key

# Tavily (optional - for web search)
TAVILY_API_KEY=your_tavily_api_key
```

See [SETUP.md](./SETUP.md) for detailed configuration instructions.

---

## 🚀 Usage

### Truth Score Calculator

```python
from scripts.truth_score_calculator import calculate_truth_score

result = calculate_truth_score(
    recruiter_activity='High',
    repost_frequency='Low',
    posted_date='2026-01-15T00:00:00Z',
    community_sentiment='Positive'
)

print(f"Truth Score: {result.truth_score}/100")
print(f"Ghost Risk: {result.ghost_risk}")
print(f"Why: {result.why_score}")
```

### AI Agent Pipeline

```python
from scripts.pipeline import initialize_rolewithai_agent, analyze_job

# Initialize agent
agent = initialize_rolewithai_agent(model_name="llama3")

# Analyze a job
analysis = analyze_job(
    agent,
    job_title="Senior Product Designer",
    company="TechCorp Inc.",
    job_description="Posted 3 days ago. High recruiter engagement. Positive community sentiment."
)

print(analysis)
```

### Web Application

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder
5. Navigate to LinkedIn job postings - Truth Scores will appear automatically

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    RoleWithAI Stack                      │
└─────────────────────────────────────────────────────────┘

Frontend (Next.js)
├── Café Study UI (Tailwind CSS)
├── Job Cards with Truth Scores
├── Status Ledger (Auto-prioritization)
└── Chrome Extension (LinkedIn integration)

Backend (Python)
├── Truth Score Calculator
│   ├── Recruiter Activity Analysis
│   ├── Repost Frequency Detection
│   ├── Posting Age Calculation
│   └── Community Sentiment Aggregation
│
├── AI Agent Pipeline (LangChain + Ollama)
│   ├── ReAct Pattern (Reason → Act → Observe)
│   ├── Truth Score Tool Integration
│   ├── Conversation Memory
│   └── Empathetic Analysis Synthesis
│
└── Intelligence Engine
    ├── Narrative Generator (Supportive tone)
    ├── Signal Processor (Visual breakdown)
    └── Ledger Automator (Auto-prioritization)

Data Layer
├── Supabase (Ghosting reports, community signals)
├── Local LLM (Ollama - privacy-first)
└── Optional: Gemini/Tavily (cloud AI)
```

### Data Flow

1. **Job Posting** → Chrome Extension or Manual Input
2. **Signal Extraction** → Recruiter activity, repost frequency, age, sentiment
3. **Truth Score Calculation** → Algorithm computes 1-100 score
4. **AI Agent Analysis** → Local LLM synthesizes empathetic recommendation
5. **Visualization** → Café Study UI displays with color-coded risk levels

---

## 🗺 Future Roadmap

### Q2 2026: Automated Follow-ups
- **Smart Reminders**: Auto-detect when to follow up based on company response patterns
- **Template Generator**: AI-powered follow-up emails tailored to each company
- **Response Tracking**: Monitor email opens and engagement

### Q3 2026: Resume Tailoring
- **Job-Specific Optimization**: AI analyzes job descriptions and suggests resume tweaks
- **ATS Optimization**: Ensure resumes pass Applicant Tracking Systems
- **Cover Letter Generator**: Generate personalized cover letters using truth score insights

### Q4 2026: Community Intelligence
- **Ghost Job Database**: Crowdsourced database of verified ghost jobs
- **Company Reputation Scores**: Aggregate ghosting reports into company ratings
- **Peer Insights**: Anonymous sharing of interview experiences and timelines

### 2027: Advanced Features
- **Salary Negotiation AI**: Analyze market data to suggest negotiation strategies
- **Career Path Mapping**: AI-powered career trajectory recommendations
- **Interview Prep**: Role-specific interview question generators based on company culture

---

## 🤝 Contributing

We welcome contributions! RoleWithAI is built for the community, by the community.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** (follow our code style)
4. **Add tests** if applicable
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Areas We Need Help

- 🐛 **Bug Reports**: Found a ghost job that scored high? Report it!
- 📊 **Data Collection**: Help us build the community ghosting database
- 🎨 **UI/UX Improvements**: Make the Café Study interface even more calming
- 🤖 **AI Improvements**: Enhance the agent pipeline or truth score algorithm
- 📝 **Documentation**: Improve guides, add examples, translate docs

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ollama** - For making local LLMs accessible
- **LangChain** - For simplifying agent orchestration
- **The Job Seeker Community** - For sharing ghosting experiences and making this tool possible

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/rolewithai/issues)
- **Discussions**: [Join the conversation](https://github.com/yourusername/rolewithai/discussions)

---

<div align="center">

**Built with ❤️ for job seekers navigating the ghost job epidemic**

[⭐ Star us on GitHub](https://github.com/yourusername/rolewithai) | [📖 Read the Docs](./docs) | [🐛 Report a Bug](https://github.com/yourusername/rolewithai/issues)

</div>
