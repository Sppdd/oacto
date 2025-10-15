# Chrome Built-in AI × n8n: Professional Integration Plan

## Vision
Transform Chrome's built-in AI APIs into professional n8n nodes, creating a **local-first, privacy-focused automation ecosystem** where Chrome AI becomes the foundational building block for all workflows.

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│   n8n Workflow Engine (localhost)   │
│   - Visual workflow builder          │
│   - 400+ existing nodes              │
│   - Scheduling & monitoring          │
└──────────┬──────────────────────────┘
           │
           │ HTTP/WebSocket Bridge
           ↓
┌─────────────────────────────────────┐
│  Chrome Extension (AI Executor)      │
│  - Manages Chrome AI API access      │
│  - Executes AI in browser context    │
│  - Handles session management        │
└──────────┬──────────────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│  Chrome Built-in AI APIs (Local)     │
│  - Prompt API (Gemini Nano)          │
│  - Writer, Summarizer, Translator    │
│  - Rewriter, Proofreader             │
│  - Language Detection                │
└─────────────────────────────────────┘
```

---

## Project Structure

```
chrome-ai-n8n-integration/
├── packages/
│   ├── n8n-nodes-chrome-ai/          # NPM package for n8n
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── credentials/
│   │   │   └── ChromeAiApi.credentials.ts
│   │   ├── nodes/
│   │   │   ├── ChromePromptAi/
│   │   │   │   ├── ChromePromptAi.node.ts
│   │   │   │   ├── ChromePromptAi.node.json
│   │   │   │   └── chrome-prompt-ai.svg
│   │   │   ├── ChromeWriter/
│   │   │   ├── ChromeSummarizer/
│   │   │   ├── ChromeTranslator/
│   │   │   ├── ChromeRewriter/
│   │   │   ├── ChromeProofreader/
│   │   │   └── ChromeLanguageDetector/
│   │   ├── utils/
│   │   │   ├── ChromeAiClient.ts
│   │   │   └── types.ts
│   │   └── README.md
│   │
│   └── chrome-extension/              # Refactored extension
│       ├── manifest.json
│       ├── background/
│       │   ├── service-worker.ts
│       │   ├── n8n-bridge.ts         # NEW: Bridge server
│       │   └── ai-executor.ts        # NEW: AI execution logic
│       ├── content/
│       │   └── content-script.ts
│       ├── popup/
│       │   ├── popup.html
│       │   ├── popup.ts
│       │   └── popup.css
│       └── settings/                  # NEW: Extension settings
│           ├── settings.html
│           ├── settings.ts
│           └── settings.css
│
├── examples/                          # Example n8n workflows
│   ├── linkedin-ai-post.json
│   ├── smart-email-assistant.json
│   └── content-pipeline.json
│
├── docs/
│   ├── SETUP.md
│   ├── NODE_DEVELOPMENT.md
│   ├── ARCHITECTURE.md
│   └── PUBLISHING.md
│
└── README.md
```

---

## Phase 1: Create n8n Node Package

### 1.1 Package Setup

**File: `packages/n8n-nodes-chrome-ai/package.json`**

```json
{
  "name": "n8n-nodes-chrome-ai",
  "version": "1.0.0",
  "description": "n8n nodes for Chrome's built-in AI APIs (local, private, on-device)",
  "keywords": [
    "n8n-community-node-package",
    "chrome-ai",
    "gemini-nano",
    "on-device-ai",
    "local-ai",
    "privacy-first"
  ],
  "license": "MIT",
  "homepage": "https://github.com/yourusername/n8n-nodes-chrome-ai",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/n8n-nodes-chrome-ai.git"
  },
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier nodes credentials --write",
    "lint": "eslint nodes credentials package.json",
    "test": "jest"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/ChromeAiApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/ChromePromptAi/ChromePromptAi.node.js",
      "dist/nodes/ChromeWriter/ChromeWriter.node.js",
      "dist/nodes/ChromeSummarizer/ChromeSummarizer.node.js",
      "dist/nodes/ChromeTranslator/ChromeTranslator.node.js",
      "dist/nodes/ChromeRewriter/ChromeRewriter.node.js",
      "dist/nodes/ChromeProofreader/ChromeProofreader.node.js",
      "dist/nodes/ChromeLanguageDetector/ChromeLanguageDetector.node.js"
    ]
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "n8n-workflow": "^1.0.0",
    "typescript": "^5.0.0",
    "gulp": "^4.0.2",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  },
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

### 1.2 TypeScript Configuration

**File: `packages/n8n-nodes-chrome-ai/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "module": "commonjs",
    "lib": ["ES2019"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["credentials", "nodes", "utils"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Chrome AI Client Utility

**File: `packages/n8n-nodes-chrome-ai/utils/ChromeAiClient.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';

