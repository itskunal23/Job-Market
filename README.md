# Job Market Analysis Toolkit

Job market analysis toolkit: scrapes, processes, and visualizes tech hiring trends. Python + data science stack for career intelligence.

## Problem
Tech professionals lack accessible, data-driven insights into hiring trends. Job boards show listings but not market dynamics — which skills are rising, which roles are declining, salary trajectories, geographic hotspots. Existing reports are paywalled or outdated.

## Solution
A modular Python toolkit that collects job posting data from multiple sources, processes and normalizes it, and generates actionable visualizations and reports. Designed for individual career planning and team hiring strategy.

## Tech Stack
- **Language**: Python 3.11+
- **Data Collection**: requests, beautifulsoup4, playwright (dynamic sites)
- **Processing**: pandas, polars (large datasets), numpy
- **Analysis**: scikit-learn (clustering, trend detection), scipy (statistics)
- **Visualization**: matplotlib, seaborn, plotly (interactive), altair
- **NLP**: spaCy, sentence-transformers (skill extraction, embedding)
- **Scheduling**: apscheduler, cron
- **Storage**: SQLite (local), PostgreSQL (production), Parquet (analytics)
- **Deployment**: Docker, GitHub Actions (scheduled runs)

## Installation
```bash
git clone https://github.com/itskunal23/Job-Market.git
cd Job-Market

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# or
pip install -e .[dev]
```

## Usage
```bash
# Run full pipeline: collect → process → analyze → visualize
python -m job_market pipeline --all

# Collect new job postings
python -m job_market collect --sources linkedin,indeed,glassdoor --keywords "ai,ml,llm" --days 30

# Process raw data
python -m job_market process --input data/raw --output data/processed

# Generate trend analysis
python -m job_market analyze --skills python,typescript,rust --period 90d

# Create visualizations
python -m job_market visualize --output reports/ --format html,png

# Start scheduled collector (runs daily at 6 AM)
python -m job_market schedule --cron "0 6 * * *"
```

## Architecture
```
job_market/
├── collectors/          # Source-specific scrapers
│   ├── linkedin.py
│   ├── indeed.py
│   └── glassdoor.py
├── processors/          # Data cleaning, normalization
│   ├── clean.py
│   ├── normalize.py
│   └── deduplicate.py
├── analyzers/           # Trend detection, skill extraction
│   ├── skills.py
│   ├── trends.py
│   ├── salaries.py
│   └── geography.py
├── visualizers/         # Chart generation
│   ├── skills.py
│   ├── trends.py
│   └── dashboard.py
├── storage/             # Database abstraction
│   ├── sqlite.py
│   ├── postgres.py
│   └── parquet.py
├── cli.py               # Typer-based CLI
├── config.py            # Pydantic settings
└── scheduler.py         # APScheduler integration
```

## Data Sources
| Source | Method | Frequency | Fields |
|--------|--------|-----------|--------|
| LinkedIn | API + scraping | Daily | title, company, location, skills, salary, date |
| Indeed | Scraping | Daily | title, company, location, description, salary |
| Glassdoor | Scraping | Daily | title, company, location, rating, salary |
| Levels.fyi | API | Weekly | level, total_comp, base, stock, bonus |

## Key Analyses
- **Skill Trend Velocity** — Which skills growing fastest (monthly % change)
- **Salary Percentiles** — P25/P50/P75/P90 by role, location, experience
- **Role Clustering** — K-means on skill embeddings to find role families
- **Geographic Heatmaps** — Hiring density by metro area
- **Company Hiring Velocity** — Postings/month per company

## Output Formats
- **Interactive Dashboard** — Plotly Dash / Streamlit (local)
- **Static Reports** — HTML + PNG (GitHub Pages)
- **JSON API** — For embedding in portfolio/notion
- **CSV/Parquet** — For further analysis

## Configuration
```yaml
# config.yaml
collectors:
  linkedin:
    enabled: true
    keywords: ["machine learning", "llm", "agentic", "mcp"]
    locations: ["San Francisco", "New York", "Seattle", "Remote"]
  indeed:
    enabled: true
    ...

analyzers:
  skill_trends:
    window_days: 90
    min_postings: 10
  salary:
    currency: USD
    adjust_for_inflation: true

visualizers:
  theme: "apple"  # Custom Apple-inspired theme
  color_primary: "#0071E3"
```

## Contributing
PRs welcome for new data sources, analysis modules, or visualization types. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
MIT © Kunal Goenka