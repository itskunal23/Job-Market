/**
 * Tavily API Client
 * Free tier: 1,000 searches/month
 * Used to search Reddit/Glassdoor for ghosting signals
 */

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ''
const TAVILY_API_URL = 'https://api.tavily.com/search'

export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

export interface TavilySearchResponse {
  query: string
  response_time: number
  results: TavilySearchResult[]
}

export async function searchTavily(
  query: string,
  options: {
    search_depth?: 'basic' | 'advanced'
    include_answer?: boolean
    include_raw_content?: boolean
  } = {}
): Promise<TavilySearchResponse> {
  if (!TAVILY_API_KEY) {
    console.warn('Tavily API key not configured')
    return {
      query,
      response_time: 0,
      results: [],
    }
  }

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: options.search_depth || 'basic',
        include_answer: options.include_answer || false,
        include_raw_content: options.include_raw_content || false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching Tavily:', error)
    return {
      query,
      response_time: 0,
      results: [],
    }
  }
}

/**
 * Search for ghosting signals about a company
 */
export async function searchGhostingSignals(
  company: string
): Promise<{ redditMentions: number; glassdoorMentions: number; ghostKeywords: number }> {
  const ghostKeywords = ['reposted', 'evergreen', 'no contact', 'ghost job', 'fake posting', 'ghosting']

  // Search Reddit
  const redditQuery = `site:reddit.com "${company}" ghosting hiring`
  const redditResults = await searchTavily(redditQuery, { search_depth: 'basic' })

  // Search Glassdoor
  const glassdoorQuery = `site:glassdoor.com "${company}" "not hiring" "fake jobs"`
  const glassdoorResults = await searchTavily(glassdoorQuery, { search_depth: 'basic' })

  // Count ghost keyword mentions
  let ghostKeywordCount = 0
  const allResults = [...redditResults.results, ...glassdoorResults.results]

  allResults.forEach((result) => {
    const text = (result.title + ' ' + result.content).toLowerCase()
    ghostKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        ghostKeywordCount++
      }
    })
  })

  return {
    redditMentions: redditResults.results.length,
    glassdoorMentions: glassdoorResults.results.length,
    ghostKeywords: ghostKeywordCount,
  }
}
