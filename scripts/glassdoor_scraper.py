"""
Glassdoor Job Scraper using Guest Portal
Uses Playwright to scrape Glassdoor jobs without authentication
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import time
import re
from urllib.parse import quote_plus

try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


@dataclass
class JobPosting:
    """Job posting data structure"""
    title: str
    company: str
    location: str
    description: str
    url: str
    platform: str = "Glassdoor"
    posted_date: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None
    
    def to_dict(self):
        return asdict(self)


class GlassdoorScraper:
    """Scrape jobs from Glassdoor Guest Portal using Playwright"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.base_url = "https://www.glassdoor.com/Job/jobs.htm"
    
    def search_jobs(
        self,
        keywords: List[str],
        location: str = "",
        max_results: int = 50,
        scroll_pause: float = 2.0
    ) -> List[JobPosting]:
        """
        Search for jobs on Glassdoor
        
        Args:
            keywords: List of keywords
            location: Location filter
            max_results: Maximum number of results
            scroll_pause: Seconds to wait between scrolls
        
        Returns:
            List of JobPosting objects
        """
        if not PLAYWRIGHT_AVAILABLE:
            raise ImportError("Playwright not available. Install with: pip install playwright && playwright install chromium")
        
        jobs = []
        search_query = " ".join(keywords)
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=self.headless,
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--disable-dev-shm-usage',
                        '--no-sandbox'
                    ]
                )
                context = browser.new_context(
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    viewport={'width': 1920, 'height': 1080},
                    locale='en-US'
                )
                page = context.new_page()
                page.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    });
                """)
                
                # Build search URL
                url = self._build_search_url(search_query, location)
                print(f"Glassdoor: Navigating to {url}")
                
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                time.sleep(4)  # Glassdoor needs more time
                
                # Wait for job cards
                job_card_selectors = [
                    'li[data-test="job-listing"]',
                    'li.react-job-listing',
                    'div[data-test="job-listing"]',
                    'li.jl'
                ]
                
                job_cards = []
                for selector in job_card_selectors:
                    try:
                        page.wait_for_selector(selector, timeout=5000)
                        cards = page.query_selector_all(selector)
                        if len(cards) > 0:
                            job_cards = cards
                            print(f"Glassdoor: Found {len(cards)} jobs using {selector}")
                            break
                    except PlaywrightTimeout:
                        continue
                
                # Scroll to load more
                for _ in range(3):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(scroll_pause)
                    for selector in job_card_selectors:
                        cards = page.query_selector_all(selector)
                        if len(cards) > len(job_cards):
                            job_cards = cards
                            break
                
                # Extract job data
                for i, card in enumerate(job_cards[:max_results]):
                    try:
                        job = self._extract_job_from_card(card, page)
                        if job:
                            jobs.append(job)
                    except Exception as e:
                        print(f"Error extracting Glassdoor job {i+1}: {e}")
                        continue
                
                browser.close()
                
        except Exception as e:
            print(f"Error scraping Glassdoor: {e}")
            print("Returning empty list - no mock data")
            return []
        
        print(f"Glassdoor: Successfully scraped {len(jobs)} jobs")
        return jobs  # Return empty list if no jobs found (no mock data)
    
    def _build_search_url(self, keywords: str, location: str) -> str:
        """Build Glassdoor search URL"""
        params = []
        if keywords:
            params.append(f"sc.keyword={quote_plus(keywords)}")
        if location:
            params.append(f"locT=C&locId={quote_plus(location)}")
        
        url = self.base_url
        if params:
            url += "?" + "&".join(params)
        return url
    
    def _extract_job_from_card(self, card, page) -> Optional[JobPosting]:
        """Extract job data from Glassdoor job card"""
        try:
            # Title and URL
            title_selectors = ['a[data-test="job-link"]', 'a.jobLink', 'h3 a']
            title_element = None
            for selector in title_selectors:
                title_element = card.query_selector(selector)
                if title_element:
                    break
            
            if not title_element:
                return None
            
            title = title_element.inner_text().strip()
            url = title_element.get_attribute('href') or ''
            if url and not url.startswith('http'):
                url = f"https://www.glassdoor.com{url}"
            
            # Company
            company_selectors = ['a[data-test="employer-name"]', '.employerName', 'div[data-test="employer-name"]']
            company_element = None
            for selector in company_selectors:
                company_element = card.query_selector(selector)
                if company_element:
                    break
            company = company_element.inner_text().strip() if company_element else "Unknown Company"
            
            # Location
            location_selectors = ['span[data-test="job-location"]', '.location', 'div[data-test="job-location"]']
            location_element = None
            for selector in location_selectors:
                location_element = card.query_selector(selector)
                if location_element:
                    break
            location = location_element.inner_text().strip() if location_element else "Location not specified"
            
            # Salary
            salary_element = card.query_selector('span[data-test="detailSalary"], .salary')
            salary = salary_element.inner_text().strip() if salary_element else None
            
            # Description snippet
            desc_element = card.query_selector('div[data-test="job-snippet"], .jobSnippet')
            description = desc_element.inner_text().strip() if desc_element else ""
            
            # Posted date
            date_element = card.query_selector('div[data-test="job-age"], .job-age')
            posted_date = None
            if date_element:
                date_text = date_element.inner_text().strip()
                posted_date = self._parse_posted_date(date_text)
            
            return JobPosting(
                title=title,
                company=company,
                location=location,
                description=description,
                url=url,
                platform="Glassdoor",
                posted_date=posted_date,
                salary=salary
            )
            
        except Exception as e:
            print(f"Error extracting Glassdoor job card: {e}")
            return None
    
    def _parse_posted_date(self, date_text: str) -> Optional[str]:
        """Parse relative date text"""
        if not date_text:
            return None
        
        date_text_lower = date_text.lower()
        now = datetime.now()
        
        if 'just posted' in date_text_lower or 'today' in date_text_lower:
            return now.isoformat()
        elif 'day' in date_text_lower:
            days_match = re.search(r'(\d+)', date_text_lower)
            if days_match:
                days_ago = int(days_match.group(1))
                posted = now.replace(day=max(1, now.day - days_ago))
                return posted.isoformat()
        
        return now.isoformat()
    
    def _generate_mock_jobs(self, keywords: List[str], location: str, count: int) -> List[JobPosting]:
        """Generate mock Glassdoor jobs"""
        job_titles = [
            f"Senior {' '.join(keywords[:2]).title()} Engineer",
            f"{keywords[0].title()} Developer",
            f"Full Stack {' '.join(keywords[:2]).title()} Developer"
        ]
        
        companies = ["TechCorp", "StartupXYZ", "DesignStudio", "CloudSystems"]
        locations = [location if location else "San Francisco, CA", "New York, NY", "Remote"]
        
        jobs = []
        for i in range(min(count, 15)):
            jobs.append(JobPosting(
                title=job_titles[i % len(job_titles)],
                company=companies[i % len(companies)],
                location=locations[i % len(locations)],
                description=f"Looking for {keywords[0]} developer.",
                url=f"https://www.glassdoor.com/job-listing/{i+1}",
                platform="Glassdoor",
                posted_date=datetime.now().isoformat(),
                job_type="Full-time"
            ))
        
        return jobs
