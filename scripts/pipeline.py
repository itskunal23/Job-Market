"""
RoleWithAI Agent Pipeline
Uses LangChain and Ollama to orchestrate job analysis with Truth Score validation
Follows ReAct (Reason + Act) pattern for autonomous job analysis
"""

import os
import sys
import json
from typing import Dict, Any
from pathlib import Path

# Add scripts directory to path for imports
scripts_dir = Path(__file__).parent
sys.path.insert(0, str(scripts_dir))

from langchain.agents import AgentType, initialize_agent, Tool
from langchain_community.llms import Ollama
from langchain.memory import ConversationBufferMemory
from truth_score_calculator import calculate_truth_score, get_days_since_posted


class RoleWithAITools:
    """Custom tools for the RoleWithAI agent"""
    
    @staticmethod
    def calculate_truth_score_tool(job_data: str) -> str:
        """
        Calculates the Truth Score based on job data.
        
        Input format: JSON string with keys:
        - recruiter_activity: 'High' | 'Moderate' | 'None'
        - repost_frequency: 'High' | 'Low' | 'None'
        - posted_date: ISO date string
        - community_sentiment: 'Positive' | 'Neutral' | 'Negative'
        
        Returns: JSON string with truth score breakdown
        """
        try:
            # Parse job data
            if isinstance(job_data, str):
                # Try to parse as JSON
                try:
                    data = json.loads(job_data)
                except json.JSONDecodeError:
                    # If not JSON, try to extract from text
                    data = RoleWithAITools._parse_job_data_from_text(job_data)
            else:
                data = job_data
            
            # Extract required fields with defaults
            recruiter_activity = data.get('recruiter_activity', 'None')
            repost_frequency = data.get('repost_frequency', 'None')
            posted_date = data.get('posted_date', '')
            community_sentiment = data.get('community_sentiment', 'Neutral')
            
            # Calculate truth score
            result = calculate_truth_score(
                recruiter_activity=recruiter_activity,
                repost_frequency=repost_frequency,
                posted_date=posted_date,
                community_sentiment=community_sentiment
            )
            
            # Format response
            response = {
                "truth_score": result.truth_score,
                "ghost_risk": result.ghost_risk,
                "breakdown": result.breakdown,
                "why_score": result.why_score,
                "recommendation": RoleWithAITools._get_recommendation(result.truth_score, result.ghost_risk)
            }
            
            return json.dumps(response, indent=2)
            
        except Exception as e:
            return f"Error calculating truth score: {str(e)}"
    
    @staticmethod
    def _parse_job_data_from_text(text: str) -> Dict[str, Any]:
        """Extract job data from natural language text"""
        text_lower = text.lower()
        
        # Extract recruiter activity
        if 'high recruiter' in text_lower or 'active recruiter' in text_lower:
            recruiter_activity = 'High'
        elif 'moderate recruiter' in text_lower or 'some recruiter' in text_lower:
            recruiter_activity = 'Moderate'
        else:
            recruiter_activity = 'None'
        
        # Extract repost frequency
        if 'reposted' in text_lower or 'repost' in text_lower:
            if 'multiple' in text_lower or 'several' in text_lower or 'many' in text_lower:
                repost_frequency = 'High'
            else:
                repost_frequency = 'Low'
        else:
            repost_frequency = 'None'
        
        # Extract community sentiment
        if 'negative' in text_lower or 'ghosting' in text_lower or 'concerns' in text_lower:
            community_sentiment = 'Negative'
        elif 'positive' in text_lower or 'good' in text_lower or 'recommended' in text_lower:
            community_sentiment = 'Positive'
        else:
            community_sentiment = 'Neutral'
        
        # Try to extract date (simplified)
        posted_date = ''  # Would need more sophisticated parsing
        
        return {
            'recruiter_activity': recruiter_activity,
            'repost_frequency': repost_frequency,
            'posted_date': posted_date,
            'community_sentiment': community_sentiment
        }
    
    @staticmethod
    def _get_recommendation(score: int, risk: str) -> str:
        """Generate recommendation based on truth score"""
        if score >= 80:
            return "HIGH PRIORITY: This is a high-intent opportunity. Strong signals suggest active hiring."
        elif score >= 50:
            return "MODERATE PRIORITY: Worth applying, but keep expectations realistic. Monitor for updates."
        else:
            return "LOW PRIORITY: This appears to be a ghost job. Focus your energy on higher-intent opportunities."


