// Popup script - shows connection status

document.addEventListener('DOMContentLoaded', async () => {
  checkBridgeStatus();
  checkAIStatus();
  
  // Listen for status updates
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'bridge-status') {
      updateBridgeStatus(message.status === 'connected');
    }
  });
});

async function checkBridgeStatus() {
  const statusEl = document.getElementById('bridge-status');
  const indicator = statusEl.querySelector('.indicator');
  const text = statusEl.querySelector('.text');
  
  try {
    const response = await chrome.runtime.sendMessage({ type: 'get-bridge-status' });
    
    if (response.connected) {
      indicator.className = 'indicator connected';
      text.textContent = 'Connected';
    } else {
      indicator.className = 'indicator disconnected';
      text.textContent = 'Disconnected';
    }
  } catch (error) {
    indicator.className = 'indicator disconnected';
    text.textContent = 'Error';
  }
}

async function checkAIStatus() {
  const statusEl = document.getElementById('ai-status');
  const indicator = statusEl.querySelector('.indicator');
  const text = statusEl.querySelector('.text');
  
  try {
    // Try to access window.ai in active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      indicator.className = 'indicator disconnected';
      text.textContent = 'No active tab';
      return;
    }
    
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return typeof window.ai !== 'undefined' && 
               typeof window.ai.languageModel !== 'undefined';
      },
    });
    
    if (result && result[0] && result[0].result) {
      indicator.className = 'indicator connected';
      text.textContent = 'Available';
    } else {
      indicator.className = 'indicator disconnected';
      text.textContent = 'Not available';
    }
  } catch (error) {
    indicator.className = 'indicator disconnected';
    text.textContent = 'Check failed';
  }
}

function updateBridgeStatus(connected) {
  const statusEl = document.getElementById('bridge-status');
  const indicator = statusEl.querySelector('.indicator');
  const text = statusEl.querySelector('.text');
  
  if (connected) {
    indicator.className = 'indicator connected';
    text.textContent = 'Connected';
  } else {
    indicator.className = 'indicator disconnected';
    text.textContent = 'Disconnected';
  }
}

