// Default Workflow Configurations
// Matches the platform examples and common use cases

const DEFAULT_WORKFLOWS = [
  {
    id: 'haiku',
    name: 'AI Haiku Generator',
    description: 'Generate beautiful haikus',
    icon: '🎨',
    systemPrompt: 'You are a creative poet. Write beautiful haikus following the 5-7-5 syllable pattern.',
    contextMenu: true,
    quickAction: true,
    category: 'creative'
  },
  {
    id: 'summarize',
    name: 'Summarize Text',
    description: 'Create concise summaries',
    icon: '📝',
    systemPrompt: 'You are a professional summarizer. Create clear, concise summaries that capture the key points.',
    contextMenu: true,
    quickAction: true,
    category: 'productivity'
  },
  {
    id: 'translate',
    name: 'Translate Text',
    description: 'Translate to different languages',
    icon: '🌍',
    systemPrompt: 'You are a professional translator. Translate accurately while preserving meaning and tone.',
    contextMenu: true,
    quickAction: true,
    category: 'language'
  },
  {
    id: 'rewrite',
    name: 'Rewrite Text',
    description: 'Rephrase with different tone',
    icon: '✏️',
    systemPrompt: 'You are a professional writer. Rewrite text with improved clarity, style, and tone.',
    contextMenu: true,
    quickAction: true,
    category: 'writing'
  },
  {
    id: 'proofread',
    name: 'Proofread Text',
    description: 'Fix grammar and spelling',
    icon: '🔍',
    systemPrompt: 'You are a professional proofreader. Fix grammar, spelling, and style issues while maintaining the original meaning.',
    contextMenu: true,
    quickAction: true,
    category: 'writing'
  },
  {
    id: 'chat',
    name: 'AI Chat Assistant',
    description: 'General AI conversation',
    icon: '💬',
    systemPrompt: 'You are a helpful AI assistant. Provide accurate, helpful, and friendly responses.',
    contextMenu: false,
    quickAction: true,
    category: 'general'
  },
  {
    id: 'email',
    name: 'Email Writer',
    description: 'Write professional emails',
    icon: '📧',
    systemPrompt: 'You are a professional email writer. Write clear, concise, and appropriately toned emails.',
    contextMenu: true,
    quickAction: true,
    category: 'business'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review and improve code',
    icon: '💻',
    systemPrompt: 'You are an expert code reviewer. Analyze code for bugs, improvements, and best practices.',
    contextMenu: true,
    quickAction: true,
    category: 'development'
  }
];

// Workflow categories for organization
const WORKFLOW_CATEGORIES = {
  creative: { name: 'Creative', icon: '🎨' },
  productivity: { name: 'Productivity', icon: '⚡' },
  language: { name: 'Language', icon: '🌍' },
  writing: { name: 'Writing', icon: '✍️' },
  business: { name: 'Business', icon: '💼' },
  development: { name: 'Development', icon: '💻' },
  general: { name: 'General', icon: '💬' }
};

// Helper functions
function getWorkflowById(id) {
  return DEFAULT_WORKFLOWS.find(w => w.id === id);
}

function getWorkflowsByCategory(category) {
  return DEFAULT_WORKFLOWS.filter(w => w.category === category);
}

function getContextMenuWorkflows() {
  return DEFAULT_WORKFLOWS.filter(w => w.contextMenu);
}

function getQuickActionWorkflows() {
  return DEFAULT_WORKFLOWS.filter(w => w.quickAction);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_WORKFLOWS,
    WORKFLOW_CATEGORIES,
    getWorkflowById,
    getWorkflowsByCategory,
    getContextMenuWorkflows,
    getQuickActionWorkflows
  };
}