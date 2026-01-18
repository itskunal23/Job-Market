/**
 * Google Gemini 1.5 Flash API Client
 * Free tier via Google AI Studio
 * High rate limits, completely free for developers
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

/**
 * Generate insights about a job posting using Gemini
 */
export async function generateJobInsights(
  jobData: {
    title: string
    company: string
    description?: string
    truthScore: number
    ghostRisk: 'low' | 'medium' | 'high'
    ageFactor: number
    responseRate: number
    ghostSignal: number
  }
): Promise<{ message: string; detailedAdvice: string }> {
  if (!GEMINI_API_KEY) {
    // Fallback to rule-based responses
    return generateFallbackInsights(jobData)
  }

  const prompt = `You are RoleWithAI, a supportive career co-pilot assistant. Analyze this job posting and provide helpful, empathetic advice.

Job Title: ${jobData.title}
Company: ${jobData.company}
Truth Score: ${jobData.truthScore}/100
Ghost Risk: ${jobData.ghostRisk}
Age Factor: ${jobData.ageFactor}/100 (how fresh the posting is)
Response Rate: ${jobData.responseRate}% (community-reported)
Ghost Signal: ${jobData.ghostSignal}/100 (mentions of ghosting, lower is better)

${jobData.description ? `Job Description: ${jobData.description.substring(0, 500)}...` : ''}

Provide:
1. A brief 1-2 sentence message (like "RoleWithAI says: ...")
2. Detailed advice (2-3 sentences) explaining why the user should or shouldn't apply

Use "we" language to be supportive. Be honest but kind. If the ghost risk is high, gently suggest focusing energy elsewhere. If it's a good match, be encouraging.

Format your response as JSON:
{
  "message": "RoleWithAI says: ...",
  "detailedAdvice": "..."
}`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data: GeminiResponse = await response.json()
    const text = data.candidates[0]?.content?.parts[0]?.text || ''

    // Try to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch {
      // If JSON parsing fails, extract message and advice
      const lines = text.split('\n').filter((l) => l.trim())
      return {
        message: lines.find((l) => l.includes('RoleWithAI says')) || 'RoleWithAI is analyzing...',
        detailedAdvice: lines.slice(1).join(' ') || text,
      }
    }

    return {
      message: 'RoleWithAI is analyzing this posting...',
      detailedAdvice: text,
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return generateFallbackInsights(jobData)
  }
}

function generateFallbackInsights(jobData: {
  truthScore: number
  ghostRisk: 'low' | 'medium' | 'high'
  company: string
}): { message: string; detailedAdvice: string } {
  if (jobData.truthScore >= 70) {
    return {
      message: `This role is a high-intent match. ${jobData.company} has a strong track record of responding to candidates.`,
      detailedAdvice: `We should definitely apply here. ${jobData.company} has been actively hiring and responding to candidates. The role was posted recently, and community data shows positive engagement. Your skills align well with what they're looking for.`,
    }
  }

  if (jobData.truthScore >= 40) {
    return {
      message: `Moderate match. ${jobData.company} has been somewhat responsive, but proceed with caution.`,
      detailedAdvice: `This role matches your experience, but there's some risk. ${jobData.company} has been slow to respond lately. I'd recommend applying, but also keep other high-intent options open.`,
    }
  }

  return {
    message: `High ghost risk detected. This posting has been up for a while with low engagement.`,
    detailedAdvice: `Honestly, this feels like a ghost job. ${jobData.company} has reposted this multiple times without hiring, and community reports show low response rates. Let's focus your energy on higher-intent opportunities where you'll actually get a response.`,
  }
}
