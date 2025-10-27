// Chrome AI Web App Server
// Serves web app UI and provides HTTP API for n8n

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const HTTP_PORT = 3333;
const WS_PORT = 3334;

app.use(cors());
app.use(express.json());

// Serve static files (web app UI)
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket server for web app communication
let webAppWs = null;
const pendingRequests = new Map();

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('✅ Web app connected');
  webAppWs = ws;

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
    console.log('❌ Web app disconnected');
    webAppWs = null;
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper to send request to web app
async function callWebApp(action, params, timeout = 30000, req = null) {
  if (!webAppWs) {
    throw new Error('Web app not connected. Please open http://localhost:3333 in Chrome');
  }

  const id = Date.now() + Math.random();

  // Extract tokens from request headers if available
  const tokens = req ? {
    promptAiToken: req.headers['x-prompt-ai-token'] || '',
    writerToken: req.headers['x-writer-token'] || '',
    summarizerToken: req.headers['x-summarizer-token'] || '',
    translatorToken: req.headers['x-translator-token'] || '',
    rewriterToken: req.headers['x-rewriter-token'] || '',
    proofreaderToken: req.headers['x-proofreader-token'] || '',
    languageDetectorToken: req.headers['x-language-detector-token'] || '',
  } : {};

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

    webAppWs.send(JSON.stringify({ id, action, params, tokens }));
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Extract tokens from headers
  const tokens = {
    promptAiToken: req.headers['x-prompt-ai-token'] || '',
    writerToken: req.headers['x-writer-token'] || '',
    summarizerToken: req.headers['x-summarizer-token'] || '',
    translatorToken: req.headers['x-translator-token'] || '',
    rewriterToken: req.headers['x-rewriter-token'] || '',
    proofreaderToken: req.headers['x-proofreader-token'] || '',
    languageDetectorToken: req.headers['x-language-detector-token'] || '',
  };

  res.json({
    status: webAppWs ? 'ok' : 'no-webapp',
    message: webAppWs ? 'Chrome AI web app ready' : 'Web app not connected. Open http://localhost:3333 in Chrome',
    timestamp: new Date().toISOString(),
    tokens: Object.keys(tokens).filter(key => tokens[key]).length + ' tokens configured',
  });
});

