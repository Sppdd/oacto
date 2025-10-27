// Chrome AI Bridge Server - Simple Application
let ws = null;
let isAiAvailable = false;

const sessionManager = {
  sessions: new Map(),
  
  async getSession(sessionId, sessionConfig) {
    if (sessionId && this.sessions.has(sessionId)) {
      const sessionData = this.sessions.get(sessionId);
      sessionData.lastUsed = Date.now();
      console.log(`Reusing session: ${sessionId}`);
      return sessionData.session;
    }
    
    const newSessionId = sessionId || crypto.randomUUID();
    console.log(`Creating new session: ${newSessionId}`);
    const newSession = await LanguageModel.create(sessionConfig);
    this.sessions.set(newSessionId, {
      session: newSession,
      lastUsed: Date.now(),
    });
    // Pass back the id so it can be reused
    newSession.sessionId = newSessionId;
    this.cleanup();
    return newSession;
  },

  async destroySession(sessionId) {
    if (this.sessions.has(sessionId)) {
      console.log(`Destroying session: ${sessionId}`);
      const sessionData = this.sessions.get(sessionId);
      sessionData.session.destroy();
      this.sessions.delete(sessionId);
    }
  },

  cleanup() {
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    for (const [sessionId, sessionData] of this.sessions.entries()) {
      if (now - sessionData.lastUsed > FIVE_MINUTES) {
        console.log(`Cleaning up idle session: ${sessionId}`);
        sessionData.session.destroy();
        this.sessions.delete(sessionId);
      }
    }
  }
};


// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkOriginTrialTokens();
  checkAIAvailability();
  connectToServer();
  setupEventListeners();
  addLog('System initialized');
});

// Setup event listeners
function setupEventListeners() {
  document.getElementById('test-ai-btn').addEventListener('click', openTestModal);
  document.getElementById('refresh-btn').addEventListener('click', refreshStatus);
  document.getElementById('open-n8n-btn').addEventListener('click', () => {
    window.open('http://localhost:5678', '_blank');
  });
  
  // Modal controls
  document.getElementById('close-modal').addEventListener('click', closeTestModal);
  document.getElementById('cancel-btn').addEventListener('click', closeTestModal);
  document.getElementById('run-test-btn').addEventListener('click', runAITest);
  
  // Temperature slider
  document.getElementById('temperature').addEventListener('input', (e) => {
    document.getElementById('temp-value').textContent = e.target.value;
  });

  // Listen for token updates from n8n
  window.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_TOKENS') {
      updateTokensFromN8n(event.data.tokens);
    }
  });
}

// Check origin trial tokens
function checkOriginTrialTokens() {
  const tokens = window.CHROME_AI_TOKENS || {};
  const tokenCount = Object.values(tokens).filter(token => token && token.trim() !== '').length;
  
  const statusEl = document.getElementById('token-status');
  const detailEl = document.getElementById('token-detail');
  
  if (tokenCount > 0) {
    statusEl.textContent = 'Loaded';
    statusEl.className = 'status-badge success';
    detailEl.textContent = `${tokenCount}/7 tokens configured`;
    addLog(`Loaded ${tokenCount} origin trial tokens`, 'success');
  } else {
    statusEl.textContent = 'Missing';
    statusEl.className = 'status-badge warning';
    detailEl.textContent = 'No tokens configured';
    addLog('No origin trial tokens configured', 'warning');
  }
}

// Update tokens from n8n
function updateTokensFromN8n(tokens) {
  if (tokens && Object.keys(tokens).length > 0) {
    // Map n8n credential tokens to webapp token names
    const mappedTokens = {};
    if (tokens.promptAiToken) mappedTokens['AIPromptAPIMultimodalInput'] = tokens.promptAiToken;
    if (tokens.writerToken) mappedTokens['WriterAPI'] = tokens.writerToken;
    if (tokens.summarizerToken) mappedTokens['SummarizerAPI'] = tokens.summarizerToken;
    if (tokens.translatorToken) mappedTokens['TranslatorAPI'] = tokens.translatorToken;
    if (tokens.rewriterToken) mappedTokens['RewriterAPI'] = tokens.rewriterToken;
    if (tokens.proofreaderToken) mappedTokens['ProofreaderAPI'] = tokens.proofreaderToken;
    if (tokens.languageDetectorToken) mappedTokens['LanguageDetectorAPI'] = tokens.languageDetectorToken;

    // Update the global tokens object
    window.CHROME_AI_TOKENS = { ...window.CHROME_AI_TOKENS, ...mappedTokens };

    // Clear existing tokens from DOM
    const existingTokens = document.querySelectorAll('meta[http-equiv="origin-trial"]');
    existingTokens.forEach(meta => meta.remove());

    // Inject new tokens
    if (typeof injectOriginTrialTokens === 'function') {
      injectOriginTrialTokens();
    }

    // Recheck AI availability with new tokens
    setTimeout(() => {
      checkAIAvailability();
      checkOriginTrialTokens();
      addLog(`Updated ${Object.keys(mappedTokens).length} origin trial tokens from n8n`, 'success');
    }, 1000);
  }
}

