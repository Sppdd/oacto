# Chrome AI Automation Platform - Complete Guide

## 🎯 Overview

The Chrome AI Automation Platform is an enterprise-grade system that brings Chrome's built-in AI (Gemini Nano) to n8n workflows with a beautiful, animated interface for managing workflows and AI sessions.

## ✨ Key Features

### 1. **Animated Dashboard**
- Real-time status monitoring for Chrome AI and server connection
- Beautiful anime.js animations throughout the interface
- Quick actions for common tasks
- Activity log with live updates

### 2. **Workflow Management**
- Visual workflow cards with one-click execution
- Import example workflows instantly
- Edit workflows directly in embedded n8n canvas
- Track workflow status and execution history

### 3. **Advanced AI Session Management**
- Persistent sessions stored in localStorage
- Automatic session restoration on page load
- Conversation history tracking
- Token usage monitoring
- Intelligent idle session cleanup
- Workflow-specific session caching

### 4. **Embedded n8n Canvas**
- Full n8n editor embedded in the platform
- Seamless workflow creation and editing
- No need to switch between tabs

### 5. **Interactive Guide**
- Step-by-step setup instructions
- Pro tips and best practices
- Animated transitions between sections

## 🚀 Getting Started

### Prerequisites

1. **Chrome Canary** with AI enabled
2. **n8n** installed
3. **Node.js** 16+ installed

### Step 1: Enable Chrome AI

```bash
# 1. Join Chrome AI Early Preview Program
https://goo.gle/chrome-ai-dev-preview-join

# 2. Enable flags in chrome://flags
- "Prompt API for Gemini Nano" → Enable
- "Enables optimization guide on device" → Enable

# 3. Restart Chrome

# 4. Download model in chrome://components/
- Find "Optimization Guide On Device Model"
- Click "Check for update"
- Wait 5-10 minutes for ~1.5GB download

# 5. Verify installation
# Open console (F12) and type: LanguageModel
# Should see: ƒ LanguageModel() { [native code] }
```

### Step 2: Start the Platform

```bash
# Start the web app server
cd webapp
npm install
npm start

# Server will start on:
# - HTTP: http://localhost:3333
# - WebSocket: ws://localhost:3334
```

### Step 3: Open the Platform

```bash
# Open in Chrome
http://localhost:3333

# Keep this tab open (minimize is fine)
```

### Step 4: Install n8n Nodes

```bash
# Build and link the Chrome AI nodes
cd packages/n8n-nodes-chrome-ai
npm install
npm run build
npm link

# Link to n8n
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Start n8n
n8n start
```

### Step 5: Configure n8n Credentials

1. Open n8n at `http://localhost:5678`
2. Go to **Credentials** → **New**
3. Select **Chrome AI API**
4. Enter Bridge URL: `http://localhost:3333`
5. Leave API Key empty (optional)
6. Click **Test** → Should show ✅ Success
7. Save credentials

## 📊 Using the Dashboard

### Navigation

The sidebar provides quick access to all features:

- **📊 Dashboard** - Overview of system status and quick actions
- **⚙️ Workflows** - Manage and run your n8n workflows
- **🧠 AI Sessions** - View and manage conversation sessions
- **🔗 n8n Canvas** - Embedded workflow editor
- **📖 Guide** - Interactive setup and usage guide

### Status Cards

The dashboard displays four key status cards:

1. **Chrome AI** - Shows if AI is ready, downloading, or unavailable
2. **Server** - WebSocket connection status
3. **Workflows** - Number of active workflows
4. **AI Sessions** - Number of active conversation sessions

### Quick Actions

- **✨ Test AI** - Open modal to test Chrome AI with custom prompts
- **📋 View Workflows** - Navigate to workflows page
- **🚀 Open n8n** - Open n8n in new tab
- **📚 View Guide** - Open the interactive guide

## ⚙️ Workflow Management

### Viewing Workflows

Navigate to the **Workflows** tab to see all available workflows. Each workflow card shows:

