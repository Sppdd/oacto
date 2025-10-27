// Chrome AI Origin Trial Tokens Configuration
// Default tokens - can be overridden by n8n credentials
// Get your tokens from: https://developer.chrome.com/origintrials/

window.CHROME_AI_TOKENS = {
  // Language Model / Prompt API (already in HTML meta tag)
  'AIPromptAPIMultimodalInput': 'AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwfQ==',

  // Writer API - NOTE: This API requires user gestures and cannot be used in automated workflows
  // The token is valid but the API has restrictions that prevent n8n integration
  'WriterAPI': '', // Leave empty - will be provided by n8n credentials

  // Summarizer API
  'SummarizerAPI': '', // Leave empty - will be provided by n8n credentials

  // Translator API
  'TranslatorAPI': '', // Leave empty - will be provided by n8n credentials

  // Rewriter API
  'RewriterAPI': '', // Leave empty - will be provided by n8n credentials

  // Proofreader API
  'ProofreaderAPI': '', // Leave empty - will be provided by n8n credentials

  // Language Detector API
  'LanguageDetectorAPI': '' // Leave empty - will be provided by n8n credentials
};

// Function to inject origin trial tokens programmatically
function injectOriginTrialTokens() {
  const tokens = window.CHROME_AI_TOKENS;

  Object.entries(tokens).forEach(([feature, token]) => {
    if (token && token.trim() !== '') {
      try {
        const otMeta = document.createElement('meta');
        otMeta.httpEquiv = 'origin-trial';
        otMeta.content = token;
        document.head.appendChild(otMeta);
        console.log(`✅ Injected origin trial token for: ${feature}`);
      } catch (error) {
        console.warn(`❌ Failed to inject token for ${feature}:`, error);
      }
    }
  });
}

// Inject tokens when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectOriginTrialTokens);
} else {
  injectOriginTrialTokens();
}
