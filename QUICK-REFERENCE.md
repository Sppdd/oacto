# Chrome AI Automation Platform - Quick Reference

## 🚀 Startup

```bash
./start-platform.sh    # Start everything
./stop-platform.sh     # Stop everything
```

## 🌐 URLs

- **Platform Dashboard:** http://localhost:3333
- **n8n Editor:** http://localhost:5678
- **WebSocket:** ws://localhost:3334

## 📊 Dashboard Navigation

| Icon | Section | Purpose |
|------|---------|---------|
| 📊 | Dashboard | Status overview and quick actions |
| ⚙️ | Workflows | Manage and run workflows |
| 🧠 | AI Sessions | View conversation sessions |
| 🔗 | n8n Canvas | Embedded workflow editor |
| 📖 | Guide | Interactive setup guide |

## ⚡ Quick Actions

| Action | Shortcut |
|--------|----------|
| Test AI | Click ✨ Test AI button |
| Run Workflow | Click ▶️ Run on workflow card |
| Create Session | Navigate to Sessions → ➕ New Session |
| Open n8n | Click 🚀 Open n8n |
| View Guide | Click 📚 View Guide |

## 🔧 Workflow Management

### Run Workflow
1. Go to Workflows tab
2. Click **▶️ Run** on any workflow card
3. Watch activity log for results

### Schedule Workflow
1. Click **⏰ Schedule** on workflow card
2. Choose schedule type:
   - **Once** - Specific date/time
   - **Interval** - Every X minutes/hours/days
   - **Daily** - Same time each day
   - **Weekly** - Specific day and time
   - **Cron** - Custom expression
3. Click **Save Schedule**

### Import Example
1. Click **Import Example** button
2. Select workflow from list
3. Opens in n8n automatically

## 🧠 Session Management

### Create Session
1. Go to AI Sessions tab
2. Click **➕ New Session**
3. Configure:
   - Name
   - System prompt (optional)
   - Temperature (0-2)
   - Top K (1-10)
4. Click **Create Session**

### Use Session
1. Click **💬 Continue** on session card
2. Type message
3. Click **Send Message**
4. View response

### View History
- Click **📜 History** on session card

## 🎨 Status Indicators

| Color | Meaning |
|-------|---------|
| 🟢 Green | Connected/Ready |
| 🟡 Yellow | Checking/Warning |
| 🔴 Red | Error/Disconnected |

## 📝 Activity Log Colors

| Color | Type |
|-------|------|
| White | Info |
| Green | Success |
| Yellow | Warning |
| Red | Error |

## 🔑 n8n Credentials Setup

1. Open n8n: http://localhost:5678
2. Go to **Credentials** → **New**
3. Select **Chrome AI API**
4. Enter:
   - Bridge URL: `http://localhost:3333`
   - API Key: (leave empty)
5. Click **Test** → Should show ✅
6. Click **Save**

## 🎯 Chrome AI Nodes

| Node | Purpose | Example |
|------|---------|---------|
| Chrome Prompt AI | General LLM | Write email, generate content |
| Chrome Writer | Structured writing | Blog posts, articles |
| Chrome Summarizer | Condense text | Summarize articles |
| Chrome Translator | Language translation | English to Spanish |
| Chrome Rewriter | Rephrase text | Change tone/style |
| Chrome Proofreader | Fix grammar | Correct spelling/grammar |
| Chrome Language Detector | Identify language | Detect text language |

## 🔥 Common Workflows

### Email Assistant
```
Manual Trigger
  → Chrome Prompt AI (system: "Professional email writer")
  → Send Email
```

### Content Pipeline
```
RSS Feed
  → Chrome Summarizer
  → Chrome Rewriter
  → Post to Twitter
```

### Multilingual Support
```
Webhook
  → Chrome Language Detector
  → IF (language check)
  → Chrome Translator
  → Process
```

## 💡 Best Practices

### System Prompts
```javascript
// Good
"You are a professional email writer. Write concise, friendly emails."

// Bad
"Write emails"
```

### Temperature Settings
- **0.0-0.3** - Factual, consistent
- **0.4-0.7** - Balanced
- **0.8-1.2** - Creative
- **1.3-2.0** - Very creative

