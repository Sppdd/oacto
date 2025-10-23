# Chrome AI Workflows Extension - Testing Guide

Complete testing checklist to verify all extension features work correctly.

## Pre-Testing Setup

Before running tests, ensure:

- [ ] Chrome AI enabled and model downloaded
- [ ] webapp server running on localhost:3333
- [ ] n8n running on localhost:5678
- [ ] Extension loaded in chrome://extensions/
- [ ] At least one n8n workflow with webhook trigger activated

## Test Suite

### Test 1: Extension Installation ✅

**Objective:** Verify extension loads without errors

**Steps:**
1. Open `chrome://extensions/`
2. Load unpacked extension
3. Check extension appears in list
4. Click "service worker" - console should show:
   ```
   Chrome AI Workflows background service worker loaded
   Loaded workflows: 6
   Context menus created
   ```

**Expected:**
- ✅ No errors in service worker console
- ✅ Extension icon appears in toolbar
- ✅ Default workflows loaded

**Actual:** _____

---

### Test 2: Side Panel Opens ✅

**Objective:** Verify side panel UI loads correctly

**Steps:**
1. Click extension icon in toolbar
2. Side panel should open on right side
3. Verify UI elements present:
   - Status indicators (Platform, Chrome AI)
   - Quick action buttons (Test AI, Platform, Refresh)
   - Workflow selector dropdown
   - Input textarea
   - Execute button (disabled initially)
   - History section (empty initially)

**Expected:**
- ✅ Side panel opens smoothly
- ✅ Dark theme applied correctly
- ✅ All UI elements visible
- ✅ No JavaScript errors in console

**Actual:** _____

---

### Test 3: Status Indicators ✅

**Objective:** Verify status checks work

**Steps:**
1. Open side panel
2. Check Platform status indicator:
   - Should be green if n8n is running
   - Red if n8n is not running
3. Check AI status indicator:
   - Should be green if Chrome AI available
   - Red if not available

**Expected:**
- ✅ Status indicators show correct state
- ✅ Colors update based on actual status

**Actual:** _____

---

### Test 4: Chrome AI Test ✅

**Objective:** Verify direct AI access works

**Steps:**
1. Open side panel
2. Click "✨ Test AI" button
3. Wait for response

**Expected:**
- ✅ Success message appears
- ✅ AI response included (e.g., "Hello World" or similar)
- ✅ No errors in console

**Actual:** _____

---

### Test 5: Workflow Dropdown Populates ✅

**Objective:** Verify workflows load correctly

**Steps:**
1. Open side panel
2. Click workflow dropdown
3. Verify default workflows appear:
   - 📝 Summarize Text
   - 🌍 Translate Text
   - ✏️ Rewrite Text
   - 🔍 Proofread Text
   - 💬 AI Chat Assistant
   - 🎨 Generate Haiku

**Expected:**
- ✅ All 6 default workflows appear
- ✅ Icons display correctly
- ✅ Dropdown is functional

**Actual:** _____

---

### Test 6: Workflow Execution ✅

**Objective:** Verify workflow execution end-to-end

**Setup:**
- Import `example-workflow.json` into n8n
- Activate the workflow
- Webhook URL: `http://localhost:5678/webhook/test`

**Steps:**
1. Add custom workflow in extension settings:
   - Name: Test Workflow
   - URL: http://localhost:5678/webhook/test
   - Icon: 🧪
2. Open side panel
3. Select "Test Workflow" from dropdown
4. Enter text: "Tell me a joke"
5. Click "▶️ Run Workflow"
6. Wait for response

**Expected:**
- ✅ Button shows loading state
- ✅ Response appears in results section
- ✅ Result contains AI-generated content
- ✅ Badge shows ✓ briefly
- ✅ History item appears in "Recent Executions"

**Actual:** _____

---

### Test 7: Context Menu ✅

**Objective:** Verify context menu integration

**Steps:**
1. Open any webpage (e.g., google.com)
2. Select some text on the page
3. Right-click selected text
4. Look for "Chrome AI Workflows" in menu
5. Click on it
6. Verify submenu appears with workflows

**Expected:**
- ✅ Context menu item appears
- ✅ Submenu shows workflows with icons
- ✅ Only workflows with `showInContextMenu: true` appear

**Actual:** _____

---

### Test 8: Context Menu Execution ✅

**Objective:** Verify workflow execution from context menu

**Steps:**
1. On a webpage, select text: "Machine learning is transforming technology"
2. Right-click → Chrome AI Workflows → 📝 Summarize Text
3. Side panel opens
4. Text should be pre-filled
5. Workflow should execute automatically

**Expected:**
- ✅ Side panel opens
- ✅ Selected text appears in input
- ✅ Workflow executes automatically
- ✅ Result displays

**Actual:** _____

---

