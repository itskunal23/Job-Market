# RoleWithAI Agent Pipeline - Quick Start

## Prerequisites

1. **Install Ollama**: Download from [https://ollama.ai](https://ollama.ai) and install
2. **Pull a model**: Run `ollama pull llama3` (or `ollama pull mistral`)

## Setup

1. **Activate virtual environment**:
```bash
# From project root
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux
```

2. **Install dependencies**:
```bash
pip install -r scripts/requirements.txt
```

3. **Verify Ollama is running**:
```bash
ollama list
```

## Run the Pipeline

```bash
# From project root with venv activated
python scripts/pipeline.py
```

Or from the scripts directory:
```bash
cd scripts
python pipeline.py
```

## How It Works

The pipeline uses a **ReAct (Reason + Act)** pattern:

1. **Agent receives query**: "Analyze this job posting..."
2. **Agent reasons**: "I need to calculate the truth score first"
3. **Agent acts**: Calls the `TruthScoreCalculator` tool
4. **Agent observes**: Receives truth score, ghost risk, and breakdown
5. **Agent synthesizes**: Uses Ollama LLM to provide empathetic analysis
6. **Returns**: Complete analysis with recommendation

## Example Usage

The script includes 3 example job analyses:
- High-intent job (TechCorp) - Should score ~95
- Ghost job (StartupXYZ) - Should score ~1
- Medium job (DesignStudio) - Should score ~70

## Custom Analysis

You can modify the `main()` function in `pipeline.py` to analyze your own jobs:

```python
analysis = analyze_job(
    agent_chain,
    job_title="Your Job Title",
    company="Company Name",
    job_description="Posted 5 days ago. High recruiter activity. No reposts."
)
print(analysis)
```

## Troubleshooting

**"Ollama not found"**
- Ensure Ollama is installed and in PATH
- Restart terminal after installation

**"Model not found"**
- Run: `ollama pull llama3`
- Or change model in `pipeline.py`: `model_name="mistral"`

**Import errors**
- Ensure you're in the virtual environment
- Reinstall: `pip install -r scripts/requirements.txt --upgrade`
