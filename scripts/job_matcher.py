"""
Job Matcher
Matches resume data with job postings to find the best fits
Uses keyword matching, skill overlap, and experience level matching
"""

import re
from typing import List, Dict, Tuple
from dataclasses import dataclass

try:
    from resume_parser import ResumeData
except ImportError:
    # Fallback if resume_parser is not available
    from dataclasses import dataclass as dc_dataclass
    from typing import Optional
    
    @dc_dataclass
    class ResumeData:
        name: str
        email: Optional[str] = None
        phone: Optional[str] = None
        skills: List[str] = None
        experience: List[Dict[str, str]] = None
        education: List[Dict[str, str]] = None
        summary: Optional[str] = None
        
        def __post_init__(self):
            if self.skills is None:
                self.skills = []
            if self.experience is None:
                self.experience = []
            if self.education is None:
                self.education = []


@dataclass
class MatchScore:
    """Job match score breakdown"""
    overall_score: float  # 0-100
    skill_match: float    # 0-100
    experience_match: float  # 0-100
    keyword_match: float  # 0-100
    matched_skills: List[str]
    missing_skills: List[str]
    matched_keywords: List[str]


class JobMatcher:
    """Match jobs with resume data"""
    
    def __init__(self, resume_data: ResumeData):
        self.resume_data = resume_data
        self.resume_skills_lower = [skill.lower() for skill in resume_data.skills]
        self.resume_text_lower = self._get_resume_text_lower()
    
    def match_job(self, job: Dict) -> MatchScore:
        """
        Calculate match score for a single job
        
        Args:
            job: Job posting dictionary with title, description, etc.
        
        Returns:
            MatchScore object with detailed breakdown
        """
        job_description = (job.get('description', '') + ' ' + job.get('title', '')).lower()
        job_title = job.get('title', '').lower()
        
        # Calculate different match components
        skill_match_score, matched_skills, missing_skills = self._calculate_skill_match(job_description)
        experience_match_score = self._calculate_experience_match(job_title, job_description)
        keyword_match_score, matched_keywords = self._calculate_keyword_match(job_description, job_title)
        
        # Weighted overall score
        overall_score = (
            skill_match_score * 0.5 +      # Skills are most important
            experience_match_score * 0.3 +  # Experience level matters
            keyword_match_score * 0.2       # Keywords provide context
        )
        
        return MatchScore(
            overall_score=round(overall_score, 2),
            skill_match=round(skill_match_score, 2),
            experience_match=round(experience_match_score, 2),
            keyword_match=round(keyword_match_score, 2),
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            matched_keywords=matched_keywords
        )
    
    def match_jobs(self, jobs: List[Dict], min_score: float = 50.0) -> List[Tuple[Dict, MatchScore]]:
        """
        Match multiple jobs and return sorted by match score
        
        Args:
            jobs: List of job posting dictionaries
            min_score: Minimum match score to include (0-100)
        
        Returns:
            List of tuples (job, match_score) sorted by score descending
        """
        matches = []
        
        for job in jobs:
            match_score = self.match_job(job)
            if match_score.overall_score >= min_score:
                matches.append((job, match_score))
        
        # Sort by overall score descending
        matches.sort(key=lambda x: x[1].overall_score, reverse=True)
        
        return matches
    
    def _get_resume_text_lower(self) -> str:
        """Get all resume text in lowercase for matching"""
        text_parts = []
        
        if self.resume_data.summary:
            text_parts.append(self.resume_data.summary.lower())
        
        for exp in self.resume_data.experience:
            if isinstance(exp, dict):
                text_parts.append(exp.get('title', '').lower())
                text_parts.append(exp.get('description', '').lower())
        
        for skill in self.resume_data.skills:
            text_parts.append(skill.lower())
        
        return ' '.join(text_parts)
    
    def _calculate_skill_match(self, job_description: str) -> Tuple[float, List[str], List[str]]:
        """Calculate how well resume skills match job requirements"""
        # Extract skills mentioned in job description
        job_skills = self._extract_skills_from_text(job_description)
        
        if not job_skills:
            return 50.0, [], []  # Neutral score if no skills found
        
        # Find matching skills
        matched_skills = []
        for skill in self.resume_skills_lower:
            for job_skill in job_skills:
                if skill in job_skill.lower() or job_skill.lower() in skill:
                    matched_skills.append(skill.title())
                    break
        
        # Find missing skills
        missing_skills = [skill for skill in job_skills if not any(
            skill.lower() in resume_skill or resume_skill in skill.lower()
            for resume_skill in self.resume_skills_lower
        )]
        
        # Calculate score: percentage of required skills that match
        match_percentage = (len(matched_skills) / len(job_skills)) * 100 if job_skills else 0
        
        # Boost score if resume has extra relevant skills
        if len(matched_skills) > len(job_skills) * 0.5:
            match_percentage = min(100, match_percentage + 10)
        
        return match_percentage, matched_skills, missing_skills
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract technical skills from job description"""
        # Common technical skills keywords
        skill_keywords = [
            'python', 'javascript', 'java', 'c++', 'c#', 'react', 'node', 'angular', 'vue',
            'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
            'git', 'github', 'agile', 'scrum', 'machine learning', 'ai', 'data science',
            'html', 'css', 'typescript', 'rest api', 'graphql', 'microservices',
            'linux', 'unix', 'bash', 'powershell', 'ci/cd', 'jenkins', 'terraform',
            'tableau', 'power bi', 'excel', 'r', 'matlab', 'spark', 'hadoop'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates
    
    def _calculate_experience_match(self, job_title: str, job_description: str) -> float:
        """Calculate how well resume experience level matches job requirements"""
        # Extract experience level keywords from job
        senior_keywords = ['senior', 'lead', 'principal', 'architect', 'manager', 'director', '5+', '7+', '10+']
        mid_keywords = ['mid-level', 'intermediate', '3+', '4+', '5+']
        junior_keywords = ['junior', 'entry', 'associate', 'intern', '0-2', '1-2', '2+']
        
        job_text = (job_title + ' ' + job_description).lower()
        
        # Determine required experience level
        required_level = 'mid'  # default
        if any(keyword in job_text for keyword in senior_keywords):
            required_level = 'senior'
        elif any(keyword in job_text for keyword in junior_keywords):
            required_level = 'junior'
        
        # Estimate resume experience level
        resume_level = self._estimate_resume_experience_level()
        
        # Calculate match score
        if required_level == resume_level:
            return 100.0
        elif (required_level == 'senior' and resume_level == 'mid') or \
             (required_level == 'mid' and resume_level == 'junior'):
            return 70.0  # Close match
        elif (required_level == 'senior' and resume_level == 'junior'):
            return 40.0  # Underqualified
        elif (required_level == 'junior' and resume_level in ['mid', 'senior']):
            return 80.0  # Overqualified but still a match
        else:
            return 50.0  # Neutral
    
    def _estimate_resume_experience_level(self) -> str:
        """Estimate experience level from resume"""
        years_of_experience = 0
        
        # Count years from experience entries
        for exp in self.resume_data.experience:
            if isinstance(exp, dict):
                duration = exp.get('duration', '')
                # Try to extract years from duration string
                year_match = re.search(r'(\d+)\+?\s*years?', duration.lower())
                if year_match:
                    years_of_experience += int(year_match.group(1))
        
        # Estimate based on number of positions
        if len(self.resume_data.experience) >= 3:
            years_of_experience = max(years_of_experience, 5)
        elif len(self.resume_data.experience) >= 2:
            years_of_experience = max(years_of_experience, 3)
        
        # Classify
        if years_of_experience >= 7:
            return 'senior'
        elif years_of_experience >= 3:
            return 'mid'
        else:
            return 'junior'
    
    def _calculate_keyword_match(self, job_description: str, job_title: str) -> Tuple[float, List[str]]:
        """Calculate keyword overlap between resume and job"""
        # Extract important keywords from job
        job_keywords = self._extract_keywords(job_title + ' ' + job_description)
        
        # Find matching keywords in resume
        matched_keywords = []
        resume_text = self.resume_text_lower
        
        for keyword in job_keywords:
            if keyword.lower() in resume_text:
                matched_keywords.append(keyword)
        
        # Calculate score
        if not job_keywords:
            return 50.0, []
        
        match_percentage = (len(matched_keywords) / len(job_keywords)) * 100
        return match_percentage, matched_keywords
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from job description"""
        # Common job-related keywords
        keywords = []
        text_lower = text.lower()
        
        # Domain keywords
        domain_keywords = [
            'web development', 'mobile app', 'backend', 'frontend', 'full stack',
            'data science', 'machine learning', 'ai', 'cloud', 'devops',
            'cybersecurity', 'blockchain', 'fintech', 'e-commerce', 'saas'
        ]
        
        for keyword in domain_keywords:
            if keyword in text_lower:
                keywords.append(keyword)
        
        # Technology keywords (already extracted in skills)
        # Add role-specific keywords
        role_keywords = [
            'developer', 'engineer', 'architect', 'analyst', 'scientist',
            'manager', 'lead', 'specialist', 'consultant'
        ]
        
        for keyword in role_keywords:
            if keyword in text_lower:
                keywords.append(keyword)
        
        return list(set(keywords))  # Remove duplicates


