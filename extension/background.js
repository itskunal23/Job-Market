// RoleWithAI Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('RoleWithAI: Career Co-Pilot installed');
});

// Track skipped jobs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trackSkip') {
    // Store in local storage for analytics
    chrome.storage.local.get(['skippedJobs'], (result) => {
      const skipped = result.skippedJobs || [];
      skipped.push({
        ...request.jobData,
        skippedAt: new Date().toISOString(),
      });
      chrome.storage.local.set({ skippedJobs: skipped });
    });
    sendResponse({ success: true });
  }
});

// Listen for tab updates to detect LinkedIn job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com/jobs')) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).catch(() => {
      // Script already injected or page not ready
    });
  }
});
