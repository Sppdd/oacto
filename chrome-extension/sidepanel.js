// Side Panel Main Logic
// Handles UI interactions and workflow execution

// Global instances
let platformAPI;
let chromeAIClient;
let workflows = [];
let executionHistory = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Chrome AI Workflows side panel loaded');
  
  // Initialize clients
  platformAPI = new PlatformAPI();
  chromeAIClient = new ChromeAIClient();
  
  // Load saved data
  await loadSavedData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize UI
  await initializeUI();
  
  // Check connections
  await checkConnections();
});

// Load saved data from storage
async function loadSavedData() {
  try {
    const result = await chrome.storage.local.get(['executionHistory', 'workflows']);
    executionHistory = result.executionHistory || [];
    workflows = result.workflows || [];
  } catch (error) {
    console.log('Could not load saved data:', error);
  }
}

// Save data to storage
async function saveData() {
  try {
    await chrome.storage.local.set({
      executionHistory: executionHistory,
      workflows: workflows
    });
  } catch (error) {
    console.log('Could not save data:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Quick action buttons
  document.getElementById('test-ai').addEventListener('click', testChromeAI);
  document.getElementById('open-platform').addEventListener('click', openPlatform);
  document.getElementById('refresh-workflows').addEventListener('click', refreshWorkflows);
  
  // Workflow execution
  document.getElementById('execute-workflow').addEventListener('click', executeWorkflow);
  
  // Input handling
  const userInput = document.getElementById('user-input');
  userInput.addEventListener('input', updateExecuteButton);
  
  // Workflow selector
  document.getElementById('workflow-selector').addEventListener('change', updateExecuteButton);
  
  // Copy result button
  document.getElementById('copy-result').addEventListener('click', copyResult);
  
  // Clear history button
  document.getElementById('clear-history').addEventListener('click', clearHistory);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleMessage);
}

// Handle messages from background script
function handleMessage(message, sender, sendResponse) {
  switch (message.action) {
    case 'setSelectedText':
      setSelectedText(message.text);
      break;
      
    case 'executeWorkflow':
      executeWorkflowById(message.workflowId, message.text);
      break;
      
    default:
      console.log('Unknown message:', message);
  }
}

// Initialize UI
async function initializeUI() {
  // Load workflows
  await loadWorkflows();
  
  // Update workflow selector
  updateWorkflowSelector();
  
  // Render history
  renderHistory();
  
  // Update execute button state
  updateExecuteButton();
}

// Check connections
async function checkConnections() {
  // Check platform connection
  const platformConnected = await platformAPI.checkConnection();
  updateStatusIndicator('platform-status', platformConnected);
  
  // Check Chrome AI availability
  const chromeAIAvailable = await chromeAIClient.checkAvailability();
  updateStatusIndicator('ai-status', chromeAIAvailable);
  
  // Update badge
  chrome.runtime.sendMessage({ action: 'updateBadge' });
}

// Update status indicator
function updateStatusIndicator(elementId, connected) {
  const indicator = document.getElementById(elementId);
  if (indicator) {
    indicator.className = `status-indicator ${connected ? 'connected' : 'error'}`;
  }
}

// Load workflows from platform
async function loadWorkflows() {
  const result = await platformAPI.getWorkflows();
  
  if (result.success) {
    workflows = result.workflows;
    console.log(`Loaded ${workflows.length} workflows from ${result.source}`);
  } else {
    console.log('Failed to load workflows:', result.error);
    // Fallback to default workflows
    workflows = DEFAULT_WORKFLOWS;
  }
}

// Update workflow selector
function updateWorkflowSelector() {
  const selector = document.getElementById('workflow-selector');
  selector.innerHTML = '<option value="">Choose a workflow...</option>';
  
  workflows.forEach(workflow => {
    const option = document.createElement('option');
    option.value = workflow.id;
    option.textContent = `${workflow.icon || '⚙️'} ${workflow.name}`;
    if (workflow.active === false) {
      option.textContent += ' (inactive)';
    }
    selector.appendChild(option);
  });
}

// Update execute button state
function updateExecuteButton() {
  const button = document.getElementById('execute-workflow');
  const input = document.getElementById('user-input');
  const selector = document.getElementById('workflow-selector');
  
  const hasInput = input.value.trim().length > 0;
  const hasWorkflow = selector.value.length > 0;
  
  button.disabled = !(hasInput && hasWorkflow);
}

// Test Chrome AI
async function testChromeAI() {
  const button = document.getElementById('test-ai');
  const originalText = button.textContent;
  
  button.textContent = 'Testing...';
  button.disabled = true;
  
  try {
    const result = await platformAPI.testChromeAI('Write a short haiku about automation');
    
    if (result.success) {
      showResult('AI Test', result.result, 'chrome-ai');
    } else {
      showError('AI Test Failed', result.error);
    }
  } catch (error) {
    showError('AI Test Failed', error.message);
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Open platform dashboard
function openPlatform() {
  chrome.tabs.create({ url: 'http://localhost:3333' });
}

// Refresh workflows
async function refreshWorkflows() {
  const button = document.getElementById('refresh-workflows');
  const originalText = button.textContent;
  
  button.textContent = 'Refreshing...';
  button.disabled = true;
  
  try {
    await loadWorkflows();
    updateWorkflowSelector();
    showSuccess('Workflows refreshed successfully');
  } catch (error) {
    showError('Failed to refresh workflows', error.message);
  } finally {
    button.textContent = originalText;
    button.disabled = false;
  }
}

// Execute workflow
async function executeWorkflow() {
  const selector = document.getElementById('workflow-selector');
  const input = document.getElementById('user-input');
  
  const workflowId = selector.value;
  const inputText = input.value.trim();
  
  if (!workflowId || !inputText) {
    return;
  }
  
  await executeWorkflowById(workflowId, inputText);
}

// Execute workflow by ID
async function executeWorkflowById(workflowId, inputText) {
  const workflow = workflows.find(w => w.id === workflowId);
  if (!workflow) {
    showError('Workflow not found', `Workflow ${workflowId} not found`);
    return;
  }
  
  const executeButton = document.getElementById('execute-workflow');
  const executeText = document.getElementById('execute-text');
  
  // Update UI for execution
  executeButton.disabled = true;
  executeText.textContent = 'Executing...';
  
  const startTime = Date.now();
  
  try {
    // Try platform execution first
    const result = await platformAPI.executeWorkflow(workflowId, inputText, {
      systemPrompt: workflow.systemPrompt,
      temperature: workflow.temperature || 0.8,
      webhookUrl: workflow.webhookUrl,
      useChromeAI: false  // Changed from true - prefer n8n execution
    });
    
    const executionTime = Date.now() - startTime;
    
    if (result.success) {
      showResult(workflow.name, result.result, workflowId, executionTime);
      addToHistory(workflow, inputText, result.result, executionTime);
    } else {
      // Handle specific error cases
      if (result.method === 'webhook-test-mode' || result.method === 'n8n-api-test-mode') {
        showError('Workflow Not Activated', `${result.error}\n\n${result.hint}`);
      } else {
        showError('Execution Failed', result.error);
      }
    }
  } catch (error) {
    showError('Execution Failed', error.message);
  } finally {
    executeButton.disabled = false;
    executeText.textContent = 'Run Workflow';
  }
}

// Show result
function showResult(workflowName, result, workflowId, executionTime) {
  const resultsSection = document.getElementById('results-section');
  const resultWorkflow = document.getElementById('result-workflow');
  const resultContent = document.getElementById('result-content');
  const executionTimeEl = document.getElementById('execution-time');
  
  // Extract method if result is an object
  let displayResult = result;
  let method = 'unknown';
  
  if (typeof result === 'object' && result.method) {
    method = result.method;
    displayResult = result.result || JSON.stringify(result);
  }
  
  resultWorkflow.textContent = `${workflowName} (${method})`;
  resultContent.textContent = typeof displayResult === 'string' 
    ? displayResult 
    : JSON.stringify(displayResult, null, 2);
  executionTimeEl.textContent = `${executionTime || 0}ms`;
  
  resultsSection.style.display = 'block';
  resultsSection.classList.add('fade-in');
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Show error
function showError(title, message) {
  const resultsSection = document.getElementById('results-section');
  const resultWorkflow = document.getElementById('result-workflow');
  const resultContent = document.getElementById('result-content');
  const executionTimeEl = document.getElementById('execution-time');
  
  resultWorkflow.textContent = title;
  resultContent.textContent = `Error: ${message}`;
  resultContent.style.color = 'var(--error)';
  executionTimeEl.textContent = '';
  
  resultsSection.style.display = 'block';
  resultsSection.classList.add('fade-in');
}

// Show success message
function showSuccess(message) {
  // Create temporary success message
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--success);
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  successDiv.textContent = message;
  
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

// Set selected text
function setSelectedText(text) {
  const input = document.getElementById('user-input');
  const selectedTextDiv = document.getElementById('selected-text');
  const selectedTextContent = document.getElementById('selected-text-content');
  
  input.value = text;
  selectedTextContent.textContent = text;
  selectedTextDiv.style.display = 'block';
  
  updateExecuteButton();
}

// Copy result to clipboard
async function copyResult() {
  const resultContent = document.getElementById('result-content');
  const text = resultContent.textContent;
  
  try {
    await navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard');
  } catch (error) {
    console.log('Could not copy to clipboard:', error);
  }
}

// Add to execution history
function addToHistory(workflow, input, result, executionTime) {
  const historyItem = {
    id: Date.now(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
    result: result.substring(0, 200) + (result.length > 200 ? '...' : ''),
    timestamp: new Date().toISOString(),
    executionTime: executionTime
  };
  
  executionHistory.unshift(historyItem);
  
  // Keep only last 50 items
  if (executionHistory.length > 50) {
    executionHistory = executionHistory.slice(0, 50);
  }
  
  saveData();
  renderHistory();
}

// Render execution history
function renderHistory() {
  const historyList = document.getElementById('history-list');
  
  if (executionHistory.length === 0) {
    historyList.innerHTML = '<div class="empty-state"><p>No executions yet</p></div>';
    return;
  }
  
  historyList.innerHTML = executionHistory.map(item => `
    <div class="history-item" onclick="loadHistoryItem('${item.id}')">
      <div class="history-item-header">
        <span class="history-workflow">${item.workflowName}</span>
        <span class="history-time">${new Date(item.timestamp).toLocaleTimeString()}</span>
      </div>
      <div class="history-preview">${item.input}</div>
    </div>
  `).join('');
}

// Load history item
function loadHistoryItem(itemId) {
  const item = executionHistory.find(h => h.id == itemId);
  if (item) {
    const input = document.getElementById('user-input');
    const selector = document.getElementById('workflow-selector');
    
    input.value = item.input;
    selector.value = item.workflowId;
    
    updateExecuteButton();
  }
}

// Clear history
function clearHistory() {
  executionHistory = [];
  saveData();
  renderHistory();
}

// Add CSS animation for slideIn
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

console.log('Chrome AI Workflows side panel script loaded');