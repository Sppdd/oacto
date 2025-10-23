// Chrome AI Workflows Extension - Side Panel Logic

// Global variables
let storageManager;
let n8nClient;
let chromeAIClient;
let workflows = [];
let currentWorkflow = null;
let chatHistory = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Side panel initialized');
  
  // Initialize clients
  storageManager = new StorageManager();
  
  const settings = await storageManager.getSettings();
  n8nClient = new N8nClient(settings.n8nUrl, settings.n8nApiKey);
  chromeAIClient = new ChromeAIClient();
  
  // Load initial data
  await loadWorkflows();
  await loadChatHistory();
  await checkStatuses();
  
  // Setup event listeners
  setupEventListeners();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleBackgroundMessage);
});

// Load workflows from storage and n8n
async function loadWorkflows() {
  try {
    // Load from storage first
    const storedWorkflows = await storageManager.getWorkflows();
    
    // If storage is empty, use defaults
    if (!storedWorkflows || storedWorkflows.length === 0) {
      workflows = [...DEFAULT_WORKFLOWS];
      await storageManager.saveWorkflows(workflows);
    } else {
      workflows = storedWorkflows;
    }
    
    // Populate dropdown
    populateWorkflowSelector();
    
    console.log('Loaded workflows:', workflows.length);
  } catch (error) {
    console.error('Error loading workflows:', error);
    showError('Failed to load workflows: ' + error.message);
  }
}

// Populate workflow selector dropdown
function populateWorkflowSelector() {
  const selector = document.getElementById('workflow-selector');
  selector.innerHTML = '<option value="">Choose a workflow...</option>';
  
  workflows.forEach(workflow => {
    const option = document.createElement('option');
    option.value = workflow.id;
    option.textContent = `${workflow.icon} ${workflow.name}`;
    selector.appendChild(option);
  });
}

