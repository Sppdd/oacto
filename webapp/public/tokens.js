// Chrome AI Origin Trial Tokens Configuration
// Add your origin trial tokens here for each Chrome AI API

window.CHROME_AI_TOKENS = {
  // Language Model / Prompt API (already in HTML meta tag)
  'AIPromptAPIMultimodalInput': 'AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJUHJvbXB0QVBJTXVsdGltb2RhbElucHV0IiwiZXhwaXJ5IjoxNzc0MzEwNDAwfQ==',

  // Writer API - NOTE: This API requires user gestures and cannot be used in automated workflows
  // The token is valid but the API has restrictions that prevent n8n integration
  'WriterAPI': 'ArpNhGWLfPhNhZeRY7Yo4vylR1/6QJuSs72LlnOcwr5LSP1bsPETSV1Ah8BmV6kCnQ1ai5ToqzeywOEp3C9dEAkAAABOeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMzMzMiLCJmZWF0dXJlIjoiQUlXcml0ZXJBUEkiLCJleHBpcnkiOjE3Njk0NzIwMDB9', // Add your token here

  // Summarizer API
  'SummarizerAPI': 'AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJU3VtYXJpYW5JbnB1dCIsImV4cGlyeSI6MTc3NDMxMDQwMH0=', // Add your token here

  // Translator API
  'TranslatorAPI': 'AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJVGVycm9yUmVwb3J0aW5nSW5wdXQiLCJleHBpcnkiOjE3NzQzMTA0MDB9', // Add your token here

  // Rewriter API
  'RewriterAPI': 'AojhfcGqHzb7SO1Ub4QLzTuxxq5/RLuh6ajN+ZAuC0zyiUqgEFu2Gutj/yRk96p1HaKoUQtMLN4s71E4gGfhAgIAAABQeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMzMzMiLCJmZWF0dXJlIjoiQUlSZXdyaXRlckFQSSIsImV4cGlyeSI6MTc2OTQ3MjAwMH0=', // Add your token here

  // Proofreader API
  'ProofreaderAPI': 'AnMrA5wFrOijf8o+rkjMjucY4AT/4dJgLZ15usP2PjMkEd94aSNFJEJC9frqQ3ZyZYwp1HrhZXuVEfh1mHKJJgIAAABTeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMzMzMiLCJmZWF0dXJlIjoiQUlQcm9vZnJlYWRlckFQSSIsImV4cGlyeSI6MTc3OTE0ODgwMH0=', // Add your token here

  // Language Detector API
  'LanguageDetectorAPI': 'AoXwZGsUZlGEyuueX5nR6tujynrCfWhNWQnZcHTy3AZkXtCMULt/UJs6+/1Bp5jVw7Ue96Tcyf1IO8IRUMimAgcAAABeeyJvcmlnaW4iOiJodHRwczovL2Nocm9tZS5kZXY6NDQzIiwiZmVhdHVyZSI6IkFJVGVuYW50RGV0ZXJtaW5hdG9ySW5wdXQiLCJleHBpcnkiOjE3NzQzMTA0MDB9' // Add your token here
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
