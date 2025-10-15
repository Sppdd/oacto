// Content Script - Executes Chrome AI APIs in page context

console.log('Chrome AI Bridge content script loaded');

// Listen for AI requests from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, params } = message;
  
  console.log('Executing AI action:', action);
  
  // Handle different AI API calls
  switch (action) {
    case 'promptAI':
      executePromptAI(params).then(sendResponse);
      break;
    case 'writer':
      executeWriter(params).then(sendResponse);
      break;
    case 'summarizer':
      executeSummarizer(params).then(sendResponse);
      break;
    case 'translator':
      executeTranslator(params).then(sendResponse);
      break;
    case 'rewriter':
      executeRewriter(params).then(sendResponse);
      break;
    case 'proofreader':
      executeProofreader(params).then(sendResponse);
      break;
    case 'languageDetector':
      executeLanguageDetector(params).then(sendResponse);
      break;
    default:
      sendResponse({
        success: false,
        error: `Unknown action: ${action}`,
      });
  }
  
  return true; // Keep channel open for async response
});

// Chrome Prompt API
async function executePromptAI(params) {
  try {
    const { systemPrompt, userPrompt, temperature } = params;
    
    // Check availability
    if (typeof window.ai === 'undefined' || typeof window.ai.languageModel === 'undefined') {
      return {
        success: false,
        error: 'Chrome AI not available. Please enable it in chrome://flags',
      };
    }
    
    const capabilities = await window.ai.languageModel.capabilities();
    
    if (capabilities.available === 'no') {
      return {
        success: false,
        error: 'AI model not available. Check chrome://components/',
      };
    }
    
    // Create session
    const sessionConfig = {
      temperature: temperature || 0.8,
    };
    
    if (systemPrompt) {
      sessionConfig.systemPrompt = systemPrompt;
    }
    
    const session = await window.ai.languageModel.create(sessionConfig);
    const result = await session.prompt(userPrompt);
    
    session.destroy();
    
    return {
      success: true,
      value: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Chrome Writer API
async function executeWriter(params) {
  try {
    if (typeof window.ai === 'undefined' || typeof window.ai.writer === 'undefined') {
      return {
        success: false,
        error: 'Chrome Writer API not available',
      };
    }
    
    const { prompt, tone, format, length } = params;
    
    const writer = await window.ai.writer.create({
      tone: tone || 'neutral',
      format: format || 'plain-text',
      length: length || 'medium',
    });
    
    const result = await writer.write(prompt);
    
    return {
      success: true,
      value: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Chrome Summarizer API
async function executeSummarizer(params) {
  try {
    if (typeof window.ai === 'undefined' || typeof window.ai.summarizer === 'undefined') {
      return {
        success: false,
        error: 'Chrome Summarizer API not available',
      };
    }
    
    const { text, type, format, length } = params;
    
    const summarizer = await window.ai.summarizer.create({
      type: type || 'tl;dr',
      format: format || 'plain-text',
      length: length || 'medium',
    });
    
    const result = await summarizer.summarize(text);
    
    return {
      success: true,
      value: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Chrome Translator API
async function executeTranslator(params) {
  try {
    if (typeof window.ai === 'undefined' || typeof window.ai.translator === 'undefined') {
      return {
        success: false,
        error: 'Chrome Translator API not available',
      };
    }
    
    const { text, sourceLanguage, targetLanguage } = params;
    
    const translator = await window.ai.translator.create({
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage,
    });
    
    const result = await translator.translate(text);
    
    return {
      success: true,
      value: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Chrome Rewriter API
async function executeRewriter(params) {
  try {
    if (typeof window.ai === 'undefined' || typeof window.ai.rewriter === 'undefined') {
      return {
        success: false,
        error: 'Chrome Rewriter API not available',
      };
    }
    
    const { text, tone, format, length } = params;
    
    const rewriter = await window.ai.rewriter.create({
      tone: tone || 'neutral',
      format: format || 'plain-text',
      length: length || 'same',
    });
    
    const result = await rewriter.rewrite(text);
    
    return {
      success: true,
      value: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Chrome Proofreader API
async function executeProofreader(params) {
  try {
    if (typeof window.ai === 'undefined' || typeof window.ai.proofreader === 'undefined') {
      return {
        success: false,
        error: 'Chrome Proofreader API not available',
      };
    }
    
    const { text } = params;
    
    const proofreader = await window.ai.proofreader.create();
    const result = await proofreader.proofread(text);
    
    return {
      success: true,
      value: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Chrome Language Detector API
async function executeLanguageDetector(params) {
  try {
    if (typeof window.ai === 'undefined' || typeof window.ai.languageDetector === 'undefined') {
      return {
        success: false,
        error: 'Chrome Language Detector API not available',
      };
    }
    
    const { text } = params;
    
    const detector = await window.ai.languageDetector.create();
    const results = await detector.detect(text);
    
    // Return top language
    const topLanguage = results[0];
    
    return {
      success: true,
      value: topLanguage.language,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

