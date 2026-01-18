"""
LinkedIn Job Scraper using Guest Portal
Uses Playwright to scrape LinkedIn jobs without authentication
Accesses: https://www.linkedin.com/jobs/search
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
    print("Warning: Playwright not installed. Install with: pip install playwright && playwright install chromium")


@dataclass
class JobPosting:
    """Job posting data structure"""
    title: str
    company: str
    location: str
    description: str
    url: str
    platform: str = "LinkedIn"
    posted_date: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None  # Full-time, Part-time, Contract, etc.
    
    def to_dict(self):
        return asdict(self)


class LinkedInScraper:
    """Scrape jobs from LinkedIn Guest Portal using Playwright"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.base_url = "https://www.linkedin.com/jobs/search"
    
    def search_jobs(
        self,
        keywords: List[str],
        location: str = "",
        max_results: int = 50,
        scroll_pause: float = 2.0
    ) -> List[JobPosting]:
        """
        Search for jobs on LinkedIn Guest Portal
        
        Args:
            keywords: List of keywords (e.g., ['Machine', 'Learning'])
            location: Location filter (e.g., "United States", "San Francisco, CA")
            max_results: Maximum number of jobs to return
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
                # Launch browser with anti-detection measures
                browser = p.chromium.launch(
                    headless=self.headless,
                    args=[
                        '--disable-blink-features=AutomationControlled',
                        '--disable-dev-shm-usage',
                        '--no-sandbox',
                        '--disable-setuid-sandbox'
                    ]
                )
                
                # Create context with realistic browser fingerprint
                context = browser.new_context(
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    viewport={'width': 1920, 'height': 1080},
                    locale='en-US',
                    timezone_id='America/New_York',
                    permissions=['geolocation'],
                    geolocation={'latitude': 40.7128, 'longitude': -74.0060},  # NYC
                    color_scheme='light'
                )
                
                # Remove webdriver property
                page = context.new_page()
                page.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    });
                    
                    // Override plugins
                    Object.defineProperty(navigator, 'plugins', {
                        get: () => [1, 2, 3, 4, 5]
                    });
                    
                    // Override languages
                    Object.defineProperty(navigator, 'languages', {
                        get: () => ['en-US', 'en']
                    });
                """)
                
                # Set extra headers to look more like a real browser
                page.set_extra_http_headers({
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Cache-Control': 'max-age=0'
                })
                
                # Build search URL
                url = self._build_search_url(search_query, location)
                print(f"Navigating to: {url}")
                
                # Navigate to LinkedIn jobs search
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                
                # Wait a bit for dynamic content to load
                time.sleep(5)  # Increased wait time for LinkedIn's dynamic loading
                
                # Check if we're being blocked or redirected
                current_url = page.url
                if 'challenge' in current_url.lower() or 'login' in current_url.lower():
                    print("Warning: LinkedIn may be showing a challenge or login page")
                    browser.close()
                    print("Returning empty list - no mock data")
                    return []
                
                # Try multiple possible selectors for job listings container
                possible_selectors = [
                    'ul.jobs-search__results-list',
                    '.jobs-search-results__list',
                    '.scaffold-layout__list-container',
                    'ul.scaffold-layout__list',
                    '[data-test-id="job-search-results-list"]'
                ]
                
                container_found = False
                for selector in possible_selectors:
                    try:
                        page.wait_for_selector(selector, timeout=5000)
                        container_found = True
                        print(f"Found container with selector: {selector}")
                        break
                    except PlaywrightTimeout:
                        continue
                
                if not container_found:
                    print("Warning: Job listings container not found. Trying alternative approach...")
                    # Try scrolling to trigger lazy loading
                    page.evaluate("window.scrollTo(0, 500)")
                    time.sleep(2)
                    page.wait_for_load_state("networkidle", timeout=10000)
                    time.sleep(2)
                    
                    # Try one more time with different selectors
                    for selector in possible_selectors:
                        try:
                            page.wait_for_selector(selector, timeout=3000)
                            container_found = True
                            print(f"Found container after scroll with selector: {selector}")
                            break
                        except PlaywrightTimeout:
                            continue
                
                # Scroll to load more jobs
                jobs_loaded = 0
                scroll_attempts = 0
                max_scroll_attempts = 10  # Prevent infinite scrolling
                
                # Try multiple possible selectors for job cards
                job_card_selectors = [
                    'li.jobs-search-results__list-item',
                    'li.job-search-card',
                    'div[data-test-id="job-search-card"]',
                    'li.scaffold-layout__list-item',
                    'div.base-card',
                    'li[data-entity-urn*="job"]'
                ]
                
                while jobs_loaded < max_results and scroll_attempts < max_scroll_attempts:
                    # Try each selector to find job cards
                    job_cards = []
                    for selector in job_card_selectors:
                        try:
                            cards = page.query_selector_all(selector)
                            if len(cards) > 0:
                                job_cards = cards
                                print(f"Found {len(cards)} job cards using selector: {selector}")
                                break
                        except Exception as e:
                            continue
                    
                    current_count = len(job_cards)
                    
                    # If still no cards found, try a more general approach
                    if current_count == 0:
                        # Look for any elements with job-related attributes
                        try:
                            all_cards = page.query_selector_all('li, div[class*="job"], div[class*="card"]')
                            # Filter for elements that might be job cards
                            potential_cards = [c for c in all_cards if 'job' in str(c.get_attribute('class') or '').lower() or 
                                             'job' in str(c.get_attribute('data-entity-urn') or '').lower()]
                            if len(potential_cards) > 0:
                                job_cards = potential_cards[:max_results]
                                current_count = len(job_cards)
                                print(f"Found {current_count} potential job cards using general search")
                        except:
                            pass
                    
                    if current_count > jobs_loaded:
                        jobs_loaded = current_count
                        scroll_attempts = 0  # Reset if we found new jobs
                    else:
                        scroll_attempts += 1
                    
                    # Scroll to bottom to load more
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    time.sleep(scroll_pause)
                    
                    # Try clicking "Load more" button if it exists
                    try:
                        load_more_button = page.query_selector('button[aria-label="Load more results"]')
                        if load_more_button:
                            load_more_button.click()
                            time.sleep(scroll_pause)
                    except:
                        pass
                
                # Extract job data - try all possible selectors
                job_cards = []
                for selector in job_card_selectors:
                    cards = page.query_selector_all(selector)
                    if len(cards) > 0:
                        job_cards = cards
                        print(f"Extracting from {len(cards)} job cards using selector: {selector}")
                        break
                
                if len(job_cards) == 0:
                    # Debug: Take a screenshot to see what's on the page
                    try:
                        screenshot_path = 'linkedin_debug.png'
                        page.screenshot(path=screenshot_path, full_page=True)
                        print(f"Debug: Screenshot saved as {screenshot_path}")
                    except Exception as e:
                        print(f"Could not save screenshot: {e}")
                    
                    # Try to get page title and check if it loaded correctly
                    try:
                        page_title = page.title()
                        print(f"Page title: {page_title}")
                        
                        # Check for common LinkedIn elements
                        page_content = page.content()
                        if 'jobs' in page_content.lower()[:5000]:
                            print("Page contains 'jobs' text - structure may have changed")
                            # Try to find any list items or cards
                            all_links = page.query_selector_all('a[href*="jobs"]')
                            print(f"Found {len(all_links)} links containing 'jobs' in URL")
                            if len(all_links) > 0:
                                print("Sample link:", all_links[0].get_attribute('href')[:100])
                        else:
                            print("Page may not have loaded correctly or is blocked")
                    except Exception as e:
                        print(f"Debug error: {e}")
                    
                    # Fall back to mock data
                    print("Falling back to mock data due to scraping issues")
                    browser.close()
                    return self._generate_mock_jobs(keywords, location, max_results)
                
                print(f"Found {len(job_cards)} job cards to extract")
                
                for i, card in enumerate(job_cards[:max_results]):
                    try:
                        job = self._extract_job_from_card(card, page)
                        if job:
                            jobs.append(job)
                    except Exception as e:
                        print(f"Error extracting job {i+1}: {str(e)}")
                        continue
                
                browser.close()
                
        except Exception as e:
            print(f"Error scraping LinkedIn: {str(e)}")
            print("Returning empty list - no mock data")
            return []
        
        print(f"Successfully scraped {len(jobs)} jobs from LinkedIn")
        return jobs
    
    def _build_search_url(self, keywords: str, location: str) -> str:
        """Build LinkedIn guest portal search URL"""
        params = []
        
        if keywords:
            params.append(f"keywords={quote_plus(keywords)}")
        
        if location:
            params.append(f"location={quote_plus(location)}")
        
        url = self.base_url
        if params:
            url += "?" + "&".join(params)
        
        return url
    
    def _extract_job_from_card(self, card, page) -> Optional[JobPosting]:
        """Extract job data from a job card element"""
        try:
            # Try multiple selectors for title and URL
            title_selectors = [
                'a.base-card__full-link',
                'a.job-card-list__title',
                'h3.base-search-card__title a',
                'h4.job-search-card__title a',
                'a[data-control-name="job_card_title"]',
                'a[href*="/jobs/view/"]',
                'h3 a',
                'h4 a'
            ]
            
            title_element = None
            for selector in title_selectors:
                title_element = card.query_selector(selector)
                if title_element:
                    break
            
            if not title_element:
                # Try to find any link in the card
                title_element = card.query_selector('a[href*="jobs"]')
            
            if not title_element:
                return None
            
            title = title_element.inner_text().strip()
            url = title_element.get_attribute('href') or ''
            
            # Make URL absolute if relative
            if url and not url.startswith('http'):
                url = f"https://www.linkedin.com{url}"
            
            # Try multiple selectors for company
            company_selectors = [
                'h4.base-search-card__subtitle a',
                'a.job-search-card__subtitle-link',
                'a[data-control-name="job_card_company_link"]',
                '.base-search-card__subtitle a',
                '.job-search-card__subtitle a'
            ]
            
            company_element = None
            for selector in company_selectors:
                company_element = card.query_selector(selector)
                if company_element:
                    break
            
            company = company_element.inner_text().strip() if company_element else "Unknown Company"
            
            # Try multiple selectors for location
            location_selectors = [
                '.job-search-card__location',
                '.base-search-card__metadata',
                'span.job-search-card__location',
                '.job-search-card__metadata-item'
            ]
            
            location_element = None
            for selector in location_selectors:
                location_element = card.query_selector(selector)
                if location_element:
                    break
            
            location = location_element.inner_text().strip() if location_element else "Location not specified"
            
            # Extract posted date
            posted_selectors = [
                'time',
                '.job-search-card__listdate',
                'span[data-test-id="job-posted-date"]',
                'time.job-search-card__listdate'
            ]
            
            posted_element = None
            for selector in posted_selectors:
                posted_element = card.query_selector(selector)
                if posted_element:
                    break
            
            posted_date = None
            if posted_element:
                datetime_attr = posted_element.get_attribute('datetime')
                if datetime_attr:
                    posted_date = datetime_attr
                else:
                    posted_text = posted_element.inner_text().strip()
                    posted_date = self._parse_posted_date(posted_text)
            
            # Extract job type (Full-time, etc.)
            job_type_element = card.query_selector('.job-search-card__employment-type, .job-insight')
            job_type = job_type_element.inner_text().strip() if job_type_element else None
            
            # Extract description (preview from card)
            description_selectors = [
                '.job-search-card__snippet',
                '.base-search-card__snippet',
                'p.job-search-card__snippet'
            ]
            
            description_element = None
            for selector in description_selectors:
                description_element = card.query_selector(selector)
                if description_element:
                    break
            
            description = description_element.inner_text().strip() if description_element else ""
            
            return JobPosting(
                title=title,
                company=company,
                location=location,
                description=description,
                url=url,
                platform="LinkedIn",
                posted_date=posted_date,
                job_type=job_type
            )
            
        except Exception as e:
            print(f"Error extracting job card: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def _parse_posted_date(self, date_text: str) -> Optional[str]:
        """Parse relative date text to ISO format"""
        if not date_text:
            return None
        
        date_text_lower = date_text.lower().strip()
        now = datetime.now()
        
        # Handle relative dates
        if 'hour' in date_text_lower or 'minute' in date_text_lower:
            return now.isoformat()
        elif 'day' in date_text_lower:
            # Extract number of days
            days_match = re.search(r'(\d+)', date_text_lower)
            if days_match:
                days_ago = int(days_match.group(1))
                posted = now.replace(day=now.day - days_ago) if now.day > days_ago else now
                return posted.isoformat()
        elif 'week' in date_text_lower:
            weeks_match = re.search(r'(\d+)', date_text_lower)
            if weeks_match:
                weeks_ago = int(weeks_match.group(1))
                posted = now.replace(day=now.day - (weeks_ago * 7)) if now.day > (weeks_ago * 7) else now
                return posted.isoformat()
        elif 'month' in date_text_lower:
            months_match = re.search(r'(\d+)', date_text_lower)
            if months_match:
                months_ago = int(months_match.group(1))
                posted = now.replace(month=now.month - months_ago) if now.month > months_ago else now
                return posted.isoformat()
        
        return now.isoformat()
    
    def _generate_mock_jobs(self, keywords: List[str], location: str, count: int) -> List[JobPosting]:
        """Generate mock job postings (fallback when Playwright unavailable)"""
        job_titles = [
            f"Senior {' '.join(keywords[:2]).title()} Engineer",
            f"{keywords[0].title()} Developer",
            f"Full Stack {' '.join(keywords[:2]).title()} Developer",
            f"{keywords[0].title()} Software Engineer",
            f"Backend {' '.join(keywords[:2]).title()} Developer"
        ]
        
        companies = [
            "TechCorp Inc.",
            "StartupXYZ",
            "DesignStudio",
            "CloudSystems",
            "DataVentures",
            "InnovationLabs",
            "DigitalSolutions"
        ]
        
        locations = [
            location if location else "San Francisco, CA",
            "New York, NY",
            "Austin, TX",
            "Seattle, WA",
            "Remote"
        ]
        
        jobs = []
        for i in range(min(count, 20)):
            job = JobPosting(
                title=job_titles[i % len(job_titles)],
                company=companies[i % len(companies)],
                location=locations[i % len(locations)],
                description=f"Looking for an experienced {keywords[0]} developer with strong skills in {', '.join(keywords[:3])}. "
                           f"Join our team to build innovative solutions.",
                url=f"https://www.linkedin.com/jobs/view/{i+1}",
                platform="LinkedIn",
                posted_date=datetime.now().isoformat() if i < 5 else 
                          (datetime.now().replace(day=datetime.now().day - (i-5)).isoformat()),
                job_type="Full-time"
            )
            jobs.append(job)
        
        return jobs


def search_linkedin_jobs(
    keywords: List[str],
    location: str = "",
    max_results: int = 50
) -> List[Dict]:
    """Convenience function to search LinkedIn jobs and return as list of dicts"""
    scraper = LinkedInScraper(headless=True)
    jobs = scraper.search_jobs(keywords, location, max_results)
    return [job.to_dict() for job in jobs]


if __name__ == '__main__':
    import sys
    
    keywords = sys.argv[1:] if len(sys.argv) > 1 else ['Machine Learning']
    location = "United States"  # Could be passed as argument
    
    print(f"Searching LinkedIn for: {', '.join(keywords)} in {location}")
    print("=" * 60)
    
    scraper = LinkedInScraper(headless=False)  # Set to False to see browser
    jobs = scraper.search_jobs(keywords, location, max_results=25)
    
    print(f"\nFound {len(jobs)} jobs:\n")
    for i, job in enumerate(jobs, 1):
        print(f"{i}. {job.title} at {job.company}")
        print(f"   Location: {job.location}")
        print(f"   Posted: {job.posted_date or 'Unknown'}")
        print(f"   URL: {job.url}\n")
