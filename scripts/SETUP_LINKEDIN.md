# LinkedIn Scraper Setup Guide

## Installation

1. **Install Playwright Python package:**
   ```bash
   pip install playwright
   ```

2. **Install Chromium browser (required for Playwright):**
   ```bash
   playwright install chromium
   ```

   This will download the Chromium browser that Playwright uses for automation.

## Usage

The LinkedIn scraper automatically uses the guest portal, which means:
- ✅ No login required
- ✅ No risk of account bans
- ✅ More permissive than logged-in scraping
- ✅ Structured HTML that's easier to parse

## How It Works

1. Navigates to: `https://www.linkedin.com/jobs/search?keywords=YOUR_KEYWORDS&location=YOUR_LOCATION`
2. Scrolls to load more jobs (up to max_results)
3. Extracts job data from each card:
   - Title
   - Company
   - Location
   - Posted date
   - Job URL
   - Description snippet

## Example

```python
from linkedin_scraper import LinkedInScraper

scraper = LinkedInScraper(headless=True)  # headless=False to see browser
jobs = scraper.search_jobs(
    keywords=['Machine Learning', 'Engineer'],
    location='United States',
    max_results=50
)

for job in jobs:
    print(f"{job.title} at {job.company}")
    print(f"Location: {job.location}")
    print(f"URL: {job.url}\n")
```

## Troubleshooting

### Playwright not found
If you see "Playwright not available", make sure you've:
1. Installed: `pip install playwright`
2. Installed browser: `playwright install chromium`

### No jobs found
- LinkedIn's HTML structure may have changed
- Check if the page loads correctly by setting `headless=False`
- The scraper will fall back to mock data if scraping fails

### Rate limiting
LinkedIn may rate limit if you make too many requests. The scraper includes:
- Delays between scrolls
- Respectful user agent
- Guest portal (less restricted)

## Notes

- The scraper uses LinkedIn's guest portal (no login required)
- It's designed to be respectful of LinkedIn's servers
- Falls back to mock data if scraping fails
- All data is extracted from publicly available job listings
