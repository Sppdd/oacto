// Chrome AI Client
// Handles direct Chrome AI API calls (fallback when platform is not available)

class ChromeAIClient {
  constructor() {
    this.isAvailable = false;
    this.checkAvailability();
  }

  // Check if Chrome AI is available
  async checkAvailability() {
    try {
      if (typeof LanguageModel !== 'undefined') {
        // Test with a simple session
        const testSession = await LanguageModel.create({
          temperature: 0.8,
          topK: 3,
          outputLanguage: 'en'
        });
        
        await testSession.prompt('test');
        testSession.destroy();
        
        this.isAvailable = true;
      } else {
        this.isAvailable = false;
      }
    } catch (error) {
      this.isAvailable = false;
    }
    
    return this.isAvailable;
  }

  // Execute a quick prompt
  async quickPrompt(prompt, options = {}) {
    if (!this.isAvailable) {
      throw new Error('Chrome AI not available');
    }

    const sessionConfig = {
      temperature: options.temperature || 0.8,
      topK: options.topK || 3,
      outputLanguage: options.outputLanguage || 'en' // Add output language
    };

    // Add system prompt if provided
    if (options.systemPrompt) {
      sessionConfig.initialPrompts = [{
        role: 'system',
        content: options.systemPrompt
      }];
    }

    const session = await LanguageModel.create(sessionConfig);
    
    try {
      const result = await session.prompt(prompt);
      return {
        success: true,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Chrome AI execution failed'
      };
    } finally {
      session.destroy();
    }
  }

  // Execute workflow with Chrome AI
  async executeWorkflow(workflowConfig, input) {
    if (!this.isAvailable) {
      throw new Error('Chrome AI not available');
    }

    const options = {
      systemPrompt: workflowConfig.systemPrompt,
      temperature: workflowConfig.temperature || 0.8
    };

    return await this.quickPrompt(input, options);
  }

  // Get availability status
  getStatus() {
    return {
      available: this.isAvailable,
      message: this.isAvailable ? 'Chrome AI is ready' : 'Chrome AI not available'
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ChromeAIClient };
}