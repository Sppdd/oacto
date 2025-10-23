// N8N Client - Handles webhook calls and n8n API communication

class N8nClient {
  constructor(baseUrl = 'http://localhost:5678', apiKey = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.timeout = 30000; // 30 seconds
  }

  // Execute workflow via webhook
  async executeWorkflow(webhookUrl, data) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - workflow took too long to execute',
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to execute workflow',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Fetch workflows from n8n API
  async fetchWorkflows() {
    try {
      const url = `${this.baseUrl}/api/v1/workflows`;
      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.apiKey) {
        headers['X-N8N-API-KEY'] = this.apiKey;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Transform n8n workflows to our format
      const workflows = result.data || result;
      
      return {
        success: true,
        workflows: workflows.map(w => ({
          id: w.id,
          name: w.name,
          active: w.active,
          nodes: w.nodes?.length || 0,
          // Try to extract webhook URL from workflow nodes
          webhookUrl: this.extractWebhookUrl(w)
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to fetch workflows',
        workflows: []
      };
    }
  }

  // Extract webhook URL from workflow definition
  extractWebhookUrl(workflow) {
    if (!workflow.nodes) return null;
    
    const webhookNode = workflow.nodes.find(
      node => node.type === 'n8n-nodes-base.webhook'
    );
    
    if (webhookNode && webhookNode.parameters?.path) {
      return `${this.baseUrl}/webhook/${webhookNode.parameters.path}`;
    }
    
    return null;
  }

  // Test connection to n8n
  async testConnection() {
    try {
      const url = `${this.baseUrl}/healthz`;
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error('n8n server returned an error');
      }

      return {
        success: true,
        message: 'Connected to n8n successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to connect to n8n. Make sure n8n is running on ' + this.baseUrl
      };
    }
  }

  // Update configuration
  setConfig(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { N8nClient };
}

