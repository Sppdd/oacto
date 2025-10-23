# Chrome AI Workflows Extension - Installation Guide

Complete step-by-step guide to get the extension working with your Chrome AI Automation Platform.

## Prerequisites

Before installing the extension, ensure you have:

### 1. Chrome AI Enabled ✅

**Required**: Chrome Canary or Chrome 127+

```bash
# Steps:
1. Join Chrome AI Early Preview Program
   → https://goo.gle/chrome-ai-dev-preview-join

2. Enable Chrome flags
   → chrome://flags
   → Search: "Prompt API for Gemini Nano"
   → Enable
   → Search: "Enables optimization guide on device"
   → Enable
   → Restart Chrome

3. Download AI model
   → chrome://components/
   → Find: "Optimization Guide On Device Model"
   → Click "Check for update"
   → Wait 5-10 minutes (~1.5GB download)
   → Version should change from "0.0.0.0" to a date
   → Restart Chrome

4. Verify AI works
   → Open any page
   → Press F12 (DevTools)
   → Console tab
   → Type: LanguageModel
   → Should see: ƒ LanguageModel() { [native code] }
```

### 2. Platform Running ✅

**Required**: Chrome AI Platform webapp and n8n

```bash
# Terminal 1: Start webapp
cd /Users/etharo/Desktop/Journal.dev/webapp
npm install  # first time only
npm start
# Should see: 📡 HTTP Server: http://localhost:3333

# Terminal 2: Start n8n
n8n start
# Should see: Editor is now accessible via: http://localhost:5678
```

### 3. n8n Workflows Configured ✅

**Required**: At least one workflow with a webhook trigger

1. Open n8n: http://localhost:5678
2. Create a new workflow or import from `examples/`
3. Add a "Webhook" trigger node
4. Set webhook path (e.g., `test`)
5. Add Chrome AI nodes (Prompt AI, Summarizer, etc.)
6. Activate the workflow
7. Note the webhook URL: `http://localhost:5678/webhook/test`

## Extension Installation

### Step 1: Load Extension in Chrome

```bash
1. Open Chrome (Canary)
2. Navigate to: chrome://extensions/
3. Enable "Developer mode" (toggle top-right)
4. Click "Load unpacked"
5. Browse to: /Users/etharo/Desktop/Journal.dev/chrome-extension
6. Click "Select"
7. Extension should appear in the list
```

### Step 2: Verify Extension Loaded

✅ **Check:**
- Extension appears in list
- No errors shown
- Extension icon appears in toolbar (puzzle piece icon → pin it)

### Step 3: Configure Extension Settings

```bash
1. Right-click extension icon
2. Click "Options"
3. Configure n8n connection:
   - n8n URL: http://localhost:5678
   - API Key: (leave empty if not set)
4. Click "Test Connection"
   → Should show: ✓ Connected to n8n
5. Click "Save Settings"
6. Click "Check AI Status"
   → Should show: ✓ Chrome AI Available
```

### Step 4: Add Workflows

**Option A: Use Default Workflows**

Default workflows are pre-configured:
- Summarize, Translate, Rewrite, Proofread, Chat, Haiku

**Option B: Add Custom Workflows**

1. In Settings page, click "Add Workflow"
2. Enter:
   ```
   Name: My Test Workflow
   Webhook URL: http://localhost:5678/webhook/test
   Icon: 🧪
   Description: Test workflow
   ```
3. Click through prompts
4. Workflow appears in table

**Option C: Fetch from n8n**

1. Open side panel (click extension icon)
2. Click "🔄 Refresh" button
3. Extension fetches active workflows from n8n
4. Workflows with webhooks are added automatically

### Step 5: Test the Extension

**Test 1: Quick AI Test**

1. Click extension icon to open side panel
2. Click "✨ Test AI" button
3. Should show success message with AI response

**Test 2: Execute Workflow**

1. In side panel, select a workflow from dropdown
2. Enter some text in the input field
3. Click "▶️ Run Workflow"
4. Wait for response (shows loading state)
5. Result appears below the button
6. Check "Recent Executions" section - item should appear

**Test 3: Context Menu**