### Test 9: Chat History ✅

**Objective:** Verify history tracking works

**Steps:**
1. Execute 3 different workflows
2. Check "Recent Executions" section
3. Should see 3 history items
4. Click on a history item
5. Result should display again

**Expected:**
- ✅ History items appear in order (most recent first)
- ✅ Each item shows workflow name, time, input preview
- ✅ Clicking item shows full result
- ✅ Success/error status indicated

**Actual:** _____

---

### Test 10: History Persistence ✅

**Objective:** Verify history survives browser restart

**Steps:**
1. Execute a workflow (shows in history)
2. Close Chrome completely
3. Reopen Chrome
4. Open side panel
5. Check "Recent Executions"

**Expected:**
- ✅ Previous history items still present
- ✅ No data loss

**Actual:** _____

---

### Test 11: Settings Page ✅

**Objective:** Verify settings page functionality

**Steps:**
1. Right-click extension icon → Options
2. Settings page opens
3. Test n8n connection
4. Check AI status
5. View workflows table

**Expected:**
- ✅ Settings page loads
- ✅ n8n URL pre-filled
- ✅ Test connection works
- ✅ AI status check works
- ✅ Workflows table shows all workflows

**Actual:** _____

---

### Test 12: Add Custom Workflow ✅

**Objective:** Verify adding workflows in settings

**Steps:**
1. Open Settings page
2. Click "➕ Add Workflow"
3. Enter:
   - Name: My Custom Workflow
   - URL: http://localhost:5678/webhook/custom
   - Icon: 🎯
   - Description: Custom test
4. Confirm all prompts
5. Check workflows table

**Expected:**
- ✅ Workflow appears in table
- ✅ Workflow saved to storage
- ✅ Workflow appears in side panel dropdown
- ✅ Context menus updated

**Actual:** _____

---

### Test 13: Edit Workflow ✅

**Objective:** Verify editing workflows

**Steps:**
1. In Settings, find a workflow
2. Click "✏️ Edit"
3. Change name to "Modified Name"
4. Confirm
5. Check table and side panel

**Expected:**
- ✅ Changes saved
- ✅ Table shows new name
- ✅ Dropdown shows new name
- ✅ Workflow still functional

**Actual:** _____

---

### Test 14: Delete Workflow ✅

**Objective:** Verify deleting workflows

**Steps:**
1. In Settings, find a workflow
2. Click "🗑️ Delete"
3. Confirm deletion
4. Check table and side panel

**Expected:**
- ✅ Workflow removed from table
- ✅ Workflow removed from dropdown
- ✅ Context menu updated

**Actual:** _____

---

### Test 15: Export Configuration ✅

**Objective:** Verify config export works

**Steps:**
1. In Settings, click "📤 Export Config"
2. File should download
3. Open downloaded JSON file

**Expected:**
- ✅ JSON file downloads
- ✅ File contains workflows, settings, history
- ✅ Valid JSON format

**Actual:** _____

---

### Test 16: Import Configuration ✅

**Objective:** Verify config import works

**Steps:**
1. In Settings, click "📥 Import Config"
2. Select exported JSON file
3. Confirm import
4. Check workflows table

**Expected:**
- ✅ Import succeeds
- ✅ Workflows loaded
- ✅ Settings restored
- ✅ No duplicates created

**Actual:** _____

---

### Test 17: Refresh from n8n ✅

**Objective:** Verify fetching workflows from n8n

**Steps:**
1. In n8n, create a new workflow with webhook trigger
2. Set path: `/dynamic-test`
3. Activate workflow
4. In side panel, click "🔄 Refresh"
5. Check dropdown

**Expected:**
- ✅ Success message appears
- ✅ New workflow appears in dropdown
- ✅ Workflow has webhook URL populated

**Actual:** _____

---

### Test 18: Copy Result ✅

**Objective:** Verify copy to clipboard works

**Steps:**
1. Execute a workflow
2. Result appears
3. Click "📋 Copy" button
4. Paste in a text editor

**Expected:**
- ✅ Button shows "✓ Copied" briefly
- ✅ Text copied to clipboard
- ✅ Pasted text matches result

**Actual:** _____

---

### Test 19: Clear History ✅

**Objective:** Verify clearing history

**Steps:**
1. Have some history items
2. Click "Clear" button in history header
3. Confirm deletion

**Expected:**
- ✅ Confirmation dialog appears
- ✅ All history cleared
- ✅ Shows "No executions yet"

**Actual:** _____

---

### Test 20: Badge Updates ✅

**Objective:** Verify extension badge changes

**Steps:**
1. Execute a workflow successfully
2. Watch extension icon badge
3. Execute a workflow that fails
4. Watch badge again

**Expected:**
- ✅ Green ✓ appears on success
- ✅ Red ✗ appears on failure
- ✅ Badge clears after 3 seconds

