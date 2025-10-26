# Chrome AI Origin Trial Tokens Configuration

This document explains how to configure origin trial tokens for Chrome AI APIs to enable all Chrome AI features in your n8n workflows.

## What are Origin Trial Tokens?

Origin trial tokens are special tokens provided by Google that enable experimental Chrome features like the AI APIs. Without these tokens, the Chrome AI APIs won't be available.

## How to Get Tokens

1. **Join the Chrome AI Early Preview Program:**
   - Visit: https://goo.gle/chrome-ai-dev-preview-join
   - Sign up for the program
   - Wait for approval (can take a few days)

2. **Get Origin Trial Tokens:**
   - After approval, go to: https://developer.chrome.com/origintrials/
   - Find the Chrome AI APIs section
   - Generate tokens for each API you need

3. **Available APIs and Features:**

   | API | Feature Name | Description |
   |-----|-------------|-------------|
   | Prompt AI | `AIPromptAPIMultimodalInput` | Language Model for general AI tasks |
   | Writer | `WriterAPI` | Text generation with tone control |
   | Summarizer | `SummarizerAPI` | Text summarization |
   | Translator | `TranslatorAPI` | Translation between languages |
   | Rewriter | `RewriterAPI` | Text rewriting with tone changes |
   | Proofreader | `ProofreaderAPI` | Grammar and spelling correction |
   | Language Detector | `LanguageDetectorAPI` | Language identification |

## How to Configure Tokens

1. **Edit the tokens.js file:**
   ```bash
   cd webapp/public/
   nano tokens.js
   ```

2. **Add your tokens:**
   ```javascript
   window.CHROME_AI_TOKENS = {
     // Language Model / Prompt API (already configured)
     'AIPromptAPIMultimodalInput': 'AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwfQ==',

     // Writer API - Add your token here
     'WriterAPI': 'YOUR_WRITER_API_TOKEN_HERE',

     // Summarizer API - Add your token here
     'SummarizerAPI': 'YOUR_SUMMARIZER_API_TOKEN_HERE',

     // Translator API - Add your token here
     'TranslatorAPI': 'YOUR_TRANSLATOR_API_TOKEN_HERE',

     // Rewriter API - Add your token here
     'RewriterAPI': 'YOUR_REWRITER_API_TOKEN_HERE',

     // Proofreader API - Add your token here
     'ProofreaderAPI': 'YOUR_PROOFREADER_API_TOKEN_HERE',

     // Language Detector API - Add your token here
     'LanguageDetectorAPI': 'YOUR_LANGUAGE_DETECTOR_API_TOKEN_HERE'
   };
   ```

3. **Restart the webapp:**
   ```bash
   cd webapp/
   npm start
   ```

## Testing Token Configuration

1. **Open the webapp:**
   ```
   http://localhost:3333
   ```

2. **Check the browser console (F12):**
   - Look for "🔐 Origin Trial Tokens Status" messages
   - Should show which tokens are configured vs missing

3. **Check the UI:**
   - Dashboard should show "X/7 APIs available"
   - Activity log will show token injection status

4. **Test individual APIs:**
   - Use the "Test AI" button to verify Prompt AI works
   - Check browser console for API availability messages

## Troubleshooting

### "Missing APIs" in console
- Make sure you have tokens for each API you want to use
- Tokens must be valid and not expired
- Check that the domain matches your token's origin

### "Token injection failed"
- Check browser console for specific error messages
- Verify tokens are valid base64 strings
- Make sure you're using HTTPS if tokens require it

### APIs still not available
- Hard refresh the page (Ctrl+Shift+R)
- Check chrome://flags to ensure AI flags are enabled
- Verify the AI model is downloaded (chrome://components/)

## Token Format

Tokens should be long base64-encoded strings like:
```
AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwfQ==
```

## Security Notes

- Keep your tokens private
- Tokens are tied to specific origins (domains)
- Tokens have expiration dates (check the decoded token)
- Don't commit tokens to version control

## Need Help?

- Check the Chrome AI documentation: https://developer.chrome.com/docs/ai/built-in-apis
- Join the Chrome AI developer community
- Check the troubleshooting guide in `docs/TROUBLESHOOTING.md`
