# Chrome AI Workflows Extension - Installation & Testing Guide

## 🚀 Quick Installation

### Step 1: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder from your project
5. The extension should appear in your extensions list

### Step 2: Pin Extension

1. Click the **puzzle piece icon** in Chrome toolbar
2. Find **Chrome AI Workflows** and click the **pin icon**
3. The extension icon should now appear in your toolbar

### Step 3: Verify Installation

- Extension icon should show in toolbar
- Clicking it should open the side panel
- Right-click on selected text should show context menu

---

## 🧪 Testing the Extension

### Test 1: Basic Functionality

1. **Open Side Panel**
   - Click extension icon
   - Should see dark-themed interface
   - Status indicators should show connection status

2. **Test AI Connection**
   - Click **✨ Test AI** button
   - Should generate a haiku about automation
   - If fails, check Chrome AI setup

3. **Test Platform Connection**
   - Click **🚀 Platform** button
   - Should open `http://localhost:3333`
   - If fails, start platform server

### Test 2: Workflow Execution

1. **Load Workflows**
   - Click **🔄 Refresh** button
   - Should load workflows from n8n or examples
   - Workflow selector should populate

2. **Execute Workflow**
   - Select a workflow from dropdown
   - Type some text in input area
   - Click **▶️ Run Workflow**
   - Should see result in results section

3. **Test Context Menu**
   - Select text on any webpage
   - Right-click → **Send to Chrome AI Workflows**
   - Side panel should open with text pre-filled

### Test 3: Advanced Features

1. **Execution History**
   - Execute several workflows
   - Check history section shows recent executions
   - Click on history item to reload

2. **Copy Results**
   - Execute a workflow
   - Click **📋 Copy** button
   - Paste somewhere to verify

3. **Settings Page**
   - Right-click extension icon → **Options**
   - Test connection buttons
   - Modify settings and save

---

## 🔧 Troubleshooting

### Extension Not Loading

**Problem**: Extension doesn't appear in `chrome://extensions/`

**Solutions**:
1. Check Developer mode is enabled
2. Verify you selected the correct `chrome-extension` folder
3. Look for error messages in the extensions page
4. Try refreshing the extensions page

### Side Panel Not Opening

**Problem**: Clicking extension icon doesn't open side panel

**Solutions**:
1. Check Chrome version (needs Chrome 114+)
2. Try right-clicking extension icon → **Inspect popup**
3. Check browser console for errors
4. Reload the extension

### No Workflows Showing

**Problem**: Workflow selector is empty

**Solutions**:
1. Check if n8n is running on `http://localhost:5678`
2. Check if platform server is running on `http://localhost:3333`
3. Click **🔄 Refresh** button
4. Check browser console for API errors

### Context Menu Not Appearing

**Problem**: Right-click doesn't show Chrome AI options

**Solutions**:
1. Reload the extension
2. Check extension permissions
3. Try on different websites
4. Check if context menu is enabled in settings

### Chrome AI Not Working

**Problem**: AI test fails or workflows don't execute

**Solutions**:
1. Verify Chrome AI is enabled (see platform setup)
2. Check `chrome://flags` for AI flags
3. Download AI model in `chrome://components/`
4. Restart Chrome completely

### Platform Connection Failed

**Problem**: Platform status shows disconnected

**Solutions**:
1. Start platform server: `cd webapp && npm start`
2. Open `http://localhost:3333` in Chrome
3. Keep the platform tab open
4. Check firewall settings

---

## 📊 Expected Behavior

### Status Indicators

| Indicator | Meaning | Action |
|-----------|---------|--------|
| 🟢 Green | Connected/Ready | Everything working |
| 🟡 Yellow | Warning | Partial functionality |
| 🔴 Red | Error/Disconnected | Check connections |

### Badge States

| Badge | Meaning |
|-------|---------|
| ✓ Green | Platform connected |
| ! Red | Platform disconnected |
| ✗ Red | Extension error |

### Workflow Sources

The extension tries to load workflows in this order:
1. **n8n API** - Real workflows from your n8n instance
2. **Examples** - Fallback to example workflows
3. **Default** - Built-in workflow configurations

---

## 🎯 Success Criteria

Extension is working correctly when:

- ✅ **Extension loads** without errors
- ✅ **Side panel opens** when clicking icon
- ✅ **Status indicators** show green when platform is running
- ✅ **Workflows load** from n8n or examples
- ✅ **AI test** generates a haiku
- ✅ **Context menu** appears on text selection
- ✅ **Workflow execution** produces results
- ✅ **History** saves and displays executions
- ✅ **Settings page** opens and saves configuration

---

## 🔄 Development Workflow

### Making Changes

1. **Edit files** in `chrome-extension/` folder
2. **Reload extension** in `chrome://extensions/`
3. **Test changes** in side panel
4. **Check console** for errors

### Debugging

1. **Extension Console**
   - Right-click extension icon → **Inspect popup**
   - Check console for errors

2. **Background Script**
   - Go to `chrome://extensions/`
   - Click **service worker** link
   - Check console for errors

3. **Side Panel Console**
   - Open side panel
   - Right-click → **Inspect**
   - Check console for errors

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Side panel opens and displays correctly
- [ ] Status indicators work
- [ ] Workflows load from n8n
- [ ] AI execution works
- [ ] Context menu functions
- [ ] History saves and loads
- [ ] Settings page works
- [ ] Badge updates correctly

---

## 📚 Additional Resources

- **Platform Guide**: `PLATFORM-GUIDE.md`
- **Extension Development**: `EXTENSION-DEVELOPMENT-PROMPT.md`
- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/
- **Chrome AI Docs**: https://developer.chrome.com/docs/ai/

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this guide** first
2. **Review console errors** in DevTools
3. **Test individual components** (platform, n8n, Chrome AI)
4. **Restart everything** (Chrome, servers, extension)
5. **Check GitHub issues** for similar problems

**Happy automating!** 🚀