**Actual:** _____

---

### Test 21: Error Handling - n8n Offline ✅

**Objective:** Verify graceful error when n8n not running

**Steps:**
1. Stop n8n (close terminal or pkill)
2. Try to execute workflow
3. Check error message

**Expected:**
- ✅ Clear error message
- ✅ Suggests checking if n8n is running
- ✅ No JavaScript errors
- ✅ Badge shows error

**Actual:** _____

---

### Test 22: Error Handling - Chrome AI Unavailable ✅

**Objective:** Verify graceful error when AI not available

**Steps:**
1. Disable Chrome AI flags
2. Restart Chrome
3. Open side panel
4. Click "✨ Test AI"

**Expected:**
- ✅ AI status shows red
- ✅ Clear error message
- ✅ Suggests enabling flags

**Actual:** _____

---

### Test 23: Context Data Passing ✅

**Objective:** Verify context data is sent correctly

**Setup:**
- Workflow that logs the full webhook payload

**Steps:**
1. On a webpage with URL and title
2. Select text
3. Execute workflow from context menu
4. Check n8n execution log

**Expected:**
- ✅ Payload contains `text` field
- ✅ Payload contains `context.url`
- ✅ Payload contains `context.title`
- ✅ Payload contains `context.selection`

**Actual:** _____

---

### Test 24: Long Running Workflow ✅

**Objective:** Verify timeout handling

**Setup:**
- Workflow with sleep node (35 seconds)

**Steps:**
1. Execute the slow workflow
2. Wait for timeout

**Expected:**
- ✅ Shows loading state
- ✅ After ~30 seconds, shows timeout error
- ✅ Error message is clear

**Actual:** _____

---

### Test 25: Multiple Quick Executions ✅

**Objective:** Verify handling rapid workflow executions

**Steps:**
1. Execute 5 workflows rapidly (don't wait for results)
2. Check if all complete

**Expected:**
- ✅ All executions queued properly
- ✅ No race conditions
- ✅ All results displayed correctly
- ✅ History shows all 5 items

**Actual:** _____

---

## Performance Tests

### Test 26: Cold Start Performance ✅

**Measure:**
1. Fresh Chrome start
2. Load extension
3. Open side panel
4. Time to interactive

**Expected:** < 2 seconds

**Actual:** _____ seconds

---

### Test 27: Workflow Execution Performance ✅

**Measure:**
1. Simple workflow (just echo)
2. From click to result displayed

**Expected:** < 5 seconds

**Actual:** _____ seconds

---

### Test 28: Memory Usage ✅

**Measure:**
1. Check Task Manager
2. Chrome extension process memory
3. After 20 workflow executions

**Expected:** < 100MB

**Actual:** _____ MB

---

## Edge Cases

### Test 29: Empty Input ✅

**Steps:**
1. Select workflow
2. Leave input empty
3. Click execute

**Expected:**
- ✅ Error message: "Please enter some input"

**Actual:** _____

---

### Test 30: Very Long Input ✅

**Steps:**
1. Paste 5000+ characters
2. Execute workflow

**Expected:**
- ✅ Handles gracefully
- ✅ May timeout if too long
- ✅ No UI breaks

**Actual:** _____

---

### Test 31: Special Characters ✅

**Steps:**
1. Input: `{"test": "value"}` with quotes
2. Execute workflow

**Expected:**
- ✅ Characters escaped properly
- ✅ Workflow receives correct data

**Actual:** _____

---

### Test 32: No Workflows Configured ✅

**Steps:**
1. Clear all workflows in settings
2. Open side panel

**Expected:**
- ✅ Dropdown shows only "Choose a workflow..."
- ✅ Helpful message to configure workflows

**Actual:** _____

---

## Test Summary

**Total Tests:** 32

**Passed:** _____

**Failed:** _____

**Skipped:** _____

---

## Critical Path (Minimum for Release)

Must pass before considering extension ready:

- [ ] Test 1: Extension Installation
- [ ] Test 4: Chrome AI Test
- [ ] Test 6: Workflow Execution
- [ ] Test 7: Context Menu
- [ ] Test 8: Context Menu Execution
- [ ] Test 9: Chat History
- [ ] Test 11: Settings Page
- [ ] Test 12: Add Custom Workflow
- [ ] Test 21: Error Handling - n8n Offline

---

## Bug Report Template

If tests fail, report using:

```markdown
**Test:** Test #X - Name
**Status:** ❌ Failed
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Console Errors:** [Any errors from console]
**Steps to Reproduce:**
1. Step one
2. Step two
**Environment:**
- Chrome Version: ____
- Extension Version: ____
- n8n Version: ____
```

---

**Testing Complete!** ✅

All tests passed = Extension ready for use! 🚀