// Chrome Prompt AI endpoint
app.post('/api/prompt-ai', async (req, res) => {
  try {
    const { systemPrompt, userPrompt, temperature, outputLanguage, sessionId, forceNewSession } = req.body;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: 'userPrompt is required'
      });
    }

    const response = await callWebApp('promptAI', {
      systemPrompt,
      userPrompt,
      temperature: temperature || 0.8,
      outputLanguage: outputLanguage || 'en',
      sessionId,
      forceNewSession,
    }, 30000, req);

    if (response.success) {
      res.json({
        success: true,
        result: response.value.result,
        sessionId: response.value.sessionId,
        fallbackUsed: response.value.fallbackUsed || false,
        originalApi: response.value.originalApi || null,
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
    const { prompt, tone, format, length, sessionId, forceNewSession } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'prompt is required'
      });
    }

    console.log('Writer API request:', { prompt: prompt.substring(0, 50) + '...', tone, format, length });

    const response = await callWebApp('writer', {
      prompt,
      tone,
      format,
      length,
      sessionId,
      forceNewSession,
    }, 30000, req);

    if (response.success) {
      res.json({
        success: true,
        result: response.value.result,
        sessionId: response.value.sessionId,
        fallbackUsed: response.value.fallbackUsed || false,
        originalApi: response.value.originalApi || null,
      });
    } else {
      // Provide more specific error messages
      let errorMessage = response.error || 'Writer request failed';

      if (errorMessage.includes('user gesture') || errorMessage.includes('Requires a user gesture')) {
        errorMessage = 'Writer API requires user interaction. Please use the webapp interface instead of direct API calls, or try using the Prompt AI node instead.';
      } else if (errorMessage.includes('not available')) {
        errorMessage = 'Chrome Writer API is not available. Please ensure you have enabled the Writer API in chrome://flags and have a valid origin trial token.';
      } else if (errorMessage.includes('downloading') || errorMessage.includes('downloadable')) {
        errorMessage = 'Writer API model is still downloading. Please wait for the download to complete and try again.';
      }

      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  } catch (error) {
    console.error('Writer API error:', error);
    let errorMessage = error.message;

    if (errorMessage.includes('user gesture') || errorMessage.includes('Requires a user gesture')) {
      errorMessage = 'Writer API requires user interaction. Please use the webapp interface instead of direct API calls.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Chrome Summarizer API endpoint
app.post('/api/summarizer', async (req, res) => {
  try {
    const { text, type, format, length, sessionId, forceNewSession } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callWebApp('summarizer', {
      text,
      type,
      format,
      length,
      sessionId,
      forceNewSession,
    }, 30000, req);

    if (response.success) {
      res.json({
        success: true,
        result: response.value.result,
        sessionId: response.value.sessionId,
        fallbackUsed: response.value.fallbackUsed || false,
        originalApi: response.value.originalApi || null,
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
    const { text, sourceLanguage, targetLanguage, sessionId, forceNewSession } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'text and targetLanguage are required'
      });
    }

    const response = await callWebApp('translator', {
      text,
      sourceLanguage,
      targetLanguage,
      sessionId,
      forceNewSession,
    }, 30000, req);

    if (response.success) {
      res.json({
        success: true,
        result: response.value.result,
        sessionId: response.value.sessionId,
        fallbackUsed: response.value.fallbackUsed || false,
        originalApi: response.value.originalApi || null,
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
    const { text, tone, format, length, sessionId, forceNewSession } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callWebApp('rewriter', {
      text,
      tone,
      format,
      length,
      sessionId,
      forceNewSession,
    }, 30000, req);

    if (response.success) {
      res.json({
        success: true,
        result: response.value.result,
        sessionId: response.value.sessionId,
        fallbackUsed: response.value.fallbackUsed || false,
        originalApi: response.value.originalApi || null,
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
    const { text, sessionId, forceNewSession } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callWebApp('proofreader', { text, sessionId, forceNewSession }, 30000, req);

    if (response.success) {
      res.json({
        success: true,
        result: response.value.result,
        sessionId: response.value.sessionId,
        fallbackUsed: response.value.fallbackUsed || false,
        originalApi: response.value.originalApi || null,
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
    const { text, sessionId, forceNewSession } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text is required'
      });
    }

    const response = await callWebApp('languageDetector', { text, sessionId, forceNewSession }, 30000, req);

    if (response.success) {
      res.json({
        success: true,
        result: response.value.result,
        sessionId: response.value.sessionId,
        fallbackUsed: response.value.fallbackUsed || false,
        originalApi: response.value.originalApi || null,
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

// ===========================
// Workflow Management API
// ===========================

// Get all workflows from n8n
app.get('/api/workflows', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // First try to get workflows from n8n API
    try {
      // Try without API key first (some n8n instances allow this)
      let n8nResponse = await fetch('http://localhost:5678/api/v1/workflows');
      
      // If that fails, try with API key from environment
      if (!n8nResponse.ok) {
        const apiKey = process.env.N8N_API_KEY;
        
        if (apiKey) {
          console.log('Using n8n API key from environment');
          n8nResponse = await fetch('http://localhost:5678/api/v1/workflows', {
            headers: {
              'X-N8N-API-KEY': apiKey
            }
          });
        }
      }
      
      if (n8nResponse.ok) {
        const n8nData = await n8nResponse.json();
        const workflows = (n8nData.data || n8nData)
          .map(w => {
            const webhookUrl = extractWebhookUrl(w);
            const hasTrigger = w.nodes?.some(node => 
              node.type === 'n8n-nodes-base.webhook' ||
              node.type === '@n8n/n8n-nodes-langchain.chatTrigger' ||
              node.type === 'n8n-nodes-base.scheduleTrigger'
            );
            
            return {
              id: w.id,
              name: w.name,
              active: w.active,
              nodes: w.nodes?.length || 0,
              webhookUrl: webhookUrl,
              hasTrigger: hasTrigger,
              lastRun: w.updatedAt,
              type: 'n8n'
            };
          })
          .filter(w => w.hasTrigger); // Only show workflows with triggers
        
        return res.json({
          success: true,
          workflows,
          source: 'n8n'
        });
      }
    } catch (n8nError) {
      console.log('n8n API not accessible:', n8nError.message);
    }
    
    // If n8n API fails, try to get workflows from n8n database directly
    try {
      const workflows = await getWorkflowsFromN8nDatabase();
      if (workflows.length > 0) {
        return res.json({
          success: true,
          workflows,
          source: 'n8n-database'
        });
      }
    } catch (dbError) {
      console.log('n8n database access failed:', dbError.message);
    }
    
    // Last resort: return empty array instead of examples
    res.json({
      success: true,
      workflows: [],
      source: 'none',
      message: 'No workflows found. Please check n8n API configuration.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Helper function to get workflows from n8n database
async function getWorkflowsFromN8nDatabase() {
  // This is a fallback method - in practice, you'd need to access n8n's database
  // For now, we'll return empty array
  return [];
}

// Helper function to extract webhook URL from n8n workflow
function extractWebhookUrl(workflow) {
  if (!workflow.nodes) return null;
  
  // Check for standard webhook nodes
  const webhookNode = workflow.nodes.find(
    node => node.type === 'n8n-nodes-base.webhook'
  );
  
  if (webhookNode && webhookNode.parameters?.path) {
    return `http://localhost:5678/webhook/${webhookNode.parameters.path}`;
  }
  
  // Check for chat trigger nodes (they have webhookId)
  const chatTriggerNode = workflow.nodes.find(
    node => node.type === '@n8n/n8n-nodes-langchain.chatTrigger'
  );
  
  if (chatTriggerNode && chatTriggerNode.webhookId) {
    return `http://localhost:5678/webhook-test/${chatTriggerNode.webhookId}`;
  }
  
  return null;
}

// Helper function to execute workflow via n8n API
async function executeWorkflowViaN8nAPI(workflowId, input) {
  const apiKey = process.env.N8N_API_KEY;
  if (!apiKey) {
    throw new Error('N8N_API_KEY not configured');
  }

  // Method 1: Try to execute via webhook-test endpoint (for chat triggers)
  try {
    console.log('Trying webhook-test execution for workflow:', workflowId);
    
    // First, get the workflow to find the webhook URL
    const workflowResponse = await fetch(`http://localhost:5678/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': apiKey
      }
    });

    if (workflowResponse.ok) {
      const workflow = await workflowResponse.json();
      
      // Find chat trigger node
      const chatTriggerNode = workflow.nodes?.find(
        node => node.type === '@n8n/n8n-nodes-langchain.chatTrigger'
      );
      
      if (chatTriggerNode && chatTriggerNode.webhookId) {
        const webhookUrl = `http://localhost:5678/webhook-test/${chatTriggerNode.webhookId}`;
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatInput: input,
            input: input,
            text: input
          })
        });

        if (webhookResponse.ok) {
          const result = await webhookResponse.json();
          return {
            success: true,
            result: result,
            method: 'webhook-test',
            executionId: result.executionId || 'unknown'
          };
        } else {
          const errorText = await webhookResponse.text();
          if (errorText.includes('not registered') && errorText.includes('test mode')) {
            throw new Error('Webhook is in test mode. Please activate the workflow in n8n UI first.');
          }
          throw new Error(`Webhook execution failed: ${webhookResponse.status}`);
        }
      }
    }
  } catch (webhookError) {
    console.log('Webhook-test execution failed:', webhookError.message);
  }

  // Method 2: Try to execute via regular webhook endpoint
  try {
    console.log('Trying regular webhook execution for workflow:', workflowId);
    
    const workflowResponse = await fetch(`http://localhost:5678/api/v1/workflows/${workflowId}`, {
      headers: {
        'X-N8N-API-KEY': apiKey
      }
    });

    if (workflowResponse.ok) {
      const workflow = await workflowResponse.json();
      
      // Find webhook node
      const webhookNode = workflow.nodes?.find(
        node => node.type === 'n8n-nodes-base.webhook'
      );
      
      if (webhookNode && webhookNode.parameters?.path) {
        const webhookUrl = `http://localhost:5678/webhook/${webhookNode.parameters.path}`;
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatInput: input,
            input: input,
            text: input
          })
        });

        if (webhookResponse.ok) {
          const result = await webhookResponse.json();
          return {
            success: true,
            result: result,
            method: 'webhook',
            executionId: result.executionId || 'unknown'
          };
        }
      }
    }
  } catch (webhookError) {
    console.log('Regular webhook execution failed:', webhookError.message);
  }

  // Method 3: Try to trigger workflow execution via executions endpoint
  try {
    console.log('Trying execution trigger for workflow:', workflowId);
    
    // This is a workaround - we'll create a manual execution
    // Note: This might not work for all workflow types
    const executionResponse = await fetch(`http://localhost:5678/api/v1/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey
      },
      body: JSON.stringify({
        data: {
          chatInput: input,
          input: input,
          text: input
        }
      })
    });

    if (executionResponse.ok) {
      const result = await executionResponse.json();
      return {
        success: true,
        result: result,
        method: 'api-execute',
        executionId: result.executionId || 'unknown'
      };
    }
  } catch (apiError) {
    console.log('API execution failed:', apiError.message);
  }

  throw new Error('All n8n execution methods failed');
}

// Helper function to activate workflow and execute it
async function activateAndExecuteWorkflow(workflowId, input) {
  const apiKey = process.env.N8N_API_KEY;
  if (!apiKey) {
    throw new Error('N8N_API_KEY not configured');
  }

  try {
    // First, try to activate the workflow
    console.log('Attempting to activate workflow:', workflowId);
    const activateResponse = await fetch(`http://localhost:5678/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': apiKey
      }
    });

    if (activateResponse.ok) {
      console.log('Workflow activated successfully');
      
      // Wait a moment for activation to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Now try to execute the workflow
      return await executeWorkflowViaN8nAPI(workflowId, input);
    } else {
      console.log('Failed to activate workflow:', activateResponse.status);
    }
  } catch (activateError) {
    console.log('Activation failed:', activateError.message);
  }

  // If activation fails, try direct execution
  return await executeWorkflowViaN8nAPI(workflowId, input);
}

// Get workflow by ID
app.get('/api/workflows/:id', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const workflowFile = path.join(__dirname, '..', 'examples', `${req.params.id}.json`);
    const content = await fs.readFile(workflowFile, 'utf-8');
    const workflow = JSON.parse(content);

    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Workflow not found',
    });
  }
});

// Execute workflow via webhook
app.post('/api/execute-workflow', async (req, res) => {
  try {
    const { workflowId, input, options = {} } = req.body;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'workflowId is required'
      });
    }

    // METHOD 1: Try n8n API execution (primary method)
    try {
      console.log('Executing workflow via n8n API:', workflowId);
      const result = await executeWorkflowViaN8nAPI(workflowId, input);
      
      return res.json({
        success: true,
        result: result.result,
        workflowId,
        timestamp: new Date().toISOString(),
        method: result.method,
        executionId: result.executionId
      });
    } catch (apiError) {
      console.log('n8n API execution failed:', apiError.message);
      
      // If it's a test mode error, try to activate and execute
      if (apiError.message.includes('test mode')) {
        try {
          console.log('Attempting to activate and execute workflow:', workflowId);
          const result = await activateAndExecuteWorkflow(workflowId, input);
          
          return res.json({
            success: true,
            result: result.result,
            workflowId,
            timestamp: new Date().toISOString(),
            method: result.method + '-activated',
            executionId: result.executionId,
            note: 'Workflow was activated automatically'
          });
        } catch (activateError) {
          return res.json({
            success: false,
            error: apiError.message,
            workflowId,
            method: 'n8n-api-test-mode',
            hint: 'Go to n8n UI, open the workflow, and click "Execute Workflow" to activate the webhook.'
          });
        }
      }
    }

    // METHOD 2: Try webhook execution (fallback)
    if (options.webhookUrl) {
      try {
        console.log('Executing workflow via webhook:', options.webhookUrl);
        const webhookResponse = await fetch(options.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chatInput: input,
            input: input,
            text: input
          })
        });

        if (webhookResponse.ok) {
          const webhookResult = await webhookResponse.json();
          return res.json({
            success: true,
            result: webhookResult,
            workflowId,
            timestamp: new Date().toISOString(),
            method: 'webhook'
          });
        } else {
          const errorText = await webhookResponse.text();
          console.log('Webhook execution failed:', webhookResponse.status, errorText);
          
          // Check if it's a test mode error
          if (errorText.includes('not registered') && errorText.includes('test mode')) {
            return res.json({
              success: false,
              error: 'Webhook is in test mode. Please activate the workflow in n8n first.',
              workflowId,
              method: 'webhook-test-mode',
              hint: 'Go to n8n UI, open the workflow, and activate it to enable webhook execution.'
            });
          }
        }
      } catch (webhookError) {
        console.log('Webhook execution failed:', webhookError.message);
      }
    }

    // METHOD 3: Fallback to Chrome AI (last resort)
    if (options.useChromeAI !== false) {
      try {
        const result = await callWebApp('promptAI', {
          systemPrompt: options.systemPrompt || 'You are a helpful AI assistant.',
          userPrompt: input,
          temperature: options.temperature || 0.8,
          outputLanguage: options.outputLanguage || 'en'
        });

        if (result.success) {
          return res.json({
            success: true,
            result: result.value,
            workflowId,
            timestamp: new Date().toISOString(),
            method: 'chrome-ai-fallback',
            note: 'Workflow execution failed, used Chrome AI instead'
          });
        }
      } catch (chromeError) {
        console.log('Chrome AI fallback failed:', chromeError.message);
      }
    }

    res.status(500).json({
      success: false,
      error: 'All execution methods failed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===========================
// Session Management API
// ===========================

// Get session status
app.get('/api/sessions/status', async (req, res) => {
  try {
    const response = await callWebApp('getSessionStatus', {});
    
    if (response.success) {
      res.json({
        success: true,
        sessions: response.value,
      });
    } else {
      res.status(500).json({
        success: false,
        error: response.error || 'Failed to get session status',
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
  console.log('🚀 Chrome AI Web App Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 HTTP Server: http://localhost:${HTTP_PORT}`);
  console.log(`🔌 WebSocket:   ws://localhost:${WS_PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🌐 Open in Chrome: http://localhost:3333');
  console.log('');
  console.log('Next steps:');
  console.log('1. Open http://localhost:3333 in Chrome');
  console.log('2. Keep this tab open');
  console.log('3. Use n8n nodes with bridge URL: http://localhost:3333');
  console.log('');
});

console.log('Starting WebSocket server on port', WS_PORT);

