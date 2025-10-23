# Chrome AI Workflows Extension

Quick access to n8n workflows powered by Chrome's built-in AI (Gemini Nano) directly from your browser's side panel.

## Features

- **Side Panel Interface** - Persistent chat-like interface for workflow execution
- **Context Menus** - Right-click selected text to run workflows instantly
- **Workflow Management** - Add, edit, and configure custom workflows
- **n8n Integration** - Trigger workflows via webhooks with automatic discovery
- **Chat History** - Keep track of recent workflow executions
- **Chrome AI Status** - Real-time status of on-device AI availability
- **Import/Export** - Backup and share workflow configurations

## Installation

### Prerequisites

1. **Chrome Canary** (or Chrome 127+) with Chrome AI enabled:
   - Join Chrome AI Early Preview Program: https://goo.gle/chrome-ai-dev-preview-join
   - Enable flags in `chrome://flags`:
     - "Prompt API for Gemini Nano" → Enable
     - "Enables optimization guide on device" → Enable
   - Download AI model from `chrome://components/`
   - Restart Chrome

2. **n8n** running on localhost:5678
   ```bash
   n8n start
   ```

3. **Chrome AI Platform** (webapp) running on localhost:3333
   ```bash
   cd webapp
   npm start
   ```

### Load Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `chrome-extension/` directory
5. The extension icon should appear in your toolbar

## Usage

### Quick Start

1. **Open Side Panel**
   - Click the extension icon in toolbar, or
   - Right-click selected text → "Chrome AI Workflows"

2. **Select a Workflow**
   - Choose from the dropdown (default workflows included)

3. **Enter Input**
   - Type your text or use pre-filled selected text

4. **Run Workflow**
   - Click "Run Workflow" button
   - Results appear in the side panel

### Context Menu

Right-click any selected text and choose:
- **Chrome AI Workflows** → Select specific workflow
- Workflows with icons appear in submenu

### Settings

Click extension icon → Right-click → "Options" to:
- Configure n8n connection (URL, API key)
- Add/edit/delete custom workflows
- Import/export configuration
- Test Chrome AI status
- Clear all data

## Configuration

### n8n Workflows

Your n8n workflows must have a **Webhook trigger node** configured:

1. In n8n, add a "Webhook" node to your workflow
2. Set the webhook path (e.g., `/summarize`)
3. Activate the workflow
4. The webhook URL will be: `http://localhost:5678/webhook/summarize`

### Default Workflows

The extension comes with 6 pre-configured workflows:

- **📝 Summarize Text** - Create concise summaries
- **🌍 Translate Text** - Translate to other languages
- **✏️ Rewrite Text** - Rephrase with different tone
- **🔍 Proofread Text** - Fix grammar and spelling
- **💬 AI Chat Assistant** - General conversation
- **🎨 Generate Haiku** - Creative haiku generation

### Custom Workflows

Add your own workflows in Settings:
1. Click "Add Workflow"
2. Enter:
   - Name
   - Webhook URL
   - Icon (emoji)
   - Description
3. Save

## Webhook Payload Format

The extension sends this JSON to your n8n webhooks:

```json
{
  "text": "user input or selected text",
  "context": {
    "url": "https://example.com",
    "title": "Page Title",
    "selection": "highlighted text"
  },
  "sessionId": "session_12345"
}
```

Your n8n workflow can access these values using `{{$json.text}}`, `{{$json.context.url}}`, etc.

## Troubleshooting

### Extension shows "Platform: Disconnected"

- Make sure n8n is running on port 5678
- Check webhook URLs in settings are correct
- Test connection in Settings page

### Extension shows "AI: Not Available"

1. Enable Chrome AI flags in `chrome://flags`
2. Download model from `chrome://components/`
3. Restart Chrome
4. Click "Check AI Status" in Settings

### Workflows don't execute

1. Verify n8n workflow is active (toggle on in n8n)
2. Check webhook trigger node is configured
3. Test webhook URL manually with curl:
   ```bash
   curl -X POST http://localhost:5678/webhook/test \
     -H "Content-Type: application/json" \
     -d '{"text":"test"}'
   ```

### Context menu doesn't appear

1. Check workflows are configured with `showInContextMenu: true`
2. Reload the extension
3. Right-click on selected text (not empty space)

## Architecture

```
User Action (side panel or context menu)
  ↓
Extension sends webhook POST request
  ↓
n8n workflow receives data
  ↓
n8n uses Chrome AI nodes (via webapp server)
  ↓
Chrome AI processes (Gemini Nano on-device)
  ↓
Result returns through chain
  ↓
Extension displays in side panel
```

## Development

### File Structure

```
chrome-extension/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Service worker (context menus, webhooks)
├── sidepanel.html/js/css      # Main UI
├── options.html/js            # Settings page
└── lib/
    ├── workflow-config.js     # Default workflows
    ├── n8n-client.js          # Webhook execution
    ├── chromeai-client.js     # AI API wrapper
    └── storage-manager.js     # Chrome storage helper
```

### Message Passing

**Side Panel → Background:**
```javascript
chrome.runtime.sendMessage({
  action: 'executeWebhook',
  webhookUrl: 'http://localhost:5678/webhook/test',
  data: { text: 'Hello' }
});
```

**Background → Side Panel:**
```javascript
chrome.runtime.sendMessage({
  action: 'setSelectedText',
  text: 'Selected text from page'
});
```

### Storage Format

Workflows and history are stored in `chrome.storage.sync`:

```javascript
{
  workflows: [...],        // Array of workflow configs
  chatHistory: [...],      // Last 50 executions
  settings: {              // Extension settings
    n8nUrl: 'http://localhost:5678',
    n8nApiKey: '',
    platformUrl: 'http://localhost:3333'
  }
}
```

## Privacy

- **100% Local**: All AI processing happens on your device
- **No External Calls**: Extension only communicates with localhost
- **No Data Collection**: Nothing is sent to external servers
- **Open Source**: Audit the code yourself

## Links

- Chrome AI Documentation: https://developer.chrome.com/docs/ai/built-in-apis
- n8n Documentation: https://docs.n8n.io
- Chrome Extension Samples: https://github.com/GoogleChrome/chrome-extensions-samples

## License

MIT License - See main project LICENSE file

---

**Built for the Chrome AI Automation Platform** 🚀

For issues and feature requests, see the main project repository.