1. On any webpage, select some text
2. Right-click selected text
3. Choose "Chrome AI Workflows"
4. Select a workflow from submenu
5. Side panel opens with text pre-filled
6. Workflow executes automatically

## Troubleshooting

### Extension Won't Load

**Error:** "Manifest file is missing or unreadable"

**Fix:**
```bash
cd /Users/etharo/Desktop/Journal.dev/chrome-extension
ls manifest.json  # verify file exists
```

**Error:** "Service worker registration failed"

**Fix:**
- Check background.js has no syntax errors
- Remove and reload extension

### "Platform: Disconnected" in Side Panel

**Cause:** n8n not running or wrong URL

**Fix:**
```bash
# Check n8n is running
curl http://localhost:5678/healthz

# If not, start it
n8n start

# In extension settings, verify URL is correct
```

### "AI: Not Available" in Side Panel

**Cause:** Chrome AI not enabled or model not downloaded

**Fix:**
1. Check `chrome://flags` - both flags enabled
2. Check `chrome://components/` - model downloaded
3. Restart Chrome completely
4. Click "Check AI Status" in extension settings

### Workflows Don't Execute

**Cause 1:** Webhook URL incorrect

**Fix:**
```bash
# Test webhook manually
curl -X POST http://localhost:5678/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}'

# Should return workflow response
```

**Cause 2:** Workflow not activated in n8n

**Fix:**
- Open workflow in n8n
- Click toggle switch to activate
- Should turn green

**Cause 3:** Webhook trigger not configured

**Fix:**
- Add "Webhook" trigger node to workflow
- Set path in webhook node
- Save and activate workflow

### Context Menu Doesn't Appear

**Cause:** Extension not registering menus

**Fix:**
1. Open `chrome://extensions/`
2. Click "service worker" under extension
3. Check console for errors
4. If errors, reload extension

### Results Don't Display

**Cause:** Unexpected response format from webhook

**Fix:**
- Check n8n workflow returns data properly
- Add a "Return" node at the end of workflow
- Set it to return the AI result

## Verification Checklist

Before reporting issues, verify:

- [ ] Chrome AI enabled in flags
- [ ] AI model downloaded (check chrome://components/)
- [ ] webapp server running (localhost:3333)
- [ ] n8n running (localhost:5678)
- [ ] n8n workflows activated
- [ ] Webhook trigger nodes configured
- [ ] Extension loaded without errors
- [ ] Extension settings configured and tested
- [ ] At least one workflow added
- [ ] Test AI button works
- [ ] Test workflow execution works

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No workflows in dropdown | No workflows configured | Add workflows in Settings or click Refresh |
| Webhook timeout | Workflow takes > 30s | Simplify workflow or increase timeout |
| CORS errors | Direct fetch from side panel | Use background.js (already implemented) |
| Storage quota exceeded | Too much history | Click "Clear History" in side panel |
| Badge doesn't update | Background script error | Check service worker console |

## Development Mode

When developing or debugging:

1. **Open DevTools for Side Panel**
   - Right-click in side panel
   - Click "Inspect"
   - Console shows logs

2. **Open Service Worker Console**
   - chrome://extensions/
   - Find extension
   - Click "service worker"
   - Console shows background logs

3. **Reload Extension**
   - After code changes
   - Click reload icon in chrome://extensions/
   - Refresh side panel if open

## Next Steps

Once installed and tested:

1. **Create Your Own Workflows**
   - Build workflows in n8n
   - Add webhook triggers
   - Configure in extension

2. **Customize Workflows**
   - Edit icons and names in Settings
   - Enable/disable context menu items
   - Export config for backup

3. **Use Context Menus**
   - Select text while browsing
   - Right-click → Chrome AI Workflows
   - Instant workflow execution

4. **Monitor History**
   - View recent executions in side panel
   - Click items to see details
   - Clear history when needed

## Support

For issues:
1. Check this guide
2. Check extension README.md
3. Check main project documentation
4. Open issue with:
   - Chrome version
   - Extension console errors
   - Service worker console errors
   - Steps to reproduce

---

**Happy Automating! 🚀**

Extension is now ready to use. Open the side panel and start running workflows!

