// Chrome AI Web App - Client-side AI executor
// Accesses window.ai directly and communicates with server via WebSocket

let ws = null;
let isAiAvailable = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  checkAIAvailability();
  connectToServer();
  setupTestButton();
});

// Check if Chrome AI is available
async function checkAIAvailability() {
  const statusEl = document.getElementById('ai-status');
  const indicator = statusEl.querySelector('.indicator');
  const text = statusEl.querySelector('.text');
  
  try {
    // Check for LanguageModel in global scope (correct API)
    if (!('LanguageModel' in self)) {
      indicator.className = 'indicator error';
      text.textContent = 'Not Available - Enable in chrome://flags';
      addLog('❌ Chrome AI not available. Please enable flags and join the Early Preview Program.', 'error');
      return;
    }

    // Test if we can create a session
    try {
      const testSession = await LanguageModel.create({
        temperature: 0.8,
        topK: 3
      });
      
      // If we get here, AI is ready
      indicator.className = 'indicator connected';
      text.textContent = 'Ready ✓';
      isAiAvailable = true;
      document.getElementById('test-button').disabled = false;
      addLog('✅ Chrome AI is available and ready');
      
      // Clean up test session
      testSession.destroy();
      
    } catch (createError) {
      // Check if it's a download issue
      if (createError.message.includes('download') || createError.message.includes('model')) {
        indicator.className = 'indicator checking';
        text.textContent = 'Downloading model...';
        addLog('⏳ AI model is downloading. Please wait...');
        
        // Check again after download
        setTimeout(checkAIAvailability, 5000);
      } else {
        throw createError;
      }
    }
  } catch (error) {
    indicator.className = 'indicator error';
    text.textContent = 'Error checking AI';
    addLog(`❌ Error checking AI: ${error.message}`, 'error');
    console.error('AI availability check failed:', error);
  }
}

