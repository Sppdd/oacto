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

**IMPORTANT**: Tokens are now managed through **n8n credentials**, not the webapp configuration. This provides better security and easier management.

### Step 1: Get Your Tokens
1. Join the Chrome AI Early Preview Program: https://goo.gle/chrome-ai-dev-preview-join
2. Generate tokens from: https://developer.chrome.com/origintrials/

### Step 2: Configure in n8n
1. **Open n8n** and go to **Settings → Credentials**
2. **Create/Edit "Chrome AI API"** credential
3. **Fill in your origin trial tokens** in the "Origin Trial Tokens" section:

   ```
   Prompt AI Token: [Your Prompt AI token]
   Writer API Token: [Your Writer token]
   Summarizer API Token: [Your Summarizer token]
   Translator API Token: [Your Translator token]
   Rewriter API Token: [Your Rewriter token]
   Proofreader API Token: [Your Proofreader token]
   Language Detector API Token: [Your Language Detector token]
   ```

4. **Save the credential**

### Step 3: Use in Workflows
- The tokens will be automatically sent to the webapp when workflows execute
- The webapp will update its token configuration dynamically
- No need to restart the webapp or modify any files

## Testing Token Configuration

1. **Open the webapp:**
   ```
   http://localhost:3333
   ```

2. **Configure tokens in n8n:**
   - Set up your Chrome AI API credentials in n8n with the tokens
   - Create a test workflow with a Chrome AI node

3. **Execute the workflow:**
   - The tokens will be sent automatically to the webapp
   - Check browser console for "🔄 Updating tokens from n8n" messages

4. **Check the UI:**
   - Dashboard should show "X/7 APIs available" (updated with new tokens)
   - Activity log will show token update confirmations

5. **Test individual APIs:**
   - Use the "Test AI" button to verify Prompt AI works
   - Check browser console for API availability messages with updated tokens

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
