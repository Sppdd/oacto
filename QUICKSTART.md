# 🚀 Quick Start - Chrome AI × n8n

Get up and running in 10 minutes!

## Step 1: Enable Chrome AI (5 mins)

```
1. Join Chrome AI Early Preview Program: https://goo.gle/chrome-ai-dev-preview-join
2. Enable flags in chrome://flags:
   - "Prompt API for Gemini Nano" → Enable
   - "Enables optimization guide on device" → Enable
3. Restart Chrome
4. Download model in chrome://components/:
   - Find "Optimization Guide On Device Model"
   - Click "Check for update"
   - Wait 5-10 minutes for ~1.5GB download
5. Restart Chrome when download completes
```

**Verify**: Open console (F12), type `LanguageModel` → should see constructor function

## Step 2: Start Platform (1 min)

```bash
./start-platform.sh
```

This starts:
- ✅ Bridge Server (http://localhost:3333)
- ✅ n8n (http://localhost:5678)

**Keep the Bridge Server tab open in Chrome!**

## Step 3: Configure n8n (2 mins)

```
1. Open: http://localhost:5678
2. Settings → Credentials
3. Add "Chrome AI API" credential
4. Bridge URL: http://localhost:3333
5. Add your origin trial tokens (optional)
6. Save
```

## Step 4: Create Your First Workflow (2 mins)

```
1. In n8n: New workflow
2. Add "Chrome Prompt AI" node
3. Configure:
   - System Prompt: "You are a helpful assistant"
   - User Prompt: "Write a haiku about automation"
   - Temperature: 0.8
4. Save & Execute

Should see AI response in n8n!
```

**All Chrome AI nodes now work reliably** with automatic fallbacks!

## Advanced: Session Management

Use session IDs to continue conversations across workflow runs:

```
┌─────────────────────────────────────────────────────────┐
│ Session Management                                      │
├─────────────────────────────────────────────────────────┤
│ • Session ID: [Leave empty for new session]           │
│ • Force New Session: ☐ [Create new session]           │
└─────────────────────────────────────────────────────────┘
```

**Example**: Chain nodes with same session for context continuity.

## Troubleshooting

**"AI not available"**
- Enable Chrome flags: `chrome://flags`
- Download model: `chrome://components/`
- Restart Chrome

**"Can't connect"**
- Ensure Bridge Server tab is open: `http://localhost:3333`
- Check server logs: `logs/webapp.log`
- Verify n8n credentials have correct URL

**"Node fails"**
- Check webapp activity log for errors
- Verify Chrome AI status shows "Ready"
- Try different node (all have fallbacks now)

## What's New

- ✅ **Session Management** - Continue conversations
- ✅ **Fallback Support** - All nodes work reliably
- ✅ **Concurrent Sessions** - Multiple operations simultaneously
- ✅ **Enhanced Logging** - Better debugging information
- ✅ **Simplified Setup** - One script starts everything

**Ready to automate! 🚀**

## Success Indicators

✅ Bridge server running on 3333
✅ n8n running on 5678
✅ Chrome AI shows "Ready" in webapp
✅ All Chrome AI nodes available in n8n
✅ Workflows execute with AI responses

## Advanced Features

### Session Management
- Continue conversations across workflow runs
- Chain multiple AI nodes with context
- Automatic session cleanup

### Fallback Support
- All nodes work even if Chrome APIs unavailable
- Automatic fallback to Prompt AI
- Consistent interface regardless of underlying API

### Concurrent Operations
- Multiple AI operations run simultaneously
- Efficient session reuse
- No blocking between operations

**You now have a fully functional AI automation platform! 🎉**

## Next Steps

- Import example workflows
- Read the complete documentation: `docs/HOW-IT-WORKS.md`
- Build your first automation!

---

**Complete setup guide**: `docs/SETUP.md`

