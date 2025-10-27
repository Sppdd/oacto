# How Chrome AI × n8n Integration Works

Complete guide to understanding the system architecture and data flow.

## Table of Contents

1. [System Overview](#system-overview)
2. [Component Details](#component-details)
3. [Data Flow](#data-flow)
4. [Chrome AI Nodes](#chrome-ai-nodes)
5. [Technical Implementation](#technical-implementation)
6. [Why This Architecture](#why-this-architecture)

---

## System Overview

The Chrome AI × n8n integration connects three main components:

```
┌─────────────┐     HTTP      ┌──────────────┐    WebSocket    ┌──────────────┐
│             │───────────────→│              │─────────────────→│              │
│   n8n       │                │ Bridge       │                  │  Chrome      │
│ (Workflows) │                │ Server       │                  │  Web App     │
│             │←───────────────│ (Node.js)    │←─────────────────│  (Browser)   │
└─────────────┘     JSON       └──────────────┘      JSON        └──────┬───────┘
                                                                         │
                                                                         │ language-modal
                                                                         ↓
                                                                  ┌──────────────┐
                                                                  │   Gemini     │
                                                                  │    Nano      │
                                                                  │  (On-Device) │
                                                                  └──────────────┘
```

### Why Three Components?

1. **n8n** - Workflow automation platform (where users create workflows)
2. **Bridge Server** - Middleware to handle HTTP ↔ WebSocket translation
3. **Web App** - Only place where `window.ai` APIs are accessible

---

## Component Details

### 1. n8n Chrome AI Nodes

**Location**: `packages/n8n-nodes-chrome-ai/`

**Purpose**: Custom nodes that expose Chrome AI capabilities in n8n workflows.

**How They Work**:
1. User drags a Chrome AI node into workflow
2. Node validates inputs (prompts, parameters)
3. Node makes HTTP request to Bridge Server
4. Node receives response and passes to next node

**Key Files**:
- `nodes/ChromePromptAi/ChromePromptAi.node.ts` - Main AI node
- `credentials/ChromeAiApi.credentials.ts` - Connection credentials
- `utils/ChromeAiClient.ts` - HTTP client for Bridge Server

**Example Node Code**:
```typescript
// Simplified version of ChromePromptAi.node.ts
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  // 1. Get credentials
  const credentials = await this.getCredentials('chromeAiApi');
  
  // 2. Create HTTP client
  const client = new ChromeAiClient({
    bridgeUrl: credentials.bridgeUrl as string,
    apiKey: credentials.apiKey as string,
    tokens: credentials.tokens as any,
  });

  // 3. Get user inputs
  const userPrompt = this.getNodeParameter('userPrompt', 0) as string;
  const temperature = this.getNodeParameter('temperature', 0) as number;

  // 4. Make request to Bridge Server
  const result = await client.promptAi({
    userPrompt,
    temperature,
  });

  // 5. Return result
  return [[{ json: { result } }]];
}
```

### 2. Bridge Server

**Location**: `webapp/server.js`

**Purpose**: Middleware that translates between HTTP (n8n) and WebSocket (browser).

**Ports**:
- **3333**: HTTP server for n8n nodes
- **3334**: WebSocket server for web app

**How It Works**:
1. Receives HTTP request from n8n node
2. Generates unique request ID
3. Forwards request to web app via WebSocket
4. Waits for web app response
5. Sends HTTP response back to n8n

**Key Functions**:

```javascript
// Simplified Bridge Server logic
async function callWebApp(action, params, timeout = 30000, req = null) {
  // Extract tokens from headers
  const tokens = {
    promptAiToken: req.headers['x-prompt-ai-token'],
    writerToken: req.headers['x-writer-token'],
    // ... other tokens
  };

  // Generate unique ID
  const id = Date.now() + Math.random();
  
  // Create promise that waits for response
  return new Promise((resolve, reject) => {
    // Set timeout
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error('Request timeout'));
    }, timeout);

    // Store promise resolver
    pendingRequests.set(id, { resolve, timer });

    // Send to web app via WebSocket
    webAppWs.send(JSON.stringify({ 
      id, 
      action, 
      params,
      tokens // Send tokens to web app
    }));
  });
}
```

**Endpoints**:
- `GET /api/health` - Check server status
- `POST /api/prompt-ai` - Prompt AI requests
- `POST /api/writer` - Writer API requests
- `POST /api/summarizer` - Summarizer requests
- `POST /api/translator` - Translator requests
- `POST /api/rewriter` - Rewriter requests
- `POST /api/proofreader` - Proofreader requests
- `POST /api/language-detector` - Language detection

### 3. Chrome Web App

**Location**: `webapp/public/`

**Purpose**: Browser-side application that directly accesses `window.ai` APIs.

**Why Browser?**:
- `window.ai` is only available in browser contexts
- Cannot be accessed from Node.js or service workers
- Must be a visible web page (not hidden iframe)

**How It Works**:
1. Connects to Bridge Server via WebSocket
2. Receives AI requests from Bridge Server
3. Calls appropriate Chrome AI API (`window.ai.*`)
4. Sends result back to Bridge Server

**Key Code**:

```javascript
// Simplified Web App logic
ws.onmessage = async (event) => {
  const message = JSON.parse(event.data);
  
  // Update tokens if provided
  if (message.tokens) {
    updateTokensFromN8n(message.tokens);
  }

  try {
    // Execute AI request
    const result = await executeAIRequest(message);
    
    // Send success response
    ws.send(JSON.stringify({
      id: message.id,
      success: true,
      value: result,
    }));
  } catch (error) {
    // Send error response
    ws.send(JSON.stringify({
      id: message.id,
      success: false,
      error: error.message,
    }));
  }
};

// Execute AI request
async function executeAIRequest(message) {
  switch (message.action) {
    case 'promptAI':
      return await executePromptAI(message.params);
    case 'writer':
      return await executeWriter(message.params);
    // ... other actions
  }
}

// Execute Prompt AI
async function executePromptAI(params) {
  const { userPrompt, temperature } = params;
  
  // Create AI session using Chrome's built-in API
  const session = await LanguageModel.create({
    temperature: temperature || 0.8,
    topK: 3,
  });
  
  // Generate response
  const result = await session.prompt(userPrompt);
  
  // Clean up
  session.destroy();
  
  return result;
}
```

---

## Data Flow

### Complete Request Flow

Let's trace a request from start to finish:

#### Step 1: User Creates Workflow in n8n

```
User in n8n:
- Adds "Chrome Prompt AI" node
- Sets prompt: "Write a haiku about automation"
- Sets temperature: 0.8
- Saves workflow
- Clicks "Execute"
```

#### Step 2: n8n Node Executes

```typescript
// In ChromePromptAi.node.ts
const client = new ChromeAiClient({
  bridgeUrl: 'http://localhost:3333',
});

const result = await client.promptAi({
  userPrompt: 'Write a haiku about automation',
  temperature: 0.8,
});
```

#### Step 3: HTTP Request to Bridge Server

```http
POST http://localhost:3333/api/prompt-ai
Content-Type: application/json

{
  "userPrompt": "Write a haiku about automation",
  "temperature": 0.8
}
```

#### Step 4: Bridge Server Processes Request

```javascript
// In server.js
app.post('/api/prompt-ai', async (req, res) => {
  const { userPrompt, temperature } = req.body;
  
  // Forward to web app
  const response = await callWebApp('promptAI', {
    userPrompt,
    temperature,
  }, 30000, req);
  
  // Send response back to n8n
  res.json({ success: true, result: response });
});
```

#### Step 5: WebSocket Message to Web App

```javascript
// Bridge Server sends via WebSocket
{
  "id": 1730000000.123,
  "action": "promptAI",
  "params": {
    "userPrompt": "Write a haiku about automation",
    "temperature": 0.8
  },
  "tokens": {
    "promptAiToken": "AoXwZGsUZ..."
  }
}
```

#### Step 6: Web App Executes AI Request

```javascript
// In app.js
ws.onmessage = async (event) => {
  const message = JSON.parse(event.data);
  
  // Call Chrome AI
  const session = await LanguageModel.create({
    temperature: 0.8,
    topK: 3,
  });
  
  const result = await session.prompt(
    "Write a haiku about automation"
  );
  
  session.destroy();
  
  // Send response back
  ws.send(JSON.stringify({
    id: 1730000000.123,
    success: true,
    value: result,
  }));
};
```

#### Step 7: Chrome AI (Gemini Nano) Processes

```
Gemini Nano (on-device):
- Receives prompt
- Generates response
- Returns: "Scripts running free / Tasks complete while I relax / Automation bliss"
```

#### Step 8: Response Returns Through Chain

```
Web App → WebSocket → Bridge Server → HTTP → n8n Node → User
```

**Final Result in n8n**:
```json
{
  "result": "Scripts running free / Tasks complete while I relax / Automation bliss"
}
```

---

## Chrome AI Nodes

### How Nodes Are Implemented

Each Chrome AI node follows this pattern:

```typescript
export class ChromePromptAi implements INodeType {
  // Node metadata
  description: INodeTypeDescription = {
    displayName: 'Chrome Prompt AI',
    name: 'chromePromptAi',
    icon: 'file:chromeai.svg',
    group: ['transform'],
    version: 1,
    description: 'Use Chrome built-in AI',
    defaults: {
      name: 'Chrome Prompt AI',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{
      name: 'chromeAiApi',
      required: true,
    }],
    properties: [
      // Input fields...
    ],
  };

  // Execution logic
  async execute(this: IExecuteFunctions) {
    // 1. Get credentials
    const credentials = await this.getCredentials('chromeAiApi');
    
    // 2. Create client
    const client = new ChromeAiClient({
      bridgeUrl: credentials.bridgeUrl,
      tokens: credentials.tokens,
    });
    
    // 3. Get inputs
    const inputs = this.getInputData();
    
    // 4. Process each input
    const results = [];
    for (let i = 0; i < inputs.length; i++) {
      const userPrompt = this.getNodeParameter('userPrompt', i);
      
      // 5. Make request
      const result = await client.promptAi({ userPrompt });
      
      // 6. Format output
      results.push({ json: { result } });
    }
    
    // 7. Return results
    return [results];
  }
}
```

### Node Communication

```
┌────────────────────────────────────────────────────────────┐
│                        n8n Process                         │
│                                                            │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────┐  │
│  │   Trigger    │────→│  Chrome AI   │────→│  Output  │  │
│  │   (Start)    │     │     Node     │     │   Node   │  │
│  └──────────────┘     └──────┬───────┘     └──────────┘  │
│                              │                             │
└──────────────────────────────┼─────────────────────────────┘
                               │ HTTP Request
                               ↓
                        ┌──────────────┐
                        │    Bridge    │
                        │    Server    │
                        └──────┬───────┘
                               │ WebSocket
                               ↓
                        ┌──────────────┐
                        │   Web App    │
                        └──────┬───────┘
                               │ window.ai
                               ↓
                        ┌──────────────┐
                        │ Gemini Nano  │
                        └──────────────┘
```

---

## Technical Implementation

### Origin Trial Tokens

Chrome AI APIs require origin trial tokens to work:

```javascript
// tokens.js - Configures available APIs
window.CHROME_AI_TOKENS = {
  'AIPromptAPIMultimodalInput': 'AoXwZGsUZ...',
  'WriterAPI': 'ArpNhGWLf...',
  // ... other tokens
};

// Inject tokens into page
function injectOriginTrialTokens() {
  Object.entries(window.CHROME_AI_TOKENS).forEach(([feature, token]) => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'origin-trial';
    meta.content = token;
    document.head.appendChild(meta);
  });
}
```

### Token Flow from n8n to Web App

```
┌─────────────────────────────────────────────────────┐
│ 1. User configures tokens in n8n credentials       │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│ 2. n8n node includes tokens in HTTP headers        │
│    X-Prompt-AI-Token: AoXwZGsUZ...                  │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│ 3. Bridge Server extracts tokens from headers      │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│ 4. Bridge Server includes tokens in WebSocket msg  │
│    { action: 'promptAI', tokens: {...} }            │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│ 5. Web App injects tokens into DOM                 │
│    <meta http-equiv="origin-trial" content="...">   │
└─────────────────────────────────────────────────────┘
```

### Session Management

The system uses a request-response pattern with unique IDs:

```javascript
// Bridge Server
const pendingRequests = new Map();

function callWebApp(action, params) {
  const id = Date.now() + Math.random();
  
  return new Promise((resolve, reject) => {
    // Store resolver
    pendingRequests.set(id, { resolve, reject });
    
    // Send request
    ws.send(JSON.stringify({ id, action, params }));
  });
}

// When response arrives
ws.on('message', (data) => {
  const { id, success, value, error } = JSON.parse(data);
  
  const pending = pendingRequests.get(id);
  if (pending) {
    if (success) {
      pending.resolve(value);
    } else {
      pending.reject(new Error(error));
    }
    pendingRequests.delete(id);
  }
});
```

---

## Why This Architecture?

### Why Not Direct n8n → Chrome?

**Problem**: `window.ai` only exists in browser contexts.

```javascript
// This doesn't work in Node.js:
const result = await window.ai.languageModel.create();
// Error: window is not defined
```

### Why Not Chrome Extension → n8n?

**Problem**: Chrome extensions (service workers) also can't access `window.ai`.

```javascript
// This doesn't work in service workers:
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const result = await window.ai.languageModel.create();
  // Error: window.ai is not defined in service workers
});
```

### Why Web App?

**Solution**: Only web pages have access to `window.ai`.

```javascript
// This works in web pages:
async function test() {
  const session = await window.ai.languageModel.create();
  return await session.prompt("Hello");
}
```

### Why WebSocket?

**Why not keep polling?**
- WebSocket provides bi-directional, real-time communication
- Lower latency than HTTP polling
- Persistent connection reduces overhead

**Why not HTTP directly to web app?**
- Web apps can't create HTTP servers
- Security restrictions prevent cross-origin requests
- WebSocket is the standard for browser-server communication

---

## Summary

The Chrome AI × n8n integration uses a **three-tier architecture**:

1. **n8n** - User interface and workflow engine
2. **Bridge Server** - Protocol translator (HTTP ↔ WebSocket)
3. **Web App** - Chrome AI API access point

This architecture exists because:
- `window.ai` only works in web pages
- n8n nodes use HTTP
- Bridge Server translates between protocols

**Data flows**: n8n → HTTP → Bridge Server → WebSocket → Web App → Chrome AI → Response back

**Key insight**: The web app **must** be open in a Chrome tab because that's the only place where Chrome's `window.ai` APIs are accessible.

---

For more details, see:
- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture
- [NODE-REFERENCE.md](NODE-REFERENCE.md) - Node documentation
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