def initialize_rolewithai_agent(model_name: str = "llama3", temperature: float = 0):
    """
    Initialize the RoleWithAI agent pipeline
    
    Args:
        model_name: Ollama model to use (llama3, mistral, etc.)
        temperature: LLM temperature (0 for deterministic, higher for creative)
    
    Returns:
        Initialized agent chain
    """
    # Initialize the Local LLM (Ollama)
    print(f"Initializing Ollama with model: {model_name}...")
    llm = Ollama(model=model_name, temperature=temperature)
    
    # Define Tools for the Agent
    tools = [
        Tool(
            name="TruthScoreCalculator",
            func=RoleWithAITools.calculate_truth_score_tool,
            description=(
                "Use this tool to calculate the Truth Score and Ghost Risk for a job posting. "
                "Input should be a JSON string with: recruiter_activity, repost_frequency, "
                "posted_date (ISO format), and community_sentiment. "
                "Returns the truth score (1-100), ghost risk level (LOW/MEDIUM/HIGH), "
                "breakdown of factors, and a recommendation."
            )
        )
    ]
    
    # Build the Agent Pipeline with memory
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )
    
    agent_chain = initialize_agent(
        tools,
        llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=True,
        memory=memory,
        handle_parsing_errors=True,
        max_iterations=5
    )
    
    return agent_chain


def analyze_job(agent_chain, job_title: str, company: str, job_description: str) -> str:
    """
    Analyze a job posting using the agent pipeline
    
    Args:
        agent_chain: Initialized agent chain
        job_title: Job title
        company: Company name
        job_description: Natural language description of the job posting
    
    Returns:
        Agent's analysis and recommendation
    """
    query = f"""
    Analyze the {job_title} role at {company}.
    
    Job Details:
    {job_description}
    
    Please:
    1. Use the TruthScoreCalculator tool to calculate the truth score
    2. Provide a clear analysis of whether this is a ghost job or a real opportunity
    3. Give a recommendation on whether to apply, with reasoning based on the truth score
    4. Use the supportive, empathetic tone of RoleWithAI - frame ghosting as a systemic issue, not personal failure
    """
    
    try:
        response = agent_chain.run(input=query)
        return response
    except Exception as e:
        return f"Error during analysis: {str(e)}"


def main():
    """Main execution function"""
    print("=" * 60)
    print("RoleWithAI Agent Pipeline")
    print("=" * 60)
    print()
    
    # Check if Ollama is available
    try:
        import subprocess
        result = subprocess.run(['ollama', 'list'], capture_output=True, text=True, timeout=5)
        if result.returncode != 0:
            print("⚠️  Warning: Ollama may not be installed or running.")
            print("   Please install Ollama from https://ollama.ai and ensure it's running.")
            print("   Then pull a model: ollama pull llama3")
            print()
    except Exception:
        print("⚠️  Warning: Could not verify Ollama installation.")
        print("   Please ensure Ollama is installed and running.")
        print()
    
    # Initialize agent
    try:
        agent_chain = initialize_rolewithai_agent(model_name="llama3", temperature=0)
        print("✅ Agent initialized successfully!")
        print()
    except Exception as e:
        print(f"❌ Error initializing agent: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Ensure Ollama is installed: https://ollama.ai")
        print("2. Pull a model: ollama pull llama3")
        print("3. Verify Ollama is running: ollama list")
        return
    
    # Example queries
    examples = [
        {
            "title": "Senior Product Designer",
            "company": "TechCorp Inc.",
            "description": "Posted 3 days ago. High recruiter engagement detected. Low repost frequency. Positive community sentiment."
        },
        {
            "title": "Product Manager",
            "company": "StartupXYZ",
            "description": "Posted 45 days ago. No recruiter activity. High repost frequency - reposted 4 times. Negative community sentiment with ghosting reports."
        },
        {
            "title": "UX Lead",
            "company": "DesignStudio",
            "description": "Posted 5 days ago. Moderate recruiter activity. No reposts. Neutral community sentiment."
        }
    ]
    
    print("Running example analyses...")
    print("=" * 60)
    print()
    
    for i, example in enumerate(examples, 1):
        print(f"Example {i}: {example['title']} at {example['company']}")
        print("-" * 60)
        
        analysis = analyze_job(
            agent_chain,
            example['title'],
            example['company'],
            example['description']
        )
        
        print("\nAgent Analysis:")
        print(analysis)
        print("\n" + "=" * 60 + "\n")


if __name__ == "__main__":
    main()
