// Platform API Client
// Handles communication with the Chrome AI Automation Platform server

class PlatformAPI {
  constructor(baseUrl = 'http://localhost:3333') {
    this.baseUrl = baseUrl;
    this.isConnected = false;
    this.timeout = 30000; // 30 seconds
  }

  // Check connection to platform server
  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/health`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  // Get all workflows from platform
  async getWorkflows() {
    try {
      const response = await fetch(`${this.baseUrl}/api/workflows`);
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          workflows: data.workflows,
          source: data.source || 'unknown'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch workflows',
          workflows: []
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error',
        workflows: []
      };
    }
  }

  // Execute workflow via platform
  async executeWorkflow(workflowId, input, options = {}) {
    try {
      const payload = {
        workflowId,
        input,
        options: {
          systemPrompt: options.systemPrompt,
          temperature: options.temperature || 0.8,
          outputLanguage: options.outputLanguage || 'en',
          webhookUrl: options.webhookUrl,
          useChromeAI: options.useChromeAI !== false,
          ...options
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/execute-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          result: data.result,
          workflowId: data.workflowId,
          timestamp: data.timestamp,
          method: data.method || 'unknown'
        };
      } else {
        return {
          success: false,
          error: data.error || 'Execution failed'
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - workflow took too long to execute'
        };
      }

      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  // Get session status
  async getSessionStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/api/sessions/status`);
      const data = await response.json();
      
      return {
        success: data.success || false,
        sessions: data.sessions || { count: 0, active: 0, idle: 0 }
      };
    } catch (error) {
      return {
        success: false,
        sessions: { count: 0, active: 0, idle: 0 }
      };
    }
  }

  // Test Chrome AI directly
  async testChromeAI(prompt = 'Hello, how are you?') {
    try {
      const payload = {
        userPrompt: prompt,
        temperature: 0.8,
        outputLanguage: 'en'
      };

      const response = await fetch(`${this.baseUrl}/api/prompt-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          result: data.result
        };
      } else {
        return {
          success: false,
          error: data.error || 'Chrome AI test failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  // Update configuration
  setConfig(baseUrl) {
    this.baseUrl = baseUrl;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlatformAPI };
}
