"""
Resume Parser
Extracts skills, experience, education, and other relevant information from resumes
Supports PDF and DOCX formats
"""

import re
import json
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from pathlib import Path

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False


@dataclass
class ResumeData:
    """Structured resume data"""
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


class ResumeParser:
    """Parse resumes from PDF and DOCX files"""
    
    # Common skill keywords
    TECHNICAL_SKILLS = [
        'python', 'javascript', 'java', 'c++', 'c#', 'react', 'node', 'angular', 'vue',
        'sql', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
        'git', 'github', 'agile', 'scrum', 'machine learning', 'ai', 'data science',
        'html', 'css', 'typescript', 'rest api', 'graphql', 'microservices',
        'linux', 'unix', 'bash', 'powershell', 'ci/cd', 'jenkins', 'terraform'
    ]
    
    SOFT_SKILLS = [
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
        'project management', 'collaboration', 'time management', 'critical thinking'
    ]
    
    def __init__(self):
        self.all_skills = self.TECHNICAL_SKILLS + self.SOFT_SKILLS
    
    def parse(self, file_path: str) -> ResumeData:
        """Parse resume file and extract structured data"""
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"Resume file not found: {file_path}")
        
        # Extract text based on file type
        if path.suffix.lower() == '.pdf':
            if not PDF_AVAILABLE:
                raise ImportError("PyPDF2 is required for PDF parsing. Install with: pip install PyPDF2")
            text = self._extract_text_from_pdf(file_path)
        elif path.suffix.lower() in ['.docx', '.doc']:
            if not DOCX_AVAILABLE:
                raise ImportError("python-docx is required for DOCX parsing. Install with: pip install python-docx")
            text = self._extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}. Supported: .pdf, .docx")
        
        # Parse structured data from text
        return self._parse_text(text)
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    
    def _parse_text(self, text: str) -> ResumeData:
        """Parse structured data from resume text"""
        text_lower = text.lower()
        
        # Extract name (usually first line or after "Name:")
        name = self._extract_name(text)
        
        # Extract contact information
        email = self._extract_email(text)
        phone = self._extract_phone(text)
        
        # Extract skills
        skills = self._extract_skills(text, text_lower)
        
        # Extract experience
        experience = self._extract_experience(text)
        
        # Extract education
        education = self._extract_education(text)
        
        # Extract summary/objective (first paragraph or section)
        summary = self._extract_summary(text)
        
        return ResumeData(
            name=name,
            email=email,
            phone=phone,
            skills=skills,
            experience=experience,
            education=education,
            summary=summary
        )
    
    def _extract_name(self, text: str) -> str:
        """Extract name from resume (usually first line)"""
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if len(line) > 0 and len(line) < 50:
                # Simple heuristic: name is usually 2-4 words, capitalized
                words = line.split()
                if 2 <= len(words) <= 4:
                    if all(word[0].isupper() for word in words if word):
                        return line
        return "Unknown"
    
    def _extract_email(self, text: str) -> Optional[str]:
        """Extract email address"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(email_pattern, text)
        return matches[0] if matches else None
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number"""
        phone_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # US format
            r'\(\d{3}\)\s?\d{3}[-.]?\d{4}',     # (123) 456-7890
            r'\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}'  # International
        ]
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        return None
    
    def _extract_skills(self, text: str, text_lower: str) -> List[str]:
        """Extract skills from resume"""
        found_skills = []
        
        # Look for skills section
        skills_section_patterns = [
            r'skills?:?\s*\n(.*?)(?=\n\n|\n[A-Z][a-z]+:)',
            r'technical skills?:?\s*\n(.*?)(?=\n\n|\n[A-Z][a-z]+:)',
            r'competencies?:?\s*\n(.*?)(?=\n\n|\n[A-Z][a-z]+:)'
        ]
        
        skills_text = ""
        for pattern in skills_section_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                skills_text = match.group(1)
                break
        
        # If no skills section found, search entire text
        if not skills_text:
            skills_text = text
        
        # Match against known skills
        for skill in self.all_skills:
            if skill.lower() in skills_text.lower():
                found_skills.append(skill.title())
        
        # Also extract skills mentioned in bullet points or lists
        bullet_points = re.findall(r'[•\-\*]\s*(.+?)(?=\n|$)', skills_text, re.MULTILINE)
        for bullet in bullet_points:
            bullet_lower = bullet.lower()
            for skill in self.all_skills:
                if skill.lower() in bullet_lower and skill.title() not in found_skills:
                    found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates
    
    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        """Extract work experience"""
        experience = []
        
        # Look for experience section
        experience_patterns = [
            r'experience:?\s*\n(.*?)(?=\n\n[A-Z][a-z]+:|\nEducation:)',
            r'work experience:?\s*\n(.*?)(?=\n\n[A-Z][a-z]+:|\nEducation:)',
            r'employment:?\s*\n(.*?)(?=\n\n[A-Z][a-z]+:|\nEducation:)'
        ]
        
        experience_text = ""
        for pattern in experience_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                experience_text = match.group(1)
                break
        
        if not experience_text:
            return experience
        
        # Extract job entries (simplified - looks for company names and dates)
        # This is a basic implementation - could be enhanced with NLP
        lines = experience_text.split('\n')
        current_job = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_job:
                    experience.append(current_job)
                    current_job = {}
                continue
            
            # Look for dates (years)
            year_match = re.search(r'(19|20)\d{2}', line)
            if year_match and 'title' not in current_job:
                # Likely a job title line
                parts = line.split(year_match.group(0))
                if parts[0]:
                    current_job['title'] = parts[0].strip()
                    current_job['company'] = parts[1].strip() if len(parts) > 1 else "Unknown"
                    current_job['duration'] = year_match.group(0)
        
        if current_job:
            experience.append(current_job)
        
        return experience
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information"""
        education = []
        
        # Look for education section
        education_patterns = [
            r'education:?\s*\n(.*?)(?=\n\n[A-Z][a-z]+:|$)',
            r'academic:?\s*\n(.*?)(?=\n\n[A-Z][a-z]+:|$)'
        ]
        
        education_text = ""
        for pattern in education_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                education_text = match.group(1)
                break
        
        if not education_text:
            return education
        
        # Extract degree and institution
        lines = education_text.split('\n')
        for line in lines[:5]:  # Check first few lines
            line = line.strip()
            if any(keyword in line.lower() for keyword in ['bachelor', 'master', 'phd', 'degree', 'university', 'college']):
                education.append({
                    'degree': line,
                    'institution': line  # Simplified - could be enhanced
                })
                break
        
        return education
    
    def _extract_summary(self, text: str) -> Optional[str]:
        """Extract summary or objective"""
        summary_patterns = [
            r'summary:?\s*\n(.+?)(?=\n\n[A-Z][a-z]+:)',
            r'objective:?\s*\n(.+?)(?=\n\n[A-Z][a-z]+:)',
            r'profile:?\s*\n(.+?)(?=\n\n[A-Z][a-z]+:)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                # Take first 200 characters
                return summary[:200] + "..." if len(summary) > 200 else summary
        
        return None


def parse_resume(file_path: str) -> Dict:
    """Convenience function to parse resume and return as dict"""
    parser = ResumeParser()
    resume_data = parser.parse(file_path)
    return asdict(resume_data)


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python resume_parser.py <resume_file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    try:
        resume_data = parse_resume(file_path)
        print(json.dumps(resume_data, indent=2))
    except Exception as e:
        print(f"Error parsing resume: {str(e)}", file=sys.stderr)
        sys.exit(1)