// Connect to WebSocket server
function connectToServer() {
  const statusEl = document.getElementById('server-status');
  const indicator = statusEl.querySelector('.indicator');
  const text = statusEl.querySelector('.text');

  try {
    ws = new WebSocket('ws://localhost:3334');

    ws.onopen = () => {
      indicator.className = 'indicator connected';
      text.textContent = 'Connected ✓';
      addLog('✅ Connected to server');
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      addLog(`📨 Request: ${message.action}`);
      
      try {
        const result = await executeAIRequest(message);
        
        ws.send(JSON.stringify({
          id: message.id,
          success: true,
          value: result,
        }));
        
        addLog(`✅ Response sent for ${message.action}`, 'success');
      } catch (error) {
        ws.send(JSON.stringify({
          id: message.id,
          success: false,
          error: error.message,
        }));
        
        addLog(`❌ Error in ${message.action}: ${error.message}`, 'error');
      }
    };

    ws.onclose = () => {
      indicator.className = 'indicator error';
      text.textContent = 'Disconnected';
      addLog('❌ Disconnected from server. Reconnecting...', 'error');
      
      // Reconnect after 5 seconds
      setTimeout(connectToServer, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    indicator.className = 'indicator error';
    text.textContent = 'Connection failed';
    addLog(`❌ Failed to connect: ${error.message}`, 'error');
  }
}

// Execute AI request based on action
async function executeAIRequest(message) {
  const { action, params } = message;

  switch (action) {
    case 'promptAI':
      return await executePromptAI(params);
    case 'writer':
      return await executeWriter(params);
    case 'summarizer':
      return await executeSummarizer(params);
    case 'translator':
      return await executeTranslator(params);
    case 'rewriter':
      return await executeRewriter(params);
    case 'proofreader':
      return await executeProofreader(params);
    case 'languageDetector':
      return await executeLanguageDetector(params);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

// Chrome Prompt API implementation
async function executePromptAI(params) {
  const { systemPrompt, userPrompt, temperature } = params;

  if (!isAiAvailable) {
    throw new Error('Chrome AI not available. Enable in chrome://flags');
  }

  // Create session with configuration using the correct API
  const sessionConfig = {
    temperature: temperature || 0.8,
    topK: 3
  };

  if (systemPrompt) {
    sessionConfig.initialPrompts = [{
      role: 'system',
      content: systemPrompt
    }];
  }

  const session = await LanguageModel.create(sessionConfig);
  
  try {
    const result = await session.prompt(userPrompt);
    return result;
  } finally {
    session.destroy(); // Clean up session
  }
}

// Chrome Writer API implementation
async function executeWriter(params) {
  if (!('Writer' in self)) {
    throw new Error('Chrome Writer API not available');
  }

  const { prompt, tone, format, length } = params;

  const writer = await Writer.create({
    tone: tone || 'neutral',
    format: format || 'plain-text',
    length: length || 'medium',
  });

  try {
    const result = await writer.write(prompt);
    return result;
  } finally {
    writer.destroy();
  }
}

// Chrome Summarizer API implementation
async function executeSummarizer(params) {
  if (!('Summarizer' in self)) {
    throw new Error('Chrome Summarizer API not available');
  }

  const { text, type, format, length } = params;

  const summarizer = await Summarizer.create({
    type: type || 'tl;dr',
    format: format || 'plain-text',
    length: length || 'medium',
  });

  try {
    const result = await summarizer.summarize(text);
    return result;
  } finally {
    summarizer.destroy();
  }
}

// Chrome Translator API implementation
async function executeTranslator(params) {
  if (!('Translator' in self)) {
    throw new Error('Chrome Translator API not available');
  }

  const { text, sourceLanguage, targetLanguage } = params;

  const translator = await Translator.create({
    sourceLanguage: sourceLanguage || 'en',
    targetLanguage,
  });

  try {
    const result = await translator.translate(text);
    return result;
  } finally {
    translator.destroy();
  }
}

// Chrome Rewriter API implementation
async function executeRewriter(params) {
  if (!('Rewriter' in self)) {
    throw new Error('Chrome Rewriter API not available');
  }

  const { text, tone, format, length } = params;

  const rewriter = await Rewriter.create({
    tone: tone || 'neutral',
    format: format || 'plain-text',
    length: length || 'same',
  });

  try {
    const result = await rewriter.rewrite(text);
    return result;
  } finally {
    rewriter.destroy();
  }
}

// Chrome Proofreader API implementation
async function executeProofreader(params) {
  if (!('Proofreader' in self)) {
    throw new Error('Chrome Proofreader API not available');
  }

  const { text } = params;

  const proofreader = await Proofreader.create();

  try {
    const result = await proofreader.proofread(text);
    return result;
  } finally {
    proofreader.destroy();
  }
}

// Chrome Language Detector API implementation
async function executeLanguageDetector(params) {
  if (!('LanguageDetector' in self)) {
    throw new Error('Chrome Language Detector API not available');
  }

  const { text } = params;

  const detector = await LanguageDetector.create();

  try {
    const results = await detector.detect(text);
    
    // Return top language
    if (results && results.length > 0) {
      return results[0].language;
    }
    
    throw new Error('No language detected');
  } finally {
    detector.destroy();
  }
}

// Setup test button
function setupTestButton() {
  const button = document.getElementById('test-button');
  const promptInput = document.getElementById('test-prompt');
  const resultDiv = document.getElementById('test-result');

  button.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
      alert('Please enter a test prompt');
      return;
    }

    button.disabled = true;
    button.textContent = 'Testing...';
    resultDiv.classList.add('hidden');

    try {
      const result = await executePromptAI({
        userPrompt: prompt,
        temperature: 0.8
      });

      resultDiv.textContent = result;
      resultDiv.classList.remove('hidden');
      addLog('✅ Test successful', 'success');
    } catch (error) {
      resultDiv.textContent = `Error: ${error.message}`;
      resultDiv.classList.remove('hidden');
      addLog(`❌ Test failed: ${error.message}`, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Test Prompt AI';
    }
  });
}

// Add log entry
function addLog(message, type = 'info') {
  const logDiv = document.getElementById('activity-log');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span class="timestamp">${timestamp}</span>${message}`;
  
  logDiv.appendChild(entry);
  
  // Keep only last 50 entries
  while (logDiv.children.length > 50) {
    logDiv.removeChild(logDiv.firstChild);
  }
  
  // Scroll to bottom
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Warn user before closing
window.addEventListener('beforeunload', (event) => {
  if (isAiAvailable) {
    event.preventDefault();
    event.returnValue = 'Closing this tab will disconnect the AI bridge. Are you sure?';
  }
});

console.log('Chrome AI Web App loaded');