// Check Chrome AI availability
async function checkAIAvailability() {
  const statusEl = document.getElementById('ai-status');
  const detailEl = document.getElementById('ai-detail');

  try {
    // Check for LanguageModel in global scope
    if (!('LanguageModel' in self)) {
      statusEl.textContent = 'Not Available';
      statusEl.className = 'status-badge error';
      detailEl.textContent = 'Enable in chrome://flags';
      addLog('Chrome AI not available. Enable flags and join Early Preview Program.', 'error');
      return;
    }

    // Check which APIs are available
    const availableAPIs = [];
    if ('LanguageModel' in self) availableAPIs.push('Prompt AI');
    if ('Writer' in self) availableAPIs.push('Writer');
    if ('Summarizer' in self) availableAPIs.push('Summarizer');
    if ('Translator' in self) availableAPIs.push('Translator');
    if ('Rewriter' in self) availableAPIs.push('Rewriter');
    if ('Proofreader' in self) availableAPIs.push('Proofreader');
    if ('LanguageDetector' in self) availableAPIs.push('Language Detector');

    // Test if we can create a session
    try {
      const testSession = await LanguageModel.create({
        temperature: 0.8,
        topK: 3,
        outputLanguage: 'en'
      });
      
      statusEl.textContent = 'Ready';
      statusEl.className = 'status-badge success';
      detailEl.textContent = `${availableAPIs.length}/7 APIs available`;
      isAiAvailable = true;
      addLog(`Chrome AI is ready (${availableAPIs.length}/7 APIs available)`, 'success');
      
      testSession.destroy();
    } catch (createError) {
      if (createError.message.includes('download') || createError.message.includes('model')) {
        statusEl.textContent = 'Downloading';
        statusEl.className = 'status-badge warning';
        detailEl.textContent = 'AI model downloading (~1.5GB)';
        addLog('AI model is downloading. Please wait...', 'warning');
        setTimeout(checkAIAvailability, 5000);
      } else {
        statusEl.textContent = 'Limited';
        statusEl.className = 'status-badge warning';
        detailEl.textContent = `${availableAPIs.length}/7 APIs available`;
        addLog(`Chrome AI partially available: ${availableAPIs.join(', ')}`, 'warning');
      }
    }
  } catch (error) {
    statusEl.textContent = 'Error';
    statusEl.className = 'status-badge error';
    detailEl.textContent = error.message;
    addLog(`Error checking AI: ${error.message}`, 'error');
    console.error('AI availability check failed:', error);
  }
}

