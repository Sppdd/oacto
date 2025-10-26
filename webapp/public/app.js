// Chrome AI Automation Platform - Main Application
// Enhanced with anime.js animations and enterprise features

let ws = null;
let isAiAvailable = false;
let currentView = 'dashboard';

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  initializeAnimations();
  initializeNavigation();
  initializeModals();
  checkOriginTrialTokens();
  checkAIAvailability();
  connectToServer();
  setupQuickActions();
  loadWorkflows();
  updateDashboardStats();
});

// ===========================
// Animations with anime.js
// ===========================

function initializeAnimations() {
  // Animate sidebar on load
  anime({
    targets: '.sidebar',
    translateX: [-240, 0],
    opacity: [0, 1],
    duration: 600,
    easing: 'easeOutExpo'
  });

  // Animate nav items
  anime({
    targets: '.nav-item',
    translateX: [-20, 0],
    opacity: [0, 1],
    delay: anime.stagger(50, {start: 300}),
    duration: 400,
    easing: 'easeOutQuad'
  });

  // Animate status cards
  anime({
    targets: '.status-card',
    scale: [0.9, 1],
    opacity: [0, 1],
    delay: anime.stagger(100, {start: 400}),
    duration: 500,
    easing: 'easeOutExpo'
  });

  // Animate action buttons
  anime({
    targets: '.action-btn',
    scale: [0.8, 1],
    opacity: [0, 1],
    delay: anime.stagger(80, {start: 600}),
    duration: 400,
    easing: 'easeOutBack'
  });
}

function animateViewTransition(viewId) {
  const view = document.getElementById(viewId);
  
  anime({
    targets: view.querySelectorAll('.page-header, .cards-grid, .section, .guide-step'),
    translateY: [30, 0],
    opacity: [0, 1],
    delay: anime.stagger(80),
    duration: 500,
    easing: 'easeOutQuad'
  });
}

function animateCardUpdate(cardId, success = true) {
  const card = document.getElementById(cardId);
  
  anime({
    targets: card,
    scale: [1, 1.05, 1],
    duration: 400,
    easing: 'easeInOutQuad'
  });

  if (success) {
    anime({
      targets: card.querySelector('.card-icon'),
      rotate: [0, 360],
      duration: 600,
      easing: 'easeInOutQuad'
    });
  }
}

// ===========================
// Navigation
// ===========================

function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = item.dataset.view;
      switchView(viewName);
    });
  });
}

function switchView(viewName) {
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

  // Update views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`view-${viewName}`);
  targetView.classList.add('active');
  currentView = viewName;

  // Animate view transition
  animateViewTransition(`view-${viewName}`);

  // Log navigation
  addLog(`Navigated to ${viewName}`, 'info');
}

// ===========================
// Origin Trial Tokens Check
// ===========================

function checkOriginTrialTokens() {
  const tokens = window.CHROME_AI_TOKENS || {};
  const injectedTokens = document.querySelectorAll('meta[http-equiv="origin-trial"]');

  console.log('🔐 Origin Trial Tokens Status:');
  console.log(`📊 Found ${injectedTokens.length} injected tokens`);

  Object.entries(tokens).forEach(([feature, token]) => {
    const status = token && token.trim() !== '' ? '✅ Configured' : '❌ Missing';
    console.log(`   ${feature}: ${status}`);
  });

  // Log all injected tokens for debugging
  injectedTokens.forEach((meta, index) => {
    console.log(`🔑 Token ${index + 1}:`, meta.content.substring(0, 50) + '...');
  });

  // Update UI if needed
  const tokenCount = Object.values(tokens).filter(token => token && token.trim() !== '').length;
  if (tokenCount > 0) {
    addLog(`✅ Loaded ${tokenCount} origin trial tokens`, 'success');
  } else {
    addLog('⚠️ No origin trial tokens configured. Chrome AI APIs may not work.', 'warning');
  }
}

// ===========================
// Chrome AI Availability Check
// ===========================

