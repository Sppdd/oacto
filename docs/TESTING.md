# Testing Guide

How to test the complete Chrome AI × n8n integration.

## Prerequisites

Before testing:
- [ ] Bridge server running
- [ ] Chrome extension loaded
- [ ] n8n running
- [ ] Chrome AI enabled and model downloaded

## Test 1: Bridge Server Health

### Via cURL

```bash
curl http://localhost:3333/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Chrome AI bridge ready",
  "timestamp": "2024-10-14T..."
}
```

If `"status": "no-extension"`:
- Load Chrome extension
- Check extension console (chrome://extensions/ → service worker)

## Test 2: Extension Connection

### Check Extension Popup

```
1. Click extension icon
2. Should show:
   Bridge Server: ✅ Connected
   Chrome AI: ✅ Available
```

### Check Service Worker Console

```
1. chrome://extensions/
2. Find "Chrome AI Bridge for n8n"
3. Click "service worker" link
4. Console should show:
   "Chrome AI Bridge service worker loaded"
   "✅ Connected to bridge server"
```

## Test 3: Direct AI API Call

### Via cURL to Bridge

```bash
curl -X POST http://localhost:3333/api/prompt-ai \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt": "Say hello in a haiku",
    "temperature": 0.8
  }'
```

**Expected response:**
```json
{
  "success": true,
  "result": "Lines of code flow free\nAutomation dreams take flight\nSilent help, pure joy"
}
```

## Test 4: n8n Credentials

### Create and Test

```
1. n8n → Settings → Credentials
2. Add "Chrome AI API"
3. Bridge URL: http://localhost:3333
4. Click "Test"
5. Should show: ✅ Connection successful
```

If fails:
- Check bridge server is running
- Check URL is correct
- Check for firewall issues

## Test 5: Simple Workflow in n8n

### Create Test Workflow

```
1. New workflow in n8n
2. Add nodes:
   - Manual Trigger
   - Chrome Prompt AI
3. Configure Prompt AI:
   - Credentials: Chrome AI Bridge
   - User Prompt: "Count from 1 to 5"
   - Temperature: 0.3
4. Connect nodes
5. Click "Execute Workflow"
```

**Expected output:**
```json
{
  "aiResult": "1, 2, 3, 4, 5",
  "_meta": {
    "prompt": "Count from 1 to 5",
    "temperature": 0.3,
    "timestamp": "2024-10-14T...",
    "model": "gemini-nano"
  }
}
```

## Test 6: All AI Nodes

### Import Test Workflow

Create workflow with all 7 nodes:

```json
{
  "nodes": [
    {
      "name": "Manual",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "name": "1. Prompt AI",
      "type": "n8n-nodes-chrome-ai.chromePromptAi",
      "parameters": {
        "userPrompt": "Write one sentence about AI"
      }
    },
    {
      "name": "2. Writer",
      "type": "n8n-nodes-chrome-ai.chromeWriter",
      "parameters": {
        "prompt": "AI automation benefits",
        "tone": "formal"
      }
    },
    {
      "name": "3. Summarizer",
      "type": "n8n-nodes-chrome-ai.chromeSummarizer",
      "parameters": {
        "text": "={{$node['2. Writer'].json.generatedText}}",
        "type": "tl;dr"
      }
    },
    {
      "name": "4. Translator",
      "type": "n8n-nodes-chrome-ai.chromeTranslator",
      "parameters": {
        "text": "Hello world",
        "targetLanguage": "es"
      }
    },
    {
      "name": "5. Rewriter",
      "type": "n8n-nodes-chrome-ai.chromeRewriter",
      "parameters": {
        "text": "Hey there buddy!",
        "tone": "more-formal"
      }
    },
    {
      "name": "6. Proofreader",
      "type": "n8n-nodes-chrome-ai.chromeProofreader",
      "parameters": {
        "text": "This sentance has erors"
      }
    },
    {
      "name": "7. Language Detector",
      "type": "n8n-nodes-chrome-ai.chromeLanguageDetector",
      "parameters": {
        "text": "Bonjour le monde"
      }
    }
  ]
}
```

Execute and verify each node produces output.

## Test 7: Error Handling

### Test Invalid Prompt

```
Create workflow:
- Prompt AI with empty prompt
- Should show error message
```

### Test Bridge Disconnection

```
1. Stop bridge server
2. Execute workflow
3. Should show: "Bridge not responding"
4. Restart bridge
5. Execute again - should work
```

### Test AI Unavailable

```
1. Close all Chrome windows
2. Execute workflow
3. Should handle gracefully
```

## Test 8: Performance

### Measure Latency

```bash
# Time a simple request
time curl -X POST http://localhost:3333/api/prompt-ai \
  -H "Content-Type: application/json" \
  -d '{"userPrompt": "Say hi"}'
```

**Expected**: < 2 seconds for simple prompts

### Test Load

Execute workflow 10 times in succession:
- All should complete
- No crashes
- Consistent performance

## Test 9: Integration Test

### Complete Workflow Test

```
Scenario: RSS → Summarize → Translate → Post

1. Add RSS Feed node
2. Chrome Summarizer (condense article)
3. Chrome Translator (EN → ES)
4. Chrome Proofreader (polish)
5. HTTP Request (post to webhook.site)
6. Execute
7. Verify output at webhook.site
```

## Test 10: Production Readiness

### Checklist

- [ ] All 7 nodes execute without errors
- [ ] Bridge handles disconnections gracefully
- [ ] Extension reconnects automatically
- [ ] Error messages are clear and actionable
- [ ] Workflows with 10+ AI nodes complete successfully
- [ ] Performance is acceptable (< 5s per node)
- [ ] No memory leaks after extended use
- [ ] Documentation is complete and accurate

## Automated Testing

### Unit Tests (Coming Soon)

```bash
cd packages/n8n-nodes-chrome-ai
npm test
```

### Integration Tests

```bash
# Test all endpoints
cd packages/chrome-extension/server
npm test
```

## Debugging

### Enable Verbose Logging

**Bridge Server:**
Add to `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

**Extension:**
```javascript
// In service-worker.js
console.log('Request:', message);
console.log('Response:', response);
```

### Monitor WebSocket

Use browser extension like "WebSocket King" to monitor `ws://localhost:3334`

### Network Tab

```
1. F12 → Network tab
2. Filter: "WS" (WebSocket)
3. See real-time messages
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Timeout | Increase timeout in ChromeAiClient |
| Connection refused | Start bridge server |
| 503 errors | Load Chrome extension |
| Slow performance | Close unnecessary Chrome tabs |
| Memory issues | Destroy AI sessions after use |

---

## Success Criteria

All tests pass:
- ✅ Bridge health check returns "ok"
- ✅ Extension shows connected status
- ✅ Direct API call succeeds
- ✅ n8n credentials test succeeds
- ✅ Simple workflow executes
- ✅ All 7 nodes work independently
- ✅ Chained workflows complete
- ✅ Error handling works gracefully
- ✅ Performance is acceptable
- ✅ No crashes or hangs

**Ready for production!** 🎉

See `docs/SETUP.md` for deployment instructions.

