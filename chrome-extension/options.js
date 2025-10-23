// Chrome AI Workflows Extension - Options/Settings Page

let storageManager;
let n8nClient;
let chromeAIClient;
let workflows = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Options page initialized');
  
  // Initialize clients
  storageManager = new StorageManager();
  chromeAIClient = new ChromeAIClient();
  
  // Load settings
  await loadSettings();
  
  // Load workflows
  await loadWorkflows();
  
  // Check AI status
  await checkAIStatus();
  
  // Setup event listeners
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const settings = await storageManager.getSettings();
  
  document.getElementById('n8n-url').value = settings.n8nUrl;
  document.getElementById('n8n-api-key').value = settings.n8nApiKey || '';
  
  // Initialize n8n client
  n8nClient = new N8nClient(settings.n8nUrl, settings.n8nApiKey);
}

// Load workflows from storage
async function loadWorkflows() {
  workflows = await storageManager.getWorkflows();
  
  // If empty, load defaults
  if (!workflows || workflows.length === 0) {
    workflows = [...DEFAULT_WORKFLOWS];
    await storageManager.saveWorkflows(workflows);
  }
  
  renderWorkflowsTable();
}

// Render workflows table
function renderWorkflowsTable() {
  const tbody = document.getElementById('workflows-tbody');
  tbody.innerHTML = '';
  
  workflows.forEach((workflow, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${workflow.icon}</td>
      <td>${workflow.name}</td>
      <td style="font-size: 12px; color: var(--text-secondary);">${truncate(workflow.webhookUrl, 40)}</td>
      <td>
        <div class="workflow-actions">
          <button class="icon-btn" onclick="editWorkflow(${index})">✏️ Edit</button>
          <button class="icon-btn" onclick="deleteWorkflow(${index})">🗑️ Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  document.getElementById('check-ai').addEventListener('click', checkAIStatus);
  document.getElementById('add-workflow').addEventListener('click', addWorkflow);
  document.getElementById('import-config').addEventListener('click', importConfig);
  document.getElementById('export-config').addEventListener('click', exportConfig);
  document.getElementById('clear-all').addEventListener('click', clearAllData);
}

// Test n8n connection
async function testConnection() {
  const url = document.getElementById('n8n-url').value;
  const apiKey = document.getElementById('n8n-api-key').value;
  
  const statusDiv = document.getElementById('connection-status');
  statusDiv.innerHTML = '<p style="color: var(--text-secondary);">Testing connection...</p>';
  
  const testClient = new N8nClient(url, apiKey);
  const result = await testClient.testConnection();
  
  if (result.success) {
    statusDiv.innerHTML = '<span class="status-badge success">✓ Connected to n8n</span>';
    showMessage('Connection successful!', 'success');
  } else {
    statusDiv.innerHTML = '<span class="status-badge error">✗ Connection failed</span>';
    showMessage('Connection failed: ' + result.error, 'error');
  }
}

// Save settings
async function saveSettings() {
  const settings = {
    n8nUrl: document.getElementById('n8n-url').value,
    n8nApiKey: document.getElementById('n8n-api-key').value,
    platformUrl: 'http://localhost:3333',
    autoRefreshWorkflows: true
  };
  
  await storageManager.saveSettings(settings);
  
  // Update n8n client
  n8nClient.setConfig(settings.n8nUrl, settings.n8nApiKey);
  
  showMessage('Settings saved successfully!', 'success');
}

// Check Chrome AI status
async function checkAIStatus() {
  const statusDiv = document.getElementById('ai-status');
  statusDiv.innerHTML = '<p style="color: var(--text-secondary);">Checking Chrome AI...</p>';
  
  const result = await chromeAIClient.checkAvailability();
  
  if (result.available) {
    const capabilities = await chromeAIClient.getCapabilities();
    const availableAPIs = Object.entries(capabilities)
      .filter(([key, value]) => value)
      .map(([key]) => key)
      .join(', ');
    
    statusDiv.innerHTML = `
      <span class="status-badge success">✓ Chrome AI Available</span>
      <p style="color: var(--text-secondary); margin-top: 12px; font-size: 13px;">
        Available APIs: ${availableAPIs}
      </p>
    `;
  } else {
    statusDiv.innerHTML = `
      <span class="status-badge error">✗ Chrome AI Not Available</span>
      <p style="color: var(--error); margin-top: 12px; font-size: 13px;">
        ${result.reason}
      </p>
      ${result.downloading ? '<p style="color: var(--warning); margin-top: 8px; font-size: 13px;">Model is downloading. Please wait and check again.</p>' : ''}
    `;
  }
}

// Add new workflow
function addWorkflow() {
  const name = prompt('Workflow Name:');
  if (!name) return;
  
  const webhookUrl = prompt('Webhook URL:', 'http://localhost:5678/webhook/');
  if (!webhookUrl) return;
  
  const icon = prompt('Icon (emoji):', '⚙️');
  const description = prompt('Description:', '');
  
  const newWorkflow = {
    id: 'custom_' + Date.now(),
    name: name,
    description: description,
    webhookUrl: webhookUrl,
    icon: icon || '⚙️',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'custom'
  };
  
  workflows.push(newWorkflow);
  saveWorkflows();
}

// Edit workflow
window.editWorkflow = function(index) {
  const workflow = workflows[index];
  
  const name = prompt('Workflow Name:', workflow.name);
  if (name === null) return;
  
  const webhookUrl = prompt('Webhook URL:', workflow.webhookUrl);
  if (webhookUrl === null) return;
  
  const icon = prompt('Icon (emoji):', workflow.icon);
  const description = prompt('Description:', workflow.description);
  
  workflows[index] = {
    ...workflow,
    name: name || workflow.name,
    webhookUrl: webhookUrl || workflow.webhookUrl,
    icon: icon || workflow.icon,
    description: description || workflow.description
  };
  
  saveWorkflows();
};

// Delete workflow
window.deleteWorkflow = function(index) {
  const workflow = workflows[index];
  
  if (confirm(`Delete workflow "${workflow.name}"?`)) {
    workflows.splice(index, 1);
    saveWorkflows();
  }
};

// Save workflows to storage
async function saveWorkflows() {
  await storageManager.saveWorkflows(workflows);
  renderWorkflowsTable();
  
  // Notify background to update context menus
  chrome.runtime.sendMessage({ action: 'refreshWorkflows' });
  
  showMessage('Workflows updated!', 'success');
}

// Import configuration
function importConfig() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      
      // Import configuration
      await storageManager.importConfig(config);
      
      // Reload data
      await loadSettings();
      await loadWorkflows();
      
      showMessage('Configuration imported successfully!', 'success');
    } catch (error) {
      showMessage('Import failed: ' + error.message, 'error');
    }
  };
  
  input.click();
}

// Export configuration
async function exportConfig() {
  try {
    const config = await storageManager.exportConfig();
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chrome-ai-workflows-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showMessage('Configuration exported!', 'success');
  } catch (error) {
    showMessage('Export failed: ' + error.message, 'error');
  }
}

// Clear all data
async function clearAllData() {
  if (!confirm('This will delete ALL workflows, chat history, and settings. Are you sure?')) {
    return;
  }
  
  if (!confirm('This action cannot be undone. Continue?')) {
    return;
  }
  
  await storageManager.clearAll();
  
  // Reload defaults
  workflows = [...DEFAULT_WORKFLOWS];
  await storageManager.saveWorkflows(workflows);
  
  await loadSettings();
  await loadWorkflows();
  
  showMessage('All data cleared. Default settings restored.', 'success');
}

// Show message
function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

// Utility function
function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

console.log('Options page script loaded');

