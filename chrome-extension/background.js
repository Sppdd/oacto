// Background Service Worker
// Handles context menus, badge updates, and communication

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome AI Workflows extension installed');
  
  // Create context menu items
  createContextMenus();
  
  // Set initial badge
  updateBadge();
  
  // Start periodic badge updates
  setInterval(updateBadge, 30000); // Every 30 seconds
});

// Create context menu items
function createContextMenus() {
  // Main context menu for text selection
  chrome.contextMenus.create({
    id: 'chrome-ai-workflows',
    title: 'Send to Chrome AI Workflows',
    contexts: ['selection']
  });

  // Quick action submenus
  const quickActions = [
    { id: 'summarize', title: '📝 Summarize', icon: '📝' },
    { id: 'translate', title: '🌍 Translate', icon: '🌍' },
    { id: 'rewrite', title: '✏️ Rewrite', icon: '✏️' },
    { id: 'proofread', title: '🔍 Proofread', icon: '🔍' },
    { id: 'email', title: '📧 Write Email', icon: '📧' }
  ];

  quickActions.forEach(action => {
    chrome.contextMenus.create({
      id: action.id,
      parentId: 'chrome-ai-workflows',
      title: action.title,
      contexts: ['selection']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'chrome-ai-workflows') {
    // Open side panel with selected text
    await chrome.sidePanel.open({ tabId: tab.id });
    
    // Send message to side panel
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'setSelectedText',
        text: info.selectionText
      });
    } catch (error) {
      console.log('Could not send message to tab:', error);
    }
  } else {
    // Execute specific workflow
    await chrome.sidePanel.open({ tabId: tab.id });
    
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'executeWorkflow',
        workflowId: info.menuItemId,
        text: info.selectionText
      });
    } catch (error) {
      console.log('Could not send message to tab:', error);
    }
  }
});

// Update badge based on platform status
async function updateBadge() {
  try {
    const response = await fetch('http://localhost:3333/api/health');
    const data = await response.json();
    
    if (data.status === 'ok') {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    } else {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    }
  } catch (error) {
    chrome.action.setBadgeText({ text: '✗' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

// Handle messages from content scripts or side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'updateBadge':
      updateBadge();
      sendResponse({ success: true });
      break;
      
    case 'checkPlatformStatus':
      checkPlatformStatus().then(sendResponse);
      return true; // Keep message channel open for async response
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Check platform status
async function checkPlatformStatus() {
  try {
    const response = await fetch('http://localhost:3333/api/health');
    const data = await response.json();
    
    return {
      success: true,
      status: data.status,
      message: data.message,
      timestamp: data.timestamp
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome AI Workflows extension started');
  updateBadge();
});

// Handle tab updates (for badge updates)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Update badge when tab loads
    updateBadge();
  }
});

console.log('Chrome AI Workflows background script loaded');