"""
Job Scraper
Scrapes job postings from various job boards (LinkedIn, Indeed, etc.)
Now uses LinkedIn Guest Portal via Playwright for real data
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import json

# Import scrapers
try:
    from linkedin_scraper import LinkedInScraper, JobPosting as LinkedInJobPosting
    LINKEDIN_SCRAPER_AVAILABLE = True
except ImportError:
    LINKEDIN_SCRAPER_AVAILABLE = False

try:
    from indeed_scraper import IndeedScraper, JobPosting as IndeedJobPosting
    INDEED_SCRAPER_AVAILABLE = True
except ImportError:
    INDEED_SCRAPER_AVAILABLE = False

try:
    from glassdoor_scraper import GlassdoorScraper, JobPosting as GlassdoorJobPosting
    GLASSDOOR_SCRAPER_AVAILABLE = True
except ImportError:
    GLASSDOOR_SCRAPER_AVAILABLE = False


@dataclass
class JobPosting:
    """Job posting data structure"""
    title: str
    company: str
    location: str
    description: str
    url: str
    platform: str
    posted_date: Optional[str] = None
    salary: Optional[str] = None
    job_type: Optional[str] = None  # Full-time, Part-time, Contract, etc.
    
    def to_dict(self):
        return asdict(self)


class JobScraper:
    """Scrape jobs from various job boards (LinkedIn, Indeed, Glassdoor)"""
    
    def __init__(self, use_all_sources: bool = True):
        self.use_all_sources = use_all_sources
    
    def search_jobs(
        self, 
        keywords: List[str], 
        location: str = "", 
        max_results: int = 50,
        sources: List[str] = None
    ) -> List[JobPosting]:
        """
        Search for jobs matching keywords across multiple platforms
        
        Args:
            keywords: List of job-related keywords (e.g., ['python', 'developer'])
            location: Location filter (e.g., "San Francisco, CA" or "United States")
            max_results: Maximum number of results to return per source
            sources: List of sources to use ['linkedin', 'indeed', 'glassdoor']. If None, uses all available
        
        Returns:
            List of JobPosting objects from all sources
        """
        all_jobs = []
        
        if sources is None:
            sources = ['linkedin', 'indeed', 'glassdoor']
        
        # Calculate jobs per source
        jobs_per_source = max(10, max_results // len(sources))
        
        # Scrape from LinkedIn
        if 'linkedin' in sources and LINKEDIN_SCRAPER_AVAILABLE:
            try:
                linkedin_scraper = LinkedInScraper(headless=True)
                linkedin_jobs = linkedin_scraper.search_jobs(keywords, location, jobs_per_source)
                
                for lj in linkedin_jobs:
                    job = JobPosting(
                        title=lj.title,
                        company=lj.company,
                        location=lj.location,
                        description=lj.description,
                        url=lj.url,
                        platform=lj.platform,
                        posted_date=lj.posted_date,
                        salary=lj.salary,
                        job_type=lj.job_type
                    )
                    all_jobs.append(job)
                print(f"LinkedIn: Added {len(linkedin_jobs)} jobs")
            except Exception as e:
                print(f"LinkedIn scraping failed: {str(e)}")
        
        # Scrape from Indeed
        if 'indeed' in sources and INDEED_SCRAPER_AVAILABLE:
            try:
                indeed_scraper = IndeedScraper(headless=True)
                indeed_jobs = indeed_scraper.search_jobs(keywords, location, jobs_per_source)
                
                for ij in indeed_jobs:
                    job = JobPosting(
                        title=ij.title,
                        company=ij.company,
                        location=ij.location,
                        description=ij.description,
                        url=ij.url,
                        platform=ij.platform,
                        posted_date=ij.posted_date,
                        salary=ij.salary,
                        job_type=ij.job_type
                    )
                    all_jobs.append(job)
                print(f"Indeed: Added {len(indeed_jobs)} jobs")
            except Exception as e:
                print(f"Indeed scraping failed: {str(e)}")
        
        # Scrape from Glassdoor
        if 'glassdoor' in sources and GLASSDOOR_SCRAPER_AVAILABLE:
            try:
                glassdoor_scraper = GlassdoorScraper(headless=True)
                glassdoor_jobs = glassdoor_scraper.search_jobs(keywords, location, jobs_per_source)
                
                for gj in glassdoor_jobs:
                    job = JobPosting(
                        title=gj.title,
                        company=gj.company,
                        location=gj.location,
                        description=gj.description,
                        url=gj.url,
                        platform=gj.platform,
                        posted_date=gj.posted_date,
                        salary=gj.salary,
                        job_type=gj.job_type
                    )
                    all_jobs.append(job)
                print(f"Glassdoor: Added {len(glassdoor_jobs)} jobs")
            except Exception as e:
                print(f"Glassdoor scraping failed: {str(e)}")
        
        # If no jobs found from any source, return empty list (no mock data)
        if not all_jobs:
            print("Warning: No jobs found from any source. Check your internet connection and scraper configuration.")
            return []
        
        # Remove duplicates based on title + company
        seen = set()
        unique_jobs = []
        for job in all_jobs:
            key = (job.title.lower(), job.company.lower())
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs[:max_results]
    
    def scrape_popular_jobs(self, location: str = "", max_per_source: int = 20) -> List[JobPosting]:
        """
        Scrape popular/high-demand jobs across all platforms
        Uses common high-demand keywords
        """
        popular_keywords = [
            ['Software', 'Engineer'],
            ['Product', 'Manager'],
            ['Data', 'Scientist'],
            ['Full', 'Stack', 'Developer'],
            ['Machine', 'Learning', 'Engineer'],
            ['DevOps', 'Engineer'],
            ['UX', 'Designer'],
            ['Product', 'Designer']
        ]
        
        all_jobs = []
        
        for keywords in popular_keywords[:5]:  # Top 5 categories
            jobs = self.search_jobs(keywords, location, max_per_source)
            all_jobs.extend(jobs)
        
        # Remove duplicates
        seen = set()
        unique_jobs = []
        for job in all_jobs:
            key = (job.title.lower(), job.company.lower())
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs[:max_per_source * 5]  # Return up to 100 jobs
    
    def _generate_mock_jobs(self, keywords: List[str], location: str, count: int) -> List[JobPosting]:
        """Generate mock job postings based on keywords (for development/testing)"""
        # This is a placeholder - replace with actual scraping logic
        
        job_titles = [
            f"Senior {' '.join(keywords[:2]).title()} Developer",
            f"{keywords[0].title()} Engineer",
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
        
        platforms = ["LinkedIn", "Indeed", "Glassdoor"]
        
        jobs = []
        for i in range(min(count, 20)):  # Generate up to 20 mock jobs
            job = JobPosting(
                title=job_titles[i % len(job_titles)],
                company=companies[i % len(companies)],
                location=locations[i % len(locations)],
                description=f"Looking for an experienced {keywords[0]} developer with strong skills in {', '.join(keywords[:3])}. "
                           f"Join our team to build innovative solutions. Requirements include {keywords[0]} expertise, "
                           f"problem-solving skills, and collaborative mindset.",
                url=f"https://example.com/jobs/{i+1}",
                platform=platforms[i % len(platforms)],
                posted_date=(datetime.now().isoformat() if i < 5 else 
                           (datetime.now().replace(day=datetime.now().day - (i-5)).isoformat())),
                job_type="Full-time"
            )
            jobs.append(job)
        
        return jobs
    
    def scrape_linkedin(self, keywords: List[str], location: str = "") -> List[JobPosting]:
        """Scrape LinkedIn jobs using guest portal"""
        return self.search_jobs(keywords, location, 50, sources=['linkedin'])
    
    def scrape_indeed(self, keywords: List[str], location: str = "") -> List[JobPosting]:
        """Scrape Indeed jobs"""
        return self.search_jobs(keywords, location, 50, sources=['indeed'])
    
    def scrape_glassdoor(self, keywords: List[str], location: str = "") -> List[JobPosting]:
        """Scrape Glassdoor jobs"""
        return self.search_jobs(keywords, location, 50, sources=['glassdoor'])
    
    def scrape_indeed(self, keywords: List[str], location: str = "") -> List[JobPosting]:
        """
        Scrape Indeed jobs using web scraping
        Note: Indeed has an official API - consider using that in production: https://www.indeed.com/publisher
        """
        return self.search_jobs(keywords, location, 50, sources=['indeed'])
    
    def scrape_glassdoor(self, keywords: List[str], location: str = "") -> List[JobPosting]:
        """
        Scrape Glassdoor jobs using web scraping
        Note: Check Glassdoor's ToS and consider using official API if available
        """
        return self.search_jobs(keywords, location, 50, sources=['glassdoor'])


def search_jobs(keywords: List[str], location: str = "", max_results: int = 50) -> List[Dict]:
    """Convenience function to search jobs and return as list of dicts"""
    scraper = JobScraper()
    jobs = scraper.search_jobs(keywords, location, max_results)
    return [job.to_dict() for job in jobs]


if __name__ == '__main__':
    import sys
    
    keywords = sys.argv[1:] if len(sys.argv) > 1 else ['python', 'developer']
    location = ""  # Could be passed as argument
    
    print(f"Searching for jobs with keywords: {', '.join(keywords)}")
    jobs = search_jobs(keywords, location, max_results=10)
    
    print(f"\nFound {len(jobs)} jobs:\n")
    for i, job in enumerate(jobs, 1):
        print(f"{i}. {job['title']} at {job['company']}")
        print(f"   Location: {job['location']}")
        print(f"   Platform: {job['platform']}")
        print(f"   URL: {job['url']}\n")
