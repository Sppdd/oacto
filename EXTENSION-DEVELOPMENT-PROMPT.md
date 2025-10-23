# Chrome AI Workflows Extension - Optimized Development Prompt

## Project Context

You are building a **Chrome Side Panel Extension** for the **Chrome AI Automation Platform** - an enterprise-grade automation platform that integrates Chrome's built-in AI (Gemini Nano) with n8n workflows.

### Current Platform Architecture (Working)
```
Chrome AI Automation Platform (localhost:3333)
├── Animated Dashboard with Workflow Management
├── AI Session Management (persistent conversations)
├── Embedded n8n Canvas (localhost:5678)
├── WebSocket Bridge (ws://localhost:3334)
└── Chrome AI Integration (window.ai.* APIs) note the window.ai is deprecated use the **idea.me** to see the recommandation set up to propore implemantation. 
```

### Extension Goal
Create a **Chrome Side Panel Extension** that provides **instant access** to n8n workflows while browsing, leveraging the existing platform's infrastructure.

--

On-device AI with Gemini Nano
This sample demonstrates how to use the Gemini Nano prompt API in Chrome Extensions. To learn more about the API, head over to Built-in AI on developer.chrome.com.

Overview
The extension provides a chat interface using the Prompt API with Chrome's built-in Gemini Nano model.

Running this extension
Clone this repository.
Run npm install in the project directory.
Run npm run build in the project directory to build the extension.
Load the newly created dist directory in Chrome as an unpacked extension.
Click the extension icon.
Interact with the Prompt API in the sidebar.

https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/ai.gemini-on-device


or route it to the workflows url, like the chat url or webhook url that n8n will provide after building the workflows and activting them. 
---

## Extension Architecture

### Core Concept
The extension acts as a **lightweight frontend** to your existing Chrome AI Automation Platform, providing:
- **Quick workflow execution** from any webpage
- **Context-aware AI assistance** using selected text
- **Seamless integration** with existing n8n workflows
- **Real-time status** and execution monitoring

### Data Flow
```
User Action (highlight text / type in side panel)
    ↓
Extension Side Panel
    ↓
POST to Platform Server (localhost:3333/api/execute-workflow)
    ↓
Platform Server → WebSocket → Chrome AI
    ↓
Chrome AI processes request
    ↓
Response back through Platform Server
    ↓
Extension displays result + updates badge
```

---

## Technical Implementation

### 1. Extension Structure
```
chrome-extension/
├── manifest.json              # Manifest V3
├── background.js              # Service worker
├── sidepanel.html             # Main UI
├── sidepanel.js               # Side panel logic
├── sidepanel.css              # Styling (match platform theme)
├── options.html               # Settings page
├── options.js                 # Settings logic
├── workflow-config.js         # Default workflow configurations
├── chromeai-client.js         # Chrome AI utilities (from platform)
├── platform-api.js            # API client for platform server
└── icons/                     # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 2. Manifest V3 Configuration
```json
{
  "manifest_version": 3,
  "name": "Chrome AI Workflows",
  "version": "1.0.0",
  "description": "Quick access to Chrome AI Automation Platform workflows",
  "permissions": [
    "sidePanel",
    "contextMenus",
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "http://localhost:3333/*",
    "http://localhost:5678/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_icon": "icons/icon48.png",
    "default_title": "Chrome AI Workflows"
  },
  "options_page": "options.html"
}
```

---

## Key Features Implementation

### 1. Side Panel Interface

**Design:** Match the platform's dark theme and animations
```html
<!-- sidepanel.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="sidepanel.css">
</head>
<body>
  <div class="extension-container">
    <!-- Status Header -->
    <div class="status-header">
      <div class="platform-status">
        <span class="status-indicator" id="platform-status"></span>
        <span class="status-text">Chrome AI Platform</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-btn" id="test-ai">
        <span class="icon">✨</span>
        <span>Test AI</span>
      </button>
      <button class="action-btn" id="open-platform">
        <span class="icon">🚀</span>
        <span>Open Platform</span>
      </button>
    </div>

    <!-- Workflow Selector -->
    <div class="workflow-section">
      <label>Select Workflow:</label>
      <select id="workflow-selector">
        <option value="">Choose a workflow...</option>
      </select>
    </div>

    <!-- Input Area -->
    <div class="input-section">
      <textarea id="user-input" placeholder="Type your message or paste selected text..."></textarea>
      <div class="selected-text" id="selected-text" style="display: none;">
        <span class="label">Selected:</span>
        <span class="text" id="selected-text-content"></span>
      </div>
    </div>

    <!-- Execute Button -->
    <button class="execute-btn" id="execute-workflow">
      <span class="icon">▶️</span>
      <span>Run Workflow</span>
    </button>

    <!-- Results Area -->
    <div class="results-section" id="results-section" style="display: none;">
      <div class="result-header">
        <span class="workflow-name" id="result-workflow"></span>
        <span class="execution-time" id="execution-time"></span>
      </div>
      <div class="result-content" id="result-content"></div>
    </div>

    <!-- History -->
    <div class="history-section">
      <h3>Recent Executions</h3>
      <div class="history-list" id="history-list"></div>
    </div>
  </div>

  <script src="platform-api.js"></script>
  <script src="chromeai-client.js"></script>
  <script src="sidepanel.js"></script>
