// Storage Manager - Wrapper for chrome.storage.sync
// Handles saving/loading workflows, chat history, and settings

class StorageManager {
  constructor() {
    this.storage = chrome.storage.sync;
  }

  // Workflow Management
  async getWorkflows() {
    const result = await this.storage.get(['workflows']);
    return result.workflows || [];
  }

  async saveWorkflows(workflows) {
    await this.storage.set({ workflows });
  }

  async addWorkflow(workflow) {
    const workflows = await this.getWorkflows();
    workflows.push(workflow);
    await this.saveWorkflows(workflows);
  }

  async updateWorkflow(id, updatedWorkflow) {
    const workflows = await this.getWorkflows();
    const index = workflows.findIndex(w => w.id === id);
    if (index !== -1) {
      workflows[index] = { ...workflows[index], ...updatedWorkflow };
      await this.saveWorkflows(workflows);
    }
  }

  async deleteWorkflow(id) {
    const workflows = await this.getWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    await this.saveWorkflows(filtered);
  }

  // Chat History Management (limit to last 50 messages)
  async getChatHistory() {
    const result = await this.storage.get(['chatHistory']);
    return result.chatHistory || [];
  }

  async saveChatHistory(history) {
    // Keep only last 50 entries
    const limited = history.slice(-50);
    await this.storage.set({ chatHistory: limited });
  }

  async addChatMessage(message) {
    const history = await this.getChatHistory();
    history.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    await this.saveChatHistory(history);
  }

  async clearChatHistory() {
    await this.storage.set({ chatHistory: [] });
  }

  // Settings Management
  async getSettings() {
    const result = await this.storage.get(['settings']);
    return result.settings || {
      n8nUrl: 'http://localhost:5678',
      n8nApiKey: '',
      platformUrl: 'http://localhost:3333',
      autoRefreshWorkflows: true
    };
  }

  async saveSettings(settings) {
    await this.storage.set({ settings });
  }

  async updateSetting(key, value) {
    const settings = await this.getSettings();
    settings[key] = value;
    await this.saveSettings(settings);
  }

  // Export/Import Configuration
  async exportConfig() {
    const [workflows, settings, history] = await Promise.all([
      this.getWorkflows(),
      this.getSettings(),
      this.getChatHistory()
    ]);

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      workflows,
      settings,
      chatHistory: history
    };
  }

  async importConfig(config) {
    if (config.workflows) {
      await this.saveWorkflows(config.workflows);
    }
    if (config.settings) {
      await this.saveSettings(config.settings);
    }
    if (config.chatHistory) {
      await this.saveChatHistory(config.chatHistory);
    }
  }

  // Utility - Clear all data
  async clearAll() {
    await this.storage.clear();
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager };
}