- Workflow name and icon
- Description
- Status (active/inactive)
- Number of nodes
- Last run time
- Action buttons

### Running Workflows

Click the **▶️ Run** button on any workflow card to execute it immediately. The platform will:

1. Animate the card to show activity
2. Execute the workflow through n8n
3. Update the status and last run time
4. Show success/error in the activity log

### Editing Workflows

Click the **✏️ Edit** button to open the workflow in the embedded n8n canvas. You can:

- Modify nodes and connections
- Test individual nodes
- Save changes
- Return to the workflows view

### Importing Examples

The platform includes three example workflows:

1. **🎨 AI Haiku Generator** - Simple AI text generation
2. **📰 Content Pipeline** - RSS → Summarize → Rewrite → Post
3. **🌍 Multilingual Workflow** - Auto-detect language and translate

Click **Import Example** to add these to your n8n instance.

## 🧠 AI Session Management

### What are AI Sessions?

AI sessions maintain conversation context across multiple prompts. Each session:

- Stores conversation history
- Tracks token usage
- Persists in localStorage
- Auto-restores on page load
- Cleans up when idle

### Creating Sessions

1. Navigate to **AI Sessions** tab
2. Click **➕ New Session**
3. Configure:
   - Session name
   - System prompt (optional)
   - Temperature (0-2)
   - Top K (1-10)
4. Click **Create Session**

### Using Sessions

Click **💬 Continue** on any session card to:

- Send messages to the AI
- View responses in real-time
- Build on previous conversation
- Maintain context across prompts

### Session Features

- **📜 History** - View full conversation history
- **🗑️ Delete** - Remove session and free memory
- **Token Tracking** - Monitor usage and remaining quota
- **Auto-cleanup** - Idle sessions removed after 30 minutes

### Workflow-Specific Sessions

The platform automatically creates and reuses sessions for workflows:

- Each workflow gets a dedicated session
- System prompts are cached
- Sessions persist across workflow runs
- Improves performance and consistency

## 🎨 Animations

The platform uses anime.js for smooth, professional animations:

### Page Load
- Sidebar slides in from left
- Nav items fade in sequentially
- Status cards scale up with stagger
- Action buttons bounce in

### View Transitions
- Content fades in from bottom
- Elements stagger for smooth flow
- Cards animate on hover
- Modals slide up smoothly

### Interactions
- Cards pulse on update
- Icons rotate on success
- Buttons lift on hover
- Log entries slide in

## 🔧 Advanced Configuration

### Session Management

Edit session parameters in `session-manager.js`:

```javascript
// Maximum idle time before cleanup (minutes)
maxIdleMinutes: 30

// Default AI parameters
defaultTopK: 3
defaultTemperature: 1.0
```

### Workflow Execution

Customize workflow behavior in `workflow-manager.js`:

```javascript
// n8n instance URL
n8nUrl: 'http://localhost:5678'

// Workflow execution timeout
executionTimeout: 30000
```

### Server Configuration

Modify server settings in `server.js`:

```javascript
// HTTP server port
const HTTP_PORT = 3333;

// WebSocket server port
const WS_PORT = 3334;

// Request timeout
timeout: 30000
```

## 🎯 Best Practices

### 1. Keep the Tab Open
Chrome AI only works while the platform page is open. You can:
- Minimize the window
- Switch to other tabs
- But don't close the tab!

### 2. Use System Prompts
Define AI behavior with system prompts:
```
You are a professional email writer.
Write concise, friendly emails.
Always include a clear call-to-action.
```

### 3. Monitor Token Usage
Each session has a token limit. Check the Sessions tab to:
- See tokens used
- See tokens remaining
- Create new sessions when needed

### 4. Organize Workflows
Use descriptive names and icons:
- 📧 Email workflows
- 📰 Content workflows
- 🌍 Translation workflows
- 📊 Data workflows

### 5. Test Before Deploying
Use the **✨ Test AI** feature to:
- Verify prompts work correctly
- Test different temperatures
- Experiment with system prompts

## 🐛 Troubleshooting

