"""
Job Market Research Module
Analyzes hiring trends, demand, and fastest-growing roles
Uses web scraping and data analysis to provide market insights
"""

from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import json


@dataclass
class RoleMarketData:
    """Market data for a specific role"""
    role: str
    demand_score: float  # 0-100, based on number of postings
    hiring_velocity: float  # Percentage change in postings (e.g., +15%)
    average_posted_days: float  # Average days since posting (lower = faster hiring)
    total_postings: int
    growth_trend: str  # 'rising', 'stable', 'declining'
    top_locations: List[str]
    salary_range: Optional[str] = None


@dataclass
class MarketInsight:
    """Overall market insights"""
    most_demanding_roles: List[RoleMarketData]
    fastest_hiring_roles: List[RoleMarketData]
    trending_roles: List[RoleMarketData]
    market_temperature: str  # 'hot', 'warm', 'cool'
    last_updated: str


class MarketResearcher:
    """Research job market trends and role demand"""
    
    # Popular job roles across tech, design, product, etc.
    COMMON_ROLES = [
        # Software Engineering
        "Software Engineer", "Senior Software Engineer", "Full Stack Developer",
        "Backend Developer", "Frontend Developer", "DevOps Engineer",
        "Machine Learning Engineer", "Data Engineer", "Cloud Engineer",
        
        # Product & Design
        "Product Manager", "Senior Product Manager", "Product Designer",
        "UX Designer", "UI Designer", "UX Researcher",
        
        # Data & Analytics
        "Data Scientist", "Data Analyst", "Business Analyst",
        "Product Analyst", "Analytics Engineer",
        
        # Management
        "Engineering Manager", "Product Manager", "Technical Lead",
        "Engineering Director", "VP of Engineering",
        
        # Other Tech Roles
        "Security Engineer", "QA Engineer", "Site Reliability Engineer",
        "Mobile Developer", "iOS Developer", "Android Developer",
        
        # Business & Operations
        "Business Development", "Sales Engineer", "Customer Success",
        "Operations Manager", "Program Manager"
    ]
    
    def __init__(self):
        self.cache = {}  # Simple cache for market data
        self.cache_ttl = timedelta(hours=6)  # Cache for 6 hours
    
    def get_role_market_data(self, role: str, location: str = "") -> RoleMarketData:
        """
        Get market data for a specific role by scraping real job boards
        
        Args:
            role: Job role/title
            location: Optional location filter
        
        Returns:
            RoleMarketData with market insights from real scraped data
        """
        try:
            from job_scraper import JobScraper
            
            # Scrape real jobs for this role
            scraper = JobScraper(use_all_sources=True)
            keywords = role.split()
            jobs = scraper.search_jobs(keywords, location, 100, sources=['linkedin', 'indeed', 'glassdoor'])
            
            if not jobs:
                # If no jobs found, return minimal data
                return RoleMarketData(
                    role=role,
                    demand_score=0,
                    hiring_velocity=0,
                    average_posted_days=999,
                    total_postings=0,
                    growth_trend='declining',
                    top_locations=[location] if location else []
                )
            
            # Analyze real job data
            total_postings = len(jobs)
            
            # Calculate average days since posting
            days_since_list = []
            for job in jobs:
                if job.posted_date:
                    try:
                        from datetime import datetime
                        posted = datetime.fromisoformat(job.posted_date.replace('Z', '+00:00'))
                        days = (datetime.now() - posted.replace(tzinfo=None)).days
                        days_since_list.append(days)
                    except:
                        pass
            
            avg_posted_days = sum(days_since_list) / len(days_since_list) if days_since_list else 30
            
            # Calculate demand score based on actual posting count
            # Normalize to 0-100 scale (assuming 100+ postings = high demand)
            demand_score = min(100, (total_postings / 100) * 100)
            
            # Calculate hiring velocity based on posting recency
            # More recent postings = higher velocity
            recent_postings = len([d for d in days_since_list if d < 7])
            hiring_velocity = (recent_postings / total_postings * 100) if total_postings > 0 else 0
            
            # Growth trend based on posting age distribution
            if avg_posted_days < 7:
                growth_trend = 'rising'
            elif avg_posted_days < 14:
                growth_trend = 'stable'
            else:
                growth_trend = 'declining'
            
            # Extract top locations from actual jobs
            location_counts = {}
            for job in jobs:
                loc = job.location
                location_counts[loc] = location_counts.get(loc, 0) + 1
            
            top_locations = sorted(location_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            top_locations = [loc for loc, count in top_locations]
            
            if location and location not in top_locations:
                top_locations.insert(0, location)
            
            return RoleMarketData(
                role=role,
                demand_score=round(demand_score, 1),
                hiring_velocity=round(hiring_velocity, 1),
                average_posted_days=round(avg_posted_days, 1),
                total_postings=total_postings,
                growth_trend=growth_trend,
                top_locations=top_locations[:5]
            )
        except Exception as e:
            print(f"Error getting real market data for {role}: {str(e)}")
            # Return minimal data on error (not mock data)
            return RoleMarketData(
                role=role,
                demand_score=0,
                hiring_velocity=0,
                average_posted_days=999,
                total_postings=0,
                growth_trend='declining',
                top_locations=[location] if location else []
            )
    
    def get_most_demanding_roles(self, limit: int = 10) -> List[RoleMarketData]:
        """Get roles with highest demand"""
        roles_data = []
        
        # Analyze common roles
        for role in self.COMMON_ROLES[:20]:  # Analyze top 20
            market_data = self.get_role_market_data(role)
            roles_data.append(market_data)
        
        # Sort by demand score
        roles_data.sort(key=lambda x: x.demand_score, reverse=True)
        
        return roles_data[:limit]
    
    def get_fastest_hiring_roles(self, limit: int = 10) -> List[RoleMarketData]:
        """Get roles with fastest hiring (lowest average posted days)"""
        roles_data = []
        
        for role in self.COMMON_ROLES[:20]:
            market_data = self.get_role_market_data(role)
            roles_data.append(market_data)
        
        # Sort by average posted days (ascending) and hiring velocity (descending)
        roles_data.sort(key=lambda x: (x.average_posted_days, -x.hiring_velocity))
        
        return roles_data[:limit]
    
    def get_trending_roles(self, limit: int = 10) -> List[RoleMarketData]:
        """Get roles with highest growth trend"""
        roles_data = []
        
        for role in self.COMMON_ROLES[:20]:
            market_data = self.get_role_market_data(role)
            if market_data.growth_trend == 'rising':
                roles_data.append(market_data)
        
        # Sort by hiring velocity
        roles_data.sort(key=lambda x: x.hiring_velocity, reverse=True)
        
        return roles_data[:limit]
    
    def get_market_insights(self) -> MarketInsight:
        """Get comprehensive market insights"""
        most_demanding = self.get_most_demanding_roles(5)
        fastest_hiring = self.get_fastest_hiring_roles(5)
        trending = self.get_trending_roles(5)
        
        # Determine market temperature
        avg_velocity = sum(r.hiring_velocity for r in trending) / len(trending) if trending else 0
        if avg_velocity > 10:
            temperature = 'hot'
        elif avg_velocity > 0:
            temperature = 'warm'
        else:
            temperature = 'cool'
        
        return MarketInsight(
            most_demanding_roles=most_demanding,
            fastest_hiring_roles=fastest_hiring,
            trending_roles=trending,
            market_temperature=temperature,
            last_updated=datetime.now().isoformat()
        )
    
    def _calculate_demand_score(self, role_lower: str) -> float:
        """Calculate demand score based on role keywords"""
        # High demand keywords
        high_demand_keywords = [
            'software engineer', 'full stack', 'product manager',
            'data scientist', 'machine learning', 'cloud', 'devops'
        ]
        
        # Medium demand keywords
        medium_demand_keywords = [
            'designer', 'analyst', 'developer', 'engineer'
        ]
        
        score = 50  # Base score
        
        # Check for high demand keywords
        for keyword in high_demand_keywords:
            if keyword in role_lower:
                score += 30
                break
        
        # Check for medium demand keywords
        if score < 70:
            for keyword in medium_demand_keywords:
                if keyword in role_lower:
                    score += 15
                    break
        
        # Senior roles tend to have higher demand
        if 'senior' in role_lower or 'lead' in role_lower or 'principal' in role_lower:
            score += 10
        
        return min(100, max(20, score))  # Clamp between 20-100
    
    def _calculate_hiring_velocity(self, role_lower: str) -> float:
        """Calculate hiring velocity (percentage change) - DEPRECATED: Now uses real data"""
        # This method is kept for backward compatibility but should not be used
        # Real data comes from get_role_market_data() which scrapes actual jobs
        return 0.0
    
    def _calculate_avg_posted_days(self, role_lower: str) -> float:
        """Calculate average days since posting - DEPRECATED: Now uses real data"""
        # This method is kept for backward compatibility but should not be used
        # Real data comes from get_role_market_data() which scrapes actual jobs
        return 30.0
    
    def _get_top_locations(self, role_lower: str, user_location: str = "") -> List[str]:
        """Get top locations for a role"""
        default_locations = [
            "San Francisco, CA",
            "New York, NY",
            "Seattle, WA",
            "Austin, TX",
            "Remote"
        ]
        
        # If user specified location, prioritize it
        if user_location:
            locations = [user_location] + [loc for loc in default_locations if loc != user_location]
            return locations[:5]
        
        return default_locations


def get_role_market_data(role: str, location: str = "") -> Dict:
    """Convenience function to get market data as dict"""
    researcher = MarketResearcher()
    data = researcher.get_role_market_data(role, location)
    return asdict(data)


def get_market_insights() -> Dict:
    """Convenience function to get market insights as dict"""
    researcher = MarketResearcher()
    insights = researcher.get_market_insights()
    return asdict(insights)


if __name__ == '__main__':
    import sys
    
    researcher = MarketResearcher()
    
    if len(sys.argv) > 1:
        role = ' '.join(sys.argv[1:])
        print(f"Market data for: {role}")
        print("=" * 50)
        data = researcher.get_role_market_data(role)
        print(json.dumps(asdict(data), indent=2))
    else:
        print("Market Insights")
        print("=" * 50)
        insights = researcher.get_market_insights()
        print(json.dumps(asdict(insights), indent=2))
