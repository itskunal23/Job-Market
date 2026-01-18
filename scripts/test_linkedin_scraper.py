"""
Test LinkedIn scraper with debugging
Run this to see what LinkedIn's current structure looks like
"""

import sys
from pathlib import Path

# Add scripts to path
scripts_dir = Path(__file__).parent
sys.path.insert(0, str(scripts_dir))

from linkedin_scraper import LinkedInScraper

def test_scraper():
    print("Testing LinkedIn Scraper")
    print("=" * 60)
    
    # Test with headless=False to see what's happening
    scraper = LinkedInScraper(headless=False)  # Set to False to see browser
    
    print("\nSearching for: 'Software Engineer' in 'United States'")
    print("This will open a browser window so you can see what's happening...")
    print("=" * 60)
    
    jobs = scraper.search_jobs(
        keywords=['Software', 'Engineer'],
        location='United States',
        max_results=10
    )
    
    print(f"\n{'='*60}")
    print(f"Results: Found {len(jobs)} jobs")
    print(f"{'='*60}\n")
    
    for i, job in enumerate(jobs[:5], 1):
        print(f"{i}. {job.title}")
        print(f"   Company: {job.company}")
        print(f"   Location: {job.location}")
        print(f"   URL: {job.url}")
        print()

if __name__ == '__main__':
    test_scraper()
