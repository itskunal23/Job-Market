# RoleWithAI Python Scripts

Python scripts for the RoleWithAI Intelligence Agent.

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

3. Install dependencies (if any):
```bash
pip install -r requirements.txt
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

## Example Output

```
RoleWithAI Truth Score Calculator
==================================================

Test Case 1: Senior Product Designer at TechCorp Inc.
--------------------------------------------------
Truth Score: 95/100
Ghost Risk: LOW

Breakdown:
  Base Score: +50
  Recruiter Activity: +40
  Repost Frequency: -10
  Community Signal: +15

Why: Strong recruiter activity (high). Fresh posting (3 days old). Positive community sentiment.
```