// Connect to WebSocket server
function connectToServer() {
  const statusEl = document.getElementById('server-status');
  const detailEl = document.getElementById('server-detail');

  try {
    ws = new WebSocket('ws://localhost:3334');

    ws.onopen = () => {
      statusEl.textContent = 'Connected';
      statusEl.className = 'status-badge success';
      detailEl.textContent = 'WebSocket: localhost:3334';
      addLog('Connected to server', 'success');
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      addLog(`Request: ${message.action}`);
      
      try {
        // Update tokens if provided in the message
        if (message.tokens) {
          updateTokensFromN8n(message.tokens);
        }

        const result = await executeAIRequest(message);

        // Handle different response formats
        let responseValue;
        if (result.result !== undefined) {
          // New format with fallback info
          responseValue = {
            result: result.result,
            sessionId: result.sessionId,
            fallbackUsed: result.fallbackUsed || false,
            originalApi: result.originalApi || null
          };
        } else {
          // Legacy format
          responseValue = result;
        }

        ws.send(JSON.stringify({
          id: message.id,
          success: true,
          value: responseValue,
        }));

        // Log fallback usage
        if (result.fallbackUsed) {
          addLog(`⚠️ Fallback used for ${message.action} (${result.originalApi})`, 'warning');
        } else {
          addLog(`Response sent for ${message.action}`, 'success');
        }
      } catch (error) {
        ws.send(JSON.stringify({
          id: message.id,
          success: false,
          error: error.message,
        }));
        addLog(`Error in ${message.action}: ${error.message}`, 'error');
      }
    };

    ws.onclose = () => {
      statusEl.textContent = 'Disconnected';
      statusEl.className = 'status-badge error';
      detailEl.textContent = 'Reconnecting...';
      addLog('Disconnected from server. Reconnecting...', 'error');
      setTimeout(connectToServer, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    statusEl.textContent = 'Failed';
    statusEl.className = 'status-badge error';
    detailEl.textContent = 'Connection failed';
    addLog(`Failed to connect: ${error.message}`, 'error');
  }
}

// Execute AI request
async function executeAIRequest(message) {
  const { action, params } = message;

  if (params.forceNewSession && params.sessionId) {
    await sessionManager.destroySession(params.sessionId);
    params.sessionId = null; 
  }

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

// Chrome Prompt AI implementation
async function executePromptAI(params) {
  const { systemPrompt, userPrompt, temperature, outputLanguage, sessionId } = params;

  if (!isAiAvailable) {
    throw new Error('Chrome AI not available. Enable in chrome://flags');
  }

  const sessionConfig = {
    temperature: temperature || 0.8,
    topK: 3,
    outputLanguage: outputLanguage || 'en'
  };

  if (systemPrompt && !sessionId) { // Only apply system prompt to new sessions
    sessionConfig.initialPrompts = [{
      role: 'system',
      content: systemPrompt
    }];
  }

  const session = await sessionManager.getSession(sessionId, sessionConfig);
  const result = await session.prompt(userPrompt);

  return { result, sessionId: session.sessionId };
}

// Chrome Writer API implementation with fallback
async function executeWriter(params) {
  const { prompt, tone, format, length, sessionId } = params;

  // Try native Writer API first
  if ('Writer' in self) {
    try {
      const availability = await Writer.availability();

      if (availability === 'unavailable') {
        throw new Error('Chrome Writer API is not available. Please enable in chrome://flags');
      }

      if (availability === 'downloading' || availability === 'downloadable') {
        throw new Error('Writer API model is still downloading. Please wait and try again.');
      }

      const writer = await Writer.create({
        tone: tone || 'neutral',
        format: format || 'plain-text',
        length: length || 'medium',
      });

      try {
        const result = await writer.write(prompt);
        return { result, sessionId, fallbackUsed: false };
      } finally {
        writer.destroy();
      }
    } catch (error) {
      if (error.message.includes('user gesture') || error.message.includes('Requires a user gesture')) {
        console.log('Writer API requires user gesture, using Prompt AI fallback');
      } else {
        console.log('Writer API failed, using Prompt AI fallback:', error.message);
      }
    }
  }

  // Fallback to Prompt AI
  console.log('Using Prompt AI as fallback for writing');
  const toneDescription = tone && tone !== 'neutral' ? ` in a ${tone} tone` : '';
  const formatDescription = format ? ` in ${format} format` : '';
  const lengthDescription = length ? ` and make it ${length} in length` : '';

  const systemPrompt = `You are a professional writer. Write the following request${toneDescription}${formatDescription}${lengthDescription}.`;

  try {
    const fallbackResult = await executePromptAI({
      systemPrompt,
      userPrompt: prompt,
      sessionId,
    });

    return {
      result: fallbackResult.result,
      sessionId: fallbackResult.sessionId,
      fallbackUsed: true,
      originalApi: 'Writer'
    };
  } catch (fallbackError) {
    throw new Error(`Both Writer API and fallback failed. Writer error: ${fallbackError.message}`);
  }
}

// Chrome Summarizer API implementation with fallback
async function executeSummarizer(params) {
  const { text, type, format, length, sessionId } = params;

  // Try native Summarizer API first
  if ('Summarizer' in self) {
    try {
      const summarizer = await Summarizer.create({
        type: type || 'tl;dr',
        format: format || 'plain-text',
        length: length || 'medium',
      });

      try {
        const result = await summarizer.summarize(text);
        return { result, sessionId, fallbackUsed: false };
      } finally {
        summarizer.destroy();
      }
    } catch (error) {
      console.log('Summarizer API failed, using Prompt AI fallback:', error.message);
    }
  }

  // Fallback to Prompt AI
  console.log('Using Prompt AI as fallback for summarization');
  const systemPrompt = `You are an expert summarizer. Create a ${length || 'medium'} ${type || 'tl;dr'} summary in ${format || 'plain-text'} format.`;

  try {
    const fallbackResult = await executePromptAI({
      systemPrompt,
      userPrompt: `Please summarize the following text:\n\n${text}`,
      sessionId,
    });

    return {
      result: fallbackResult.result,
      sessionId: fallbackResult.sessionId,
      fallbackUsed: true,
      originalApi: 'Summarizer'
    };
  } catch (fallbackError) {
    throw new Error(`Both Summarizer API and fallback failed. Summarizer error: ${fallbackError.message}`);
  }
}

// Chrome Translator API implementation with fallback
async function executeTranslator(params) {
  const { text, sourceLanguage, targetLanguage, sessionId } = params;

  // Try native Translator API first
  if ('Translator' in self) {
    try {
      const translator = await Translator.create({
        sourceLanguage: sourceLanguage || 'en',
        targetLanguage,
      });

      try {
        const result = await translator.translate(text);
        return { result, sessionId, fallbackUsed: false };
      } finally {
        translator.destroy();
      }
    } catch (error) {
      console.log('Translator API failed, using Prompt AI fallback:', error.message);
    }
  }

  // Fallback to Prompt AI
  console.log('Using Prompt AI as fallback for translation');
  const systemPrompt = `You are a professional translator. Translate the following text from ${sourceLanguage || 'English'} to ${targetLanguage}. Only provide the translated text without any explanations or additional commentary.`;

  try {
    const fallbackResult = await executePromptAI({
      systemPrompt,
      userPrompt: text,
      sessionId,
    });

    return {
      result: fallbackResult.result,
      sessionId: fallbackResult.sessionId,
      fallbackUsed: true,
      originalApi: 'Translator'
    };
  } catch (fallbackError) {
    throw new Error(`Both Translator API and fallback failed. Translator error: ${fallbackError.message}`);
  }
}

// Chrome Rewriter API implementation with fallback
async function executeRewriter(params) {
  const { text, tone, format, length, sessionId } = params;

  // Try native Rewriter API first
  if ('Rewriter' in self) {
    try {
      const rewriter = await Rewriter.create({
        tone: tone || 'neutral',
        format: format || 'plain-text',
        length: length || 'same',
      });

      try {
        const result = await rewriter.rewrite(text);
        return { result, sessionId, fallbackUsed: false };
      } finally {
        rewriter.destroy();
      }
    } catch (error) {
      console.log('Rewriter API failed, using Prompt AI fallback:', error.message);
    }
  }

  // Fallback to Prompt AI
  console.log('Using Prompt AI as fallback for rewriting');
  const toneDescription = tone ? ` in a ${tone} tone` : '';
  const lengthDescription = length && length !== 'same' ? ` and make it ${length}` : '';
  const formatDescription = format ? ` in ${format} format` : '';

  const systemPrompt = `You are a professional text rewriter. Rewrite the following text${toneDescription}${lengthDescription}${formatDescription}. Maintain the original meaning but improve clarity and style.`;

  try {
    const fallbackResult = await executePromptAI({
      systemPrompt,
      userPrompt: `Please rewrite this text:\n\n${text}`,
      sessionId,
    });

    return {
      result: fallbackResult.result,
      sessionId: fallbackResult.sessionId,
      fallbackUsed: true,
      originalApi: 'Rewriter'
    };
  } catch (fallbackError) {
    throw new Error(`Both Rewriter API and fallback failed. Rewriter error: ${fallbackError.message}`);
  }
}

// Chrome Proofreader API implementation with fallback
async function executeProofreader(params) {
  const { text, sessionId } = params;

  // Try native Proofreader API first
  if ('Proofreader' in self) {
    try {
      const proofreader = await Proofreader.create();

      try {
        const result = await proofreader.proofread(text);
        return { result, sessionId, fallbackUsed: false };
      } finally {
        proofreader.destroy();
      }
    } catch (error) {
      console.log('Proofreader API failed, using Prompt AI fallback:', error.message);
    }
  }

  // Fallback to Prompt AI
  console.log('Using Prompt AI as fallback for proofreading');
  const systemPrompt = `You are a professional proofreader and grammar expert. Review the following text and correct any grammar, spelling, punctuation, or style issues. Return only the corrected text without any explanations.`;

  try {
    const fallbackResult = await executePromptAI({
      systemPrompt,
      userPrompt: `Please proofread and correct this text:\n\n${text}`,
      sessionId,
    });

    return {
      result: fallbackResult.result,
      sessionId: fallbackResult.sessionId,
      fallbackUsed: true,
      originalApi: 'Proofreader'
    };
  } catch (fallbackError) {
    throw new Error(`Both Proofreader API and fallback failed. Proofreader error: ${fallbackError.message}`);
  }
}

// Chrome Language Detector API implementation with fallback
async function executeLanguageDetector(params) {
  const { text, sessionId } = params;

  // Try native Language Detector API first
  if ('LanguageDetector' in self) {
    try {
      const detector = await LanguageDetector.create();

      try {
        const results = await detector.detect(text);

        if (results && results.length > 0) {
          return { result: results[0].language, sessionId, fallbackUsed: false };
        }

        throw new Error('No language detected');
      } finally {
        detector.destroy();
      }
    } catch (error) {
      console.log('Language Detector API failed, using Prompt AI fallback:', error.message);
    }
  }

  // Fallback to Prompt AI
  console.log('Using Prompt AI as fallback for language detection');
  const systemPrompt = `You are a language detection expert. Analyze the following text and identify the primary language. Respond with only the language code (e.g., 'en', 'es', 'fr', 'de') without any explanations.`;

  try {
    const fallbackResult = await executePromptAI({
      systemPrompt,
      userPrompt: `What language is this text in?\n\n${text}`,
      sessionId,
    });

    return {
      result: fallbackResult.result.trim(),
      sessionId: fallbackResult.sessionId,
      fallbackUsed: true,
      originalApi: 'LanguageDetector'
    };
  } catch (fallbackError) {
    throw new Error(`Both Language Detector API and fallback failed. Language Detector error: ${fallbackError.message}`);
  }
}

// Modal functions
function openTestModal() {
  document.getElementById('test-modal').classList.add('active');
  document.getElementById('user-prompt').focus();
}

function closeTestModal() {
  document.getElementById('test-modal').classList.remove('active');
  document.getElementById('result-box').style.display = 'none';
}

async function runAITest() {
  const systemPrompt = document.getElementById('system-prompt').value;
  const userPrompt = document.getElementById('user-prompt').value;
  const temperature = parseFloat(document.getElementById('temperature').value);
  const resultBox = document.getElementById('result-box');
  const runBtn = document.getElementById('run-test-btn');

  if (!userPrompt.trim()) {
    alert('Please enter a user prompt');
    return;
  }

  runBtn.disabled = true;
  runBtn.textContent = 'Running...';
  resultBox.style.display = 'none';

  try {
    const result = await executePromptAI({
      systemPrompt: systemPrompt || undefined,
      userPrompt,
      temperature
    });

    resultBox.textContent = result;
    resultBox.style.display = 'block';
    addLog('AI test successful', 'success');
  } catch (error) {
    resultBox.textContent = `Error: ${error.message}`;
    resultBox.style.display = 'block';
    addLog(`AI test failed: ${error.message}`, 'error');
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = 'Run Test';
  }
}

// Refresh status
function refreshStatus() {
  addLog('Refreshing status...');
  checkOriginTrialTokens();
  checkAIAvailability();
  addLog('Status refreshed', 'success');
}

// Activity log
function addLog(message, type = '') {
  const logDiv = document.getElementById('activity-log');
  if (!logDiv) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span class="log-time">${timestamp}</span>${message}`;
  
  logDiv.appendChild(entry);
  
  // Keep only last 50 entries
  while (logDiv.children.length > 50) {
    logDiv.removeChild(logDiv.firstChild);
  }
  
  // Scroll to bottom
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Warn before closing
window.addEventListener('beforeunload', (event) => {
  if (isAiAvailable) {
    event.preventDefault();
    event.returnValue = 'Closing this tab will disconnect the AI bridge. Are you sure?';
  }
});

console.log('Chrome AI Bridge Server loaded');