export interface ChromeAiClientConfig {
  bridgeUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface PromptAiRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}

export interface WriterRequest {
  prompt: string;
  tone?: 'formal' | 'neutral' | 'casual';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

export interface SummarizerRequest {
  text: string;
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
}

export interface TranslatorRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export interface RewriterRequest {
  text: string;
  tone?: 'formal' | 'neutral' | 'casual' | 'more-formal' | 'more-casual';
  format?: 'plain-text' | 'markdown';
  length?: 'shorter' | 'same' | 'longer';
}

export interface ProofreaderRequest {
  text: string;
}

export interface LanguageDetectorRequest {
  text: string;
}

export class ChromeAiClient {
  private client: AxiosInstance;

  constructor(config: ChromeAiClientConfig) {
    this.client = axios.create({
      baseURL: config.bridgeUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
      },
    });
  }

  async promptAi(request: PromptAiRequest): Promise<string> {
    const response = await this.client.post('/api/prompt-ai', request);
    return response.data.result;
  }

  async writer(request: WriterRequest): Promise<string> {
    const response = await this.client.post('/api/writer', request);
    return response.data.result;
  }

  async summarizer(request: SummarizerRequest): Promise<string> {
    const response = await this.client.post('/api/summarizer', request);
    return response.data.result;
  }

  async translator(request: TranslatorRequest): Promise<string> {
    const response = await this.client.post('/api/translator', request);
    return response.data.result;
  }

  async rewriter(request: RewriterRequest): Promise<string> {
    const response = await this.client.post('/api/rewriter', request);
    return response.data.result;
  }

  async proofreader(request: ProofreaderRequest): Promise<string> {
    const response = await this.client.post('/api/proofreader', request);
    return response.data.result;
  }