// Load chat history
async function loadChatHistory() {
  try {
    chatHistory = await storageManager.getChatHistory();
    renderChatHistory();
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}

// Render chat history
function renderChatHistory() {
  const historyList = document.getElementById('history-list');
  
  if (chatHistory.length === 0) {
    historyList.innerHTML = '<div class="empty-state"><p>No executions yet</p></div>';
    return;
  }
  
  historyList.innerHTML = '';
  
  // Show most recent first
  const recent = [...chatHistory].reverse().slice(0, 20);
  
  recent.forEach(item => {
    const historyItem = createHistoryItem(item);
    historyList.appendChild(historyItem);
  });
}

// Create history item element
function createHistoryItem(item) {
  const div = document.createElement('div');
  div.className = 'history-item' + (item.success ? '' : ' error');
  
  const time = new Date(item.timestamp);
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  div.innerHTML = `
    <div class="history-item-header">
      <span class="history-workflow">${item.workflowName}</span>
      <span class="history-time">${timeStr}</span>
    </div>
    <div class="history-input">Input: ${truncate(item.input, 50)}</div>
    <div class="history-output">${item.success ? truncate(item.output, 60) : 'Error: ' + item.error}</div>
  `;
  
  // Click to view details
  div.addEventListener('click', () => {
    showHistoryDetails(item);
  });
  
  return div;
}

// Show history item details
function showHistoryDetails(item) {
  const resultsSection = document.getElementById('results-section');
  const resultWorkflow = document.getElementById('result-workflow');
  const executionTime = document.getElementById('execution-time');
  const resultContent = document.getElementById('result-content');
  
  resultWorkflow.textContent = item.workflowName;
  executionTime.textContent = new Date(item.timestamp).toLocaleString();
  
  if (item.success) {
    resultContent.textContent = item.output;
    resultContent.style.color = 'var(--text-primary)';
  } else {
    resultContent.textContent = 'Error: ' + item.error;
    resultContent.style.color = 'var(--error)';
  }
  
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Check platform and AI status
async function checkStatuses() {
  // Check platform status
  const platformStatus = document.getElementById('platform-status');
  try {
    const result = await n8nClient.testConnection();
    if (result.success) {
      platformStatus.classList.add('connected');
      platformStatus.classList.remove('error');
    } else {
      platformStatus.classList.add('error');
      platformStatus.classList.remove('connected');
    }
  } catch (error) {
    platformStatus.classList.add('error');
    platformStatus.classList.remove('connected');
  }
  
  // Check AI status
  const aiStatus = document.getElementById('ai-status');
  try {
    const result = await chromeAIClient.checkAvailability();
    if (result.available) {
      aiStatus.classList.add('connected');
      aiStatus.classList.remove('error');
    } else {
      aiStatus.classList.add('error');
      aiStatus.classList.remove('connected');
      if (result.downloading) {
        showError('AI model is downloading. Please wait...');
      }
    }
  } catch (error) {
    aiStatus.classList.add('error');
    aiStatus.classList.remove('connected');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Workflow selector
  const workflowSelector = document.getElementById('workflow-selector');
  workflowSelector.addEventListener('change', (e) => {
    const workflowId = e.target.value;
    currentWorkflow = workflows.find(w => w.id === workflowId);
    
    const executeBtn = document.getElementById('execute-workflow');
    executeBtn.disabled = !currentWorkflow;
  });
  
  // Execute button
  const executeBtn = document.getElementById('execute-workflow');
  executeBtn.addEventListener('click', executeCurrentWorkflow);
  
  // Quick action buttons
  document.getElementById('test-ai').addEventListener('click', testAI);
  document.getElementById('open-platform').addEventListener('click', openPlatform);
  document.getElementById('refresh-workflows').addEventListener('click', refreshWorkflows);
  
  // Copy result button
  document.getElementById('copy-result').addEventListener('click', copyResult);
  
  // Clear history button
  document.getElementById('clear-history').addEventListener('click', clearHistory);
}

// Execute current workflow
async function executeCurrentWorkflow() {
  if (!currentWorkflow) {
    showError('Please select a workflow first');
    return;
  }
  
  const input = document.getElementById('user-input').value.trim();
  if (!input) {
    showError('Please enter some input');
    return;
  }
  
  // Show loading state
  const executeBtn = document.getElementById('execute-workflow');
  const executeText = document.getElementById('execute-text');
  const originalText = executeText.textContent;
  
  executeBtn.classList.add('loading');
  executeBtn.disabled = true;
  executeText.innerHTML = '<span class="loading-indicator"></span> Running...';
  
  try {
    // Get context data if workflow accepts it
    let context = {};
    if (currentWorkflow.acceptsContext) {
      context = await getContextData();
    }
    
    // Prepare payload
    const payload = {
      text: input,
      context: context,
      sessionId: generateSessionId()
    };
    
    // Execute via background script (to avoid CORS)
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'executeWebhook',
        webhookUrl: currentWorkflow.webhookUrl,
        data: payload
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
    
    // Display result
    if (result.success) {
      displayResult(result.data, currentWorkflow.name);
      
      // Save to history
      await saveToHistory({
        workflowId: currentWorkflow.id,
        workflowName: currentWorkflow.name,
        input: input,
        output: extractResultText(result.data),
        success: true
      });
      
      // Clear input
      document.getElementById('user-input').value = '';
      
      // Show success
      showSuccess('Workflow executed successfully!');
    } else {
      throw new Error(result.error || 'Workflow execution failed');
    }
  } catch (error) {
    console.error('Workflow execution error:', error);
    showError('Failed to execute workflow: ' + error.message);
    
    // Save error to history
    await saveToHistory({
      workflowId: currentWorkflow.id,
      workflowName: currentWorkflow.name,
      input: input,
      error: error.message,
      success: false
    });
  } finally {
    // Reset button state
    executeBtn.classList.remove('loading');
    executeBtn.disabled = false;
    executeText.textContent = originalText;
  }
}

// Get context data from current tab
async function getContextData() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Try to get selected text
    let selection = '';
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });
      selection = result[0]?.result || '';
    } catch (e) {
      console.log('Could not get selection:', e);
    }
    
    return {
      url: tab.url,
      title: tab.title,
      selection: selection
    };
  } catch (error) {
    console.error('Error getting context:', error);
    return {};
  }
}

// Generate session ID for chat continuity
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Extract result text from webhook response
function extractResultText(data) {
  // Handle different response formats
  if (typeof data === 'string') {
    return data;
  }
  
  if (data.result) {
    return data.result;
  }
  
  if (data.output) {
    return data.output;
  }
  
  if (data.data) {
    return extractResultText(data.data);
  }
  
  // Fallback to JSON string
  return JSON.stringify(data, null, 2);
}

