# RoleWithAI Chrome Extension

The browser extension that brings RoleWithAI's Truth Scores directly to LinkedIn job postings.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension icon should appear in your toolbar

## Features

- **Automatic Detection**: Automatically detects LinkedIn job detail pages
- **Truth Score Overlay**: Injects RoleWithAI's Truth Score directly onto the job posting
- **Ghost Risk Indicators**: Shows Low/Medium/High ghost risk badges
- **Talk to RoleWithAI**: Get detailed analysis on why to apply (or skip)
- **Report Ghosting**: One-click reporting to help the community

## How It Works

1. Navigate to any LinkedIn job posting
2. The extension automatically extracts job data (title, company, description)
3. Sends data to the RoleWithAI API (`http://localhost:3000/api/truth-score`)
4. Displays Truth Score overlay with insights
5. Allows you to report ghosting with one click

## Development

The extension uses:
- **Manifest V3** for Chrome compatibility
- **Content Scripts** to inject UI onto LinkedIn pages
- **Background Service Worker** for tracking and analytics

## API Integration

The extension communicates with your Next.js API:
- `POST /api/truth-score` - Calculate truth score for a job
- `POST /api/report-ghosting` - Report a ghosting incident

Make sure your Next.js dev server is running on `http://localhost:3000` for the extension to work.
