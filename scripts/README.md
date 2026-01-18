# RoleWithAI Python Scripts

Python scripts for the RoleWithAI Intelligence Agent with LangChain and Ollama integration.

## Prerequisites

1. **Python 3.9+** installed
2. **Ollama** installed from [https://ollama.ai](https://ollama.ai)
3. **Ollama Model** pulled: `ollama pull llama3` (or `mistral`)

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows PowerShell
venv\Scripts\activate

# Windows CMD
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

3. Run the setup script:
```bash
# Windows
scripts\setup_agent.bat

# macOS/Linux
chmod +x scripts/setup_agent.sh
./scripts/setup_agent.sh
```

Or manually install dependencies:
```bash
pip install -r scripts/requirements.txt
```

## Scripts

### `truth_score_calculator.py`

Python implementation of the RoleWithAI Truth Score algorithm.

**Usage:**
```bash
python scripts/truth_score_calculator.py
```

**Algorithm:**
- Recruiter Activity: High = +40 points, Moderate = +20 points
- Repost Frequency: High = -30 points, Low = -10 points
- Posting Age: >30 days = -20 points, >14 days = -10 points
- Community Signal: Negative = -25 points, Positive = +15 points

**Ghost Risk Thresholds:**
- >80 = LOW
- 50-79 = MEDIUM
- <50 = HIGH

### `pipeline.py`

AI Agent Pipeline using LangChain and Ollama for autonomous job analysis.

**Usage:**
```bash
python scripts/pipeline.py
```

**Features:**
- **ReAct Pattern**: Agent reasons about jobs and acts using tools
- **Truth Score Integration**: Uses the truth score calculator as a tool
- **Conversation Memory**: Remembers previous analyses in the session
- **Local LLM**: Uses Ollama (llama3/mistral) - no API costs, privacy-first

**How it works:**
1. Agent receives a job description
2. Agent decides to use the TruthScoreCalculator tool
3. Tool calculates truth score and ghost risk
4. Agent synthesizes the results with empathetic, supportive analysis
5. Returns recommendation with reasoning

**Example Output:**
```
RoleWithAI Agent Pipeline
============================================================

Example 1: Senior Product Designer at TechCorp Inc.
------------------------------------------------------------

Agent Analysis:
Based on the Truth Score calculation, this role at TechCorp Inc. 
shows strong signals (Score: 95/100, Risk: LOW). The high recruiter 
activity and fresh posting date indicate active hiring. This is a 
high-priority opportunity worth your time and energy.

Recommendation: Apply with confidence. This appears to be a genuine 
hiring opportunity with strong engagement signals.
```

## Architecture

```
┌─────────────────┐
│  User Query     │
│  (Job Analysis) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LangChain      │
│  Agent (ReAct)  │
└────────┬────────┘
         │
         ├──► Think: "I need to calculate truth score"
         │
         ▼
┌─────────────────┐
│  Truth Score    │
│  Calculator     │
│  (Tool)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Ollama LLM     │
│  (llama3)       │
│  Synthesis      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Final Analysis │
│  + Recommendation│
└─────────────────┘
```

## Troubleshooting

**Ollama not found:**
- Install from https://ollama.ai
- Ensure it's in your PATH
- Verify with: `ollama list`

**Model not available:**
- Pull the model: `ollama pull llama3`
- Or use a different model: Edit `pipeline.py` and change `model_name="llama3"` to `model_name="mistral"`

**Import errors:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r scripts/requirements.txt --upgrade`
