# RoleWithAI Setup Guide

Complete setup instructions for transforming RoleWithAI into a functional product.

## Prerequisites

- Node.js 20+ installed
- Chrome browser (for extension)
- Free accounts for:
  - Supabase (database)
  - Google AI Studio (Gemini API)
  - Tavily (web search)

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 15
- Supabase client
- All required dependencies

## Step 2: Set Up Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run the schema from `supabase/schema.sql`
4. Copy your project URL and anon key from Settings > API
5. Add them to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Set Up Google Gemini API (Free)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Get your API key (completely free, high rate limits)
3. Add to `.env.local`:

```env
GEMINI_API_KEY=your-gemini-api-key
```

## Step 4: Set Up Tavily API (Free Tier)

1. Go to [tavily.com](https://tavily.com) and sign up
2. Get your API key (1,000 free searches/month)
3. Add to `.env.local`:

```env
TAVILY_API_KEY=your-tavily-api-key
```

## Step 5: Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder
5. The extension icon should appear in your toolbar

## Step 6: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 7: Test the Extension

1. Navigate to any LinkedIn job posting
2. The RoleWithAI overlay should automatically appear
3. You'll see the Truth Score and Ghost Risk indicator
4. Click "Talk to RoleWithAI" for detailed analysis
5. Click "Report Ghosting" to contribute to the community

## Architecture Overview

### Chrome Extension
- **Content Script**: Injects Truth Score overlay on LinkedIn pages
- **Background Worker**: Tracks analytics and user actions
- **Popup**: Quick access to stats and settings

### Backend API (Next.js)
- **`/api/truth-score`**: Calculates Truth Score using the formula
- **`/api/report-ghosting`**: Stores community ghosting reports

### Truth Score Formula
```
Truth Score = (0.4 × Age Factor) + (0.4 × Response Rate) - (0.2 × Ghost Signal)
```

Where:
- **Age Factor**: How fresh the posting is (0-100)
- **Response Rate**: Community-reported response percentage (0-100)
- **Ghost Signal**: Mentions of ghosting on Reddit/Glassdoor (0-100, lower is better)

### Data Flow

1. User views LinkedIn job → Extension extracts job data
2. Extension → API → Calculate Truth Score
3. API queries:
   - Supabase for community response rates
   - Tavily for Reddit/Glassdoor ghosting mentions
   - Gemini for intelligent insights
4. Results displayed in overlay
5. User can report ghosting → Stored in Supabase

## Free Tier Limits

- **Supabase**: 500MB storage (thousands of reports)
- **Gemini**: High rate limits, completely free
- **Tavily**: 1,000 searches/month
- **GitHub Actions**: 2,000 minutes/month (for scheduled scrapers)

## Next Steps

1. **Gmail Integration**: Connect Gmail to scan for rejection emails
2. **Scheduled Scrapers**: Use GitHub Actions to run weekly scrapers
3. **Analytics**: Track which companies ghost most
4. **User Dashboard**: Show personal ghosting patterns

## Troubleshooting

**Extension not working?**
- Make sure Next.js dev server is running
- Check browser console for errors
- Verify API endpoints are accessible

**Truth Score always 50?**
- Check that Supabase is configured
- Verify API keys are set in `.env.local`
- Check browser console for API errors

**No insights from Gemini?**
- Verify `GEMINI_API_KEY` is set
- Check API quota in Google AI Studio
- Fallback rule-based insights will be used

## Production Deployment

1. Deploy Next.js app to Vercel (free tier)
2. Update extension's API URL in `content.js`
3. Package extension and submit to Chrome Web Store
4. Set up production Supabase project
5. Configure environment variables in Vercel

## Support

For issues or questions, check:
- Extension console: Right-click extension icon > Inspect popup
- Browser console: F12 on LinkedIn page
- Next.js logs: Terminal where `npm run dev` is running
