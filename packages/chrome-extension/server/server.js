// Chrome AI Bridge Server
// Connects n8n (HTTP) to Chrome Extension (WebSocket)

const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const HTTP_PORT = 3333;
const WS_PORT = 3334;

app.use(cors());
app.use(express.json());

// WebSocket server for Chrome Extension connection
let extensionWs = null;
const pendingRequests = new Map();

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('✅ Chrome Extension connected');
  extensionWs = ws;

  ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    const { id } = response;

    // Resolve pending request
    if (pendingRequests.has(id)) {
      const { resolve } = pendingRequests.get(id);
      pendingRequests.delete(id);
      resolve(response);
    }
  });

  ws.on('close', () => {
    console.log('❌ Chrome Extension disconnected');
    extensionWs = null;
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper to send request to extension
async function callExtension(action, params, timeout = 30000) {
  if (!extensionWs) {
    throw new Error('Chrome extension not connected');
  }

  const id = Date.now() + Math.random();
  
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error('Request timeout'));
    }, timeout);

    pendingRequests.set(id, { 
      resolve: (response) => {
        clearTimeout(timer);
        resolve(response);
      }
    });

    extensionWs.send(JSON.stringify({ id, action, params }));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: extensionWs ? 'ok' : 'no-extension',
    message: extensionWs ? 'Chrome AI bridge ready' : 'Chrome extension not connected',
    timestamp: new Date().toISOString(),
  });
});

// Chrome Prompt AI endpoint
app.post('/api/prompt-ai', async (req, res) => {
  try {
    const { systemPrompt, userPrompt, temperature } = req.body;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: 'userPrompt is required'
      });
    }

    const response = await callExtension('promptAI', {
      systemPrompt,
      userPrompt,
      temperature: temperature || 0.8,
    });

    if (response.success) {
      res.json({
        success: true,
        result: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'AI request failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Chrome Writer API endpoint
app.post('/api/writer', async (req, res) => {
  try {
    const { prompt, tone, format, length } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required'
      });
    }

    const response = await callExtension('writer', {
      prompt,
      tone,
      format,
      length,
    });

    if (response.success) {
      res.json({
        success: true,
        result: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Writer request failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Chrome Summarizer API endpoint
app.post('/api/summarizer', async (req, res) => {
  try {
    const { text, type, format, length } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callExtension('summarizer', {
      text,
      type,
      format,
      length,
    });

    if (response.success) {
      res.json({
        success: true,
        result: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Summarizer request failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Chrome Translator API endpoint
app.post('/api/translator', async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'text and targetLanguage are required'
      });
    }

    const response = await callExtension('translator', {
      text,
      sourceLanguage,
      targetLanguage,
    });

    if (response.success) {
      res.json({
        success: true,
        result: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Translator request failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Chrome Rewriter API endpoint
app.post('/api/rewriter', async (req, res) => {
  try {
    const { text, tone, format, length } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callExtension('rewriter', {
      text,
      tone,
      format,
      length,
    });

    if (response.success) {
      res.json({
        success: true,
        result: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Rewriter request failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Chrome Proofreader API endpoint
app.post('/api/proofreader', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callExtension('proofreader', { text });

    if (response.success) {
      res.json({
        success: true,
        result: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Proofreader request failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Chrome Language Detector API endpoint
app.post('/api/language-detector', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callExtension('languageDetector', { text });

    if (response.success) {
      res.json({
        success: true,
        result: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Language detector request failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log('');
  console.log('🚀 Chrome AI Bridge Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 HTTP Server: http://localhost:${HTTP_PORT}`);
  console.log(`🔌 WebSocket:   ws://localhost:${WS_PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Waiting for Chrome extension to connect...');
  console.log('');
  console.log('Next steps:');
  console.log('1. Load Chrome extension in chrome://extensions/');
  console.log('2. Extension will auto-connect to this server');
  console.log('3. Use n8n nodes with bridge URL: http://localhost:3333');
  console.log('');
});

console.log('Starting WebSocket server on port', WS_PORT);

