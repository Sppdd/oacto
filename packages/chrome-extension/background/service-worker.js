// Service Worker - Manages WebSocket connection to bridge server

let ws = null;
let reconnectInterval = 5000;
let reconnectTimer = null;

// Connect to bridge server on startup
connectToBridge();

// WebSocket connection management
function connectToBridge() {
  const bridgeUrl = 'ws://localhost:3334';
  
  console.log('Connecting to bridge server...');
  
  ws = new WebSocket(bridgeUrl);

  ws.onopen = () => {
    console.log('✅ Connected to bridge server');
    clearTimeout(reconnectTimer);
    
    // Update popup with connection status
    chrome.runtime.sendMessage({ 
      type: 'bridge-status', 
      status: 'connected' 
    }).catch(() => {});
  };

  ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    console.log('📨 Received request:', message.action);
    
    try {
      const result = await executeAiRequest(message);
      
      // Send response back to bridge
      ws.send(JSON.stringify({
        id: message.id,
        success: true,
        value: result,
      }));
    } catch (error) {
      console.error('❌ AI request failed:', error);
      
      ws.send(JSON.stringify({
        id: message.id,
        success: false,
        error: error.message,
      }));
    }
  };

  ws.onclose = () => {
    console.log('❌ Disconnected from bridge server');
    
    // Update popup
    chrome.runtime.sendMessage({ 
      type: 'bridge-status', 
      status: 'disconnected' 
    }).catch(() => {});
    
    // Attempt reconnection
    reconnectTimer = setTimeout(connectToBridge, reconnectInterval);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

// Execute AI request in active tab
async function executeAiRequest(message) {
  const { action, params } = message;
  
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab || !tab.id) {
    throw new Error('No active tab found');
  }

  // Send to content script for AI execution
  const response = await chrome.tabs.sendMessage(tab.id, {
    action,
    params,
  });

  if (!response.success) {
    throw new Error(response.error || 'AI request failed');
  }

  return response.value;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-bridge-status') {
    sendResponse({
      connected: ws && ws.readyState === WebSocket.OPEN,
    });
  }
  
  return true;
});

console.log('Chrome AI Bridge service worker loaded');