// Display workflow result
function displayResult(data, workflowName) {
  const resultsSection = document.getElementById('results-section');
  const resultWorkflow = document.getElementById('result-workflow');
  const executionTime = document.getElementById('execution-time');
  const resultContent = document.getElementById('result-content');
  
  resultWorkflow.textContent = workflowName;
  executionTime.textContent = new Date().toLocaleTimeString();
  resultContent.textContent = extractResultText(data);
  resultContent.style.color = 'var(--text-primary)';
  
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Save execution to history
async function saveToHistory(item) {
  await storageManager.addChatMessage(item);
  chatHistory = await storageManager.getChatHistory();
  renderChatHistory();
}

// Test AI availability
async function testAI() {
  try {
    const result = await chromeAIClient.checkAvailability();
    
    if (result.available) {
      // Test actual prompt
      const testResult = await chromeAIClient.promptAI({
        userPrompt: 'Say hello in exactly 3 words',
        temperature: 0.8
      });
      
      showSuccess('Chrome AI is working! Response: ' + testResult);
    } else {
      showError('Chrome AI not available: ' + result.reason);
    }
  } catch (error) {
    showError('AI test failed: ' + error.message);
  }
}

// Open platform dashboard
function openPlatform() {
  chrome.runtime.sendMessage({ action: 'openPlatform' });
}

// Refresh workflows from n8n
async function refreshWorkflows() {
  try {
    const result = await n8nClient.fetchWorkflows();
    
    if (result.success && result.workflows.length > 0) {
      // Merge with existing workflows
      const newWorkflows = result.workflows
        .filter(nw => nw.webhookUrl) // Only workflows with webhooks
        .map(nw => ({
          id: nw.id,
          name: nw.name,
          description: `n8n workflow (${nw.nodes} nodes)`,
          webhookUrl: nw.webhookUrl,
          icon: '⚙️',
          method: 'POST',
          acceptsContext: true,
          showInContextMenu: false,
          category: 'n8n'
        }));
      
      // Add to existing workflows (avoid duplicates)
      newWorkflows.forEach(nw => {
        const exists = workflows.find(w => w.id === nw.id);
        if (!exists) {
          workflows.push(nw);
        }
      });
      
      await storageManager.saveWorkflows(workflows);
      populateWorkflowSelector();
      
      // Notify background to update context menus
      chrome.runtime.sendMessage({ action: 'refreshWorkflows' });
      
      showSuccess(`Loaded ${newWorkflows.length} workflows from n8n`);
    } else {
      showError('No workflows found in n8n. Make sure n8n is running.');
    }
  } catch (error) {
    showError('Failed to refresh workflows: ' + error.message);
  }
}

// Copy result to clipboard
async function copyResult() {
  const resultContent = document.getElementById('result-content');
  const text = resultContent.textContent;
  
  try {
    await navigator.clipboard.writeText(text);
    
    const copyBtn = document.getElementById('copy-result');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '✓ Copied';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  } catch (error) {
    showError('Failed to copy: ' + error.message);
  }
}

// Clear chat history
async function clearHistory() {
  if (confirm('Clear all execution history?')) {
    await storageManager.clearChatHistory();
    chatHistory = [];
    renderChatHistory();
    showSuccess('History cleared');
  }
}

// Handle messages from background script
function handleBackgroundMessage(message, sender, sendResponse) {
  if (message.action === 'setSelectedText') {
    // Set selected text in input
    const userInput = document.getElementById('user-input');
    userInput.value = message.text;
    
    // Show selected text indicator
    const selectedTextDiv = document.getElementById('selected-text');
    const selectedTextContent = document.getElementById('selected-text-content');
    selectedTextContent.textContent = truncate(message.text, 200);
    selectedTextDiv.style.display = 'block';
    
    sendResponse({ success: true });
  }
  
  if (message.action === 'executeWorkflow') {
    // Auto-execute workflow
    const userInput = document.getElementById('user-input');
    userInput.value = message.text;
    
    // Select workflow
    const workflowSelector = document.getElementById('workflow-selector');
    workflowSelector.value = message.workflowId;
    
    currentWorkflow = workflows.find(w => w.id === message.workflowId);
    
    // Execute after short delay
    setTimeout(() => {
      executeCurrentWorkflow();
    }, 500);
    
    sendResponse({ success: true });
  }
}

// Utility functions
function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function showError(message) {
  // Remove any existing messages
  const existing = document.querySelector('.error-message');
  if (existing) existing.remove();
  
  const div = document.createElement('div');
  div.className = 'error-message';
  div.textContent = message;
  
  document.querySelector('.extension-container').insertBefore(
    div,
    document.querySelector('.workflow-section')
  );
  
  // Auto-remove after 5 seconds
  setTimeout(() => div.remove(), 5000);
}

function showSuccess(message) {
  // Remove any existing messages
  const existing = document.querySelector('.success-message');
  if (existing) existing.remove();
  
  const div = document.createElement('div');
  div.className = 'success-message';
  div.textContent = message;
  
  document.querySelector('.extension-container').insertBefore(
    div,
    document.querySelector('.workflow-section')
  );
  
  // Auto-remove after 3 seconds
  setTimeout(() => div.remove(), 3000);
}

// Refresh statuses every 30 seconds
setInterval(checkStatuses, 30000);

console.log('Side panel script loaded');