### Token Management
- Monitor usage in Sessions tab
- Create new session when quota low
- Use shorter prompts when possible

## 🐛 Troubleshooting

### Chrome AI Not Available
1. Check chrome://flags
2. Download model in chrome://components/
3. Restart Chrome
4. Refresh platform page

### Server Not Connected
1. Check if server running: `npm start` in webapp/
2. Verify port 3333 available
3. Check firewall settings
4. Refresh page

### Workflow Won't Run
1. Check Chrome AI status (green)
2. Check server connection (green)
3. Verify n8n credentials
4. Check activity log for errors

### Sessions Not Saving
1. Enable localStorage in browser
2. Not in incognito mode
3. Check storage quota
4. Clear and recreate

## 📦 File Structure

```
Journal.dev/
├── webapp/
│   ├── public/
│   │   ├── index.html          # Main platform UI
│   │   ├── styles.css          # Dark theme CSS
│   │   ├── app.js              # Core functionality
│   │   ├── workflow-manager.js # Workflow management
│   │   └── session-manager.js  # Session management
│   ├── server.js               # Express server
│   └── package.json
├── packages/n8n-nodes-chrome-ai/
│   ├── nodes/                  # 7 AI nodes
│   └── credentials/            # Chrome AI credentials
├── examples/                   # Example workflows
├── docs/                       # Documentation
├── start-platform.sh           # Startup script
├── stop-platform.sh            # Shutdown script
└── PLATFORM-GUIDE.md          # Complete guide
```

## 🔐 Security

- ✅ 100% local processing
- ✅ No external API calls
- ✅ No data leaves your machine
- ✅ No API keys required
- ✅ Open source code

## 📊 System Requirements

- **Chrome Canary** with AI enabled
- **Node.js** 16 or higher
- **n8n** installed globally
- **~2GB RAM** for AI model
- **~2GB disk** for model storage

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Esc | Close modal |
| Ctrl+R | Refresh status |
| Tab | Navigate forms |

## 🎨 Customization

### Change Colors
Edit `webapp/public/styles.css`:
```css
:root {
  --primary: #667eea;     /* Main color */
  --secondary: #764ba2;   /* Accent color */
}
```

### Change Ports
Edit `webapp/server.js`:
```javascript
const HTTP_PORT = 3333;
const WS_PORT = 3334;
```

## 📞 Getting Help

1. **Platform Guide** - PLATFORM-GUIDE.md
2. **Interactive Guide** - Built into platform
3. **Activity Log** - Real-time debugging
4. **Browser Console** - F12 for errors
5. **GitHub Issues** - Report bugs

## 🎓 Learning Path

1. ✅ **Setup** - Follow interactive guide
2. ✅ **Import Examples** - Study pre-built workflows
3. ✅ **Test AI** - Try the test modal
4. ✅ **Create Session** - Make your first session
5. ✅ **Build Workflow** - Create in n8n
6. ✅ **Schedule** - Automate execution
7. ✅ **Monitor** - Watch activity log

## 🚨 Important Notes

- **Keep tab open** - AI only works while page is open
- **Pin the tab** - Prevent accidental closing
- **Monitor tokens** - Sessions have limits
- **Save schedules** - Persist across restarts
- **Check logs** - Activity log shows everything

## 📈 Performance Tips

1. **Reuse sessions** - Don't create new for each request
2. **Cache system prompts** - Use workflow-specific sessions
3. **Batch requests** - Process multiple items together
4. **Monitor cleanup** - Let auto-cleanup handle idle sessions
5. **Optimize prompts** - Shorter = faster + fewer tokens

## 🎯 Success Checklist

- [ ] Chrome AI enabled and model downloaded
- [ ] Platform running (green indicators)
- [ ] n8n credentials configured
- [ ] At least one workflow imported
- [ ] Test AI successful
- [ ] Session created and working
- [ ] Workflow executed successfully
- [ ] Schedule configured (optional)

---

**Need more details?** See **PLATFORM-GUIDE.md** for comprehensive documentation.

**Ready to start?** Run `./start-platform.sh` and open http://localhost:3333

🚀 **Happy automating!**

