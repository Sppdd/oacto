// AI Session Management System
// Based on Google's Chrome AI session management best practices
// Implements persistent sessions with localStorage and intelligent cleanup

class AISessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionTemplate = null;
    this.conversationTemplate = null;
    this.activeSessionId = null;
    this.defaultParams = {
      defaultTopK: 3,
      defaultTemperature: 1.0,
    };
    this.init();
  }

  async init() {
    await this.loadParams();
    await this.restoreSessions();
    this.setupUI();
    this.updateSessionCount();
  }

  async loadParams() {
    try {
      if ('LanguageModel' in self) {
        const params = await LanguageModel.params();
        this.defaultParams = {
          defaultTopK: params.defaultTopK || 3,
          defaultTemperature: params.defaultTemperature || 1.0,
        };
      }
    } catch (error) {
      console.warn('Could not load AI params, using defaults:', error);
    }
  }

  getStoredUUIDs() {
    try {
      const uuids = localStorage.getItem('ai-session-uuids');
      if (!uuids) return [];
      return JSON.parse(uuids);
    } catch {
      return [];
    }
  }

  saveUUIDs(uuids) {
    localStorage.setItem('ai-session-uuids', JSON.stringify(uuids));
  }

  async restoreSessions() {
    const uuids = this.getStoredUUIDs();
    
    for (const uuid of uuids) {
      try {
        const storedOptions = localStorage.getItem(`ai-session-${uuid}`);
        if (!storedOptions) continue;

        const options = JSON.parse(storedOptions);
        
        // Create language model with stored options
        const assistant = await this.createLanguageModel(options);
        
        this.sessions.set(uuid, {
          assistant,
          options,
          createdAt: options.createdAt || new Date().toISOString(),
          lastUsed: options.lastUsed || new Date().toISOString(),
        });

        addLog(`🔄 Restored session: ${options.conversationSummary || 'Unnamed'}`, 'info');
      } catch (error) {
        console.error(`Failed to restore session ${uuid}:`, error);
        // Remove invalid session
        this.deleteSession(uuid);
      }
    }

    this.updateSessionCount();
  }

  async createLanguageModel(options) {
    if ('LanguageModel' in self) {
      return await LanguageModel.create(options);
    }
    throw new Error('LanguageModel API not available');
  }

  async createSession(options = {}) {
    try {
      const uuid = crypto.randomUUID();
      
      const sessionOptions = {
        initialPrompts: options.initialPrompts || [],
        topK: options.topK || this.defaultParams.defaultTopK,
        temperature: options.temperature || this.defaultParams.defaultTemperature,
        conversationSummary: options.conversationSummary || 'New conversation',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };

      const assistant = await this.createLanguageModel(sessionOptions);
      
      this.sessions.set(uuid, {
        assistant,
        options: sessionOptions,
        createdAt: sessionOptions.createdAt,
        lastUsed: sessionOptions.lastUsed,
      });

      // Save to localStorage
      const uuids = this.getStoredUUIDs();
      uuids.push(uuid);
      this.saveUUIDs(uuids);
      localStorage.setItem(`ai-session-${uuid}`, JSON.stringify(sessionOptions));

      addLog(`✨ Created new AI session: ${sessionOptions.conversationSummary}`, 'success');
      this.updateSessionCount();
      this.renderSessions();

      return uuid;
    } catch (error) {
      console.error('Failed to create session:', error);
      addLog(`❌ Failed to create session: ${error.message}`, 'error');
      throw error;
    }
  }

  async getSession(uuid) {
    const session = this.sessions.get(uuid);
    if (!session) {
      throw new Error(`Session ${uuid} not found`);
    }

    // Update last used time
    session.lastUsed = new Date().toISOString();
    session.options.lastUsed = session.lastUsed;
    localStorage.setItem(`ai-session-${uuid}`, JSON.stringify(session.options));

    return session;
  }

  async promptSession(uuid, prompt, streaming = false) {
    const session = await this.getSession(uuid);
    
    if (streaming) {
      return session.assistant.promptStreaming(prompt);
    } else {
      return await session.assistant.prompt(prompt);
    }
  }

  async addToSession(uuid, userPrompt, assistantResponse) {
    const session = await this.getSession(uuid);
    
    session.options.initialPrompts.push(
      {
        role: 'user',
        content: userPrompt,
      },
      {
        role: 'assistant',
        content: assistantResponse,
      }
    );

    // Update conversation summary
    try {
      const summaryAssistant = await this.createLanguageModel(session.options);
      const summary = await summaryAssistant.prompt(
        'Summarize the conversation as briefly as possible in one short sentence.'
      );
      session.options.conversationSummary = summary;
      summaryAssistant.destroy();
    } catch (error) {
      console.warn('Failed to update conversation summary:', error);
    }

    // Save to localStorage
    localStorage.setItem(`ai-session-${uuid}`, JSON.stringify(session.options));

    this.renderSessions();
  }

  async deleteSession(uuid) {
    const session = this.sessions.get(uuid);
    if (session && session.assistant) {
      try {
        session.assistant.destroy();
      } catch (error) {
        console.warn('Error destroying session:', error);
      }
    }

    this.sessions.delete(uuid);

    // Remove from localStorage
    const uuids = this.getStoredUUIDs().filter(id => id !== uuid);
    this.saveUUIDs(uuids);
    localStorage.removeItem(`ai-session-${uuid}`);

    addLog(`🗑️ Deleted AI session`, 'info');
    this.updateSessionCount();
    this.renderSessions();
  }

  async cleanupIdleSessions(maxIdleMinutes = 30) {
    const now = new Date();
    const sessionsToDelete = [];

    for (const [uuid, session] of this.sessions.entries()) {
      const lastUsed = new Date(session.lastUsed);
      const idleMinutes = (now - lastUsed) / 1000 / 60;

      if (idleMinutes > maxIdleMinutes) {
        sessionsToDelete.push(uuid);
      }
    }

    for (const uuid of sessionsToDelete) {
      await this.deleteSession(uuid);
    }

    if (sessionsToDelete.length > 0) {
      addLog(`🧹 Cleaned up ${sessionsToDelete.length} idle session(s)`, 'info');
    }
  }

  setupUI() {
    // Create session button
    const createBtn = document.getElementById('create-session');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.createSessionUI());
    }

    // Render initial sessions
    this.renderSessions();

    // Setup auto-cleanup (every 10 minutes)
    setInterval(() => this.cleanupIdleSessions(), 10 * 60 * 1000);
  }

  renderSessions() {
    const container = document.getElementById('sessions-container');
    if (!container) return;

    if (this.sessions.size === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🧠</div>
          <h3>No active sessions</h3>
          <p>Create a new AI session to start a conversation</p>
          <button class="btn btn-primary" onclick="sessionManager.createSessionUI()">Create Session</button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    let index = 0;
    for (const [uuid, session] of this.sessions.entries()) {
      const card = this.createSessionCard(uuid, session);
      container.appendChild(card);

      // Animate card
      anime({
        targets: card,
        opacity: [0, 1],
        translateY: [20, 0],
        delay: index * 60,
        duration: 400,
        easing: 'easeOutQuad'
      });

      index++;
    }
  }

  createSessionCard(uuid, session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    card.dataset.sessionId = uuid;

    const { assistant, options, createdAt, lastUsed } = session;
    const tokensUsed = assistant.inputUsage || assistant.tokensSoFar || 0;
    const tokensTotal = assistant.inputQuota || assistant.maxTokens || 0;
    const tokensLeft = tokensTotal - tokensUsed;
    const conversationLength = options.initialPrompts.length / 2;

    const createdDate = new Date(createdAt).toLocaleString();
    const lastUsedDate = new Date(lastUsed).toLocaleString();

    card.innerHTML = `
      <div class="session-header">
        <h3 class="session-title">${options.conversationSummary}</h3>
        <span class="session-badge">Active</span>
      </div>
      
      <div class="session-stats">
        <div class="session-stat">
          <div class="stat-value">${conversationLength}</div>
          <div class="stat-label">Messages</div>
        </div>
        <div class="session-stat">
          <div class="stat-value">${tokensUsed}</div>
          <div class="stat-label">Tokens Used</div>
        </div>
        <div class="session-stat">
          <div class="stat-value">${tokensLeft}</div>
          <div class="stat-label">Tokens Left</div>
        </div>
      </div>

      <div class="session-meta" style="font-size: 12px; color: var(--text-muted); margin: 16px 0;">
        <div>Created: ${createdDate}</div>
        <div>Last used: ${lastUsedDate}</div>
      </div>

      <div class="session-actions">
        <button class="workflow-btn primary" onclick="sessionManager.useSession('${uuid}')">
          💬 Continue
        </button>
        <button class="workflow-btn" onclick="sessionManager.viewSessionHistory('${uuid}')">
          📜 History
        </button>
        <button class="workflow-btn" onclick="sessionManager.deleteSession('${uuid}')">
          🗑️ Delete
        </button>
      </div>
    `;

    return card;
  }

  createSessionUI() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create New AI Session</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Session Name</label>
            <input type="text" id="session-name" placeholder="My AI Assistant" value="New conversation">
          </div>
          <div class="form-group">
            <label>System Prompt (optional)</label>
            <textarea id="session-system-prompt" placeholder="You are a helpful assistant..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Temperature: <span id="session-temp-value">1.0</span></label>
            <input type="range" id="session-temperature" min="0" max="2" step="0.1" value="1.0" 
                   oninput="document.getElementById('session-temp-value').textContent = this.value">
          </div>
          <div class="form-group">
            <label>Top K: <span id="session-topk-value">3</span></label>
            <input type="range" id="session-topk" min="1" max="10" step="1" value="3"
                   oninput="document.getElementById('session-topk-value').textContent = this.value">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="sessionManager.createSessionFromUI(); this.closest('.modal').remove();">
            Create Session
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  async createSessionFromUI() {
    const name = document.getElementById('session-name').value;
    const systemPrompt = document.getElementById('session-system-prompt').value;
    const temperature = parseFloat(document.getElementById('session-temperature').value);
    const topK = parseInt(document.getElementById('session-topk').value);

    const options = {
      conversationSummary: name,
      temperature,
      topK,
      initialPrompts: systemPrompt ? [{
        role: 'system',
        content: systemPrompt
      }] : []
    };

    await this.createSession(options);
  }

  useSession(uuid) {
    addLog(`💬 Using session: ${uuid}`, 'info');
    
    // Show interaction modal
    const session = this.sessions.get(uuid);
    if (!session) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>💬 ${session.options.conversationSummary}</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Your Message</label>
            <textarea id="session-prompt-${uuid}" placeholder="Type your message..." rows="4"></textarea>
          </div>
          <div id="session-response-${uuid}" class="test-result" style="display: none;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
          <button class="btn btn-primary" onclick="sessionManager.sendMessageToSession('${uuid}')">
            Send Message
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  async sendMessageToSession(uuid) {
    const promptInput = document.getElementById(`session-prompt-${uuid}`);
    const responseDiv = document.getElementById(`session-response-${uuid}`);
    const prompt = promptInput.value.trim();

    if (!prompt) return;

    try {
      responseDiv.style.display = 'block';
      responseDiv.textContent = 'Thinking...';

      const response = await this.promptSession(uuid, prompt);
      
      responseDiv.textContent = response;
      await this.addToSession(uuid, prompt, response);
      
      promptInput.value = '';
      addLog(`✅ Message sent to session`, 'success');
    } catch (error) {
      responseDiv.textContent = `Error: ${error.message}`;
      addLog(`❌ Failed to send message: ${error.message}`, 'error');
    }
  }

  viewSessionHistory(uuid) {
    const session = this.sessions.get(uuid);
    if (!session) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const history = session.options.initialPrompts
      .map((prompt, i) => {
        const role = prompt.role === 'user' ? '👤 You' : '🤖 AI';
        const className = prompt.role === 'user' ? 'user' : 'assistant';
        return `<div class="log-entry ${className}" style="margin-bottom: 12px;">
          <strong>${role}:</strong><br>
          ${prompt.content}
        </div>`;
      })
      .join('');

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>📜 Conversation History</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
          ${history || '<p style="color: var(--text-muted);">No conversation history yet.</p>'}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  updateSessionCount() {
    const countEl = document.getElementById('session-count');
    if (countEl) {
      countEl.textContent = `${this.sessions.size} Active`;
    }
  }

  // Get or create a session for workflow execution
  async getOrCreateWorkflowSession(workflowId, systemPrompt = null) {
    const sessionKey = `workflow-${workflowId}`;
    
    // Check if we have a session for this workflow
    for (const [uuid, session] of this.sessions.entries()) {
      if (session.options.workflowId === workflowId) {
        // Reuse existing session
        return uuid;
      }
    }

    // Create new session for workflow
    const uuid = await this.createSession({
      conversationSummary: `Workflow: ${workflowId}`,
      workflowId,
      initialPrompts: systemPrompt ? [{
        role: 'system',
        content: systemPrompt
      }] : []
    });

    return uuid;
  }
}

// Initialize session manager
const sessionManager = new AISessionManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.sessionManager = sessionManager;
}