def match_resume_to_jobs(resume_data: ResumeData, jobs: List[Dict], min_score: float = 50.0) -> List[Tuple[Dict, MatchScore]]:
    """Convenience function to match resume with jobs"""
    matcher = JobMatcher(resume_data)
    return matcher.match_jobs(jobs, min_score)


if __name__ == '__main__':
    from resume_parser import parse_resume
    
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python job_matcher.py <resume_file_path>")
        sys.exit(1)
    
    resume_path = sys.argv[1]
    resume_data_dict = parse_resume(resume_path)
    resume_data = ResumeData(**resume_data_dict)
    
    # Mock jobs for testing
    mock_jobs = [
        {
            'title': 'Senior Python Developer',
            'company': 'TechCorp',
            'description': 'Looking for a senior Python developer with experience in Django, Flask, and REST APIs. Must have 5+ years of experience.',
            'location': 'San Francisco, CA',
            'url': 'https://example.com/job1'
        },
        {
            'title': 'JavaScript Frontend Developer',
            'company': 'StartupXYZ',
            'description': 'Seeking a frontend developer skilled in React, TypeScript, and modern web development.',
            'location': 'Remote',
            'url': 'https://example.com/job2'
        }
    ]
    
    matcher = JobMatcher(resume_data)
    matches = matcher.match_jobs(mock_jobs, min_score=0)
    
    print(f"Resume: {resume_data.name}")
    print(f"Skills: {', '.join(resume_data.skills[:5])}...")
    print(f"\nJob Matches:\n")
    
    for job, match_score in matches:
        print(f"Title: {job['title']}")
        print(f"Company: {job['company']}")
        print(f"Match Score: {match_score.overall_score}/100")
        print(f"  Skill Match: {match_score.skill_match}/100")
        print(f"  Experience Match: {match_score.experience_match}/100")
        print(f"  Matched Skills: {', '.join(match_score.matched_skills[:5])}")
        print()