### Chrome AI Not Available

**Symptoms:** Red status indicator, "Not Available" message

**Solutions:**
1. Join Chrome AI Early Preview Program
2. Enable flags in `chrome://flags`
3. Download model in `chrome://components/`
4. Restart Chrome
5. Refresh the platform page

### Server Not Connected

**Symptoms:** Red connection indicator, "Disconnected" message

**Solutions:**
1. Check if server is running: `npm start` in webapp/
2. Verify port 3333 is not in use
3. Check firewall settings
4. Refresh the platform page

### Workflows Not Loading

**Symptoms:** Empty workflows page, no cards visible

**Solutions:**
1. Check if example files exist in `examples/` directory
2. Verify file permissions
3. Check browser console for errors
4. Restart the server

### Sessions Not Persisting

**Symptoms:** Sessions disappear on page reload

**Solutions:**
1. Check browser localStorage is enabled
2. Verify not in incognito mode
3. Check browser storage quota
4. Clear and recreate sessions

### n8n Canvas Not Loading

**Symptoms:** Blank iframe, "Connection refused" error

**Solutions:**
1. Start n8n: `n8n start`
2. Verify n8n is running on port 5678
3. Check CORS settings
4. Try opening n8n in new tab first

## 📚 API Reference

### Workflow API

```javascript
// Get all workflows
GET /api/workflows

// Get specific workflow
GET /api/workflows/:id

// Response format
{
  success: true,
  workflows: [
    {
      id: "haiku",
      name: "AI Haiku Generator",
      file: "01-simple-ai-haiku.json",
      nodes: 2
    }
  ]
}
```

### Session API

```javascript
// Get session status
GET /api/sessions/status

// Response format
{
  success: true,
  sessions: {
    count: 3,
    active: 2,
    idle: 1
  }
}
```

### Chrome AI API

```javascript
// Prompt AI
POST /api/prompt-ai
{
  systemPrompt: "You are a helpful assistant",
  userPrompt: "Write a haiku",
  temperature: 0.8
}

// Other endpoints
POST /api/writer
POST /api/summarizer
POST /api/translator
POST /api/rewriter
POST /api/proofreader
POST /api/language-detector
```

## 🎓 Example Use Cases

### 1. Daily Content Automation

**Workflow:** RSS → Summarize → Rewrite → Post to Twitter

**Setup:**
1. Import "Content Pipeline" example
2. Configure RSS feed URL
3. Set Twitter credentials
4. Schedule to run daily at 9 AM

### 2. Email Assistant

**Workflow:** Manual Trigger → Prompt AI → Send Email

**Setup:**
1. Create new workflow in n8n
2. Add Chrome Prompt AI node
3. System prompt: "You are a professional email writer"
4. User prompt: "Write email about {{topic}}"
5. Connect to email node

### 3. Multilingual Support

**Workflow:** Webhook → Detect Language → Translate → Process

**Setup:**
1. Import "Multilingual Workflow" example
2. Configure webhook URL
3. Set target languages
4. Add processing logic

### 4. Code Review Assistant

**Workflow:** GitHub Webhook → Prompt AI → Comment on PR

**Setup:**
1. Create workflow with GitHub trigger
2. System prompt: "You are a code reviewer"
3. User prompt: "Review this code: {{code}}"
4. Post comment back to GitHub

## 🚀 What's Next?

### Upcoming Features

- [ ] Workflow scheduling UI
- [ ] Session export/import
- [ ] Workflow templates library
- [ ] Performance analytics
- [ ] Multi-user support
- [ ] Docker deployment
- [ ] Cloud sync for sessions

### Contributing

This is an open-source project. Contributions welcome!

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

### Resources

- **Documentation:** `/docs` directory
- **Examples:** `/examples` directory
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

### Getting Help

1. Check this guide first
2. Review troubleshooting section
3. Check browser console for errors
4. Open GitHub issue with details

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ to make local AI automation accessible to everyone**

*No extension. No complexity. Just powerful automation.* 🚀

