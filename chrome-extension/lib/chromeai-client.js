// Chrome AI Client - Wrapper for Chrome's built-in AI APIs
// Ported from webapp/public/app.js

class ChromeAIClient {
  constructor() {
    this.isAvailable = false;
    this.capabilities = {};
  }

  // Check if Chrome AI is available
  async checkAvailability() {
    try {
      // Check for LanguageModel in global scope
      if (!('LanguageModel' in self)) {
        return {
          available: false,
          reason: 'Chrome AI not enabled. Please enable in chrome://flags'
        };
      }

      // Test if we can create a session
      try {
        const testSession = await LanguageModel.create({
          temperature: 0.8,
          topK: 3
        });
        
        // Clean up test session
        testSession.destroy();
        
        this.isAvailable = true;
        return {
          available: true,
          reason: 'Gemini Nano active and ready'
        };
        
      } catch (createError) {
        // Check if it's a download issue
        if (createError.message.includes('download') || createError.message.includes('model')) {
          return {
            available: false,
            reason: 'AI model downloading. Please wait...',
            downloading: true
          };
        }
        throw createError;
      }
    } catch (error) {
      return {
        available: false,
        reason: error.message
      };
    }
  }

  // Prompt API - General LLM
  async promptAI(params) {
    const { systemPrompt, userPrompt, temperature } = params;

    if (!this.isAvailable) {
      throw new Error('Chrome AI not available. Enable in chrome://flags');
    }

    const sessionConfig = {
      temperature: temperature || 0.8,
      topK: 3
    };

    if (systemPrompt) {
      sessionConfig.initialPrompts = [{
        role: 'system',
        content: systemPrompt
      }];
    }

    const session = await LanguageModel.create(sessionConfig);
    
    try {
      const result = await session.prompt(userPrompt);
      return result;
    } finally {
      session.destroy();
    }
  }

  // Writer API
  async writer(params) {
    if (!('Writer' in self)) {
      throw new Error('Chrome Writer API not available');
    }

    const { prompt, tone, format, length } = params;

    const writer = await Writer.create({
      tone: tone || 'neutral',
      format: format || 'plain-text',
      length: length || 'medium',
    });

    try {
      const result = await writer.write(prompt);
      return result;
    } finally {
      writer.destroy();
    }
  }

  // Summarizer API
  async summarizer(params) {
    if (!('Summarizer' in self)) {
      throw new Error('Chrome Summarizer API not available');
    }

    const { text, type, format, length } = params;

    const summarizer = await Summarizer.create({
      type: type || 'tl;dr',
      format: format || 'plain-text',
      length: length || 'medium',
    });

    try {
      const result = await summarizer.summarize(text);
      return result;
    } finally {
      summarizer.destroy();
    }
  }

  // Translator API
  async translator(params) {
    if (!('Translator' in self)) {
      throw new Error('Chrome Translator API not available');
    }

    const { text, sourceLanguage, targetLanguage } = params;

    const translator = await Translator.create({
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage,
    });

    try {
      const result = await translator.translate(text);
      return result;
    } finally {
      translator.destroy();
    }
  }

  // Rewriter API
  async rewriter(params) {
    if (!('Rewriter' in self)) {
      throw new Error('Chrome Rewriter API not available');
    }

    const { text, tone, format, length } = params;

    const rewriter = await Rewriter.create({
      tone: tone || 'neutral',
      format: format || 'plain-text',
      length: length || 'same',
    });

    try {
      const result = await rewriter.rewrite(text);
      return result;
    } finally {
      rewriter.destroy();
    }
  }

  // Proofreader API
  async proofreader(params) {
    if (!('Proofreader' in self)) {
      throw new Error('Chrome Proofreader API not available');
    }

    const { text } = params;

    const proofreader = await Proofreader.create();

    try {
      const result = await proofreader.proofread(text);
      return result;
    } finally {
      proofreader.destroy();
    }
  }

  // Language Detector API
  async languageDetector(params) {
    if (!('LanguageDetector' in self)) {
      throw new Error('Chrome Language Detector API not available');
    }

    const { text } = params;

    const detector = await LanguageDetector.create();

    try {
      const results = await detector.detect(text);
      
      if (results && results.length > 0) {
        return results[0].language;
      }
      
      throw new Error('No language detected');
    } finally {
      detector.destroy();
    }
  }

  // Get all API capabilities
  async getCapabilities() {
    const capabilities = {
      languageModel: 'LanguageModel' in self,
      writer: 'Writer' in self,
      summarizer: 'Summarizer' in self,
      translator: 'Translator' in self,
      rewriter: 'Rewriter' in self,
      proofreader: 'Proofreader' in self,
      languageDetector: 'LanguageDetector' in self
    };

    this.capabilities = capabilities;
    return capabilities;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChromeAIClient };
}

