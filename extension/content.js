// RoleWithAI Content Script - Detects LinkedIn job pages and injects Truth Score overlay

(function() {
  'use strict';

  let currentJobData = null;
  let roleWithAIOverlay = null;

  // Detect if we're on a LinkedIn job detail page
  function isJobDetailPage() {
    return window.location.pathname.includes('/jobs/view/') || 
           window.location.pathname.includes('/jobs/collections/');
  }

  // Extract job data from LinkedIn DOM
  function extractJobData() {
    try {
      const jobTitle = document.querySelector('.jobs-details-top-card__job-title')?.textContent?.trim() ||
                      document.querySelector('h1.top-card-layout__title')?.textContent?.trim() ||
                      document.querySelector('[data-test-id="job-title"]')?.textContent?.trim();

      const companyName = document.querySelector('.jobs-details-top-card__company-name')?.textContent?.trim() ||
                         document.querySelector('.topcard__org-name-link')?.textContent?.trim() ||
                         document.querySelector('[data-test-id="company-name"]')?.textContent?.trim();

      const jobDescription = document.querySelector('.jobs-description__text')?.textContent?.trim() ||
                             document.querySelector('.jobs-box__html-content')?.textContent?.trim();

      const postedDate = document.querySelector('.jobs-details-top-card__posted-date')?.textContent?.trim() ||
                        document.querySelector('time')?.getAttribute('datetime');

      if (!jobTitle || !companyName) {
        return null;
      }

      return {
        title: jobTitle,
        company: companyName,
        description: jobDescription || '',
        postedDate: postedDate || '',
        url: window.location.href,
        platform: 'linkedin'
      };
    } catch (error) {
      console.error('RoleWithAI: Error extracting job data', error);
      return null;
    }
  }

  // Fetch Truth Score from API
  async function fetchTruthScore(jobData) {
    try {
      const response = await fetch('http://localhost:3000/api/truth-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch truth score');
      }

      return await response.json();
    } catch (error) {
      console.error('RoleWithAI: Error fetching truth score', error);
      // Fallback to local calculation if API is unavailable
      return calculateLocalTruthScore(jobData);
    }
  }

  // Local fallback Truth Score calculation
  function calculateLocalTruthScore(jobData) {
    let score = 50; // Base score

    // Age factor
    const daysOld = extractDaysOld(jobData.postedDate);
    if (daysOld < 7) score += 20;
    else if (daysOld < 14) score += 10;
    else if (daysOld > 30) score -= 20;
    else if (daysOld > 60) score -= 30;

    // Description quality
    if (jobData.description) {
      const descLength = jobData.description.length;
      if (descLength > 500) score += 10;
      if (descLength < 100) score -= 15;
    }

    // Keywords that suggest ghost jobs
    const ghostKeywords = ['evergreen', 'always hiring', 'ongoing', 'continuous'];
    const hasGhostKeywords = ghostKeywords.some(keyword => 
      jobData.description.toLowerCase().includes(keyword)
    );
    if (hasGhostKeywords) score -= 15;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function extractDaysOld(postedDate) {
    if (!postedDate) return 999;
    
    // Try to parse various date formats
    const now = new Date();
    const posted = new Date(postedDate);
    
    if (isNaN(posted.getTime())) {
      // Try to extract from text like "2 days ago"
      const match = postedDate.match(/(\d+)\s*(day|week|month)/i);
      if (match) {
        const num = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        if (unit.includes('day')) return num;
        if (unit.includes('week')) return num * 7;
        if (unit.includes('month')) return num * 30;
      }
      return 999;
    }
    
    const diffTime = Math.abs(now - posted);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Create RoleWithAI overlay UI
  function createRoleWithAIOverlay(truthScore, ghostRisk, insights) {
    // Remove existing overlay if present
    if (roleWithAIOverlay) {
      roleWithAIOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'rolewithai-overlay';
    overlay.innerHTML = `
      <div class="rolewithai-card">
        <div class="rolewithai-header">
          <div class="rolewithai-logo">RoleWithAI</div>
          <button class="rolewithai-close" aria-label="Close">×</button>
        </div>
        <div class="rolewithai-content">
          <div class="truth-score-display">
            <div class="score-label">Truth Score</div>
            <div class="score-value score-${getScoreClass(truthScore)}">${truthScore}</div>
            <div class="ghost-risk-badge risk-${ghostRisk}">${ghostRisk.toUpperCase()} Ghost Risk</div>
          </div>
          <div class="rolewithai-insights">
            <p class="rolewithai-says">${insights.message}</p>
          </div>
          <div class="rolewithai-actions">
            <button class="rolewithai-button primary" id="rolewithai-talk">Talk to RoleWithAI</button>
            ${ghostRisk === 'high' ? '<button class="rolewithai-button skip" id="rolewithai-skip">Skip & Save Energy</button>' : ''}
            <button class="rolewithai-button secondary" id="rolewithai-report">Report Ghosting</button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    overlay.querySelector('.rolewithai-close').addEventListener('click', () => {
      overlay.remove();
      roleWithAIOverlay = null;
    });

    overlay.querySelector('#rolewithai-talk')?.addEventListener('click', () => {
      showRoleWithAIChat(insights.detailedAdvice);
    });

    overlay.querySelector('#rolewithai-skip')?.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'trackSkip', jobData: currentJobData });
      overlay.remove();
    });

    overlay.querySelector('#rolewithai-report')?.addEventListener('click', () => {
      reportGhosting(currentJobData);
    });

    return overlay;
  }

  function getScoreClass(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  function showRoleWithAIChat(advice) {
    // Create chat modal
    const chat = document.createElement('div');
    chat.className = 'rolewithai-chat-modal';
    chat.innerHTML = `
      <div class="rolewithai-chat-content">
        <div class="rolewithai-chat-header">
          <span>RoleWithAI's Analysis</span>
          <button class="rolewithai-close">×</button>
        </div>
        <div class="rolewithai-chat-body">
          <p>${advice}</p>
        </div>
      </div>
    `;
    chat.querySelector('.rolewithai-close').addEventListener('click', () => chat.remove());
    document.body.appendChild(chat);
  }

  async function reportGhosting(jobData) {
    try {
      await fetch('http://localhost:3000/api/report-ghosting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      
      alert('Thank you! Your report helps the community. +10 Impact Points!');
    } catch (error) {
      console.error('Error reporting ghosting', error);
    }
  }

  // Main function to inject overlay
  async function injectRoleWithAIOverlay() {
    if (!isJobDetailPage()) return;

    const jobData = extractJobData();
    if (!jobData) {
      console.log('RoleWithAI: Could not extract job data');
      return;
    }

    currentJobData = jobData;

    // Find insertion point (usually near the job title)
    const insertionPoint = document.querySelector('.jobs-details-top-card__job-title')?.parentElement ||
                          document.querySelector('.top-card-layout__entity-info') ||
                          document.querySelector('main');

    if (!insertionPoint) {
      console.log('RoleWithAI: Could not find insertion point');
      return;
    }

    // Fetch truth score
    const result = await fetchTruthScore(jobData);
    
    const ghostRisk = result.truthScore >= 70 ? 'low' : 
                     result.truthScore >= 40 ? 'medium' : 'high';

    // Create and inject overlay
    roleWithAIOverlay = createRoleWithAIOverlay(
      result.truthScore,
      ghostRisk,
      result.insights || { message: 'Analyzing job posting...', detailedAdvice: 'Processing data...' }
    );

    // Insert after job title section
    insertionPoint.insertAdjacentElement('afterbegin', roleWithAIOverlay);

    // Auto-scroll to overlay
    roleWithAIOverlay.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Watch for URL changes (LinkedIn uses SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(injectRoleWithAIOverlay, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

  // Initial injection
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectRoleWithAIOverlay);
  } else {
    setTimeout(injectRoleWithAIOverlay, 1000);
  }
})();
