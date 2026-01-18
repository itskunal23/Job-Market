// RoleWithAI Popup Script

document.addEventListener('DOMContentLoaded', () => {
  // Load stats
  chrome.storage.local.get(['impactPoints', 'jobsAnalyzed'], (result) => {
    document.getElementById('impact-points').textContent = result.impactPoints || 0;
    document.getElementById('jobs-analyzed').textContent = result.jobsAnalyzed || 0;
  });

  // Analyze current page
  document.getElementById('analyze-current').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url?.includes('linkedin.com/jobs')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'analyze' });
        window.close();
      } else {
        alert('Please navigate to a LinkedIn job posting first.');
      }
    });
  });

  // View dashboard
  document.getElementById('view-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });

  // Settings
  document.getElementById('settings').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/settings' });
  });
});