</body>
</html>
```

### 2. Platform API Integration

**Leverage existing platform server endpoints:**
```javascript
// platform-api.js
class PlatformAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3333';
    this.isConnected = false;
  }

  async checkConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  async getWorkflows() {
    const response = await fetch(`${this.baseUrl}/api/workflows`);
    return response.json();
  }

  async executeWorkflow(workflowId, input, options = {}) {
    const payload = {
      workflowId,
      input,
      options: {
        systemPrompt: options.systemPrompt,
        temperature: options.temperature || 0.8,
        ...options
      }
    };

    const response = await fetch(`${this.baseUrl}/api/execute-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return response.json();
  }

  async getSessionStatus() {
    const response = await fetch(`${this.baseUrl}/api/sessions/status`);
    return response.json();
  }
}
```

### 3. Chrome AI Client Integration

**Port Chrome AI utilities from platform:**
```javascript
// chromeai-client.js
class ChromeAIClient {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  async checkAvailability() {
    try {
      if ('LanguageModel' in self) {
        const testSession = await LanguageModel.create({
          temperature: 0.8,
          topK: 3
        });
        await testSession.prompt('test');
        testSession.destroy();
        this.isAvailable = true;
      }
    } catch (error) {
      this.isAvailable = false;
    }
    return this.isAvailable;
  }

  async quickPrompt(prompt, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Chrome AI not available');
    }

    const sessionConfig = {
      temperature: options.temperature || 0.8,
      topK: 3
    };

    if (options.systemPrompt) {
      sessionConfig.initialPrompts = [{
        role: 'system',
        content: options.systemPrompt
      }];
    }

    const session = await LanguageModel.create(sessionConfig);
    
    try {
      const result = await session.prompt(prompt);
      return result;
    } finally {
      session.destroy();
    }
  }
}
```

### 4. Context Menu Integration

**background.js implementation:**
```javascript
// background.js
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for text selection
  chrome.contextMenus.create({
    id: 'chrome-ai-workflows',
    title: 'Send to Chrome AI Workflows',
    contexts: ['selection']
  });

  // Create submenu for quick actions
  chrome.contextMenus.create({
    id: 'summarize',
    parentId: 'chrome-ai-workflows',
    title: '📝 Summarize',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'translate',
    parentId: 'chrome-ai-workflows',
    title: '🌍 Translate',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'rewrite',
    parentId: 'chrome-ai-workflows',
    title: '✏️ Rewrite',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'chrome-ai-workflows') {
    // Open side panel with selected text
    await chrome.sidePanel.open({ tabId: tab.id });
    chrome.tabs.sendMessage(tab.id, {
      action: 'setSelectedText',
      text: info.selectionText
    });
  } else {
    // Execute specific workflow
    await chrome.sidePanel.open({ tabId: tab.id });
    chrome.tabs.sendMessage(tab.id, {
      action: 'executeWorkflow',
      workflowId: info.menuItemId,
      text: info.selectionText
    });
  }
});
```

### 5. Workflow Configuration

**Default workflows matching platform examples:**
```javascript
// workflow-config.js
const DEFAULT_WORKFLOWS = [
  {
    id: 'haiku',
    name: 'AI Haiku Generator',
    description: 'Generate beautiful haikus',
    icon: '🎨',
    systemPrompt: 'You are a creative poet.',
    contextMenu: true,
    quickAction: true
  },
  {
    id: 'summarize',
    name: 'Summarize Text',
    description: 'Create concise summaries',
    icon: '📝',
    systemPrompt: 'You are a professional summarizer. Create clear, concise summaries.',
    contextMenu: true,
    quickAction: true
  },
  {
    id: 'translate',
    name: 'Translate Text',
    description: 'Translate to different languages',
    icon: '🌍',
    systemPrompt: 'You are a professional translator. Translate accurately while preserving meaning.',
    contextMenu: true,
    quickAction: true
  },
  {
    id: 'rewrite',
    name: 'Rewrite Text',
    description: 'Rephrase with different tone',
    icon: '✏️',
    systemPrompt: 'You are a professional writer. Rewrite text with improved clarity and style.',
    contextMenu: true,
    quickAction: true
  },
  {
    id: 'proofread',
    name: 'Proofread Text',
    description: 'Fix grammar and spelling',
    icon: '🔍',
    systemPrompt: 'You are a professional proofreader. Fix grammar, spelling, and style issues.',
    contextMenu: true,
    quickAction: true
  },
  {
    id: 'chat',
    name: 'AI Chat Assistant',
    description: 'General AI conversation',
    icon: '💬',
    systemPrompt: 'You are a helpful AI assistant.',
    contextMenu: false,
    quickAction: true
  }
];
```

---

## Integration with Existing Platform

### 1. Server Endpoint Addition

**Add to webapp/server.js:**
```javascript
// New endpoint for extension
app.post('/api/execute-workflow', async (req, res) => {
  try {
    const { workflowId, input, options } = req.body;
    
    // Use existing Chrome AI execution logic
    const result = await callWebApp('promptAI', {
      systemPrompt: options.systemPrompt,
      userPrompt: input,
      temperature: options.temperature
    });

    if (result.success) {
      res.json({
        success: true,
        result: result.value,
        workflowId,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check for extension
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    chromeAI: webAppWs ? 'connected' : 'disconnected'
  });
});
```

### 2. Badge Management

**Update badge based on platform status:**
```javascript
// In background.js
async function updateBadge() {
  try {
    const response = await fetch('http://localhost:3333/api/health');
    const data = await response.json();
    
    if (data.chromeAI === 'connected') {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    } else {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    }
  } catch (error) {
    chrome.action.setBadgeText({ text: '✗' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
}

// Update badge every 30 seconds
setInterval(updateBadge, 30000);
updateBadge();
```

---

## User Experience Flow

### 1. Quick Text Processing
```
User highlights text on webpage
    ↓
Right-click → "Send to Chrome AI Workflows"
    ↓
Side panel opens with text pre-filled
    ↓
Select workflow (Summarize/Translate/Rewrite)
    ↓
Click "Run Workflow"
    ↓
Result displayed in side panel
    ↓
Badge shows success status
```

### 2. Chat Interface
```
User opens side panel
    ↓
Type message in input field
    ↓
Select "AI Chat Assistant" workflow
    ↓
Click "Run Workflow"
    ↓
AI response displayed
    ↓
Continue conversation
```

### 3. Platform Integration
```
Extension detects platform status
    ↓
Shows green badge when connected
    ↓
"Open Platform" button launches full dashboard
    ↓
Extension works as quick access layer
```

---

## Development Checklist

### Phase 1: Core Extension
- [ ] Create manifest.json with required permissions
- [ ] Build basic side panel HTML/CSS (match platform theme)
- [ ] Implement platform API client
- [ ] Add Chrome AI client utilities
- [ ] Create context menu integration

### Phase 2: Workflow Integration
- [ ] Add workflow selector dropdown
- [ ] Implement workflow execution
- [ ] Add result display with animations
- [ ] Create execution history
- [ ] Add badge status updates

### Phase 3: Platform Integration
- [ ] Add server endpoints to platform
- [ ] Implement health check system
- [ ] Add settings page for configuration
- [ ] Create workflow import/export
- [ ] Add error handling and recovery

### Phase 4: Polish & Testing
- [ ] Match platform's dark theme exactly
- [ ] Add smooth animations (anime.js)
- [ ] Test with all workflow types
- [ ] Add comprehensive error messages
- [ ] Create installation guide

---

## Success Criteria

Extension is complete when:

✅ **Instant Access** - Right-click text → workflow → result in <3 seconds  
✅ **Seamless Integration** - Works with existing platform infrastructure  
✅ **Visual Consistency** - Matches platform's dark theme and animations  
✅ **Reliable Execution** - Handles errors gracefully with helpful messages  
✅ **Status Awareness** - Badge shows platform connection status  
✅ **Context Preservation** - Selected text flows smoothly to workflows  
✅ **History Tracking** - Recent executions visible in side panel  
✅ **Independent Operation** - Works even if platform server restarts  

---

## Key Advantages

### 1. **Leverages Existing Infrastructure**
- Uses platform's Chrome AI integration
- Reuses WebSocket bridge
- Maintains session management
- Keeps existing n8n workflows

### 2. **Minimal Development Overhead**
- No new Chrome AI code needed
- Reuses platform's API patterns
- Leverages existing error handling
- Maintains consistent UX

### 3. **Enhanced User Experience**
- Workflows accessible from any webpage
- Context-aware text processing
- Real-time status monitoring
- Seamless platform integration

### 4. **Future-Proof Architecture**
- Extension can evolve independently
- Platform can add new features
- Both can scale separately
- Maintains backward compatibility

---

## Next Steps

1. **Create extension directory structure**
2. **Implement manifest.json and basic side panel**
3. **Add platform API integration**
4. **Port Chrome AI client utilities**
5. **Create context menu functionality**
6. **Add server endpoints to platform**
7. **Implement badge management**
8. **Polish UI and add animations**
9. **Test with existing workflows**
10. **Create installation documentation**

This approach maximizes the value of your existing Chrome AI Automation Platform while providing the instant access users want through a Chrome extension.
