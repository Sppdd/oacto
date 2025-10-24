// Options Page Logic
// Handles settings and configuration

let platformAPI;
let chromeAIClient;
let settings = {};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Chrome AI Workflows options page loaded');
  
  // Initialize clients
  platformAPI = new PlatformAPI();
  chromeAIClient = new ChromeAIClient();
  
  // Load settings
  await loadSettings();
  
  // Setup event listeners
  setupEventListeners();
  
  // Check initial status
  await checkStatus();
});

// Load settings from storage
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get(['settings']);
    settings = result.settings || getDefaultSettings();
    
    // Apply settings to UI
    applySettingsToUI();
  } catch (error) {
    console.log('Could not load settings:', error);
    settings = getDefaultSettings();
  }
}

// Get default settings
function getDefaultSettings() {
  return {
    platformUrl: 'http://localhost:3333',
    n8nUrl: 'http://localhost:5678',
    defaultTemperature: 0.8,
    defaultTopK: 3,
    autoRefreshWorkflows: true,
    showContextMenu: true,
    saveExecutionHistory: true
  };
}

// Apply settings to UI
function applySettingsToUI() {
  document.getElementById('platform-url').value = settings.platformUrl;
  document.getElementById('n8n-url').value = settings.n8nUrl;
  document.getElementById('default-temperature').value = settings.defaultTemperature;
  document.getElementById('default-topk').value = settings.defaultTopK;
  document.getElementById('auto-refresh-workflows').checked = settings.autoRefreshWorkflows;
  document.getElementById('show-context-menu').checked = settings.showContextMenu;
  document.getElementById('save-execution-history').checked = settings.saveExecutionHistory;
}

// Save settings to storage
async function saveSettings() {
  try {
    await chrome.storage.local.set({ settings: settings });
    showMessage('Settings saved successfully', 'success');
  } catch (error) {
    console.log('Could not save settings:', error);
    showMessage('Failed to save settings', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Test connection button
  document.getElementById('test-connection').addEventListener('click', testConnection);
  
  // Test Chrome AI button
  document.getElementById('test-chrome-ai').addEventListener('click', testChromeAI);
  
  // Clear history button
  document.getElementById('clear-history').addEventListener('click', clearHistory);
  
  // Reset settings button
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Settings change handlers
  document.getElementById('platform-url').addEventListener('change', updateSettings);
  document.getElementById('n8n-url').addEventListener('change', updateSettings);
  document.getElementById('default-temperature').addEventListener('change', updateSettings);
  document.getElementById('default-topk').addEventListener('change', updateSettings);
  document.getElementById('auto-refresh-workflows').addEventListener('change', updateSettings);
  document.getElementById('show-context-menu').addEventListener('change', updateSettings);
  document.getElementById('save-execution-history').addEventListener('change', updateSettings);
}

// Update settings from UI
function updateSettings() {
  settings.platformUrl = document.getElementById('platform-url').value;
  settings.n8nUrl = document.getElementById('n8n-url').value;
  settings.defaultTemperature = parseFloat(document.getElementById('default-temperature').value);
  settings.defaultTopK = parseInt(document.getElementById('default-topk').value);
  settings.autoRefreshWorkflows = document.getElementById('auto-refresh-workflows').checked;
  settings.showContextMenu = document.getElementById('show-context-menu').checked;
  settings.saveExecutionHistory = document.getElementById('save-execution-history').checked;
  
  // Update API clients
  platformAPI.setConfig(settings.platformUrl);
}

// Test connection
async function testConnection() {
  const button = document.getElementById('test-connection');
  const resultsDiv = document.getElementById('connection-results');
  
  button.textContent = 'Testing...';
  button.disabled = true;
  
  try {
    // Test platform connection
    const platformConnected = await platformAPI.checkConnection();
    
    // Test n8n connection
    const n8nConnected = await testN8nConnection();
    
    let message = '';
    let isSuccess = true;
    
    if (platformConnected) {
      message += '✅ Platform server connected<br>';
    } else {
      message += '❌ Platform server not connected<br>';
      isSuccess = false;
    }
    
    if (n8nConnected) {
      message += '✅ n8n server connected<br>';
    } else {
      message += '❌ n8n server not connected<br>';
      isSuccess = false;
    }
    
    resultsDiv.innerHTML = message;
    resultsDiv.className = `test-results ${isSuccess ? 'success' : 'error'}`;
    
  } catch (error) {
    resultsDiv.innerHTML = `❌ Connection test failed: ${error.message}`;
    resultsDiv.className = 'test-results error';
  } finally {
    button.textContent = 'Test Connection';
    button.disabled = false;
  }
}

// Test n8n connection
async function testN8nConnection() {
  try {
    const response = await fetch(`${settings.n8nUrl}/healthz`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Test Chrome AI
async function testChromeAI() {
  const button = document.getElementById('test-chrome-ai');
  const resultsDiv = document.getElementById('chrome-ai-results');
  
  button.textContent = 'Testing...';
  button.disabled = true;
  
  try {
    const result = await chromeAIClient.quickPrompt('Write a short haiku about automation', {
      temperature: settings.defaultTemperature,
      topK: settings.defaultTopK
    });
    
    if (result.success) {
      resultsDiv.innerHTML = `✅ Chrome AI working<br><br>Test result:<br><em>${result.result}</em>`;
      resultsDiv.className = 'test-results success';
    } else {
      resultsDiv.innerHTML = `❌ Chrome AI test failed: ${result.error}`;
      resultsDiv.className = 'test-results error';
    }
  } catch (error) {
    resultsDiv.innerHTML = `❌ Chrome AI test failed: ${error.message}`;
    resultsDiv.className = 'test-results error';
  } finally {
    button.textContent = 'Test Chrome AI';
    button.disabled = false;
  }
}

// Clear execution history
async function clearHistory() {
  if (confirm('Are you sure you want to clear all execution history?')) {
    try {
      await chrome.storage.local.remove(['executionHistory']);
      showMessage('Execution history cleared', 'success');
    } catch (error) {
      showMessage('Failed to clear history', 'error');
    }
  }
}

// Reset settings to defaults
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    settings = getDefaultSettings();
    applySettingsToUI();
    showMessage('Settings reset to defaults', 'success');
  }
}

// Check status
async function checkStatus() {
  const statusDiv = document.getElementById('status-info');
  
  try {
    // Check platform connection
    const platformConnected = await platformAPI.checkConnection();
    
    // Check Chrome AI availability
    const chromeAIAvailable = await chromeAIClient.checkAvailability();
    
    let statusHTML = '';
    
    if (platformConnected) {
      statusHTML += '<p><span class="status-indicator connected"></span>Platform server connected</p>';
    } else {
      statusHTML += '<p><span class="status-indicator error"></span>Platform server not connected</p>';
    }
    
    if (chromeAIAvailable) {
      statusHTML += '<p><span class="status-indicator connected"></span>Chrome AI available</p>';
    } else {
      statusHTML += '<p><span class="status-indicator error"></span>Chrome AI not available</p>';
    }
    
    statusDiv.innerHTML = statusHTML;
  } catch (error) {
    statusDiv.innerHTML = '<p><span class="status-indicator error"></span>Status check failed</p>';
  }
}

// Show message
function showMessage(message, type) {
  // Create temporary message
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--success)' : 'var(--error)'};
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  `;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
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

console.log('Chrome AI Workflows options script loaded');