async function checkAIAvailability() {
  const statusText = document.getElementById('ai-status-text');
  const statusMeta = document.getElementById('ai-meta');
  const pulseDot = document.getElementById('connection-pulse');
  const connectionText = document.getElementById('connection-text');

  try {
    // Check for LanguageModel in global scope
    if (!('LanguageModel' in self)) {
      statusText.textContent = 'Not Available';
      statusMeta.textContent = 'Enable in chrome://flags';
      pulseDot.classList.add('error');
      pulseDot.classList.remove('connected');
      connectionText.textContent = 'AI Not Available';
      animateCardUpdate('card-ai', false);
      addLog('❌ Chrome AI not available. Please enable flags and join the Early Preview Program.', 'error');
      return;
    }

    // Check which specific APIs are available
    const availableAPIs = [];
    const missingAPIs = [];

    // Check each API
    if ('LanguageModel' in self) availableAPIs.push('Prompt AI');
    else missingAPIs.push('Prompt AI');

    if ('Writer' in self) {
      try {
        const writerAvailability = await Writer.availability();
        if (writerAvailability === 'readily') {
          availableAPIs.push('Writer');
        } else {
          missingAPIs.push(`Writer (${writerAvailability})`);
        }
      } catch (error) {
        missingAPIs.push('Writer (error)');
      }
    } else {
      missingAPIs.push('Writer');
    }

    if ('Summarizer' in self) availableAPIs.push('Summarizer');
    else missingAPIs.push('Summarizer');

    if ('Translator' in self) availableAPIs.push('Translator');
    else missingAPIs.push('Translator');

    if ('Rewriter' in self) availableAPIs.push('Rewriter');
    else missingAPIs.push('Rewriter');

    if ('Proofreader' in self) availableAPIs.push('Proofreader');
    else missingAPIs.push('Proofreader');

    if ('LanguageDetector' in self) availableAPIs.push('Language Detector');
    else missingAPIs.push('Language Detector');

    // Test if we can create a session
    try {
      const testSession = await LanguageModel.create({
        temperature: 0.8,
        topK: 3,
        outputLanguage: 'en'
      });
      
      // If we get here, AI is ready
      statusText.textContent = 'Ready ✓';
      statusMeta.textContent = `${availableAPIs.length}/7 APIs available`;
      isAiAvailable = true;
      animateCardUpdate('card-ai', true);
      addLog('✅ Chrome AI is available and ready', 'success');
      addLog(`📊 Available APIs: ${availableAPIs.join(', ')}`, 'info');

      if (missingAPIs.length > 0) {
        addLog(`⚠️ Missing APIs: ${missingAPIs.join(', ')} (may need origin trial tokens)`, 'warning');
      }

      // Clean up test session
      testSession.destroy();
      
    } catch (createError) {
      // Check if it's a download issue
      if (createError.message.includes('download') || createError.message.includes('model')) {
        statusText.textContent = 'Downloading...';
        statusMeta.textContent = 'Model downloading (~1.5GB)';
        addLog('⏳ AI model is downloading. Please wait...', 'warning');

        // Check again after download
        setTimeout(checkAIAvailability, 5000);
      } else {
        // Update status with more specific error info
        statusText.textContent = 'Limited';
        statusMeta.textContent = `${availableAPIs.length}/7 APIs available`;
        pulseDot.classList.add('warning');
        pulseDot.classList.remove('connected');
        connectionText.textContent = 'AI Limited';

        addLog(`⚠️ Chrome AI partially available: ${availableAPIs.join(', ')}`, 'warning');
        if (missingAPIs.length > 0) {
          addLog(`❌ Missing APIs: ${missingAPIs.join(', ')} - Check origin trial tokens`, 'error');
        }
        addLog(`💡 Error details: ${createError.message}`, 'info');
      }
    }
  } catch (error) {
    statusText.textContent = 'Error';
    statusMeta.textContent = error.message;
    pulseDot.classList.add('error');
    pulseDot.classList.remove('connected');
    addLog(`❌ Error checking AI: ${error.message}`, 'error');
    console.error('AI availability check failed:', error);
  }
}

// ===========================
// WebSocket Connection
// ===========================

function connectToServer() {
  const statusText = document.getElementById('server-status-text');
  const pulseDot = document.getElementById('connection-pulse');
  const connectionText = document.getElementById('connection-text');

  try {
    ws = new WebSocket('ws://localhost:3334');

    ws.onopen = () => {
      statusText.textContent = 'Connected ✓';
      pulseDot.classList.add('connected');
      pulseDot.classList.remove('error');
      connectionText.textContent = 'Connected';
      animateCardUpdate('card-server', true);
      addLog('✅ Connected to server', 'success');
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      addLog(`📨 Request: ${message.action}`, 'info');
      
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
      statusText.textContent = 'Disconnected';
      pulseDot.classList.add('error');
      pulseDot.classList.remove('connected');
      connectionText.textContent = 'Reconnecting...';
      animateCardUpdate('card-server', false);
      addLog('❌ Disconnected from server. Reconnecting...', 'error');
      
      // Reconnect after 5 seconds
      setTimeout(connectToServer, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    statusText.textContent = 'Connection failed';
    pulseDot.classList.add('error');
    connectionText.textContent = 'Connection Failed';
    addLog(`❌ Failed to connect: ${error.message}`, 'error');
  }
}

// ===========================
// AI Request Execution
// ===========================

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
  const { systemPrompt, userPrompt, temperature, outputLanguage } = params;

  if (!isAiAvailable) {
    throw new Error('Chrome AI not available. Enable in chrome://flags');
  }

  const sessionConfig = {
    temperature: temperature || 0.8,
    topK: 3,
    outputLanguage: outputLanguage || 'en'
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
    session.destroy();
  }
}

// Chrome Writer API implementation
async function executeWriter(params) {
  if (!('Writer' in self)) {
    throw new Error('Chrome Writer API not available');
  }

  const { prompt, tone, format, length } = params;

  try {
    // Check Writer API availability first
    const availability = await Writer.availability();
    console.log('Writer API availability:', availability);

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
      return result;
    } finally {
      writer.destroy();
    }
  } catch (error) {
    if (error.message.includes('user gesture') || error.message.includes('Requires a user gesture')) {
      throw new Error('Writer API requires user interaction. Please use the webapp interface instead of direct API calls.');
    }
    throw error;
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
    
    if (results && results.length > 0) {
      return results[0].language;
    }
    
    throw new Error('No language detected');
  } finally {
    detector.destroy();
  }
}

