"""
RoleWithAI Truth Score Calculator
Python implementation of the truth score algorithm for job postings
"""

from datetime import datetime
from typing import Literal, Dict, Any
from dataclasses import dataclass


@dataclass
class GhostSignal:
    """Ghost signal data structure"""
    recruiter_activity: Literal['High', 'Moderate', 'None']
    repost_frequency: Literal['High', 'Low', 'None']
    community_sentiment: Literal['Positive', 'Neutral', 'Negative']


@dataclass
class TruthScoreResult:
    """Truth score calculation result"""
    truth_score: int  # 1-100
    ghost_risk: Literal['LOW', 'MEDIUM', 'HIGH']
    breakdown: Dict[str, int]
    why_score: str


def get_days_since_posted(posted_date: str) -> int:
    """Calculate days since posting date"""
    try:
        posted = datetime.fromisoformat(posted_date.replace('Z', '+00:00'))
        now = datetime.now(posted.tzinfo) if posted.tzinfo else datetime.now()
        diff = now - posted
        return diff.days
    except Exception:
        return 999  # Treat as very old if parsing fails


def calculate_truth_score(
    recruiter_activity: str,
    repost_frequency: str,
    posted_date: str,
    community_sentiment: str
) -> TruthScoreResult:
    """
    Calculate truth score based on the RoleWithAI algorithm:
    - Recruiter Activity: High = +40 points
    - Repost Frequency: High = -30 points
    - Posting Age: >30 days = -20 points
    - Community Signal: Negative = -25 points
    
    Ghost Risk Thresholds:
    - >80 = LOW
    - 50-79 = MEDIUM
    - <50 = HIGH
    """
    base_score = 50  # Start with neutral base
    
    breakdown = {
        'base_score': 50,
        'recruiter_activity': 0,
        'repost_frequency': 0,
        'posting_age': 0,
        'community_signal': 0,
    }
    
    # 1. Recruiter Activity: High = +40 points
    if recruiter_activity == 'High':
        base_score += 40
        breakdown['recruiter_activity'] = 40
    elif recruiter_activity == 'Moderate':
        base_score += 20
        breakdown['recruiter_activity'] = 20
    
    # 2. Repost Frequency: High = -30 points
    if repost_frequency == 'High':
        base_score -= 30
        breakdown['repost_frequency'] = -30
    elif repost_frequency == 'Low':
        base_score -= 10
        breakdown['repost_frequency'] = -10
    
    # 3. Posting Age: >30 days = -20 points
    days_old = get_days_since_posted(posted_date)
    if days_old > 30:
        base_score -= 20
        breakdown['posting_age'] = -20
    elif days_old > 14:
        base_score -= 10
        breakdown['posting_age'] = -10
    
    # 4. Community Signal: Negative = -25 points
    if community_sentiment == 'Negative':
        base_score -= 25
        breakdown['community_signal'] = -25
    elif community_sentiment == 'Positive':
        base_score += 15
        breakdown['community_signal'] = 15
    
    # Clamp score between 1-100
    truth_score = max(1, min(100, round(base_score)))
    
    # Determine Ghost Risk
    if truth_score > 80:
        ghost_risk = 'LOW'
    elif truth_score >= 50:
        ghost_risk = 'MEDIUM'
    else:
        ghost_risk = 'HIGH'
    
    # Generate "why score" explanation
    why_score = generate_why_score(truth_score, breakdown, days_old, {
        'recruiter_activity': recruiter_activity,
        'repost_frequency': repost_frequency,
        'community_sentiment': community_sentiment
    })
    
    return TruthScoreResult(
        truth_score=truth_score,
        ghost_risk=ghost_risk,
        breakdown=breakdown,
        why_score=why_score
    )


def generate_why_score(
    score: int,
    breakdown: Dict[str, int],
    days_old: int,
    signals: Dict[str, str]
) -> str:
    """Generate human-readable explanation of the score"""
    reasons = []
    
    if breakdown['recruiter_activity'] > 0:
        reasons.append(f"Strong recruiter activity ({signals['recruiter_activity'].lower()})")
    
    if breakdown['repost_frequency'] < 0:
        reasons.append("High repost frequency suggests this may be an evergreen posting")
    
    if days_old > 30:
        reasons.append(f"Posted {days_old} days ago—may be stale")
    elif days_old < 7:
        reasons.append(f"Fresh posting ({days_old} days old)")
    
    if signals['community_sentiment'] == 'Negative':
        reasons.append("Community reports suggest ghosting concerns")
    elif signals['community_sentiment'] == 'Positive':
        reasons.append("Positive community sentiment")
    
    if not reasons:
        return 'Moderate signals across all indicators'
    
    return '. '.join(reasons) + '.'


def main():
    """Example usage of the truth score calculator"""
    print("RoleWithAI Truth Score Calculator")
    print("=" * 50)
    
    # Example job posting
    test_cases = [
        {
            'title': 'Senior Product Designer',
            'company': 'TechCorp Inc.',
            'recruiter_activity': 'High',
            'repost_frequency': 'Low',
            'posted_date': '2026-01-15T00:00:00Z',
            'community_sentiment': 'Positive'
        },
        {
            'title': 'Product Manager',
            'company': 'StartupXYZ',
            'recruiter_activity': 'None',
            'repost_frequency': 'High',
            'posted_date': '2025-12-01T00:00:00Z',
            'community_sentiment': 'Negative'
        },
        {
            'title': 'UX Lead',
            'company': 'DesignStudio',
            'recruiter_activity': 'Moderate',
            'repost_frequency': 'None',
            'posted_date': '2026-01-10T00:00:00Z',
            'community_sentiment': 'Neutral'
        }
    ]
    
    for i, job in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {job['title']} at {job['company']}")
        print("-" * 50)
        
        result = calculate_truth_score(
            recruiter_activity=job['recruiter_activity'],
            repost_frequency=job['repost_frequency'],
            posted_date=job['posted_date'],
            community_sentiment=job['community_sentiment']
        )
        
        print(f"Truth Score: {result.truth_score}/100")
        print(f"Ghost Risk: {result.ghost_risk}")
        print(f"\nBreakdown:")
        for key, value in result.breakdown.items():
            if value != 0:
                print(f"  {key.replace('_', ' ').title()}: {value:+d}")
        print(f"\nWhy: {result.why_score}")


if __name__ == '__main__':
    main()
