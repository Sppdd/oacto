// Default workflow configurations
// These are example workflows that users can use out of the box

const DEFAULT_WORKFLOWS = [
  {
    id: 'summarize',
    name: 'Summarize Text',
    description: 'Create a concise summary of selected text',
    webhookUrl: 'http://localhost:5678/webhook/summarize',
    icon: '📝',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'translate',
    name: 'Translate Text',
    description: 'Translate text to another language',
    webhookUrl: 'http://localhost:5678/webhook/translate',
    icon: '🌍',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'rewrite',
    name: 'Rewrite Text',
    description: 'Rephrase text with different tone',
    webhookUrl: 'http://localhost:5678/webhook/rewrite',
    icon: '✏️',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'proofread',
    name: 'Proofread Text',
    description: 'Fix grammar and spelling errors',
    webhookUrl: 'http://localhost:5678/webhook/proofread',
    icon: '🔍',
    method: 'POST',
    acceptsContext: true,
    showInContextMenu: true,
    category: 'text-processing'
  },
  {
    id: 'chat',
    name: 'AI Chat Assistant',
    description: 'General AI conversation',
    webhookUrl: 'http://localhost:5678/webhook/chat',
    icon: '💬',
    method: 'POST',
    acceptsContext: false,
    showInContextMenu: false,
    category: 'chat'
  },
  {
    id: 'haiku',
    name: 'Generate Haiku',
    description: 'Create a beautiful haiku about any topic',
    webhookUrl: 'http://localhost:5678/webhook/haiku',
    icon: '🎨',
    method: 'POST',
    acceptsContext: false,
    showInContextMenu: false,
    category: 'creative'
  }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_WORKFLOWS };
}