// ===========================
// Quick Actions
// ===========================

function setupQuickActions() {
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      handleQuickAction(action);
    });
  });
}

function handleQuickAction(action) {
  switch (action) {
    case 'test-ai':
      openTestModal();
      break;
    case 'view-workflows':
      switchView('workflows');
      break;
    case 'open-n8n':
      window.open('http://localhost:5678', '_blank');
      break;
    case 'view-guide':
      switchView('guide');
      break;
  }
}

// ===========================
// Modals
// ===========================

function initializeModals() {
  // Test AI Modal
  const testModal = document.getElementById('test-modal');
  const closeBtn = document.getElementById('close-test-modal');
  const cancelBtn = document.getElementById('cancel-test');
  const runBtn = document.getElementById('run-test');
  const tempSlider = document.getElementById('test-temperature');
  const tempValue = document.getElementById('temp-value');

  closeBtn.addEventListener('click', () => closeTestModal());
  cancelBtn.addEventListener('click', () => closeTestModal());
  runBtn.addEventListener('click', () => runAITest());

  tempSlider.addEventListener('input', (e) => {
    tempValue.textContent = e.target.value;
  });

  // Open n8n external
  const openN8nBtn = document.getElementById('open-n8n-external');
  if (openN8nBtn) {
    openN8nBtn.addEventListener('click', () => {
      window.open('http://localhost:5678', '_blank');
    });
  }
}

function openTestModal() {
  const modal = document.getElementById('test-modal');
  modal.classList.add('active');
  document.getElementById('test-user-prompt').focus();
}

function closeTestModal() {
  const modal = document.getElementById('test-modal');
  modal.classList.remove('active');
  document.getElementById('test-result').style.display = 'none';
}

async function runAITest() {
  const systemPrompt = document.getElementById('test-system-prompt').value;
  const userPrompt = document.getElementById('test-user-prompt').value;
  const temperature = parseFloat(document.getElementById('test-temperature').value);
  const resultDiv = document.getElementById('test-result');
  const runBtn = document.getElementById('run-test');

  if (!userPrompt.trim()) {
    alert('Please enter a user prompt');
    return;
  }

  runBtn.disabled = true;
  runBtn.textContent = 'Running...';
  resultDiv.style.display = 'none';

  try {
    const result = await executePromptAI({
      systemPrompt: systemPrompt || undefined,
      userPrompt,
      temperature
    });

    resultDiv.textContent = result;
    resultDiv.style.display = 'block';
    addLog('✅ AI test successful', 'success');

    anime({
      targets: resultDiv,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
      easing: 'easeOutQuad'
    });
  } catch (error) {
    resultDiv.textContent = `Error: ${error.message}`;
    resultDiv.style.display = 'block';
    addLog(`❌ AI test failed: ${error.message}`, 'error');
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = 'Run Test';
  }
}

// ===========================
// Workflows Management
// ===========================

async function loadWorkflows() {
  // This will be implemented by workflow-manager.js
  // For now, just update the count
  updateWorkflowCount(0);
}

function updateWorkflowCount(count) {
  const countEl = document.getElementById('workflow-count');
  if (countEl) {
    countEl.textContent = `${count} Active`;
  }
}

// ===========================
// Dashboard Stats
// ===========================

function updateDashboardStats() {
  // Update session count
  const sessionCount = document.getElementById('session-count');
  if (sessionCount) {
    sessionCount.textContent = '0 Active';
  }
}

// ===========================
// Activity Log
// ===========================

function addLog(message, type = 'info') {
  const logDiv = document.getElementById('activity-log');
  if (!logDiv) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `<span class="log-time">${timestamp}</span><span class="log-message">${message}</span>`;
  
  logDiv.appendChild(entry);
  
  // Animate new entry
  anime({
    targets: entry,
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 300,
    easing: 'easeOutQuad'
  });
  
  // Keep only last 50 entries
  while (logDiv.children.length > 50) {
    logDiv.removeChild(logDiv.firstChild);
  }
  
  // Scroll to bottom
  logDiv.scrollTop = logDiv.scrollHeight;
}

// ===========================
// Refresh Status
// ===========================

document.getElementById('refresh-status')?.addEventListener('click', async () => {
  addLog('🔄 Refreshing status...', 'info');
  await checkAIAvailability();
  updateDashboardStats();
  addLog('✅ Status refreshed', 'success');
});

// ===========================
// Warn before closing
// ===========================

window.addEventListener('beforeunload', (event) => {
  if (isAiAvailable) {
    event.preventDefault();
    event.returnValue = 'Closing this tab will disconnect the AI bridge. Are you sure?';
  }
});

console.log('Chrome AI Automation Platform loaded');
