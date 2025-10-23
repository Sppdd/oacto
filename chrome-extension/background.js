// Background Service Worker for Chrome AI Workflows Extension
// Handles context menus, webhook execution, and message passing

// Default workflow configurations (inline to avoid importScripts)
const DEFAULT_WORKFLOWS = [
  {
    id: 'summarize',
    name: 'Summarize Text',
    description: 'Create a concise summary of selected text',
    webhookUrl: 'http://localhost:5678/webhook/summarize',
    icon: '📝',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'translate',
    name: 'Translate Text',
    description: 'Translate text to another language',
    webhookUrl: 'http://localhost:5678/webhook/translate',
    icon: '🌍',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'rewrite',
    name: 'Rewrite Text',
    description: 'Rephrase text with different tone',
    webhookUrl: 'http://localhost:5678/webhook/rewrite',
    icon: '✏️',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'proofread',
    name: 'Proofread Text',
    description: 'Fix grammar and spelling errors',
    webhookUrl: 'http://localhost:5678/webhook/proofread',
    icon: '🔍',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'chat',
    name: 'AI Chat Assistant',
    description: 'General AI conversation',
    webhookUrl: 'http://localhost:5678/webhook/chat',
    icon: '💬',
    method: 'POST',
    acceptsContext: false,
    showInContextMenu: false,
    category: 'chat'
  },
  {
    id: 'haiku',
    name: 'Generate Haiku',
    description: 'Create a beautiful haiku about any topic',
    webhookUrl: 'http://localhost:5678/webhook/haiku',
    icon: '🎨',
    method: 'POST',
    acceptsContext: false,
    showInContextMenu: false,
    category: 'creative'
  }
];

let workflows = [];

// Initialize on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Chrome AI Workflows extension installed');
  
  // Load workflows from storage or use defaults
  await loadWorkflows();
  
  // Create context menus
  createContextMenus();
});

// Load workflows from storage
async function loadWorkflows() {
  try {
    const result = await chrome.storage.sync.get(['workflows']);
    workflows = result.workflows && result.workflows.length > 0 
      ? result.workflows 
      : DEFAULT_WORKFLOWS;
    
    console.log('Loaded workflows:', workflows.length);
  } catch (error) {
    console.error('Error loading workflows:', error);
    workflows = DEFAULT_WORKFLOWS;
  }
}

// Create context menus for workflows
function createContextMenus() {
  // Remove all existing menus first
  chrome.contextMenus.removeAll(() => {
    // Main menu
    chrome.contextMenus.create({
      id: 'chrome-ai-workflows',
      title: 'Chrome AI Workflows',
      contexts: ['selection']
    });

    // Add submenu for each workflow that accepts context
    workflows
      .filter(w => w.showInContextMenu)
      .forEach(workflow => {
        chrome.contextMenus.create({
          id: `workflow-${workflow.id}`,
          parentId: 'chrome-ai-workflows',
          title: `${workflow.icon} ${workflow.name}`,
          contexts: ['selection']
        });
      });

    console.log('Context menus created');
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'chrome-ai-workflows') {
    // Open side panel with selected text
    await chrome.sidePanel.open({ windowId: tab.windowId });
    
    // Send selected text to side panel
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'setSelectedText',
        text: info.selectionText,
        pageUrl: info.pageUrl,
        pageTitle: tab.title
      });
    }, 500);
  } else if (info.menuItemId.startsWith('workflow-')) {
    // Extract workflow ID
    const workflowId = info.menuItemId.replace('workflow-', '');
    const workflow = workflows.find(w => w.id === workflowId);
    
    if (workflow) {
      // Open side panel
      await chrome.sidePanel.open({ windowId: tab.windowId });
      
      // Execute workflow with selected text
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: 'executeWorkflow',
          workflowId: workflow.id,
          text: info.selectionText,
          context: {
            url: info.pageUrl,
            title: tab.title,
            selection: info.selectionText
          }
        });
      }, 500);
    }
  }
});

// Handle messages from side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'executeWebhook') {
    // Execute webhook and send response
    executeWebhook(message.webhookUrl, message.data)
      .then(result => {
        sendResponse(result);
        
        // Update badge based on result
        updateBadge(result.success);
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
        updateBadge(false);
      });
    
    // Return true to indicate async response
    return true;
  }
  
  if (message.action === 'refreshWorkflows') {
    // Reload workflows and recreate context menus
    loadWorkflows().then(() => {
      createContextMenus();
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.action === 'updateBadge') {
    updateBadge(message.success, message.text);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'openPlatform') {
    chrome.tabs.create({ url: 'http://localhost:3333' });
    sendResponse({ success: true });
    return true;
  }
});

// Execute webhook
async function executeWebhook(webhookUrl, data) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout - workflow took too long to execute'
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to execute workflow'
    };
  }
}

// Update extension badge
function updateBadge(success, text = null) {
  if (text) {
    chrome.action.setBadgeText({ text });
  } else if (success) {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' }); // Green
    
    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 3000);
  } else {
    chrome.action.setBadgeText({ text: '✗' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Red
    
    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 3000);
  }
}

// Listen for storage changes to update workflows
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.workflows) {
    loadWorkflows().then(() => {
      createContextMenus();
    });
  }
});

console.log('Chrome AI Workflows background service worker loaded');