  async languageDetector(request: LanguageDetectorRequest): Promise<string> {
    const response = await this.client.post('/api/language-detector', request);
    return response.data.result;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }
}
```

### 1.4 Credentials Definition

**File: `packages/n8n-nodes-chrome-ai/credentials/ChromeAiApi.credentials.ts`**

```typescript
import {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ChromeAiApi implements ICredentialType {
  name = 'chromeAiApi';
  displayName = 'Chrome AI API';
  documentationUrl = 'https://github.com/yourusername/n8n-nodes-chrome-ai';
  properties: INodeProperties[] = [
    {
      displayName: 'Bridge URL',
      name: 'bridgeUrl',
      type: 'string',
      default: 'http://localhost:3333',
      required: true,
      description: 'URL of the Chrome extension bridge server',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Optional API key for bridge authentication',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };
}
```

### 1.5 Chrome Prompt AI Node (Example)

**File: `packages/n8n-nodes-chrome-ai/nodes/ChromePromptAi/ChromePromptAi.node.ts`**

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { ChromeAiClient } from '../../utils/ChromeAiClient';

export class ChromePromptAi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Chrome Prompt AI',
    name: 'chromePromptAi',
    icon: 'file:chrome-prompt-ai.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Use Chrome built-in Prompt API (Gemini Nano) - Local & Private',
    defaults: {
      name: 'Chrome Prompt AI',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'chromeAiApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        description: 'System instructions that guide the AI behavior',
        placeholder: 'You are a helpful assistant that...',
      },
      {
        displayName: 'User Prompt',
        name: 'userPrompt',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        required: true,
        default: '',
        description: 'The prompt to send to the AI',
        placeholder: 'Write a professional email about...',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        default: 0.8,
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberStepSize: 0.1,
        },
        description: 'Controls randomness. 0 = focused, 2 = creative',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Use Input Data',
            name: 'useInputData',
            type: 'boolean',
            default: false,
            description: 'Whether to use data from previous node in prompt',
          },
          {
            displayName: 'Input Field Name',
            name: 'inputFieldName',
            type: 'string',
            default: 'text',
            displayOptions: {
              show: {
                useInputData: [true],
              },
            },
            description: 'Field name from input data to use in prompt',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    // Get credentials
    const credentials = await this.getCredentials('chromeAiApi');
    const client = new ChromeAiClient({
      bridgeUrl: credentials.bridgeUrl as string,
      apiKey: credentials.apiKey as string,
    });

    // Check bridge health
    const isHealthy = await client.healthCheck();
    if (!isHealthy) {
      throw new NodeOperationError(
        this.getNode(),
        'Chrome AI bridge is not responding. Make sure the Chrome extension is installed and running.'
      );
    }

    // Process each input item
    for (let i = 0; i < items.length; i++) {
      try {
        const systemPrompt = this.getNodeParameter('systemPrompt', i) as string;
        let userPrompt = this.getNodeParameter('userPrompt', i) as string;
        const temperature = this.getNodeParameter('temperature', i) as number;
        const options = this.getNodeParameter('options', i) as any;

        // Optionally use input data
        if (options.useInputData && options.inputFieldName) {
          const inputData = items[i].json[options.inputFieldName];
          if (inputData) {
            userPrompt = userPrompt.replace('{{input}}', String(inputData));
          }
        }

        // Call Chrome AI
        const result = await client.promptAi({
          systemPrompt: systemPrompt || undefined,
          userPrompt,
          temperature,
        });

        // Return result
        returnData.push({
          json: {
            result,
            prompt: userPrompt,
            systemPrompt,
            temperature,
            timestamp: new Date().toISOString(),
          },
          pairedItem: i,
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
            },
            pairedItem: i,
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```

---

## Phase 2: Chrome Extension Bridge

### 2.1 Bridge Server

**File: `packages/chrome-extension/background/n8n-bridge.ts`**

```typescript
// HTTP Server for n8n communication
class N8nBridge {
  private port = 3333;
  private apiKey: string | null = null;

  async start() {
    // Chrome extensions can't run HTTP servers directly
    // We use native messaging with a local Node.js server
    // Or use chrome.runtime.onConnectExternal for extension-to-extension
    
    chrome.runtime.onMessage.addListener(this.handleRequest.bind(this));
    chrome.runtime.onMessageExternal.addListener(this.handleExternalRequest.bind(this));
    
    console.log('n8n Bridge started');
  }

  private async handleRequest(
    request: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) {
    // Validate API key if configured
    if (this.apiKey && request.apiKey !== this.apiKey) {
      sendResponse({ error: 'Unauthorized' });
      return;
    }

    try {
      const result = await this.executeAiRequest(request);
      sendResponse({ success: true, result });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep channel open for async
  }

  private async executeAiRequest(request: any): Promise<any> {
    const { endpoint, params } = request;

    // Get active tab to execute AI in browser context
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('No active tab');
    }

    // Send to content script for AI execution
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: endpoint,
      params,
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    return response.value;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }
}

export const n8nBridge = new N8nBridge();
```

### 2.2 Companion Node.js Server

**File: `packages/chrome-extension/server/bridge-server.js`**

```javascript
// Separate Node.js server that bridges n8n ↔ Chrome Extension
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const port = 3333;

app.use(cors());
app.use(express.json());

// WebSocket connection to Chrome Extension
let extensionWs = null;

const wss = new WebSocket.Server({ port: 3334 });

wss.on('connection', (ws) => {
  console.log('Chrome Extension connected');
  extensionWs = ws;

  ws.on('close', () => {
    console.log('Chrome Extension disconnected');
    extensionWs = null;
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: extensionWs ? 'ok' : 'no-extension',
    message: extensionWs ? 'Ready' : 'Chrome extension not connected',
  });
});

// Prompt AI endpoint
app.post('/api/prompt-ai', async (req, res) => {
  if (!extensionWs) {
    return res.status(503).json({ error: 'Chrome extension not connected' });
  }

  try {
    const { systemPrompt, userPrompt, temperature } = req.body;

    // Send to Chrome Extension via WebSocket
    extensionWs.send(JSON.stringify({
      id: Date.now(),
      action: 'promptAI',
      params: { systemPrompt, userPrompt, temperature },
    }));

    // Wait for response
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);

      extensionWs.once('message', (data) => {
        clearTimeout(timeout);
        resolve(JSON.parse(data));
      });
    });

    if (response.success) {
      res.json({ result: response.value });
    } else {
      res.status(500).json({ error: response.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Similar endpoints for other AI APIs...
app.post('/api/writer', async (req, res) => { /* ... */ });
app.post('/api/summarizer', async (req, res) => { /* ... */ });
app.post('/api/translator', async (req, res) => { /* ... */ });
app.post('/api/rewriter', async (req, res) => { /* ... */ });
app.post('/api/proofreader', async (req, res) => { /* ... */ });
app.post('/api/language-detector', async (req, res) => { /* ... */ });

app.listen(port, () => {
  console.log(`Chrome AI Bridge Server running on http://localhost:${port}`);
  console.log('Waiting for Chrome Extension to connect on ws://localhost:3334');
});
```

---

## Phase 3: Refactor Chrome Extension

### 3.1 Updated Manifest

**File: `packages/chrome-extension/manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "Chrome AI Bridge for n8n",
  "version": "2.0.0",
  "description": "Connects Chrome's built-in AI APIs to n8n for local, private automation",
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "http://localhost:3334/*"
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content-script.js"],
      "run_at": "document_idle"
    }
  ],
  "options_page": "settings/settings.html",
  "externally_connectable": {
    "matches": ["http://localhost:3333/*"]
  }
}
```

### 3.2 WebSocket Connection to Bridge Server

**File: `packages/chrome-extension/background/websocket-client.ts`**

```typescript
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectInterval = 5000;
  private messageHandlers: Map<string, Function> = new Map();

  connect() {
    this.ws = new WebSocket('ws://localhost:3334');

    this.ws.onopen = () => {
      console.log('Connected to bridge server');
      this.sendStatusUpdate('connected');
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from bridge server. Reconnecting...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private async handleMessage(message: any) {
    const { id, action, params } = message;

    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Execute AI in content script
      const response = await chrome.tabs.sendMessage(tab.id!, {
        action,
        params,
      });

      // Send response back
      this.send({
        id,
        success: response.success,
        value: response.value,
        error: response.error,
      });
    } catch (error) {
      this.send({
        id,
        success: false,
        error: error.message,
      });
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private sendStatusUpdate(status: string) {
    // Update popup/settings with connection status
    chrome.runtime.sendMessage({ type: 'bridge-status', status });
  }
}

export const wsClient = new WebSocketClient();
```

---

## Phase 4: Publishing & Distribution

### 4.1 NPM Package Publishing

```bash
# Build the package
cd packages/n8n-nodes-chrome-ai
npm run build

# Test locally first
npm link

# In your n8n installation
cd ~/.n8n/nodes
npm link n8n-nodes-chrome-ai

# When ready to publish
npm publish
```

### 4.2 n8n Community Node Registration

1. Package is published to NPM
2. Users install in n8n:
   ```bash
   npm install n8n-nodes-chrome-ai
   ```
3. Restart n8n - nodes appear automatically

### 4.3 Chrome Web Store Publishing

1. Prepare extension package
2. Create Chrome Web Store developer account
3. Upload extension
4. Submit for review

---

## Phase 5: Documentation

### 5.1 Main README

**Key sections:**
- Quick Start Guide
- Architecture Overview
- Installation Instructions
- Example Workflows
- Troubleshooting
- API Reference

### 5.2 Node Documentation

Each node needs:
- Purpose and use cases
- Parameter descriptions
- Example workflows
- Tips and best practices

---

## Migration Path

### For Existing Users

1. **Keep standalone mode working**
   - Extension can still work independently
   - Settings toggle: "Standalone" vs "n8n Mode"

2. **Gradual migration**
   - Import existing workflows to n8n format
   - Export tool: Convert workflow JSON

3. **Backwards compatibility**
   - Keep old builder available
   - Deprecation timeline (v3.0)

---

## Benefits of This Approach

### Privacy & Performance
✅ All AI processing stays on-device
✅ No external API calls
✅ Zero latency (local network only)
✅ No API keys or rate limits

### Professional Features
✅ Published npm package
✅ TypeScript with full types
✅ Comprehensive error handling
✅ Automated testing
✅ CI/CD integration

### Ecosystem Integration
✅ Access to 400+ n8n nodes
✅ Database connections
✅ API integrations
✅ Scheduling & monitoring
✅ Team collaboration

### Developer Experience
✅ Well-documented
✅ Easy to extend
✅ Community support
✅ Regular updates

---

## Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1: n8n Nodes | 5-7 days | Create 7 AI nodes, utilities, credentials |
| Phase 2: Bridge | 3-4 days | WebSocket server, Chrome integration |
| Phase 3: Extension | 4-5 days | Refactor, settings UI, testing |
| Phase 4: Publishing | 2-3 days | NPM package, Chrome store, docs |
| Phase 5: Polish | 3-4 days | Examples, tutorials, edge cases |

**Total:** ~3-4 weeks for v1.0 release

---

## Success Metrics

- [ ] All 7 Chrome AI APIs available as n8n nodes
- [ ] < 50ms bridge latency (local network)
- [ ] 100% local processing (zero external calls)
- [ ] Published to NPM with 50+ downloads/week
- [ ] 10+ example workflows created
- [ ] Full TypeScript type coverage
- [ ] Comprehensive documentation
- [ ] Chrome Web Store approval

---

## Next Steps

1. **Set up monorepo structure**
2. **Create n8n node package skeleton**
3. **Build first node (Prompt AI)**
4. **Test end-to-end with n8n**
5. **Iterate on remaining nodes**
6. **Refactor extension for bridge**
7. **Documentation and examples**
8. **Publish and announce**

---

**Ready to start building?** This architecture makes Chrome's AI APIs a first-class citizen in the automation ecosystem while maintaining privacy and performance.

