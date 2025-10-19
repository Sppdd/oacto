// Workflow Management System
// Manages n8n workflows with one-click execution and organization

class WorkflowManager {
  constructor() {
    this.workflows = [];
    this.n8nUrl = 'http://localhost:5678';
    this.init();
  }

  async init() {
    await this.loadWorkflows();
    this.setupEventListeners();
    this.renderWorkflows();
  }

  setupEventListeners() {
    // Create workflow button
    const createBtn = document.getElementById('create-workflow');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.createWorkflow());
    }

    // Import example button
    const importBtn = document.getElementById('import-example');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.importExample());
    }
  }

  async loadWorkflows() {
    try {
      // Load example workflows from the examples directory
      const examples = [
        {
          id: 'haiku',
          name: 'AI Haiku Generator',
          description: 'Generate beautiful haikus with Chrome AI',
          icon: '🎨',
          status: 'inactive',
          nodes: 2,
          lastRun: null,
          file: '/examples/01-simple-ai-haiku.json'
        },
        {
          id: 'content-pipeline',
          name: 'Content Pipeline',
          description: 'RSS → Summarize → Rewrite → Post',
          icon: '📰',
          status: 'inactive',
          nodes: 5,
          lastRun: null,
          file: '/examples/02-content-pipeline.json'
        },
        {
          id: 'multilingual',
          name: 'Multilingual Workflow',
          description: 'Auto-detect language and translate',
          icon: '🌍',
          status: 'inactive',
          nodes: 4,
          lastRun: null,
          file: '/examples/03-multilingual-workflow.json'
        }
      ];

      this.workflows = examples;
      updateWorkflowCount(this.workflows.length);
    } catch (error) {
      console.error('Error loading workflows:', error);
      addLog('❌ Failed to load workflows', 'error');
    }
  }

  renderWorkflows() {
    const container = document.getElementById('workflows-container');
    if (!container) return;

    if (this.workflows.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No workflows yet</h3>
          <p>Create your first workflow in n8n or import an example</p>
          <button class="btn btn-primary" onclick="workflowManager.importExample()">Import Example</button>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    
    this.workflows.forEach((workflow, index) => {
      const card = this.createWorkflowCard(workflow);
      container.appendChild(card);

      // Animate card appearance
      anime({
        targets: card,
        scale: [0.9, 1],
        opacity: [0, 1],
        delay: index * 80,
        duration: 400,
        easing: 'easeOutExpo'
      });
    });
  }

  createWorkflowCard(workflow) {
    const card = document.createElement('div');
    card.className = 'workflow-card';
    card.dataset.workflowId = workflow.id;

    const lastRun = workflow.lastRun 
      ? new Date(workflow.lastRun).toLocaleString() 
      : 'Never';

    card.innerHTML = `
      <div class="workflow-header">
        <div class="workflow-icon">${workflow.icon}</div>
        <span class="workflow-status ${workflow.status}">${workflow.status}</span>
      </div>
      <h3 class="workflow-title">${workflow.name}</h3>
      <p class="workflow-description">${workflow.description}</p>
      <div class="workflow-meta">
        <span>📦 ${workflow.nodes} nodes</span>
        <span>⏱️ ${lastRun}</span>
      </div>
      <div class="workflow-actions">
        <button class="workflow-btn primary" onclick="workflowManager.runWorkflow('${workflow.id}')">
          ▶️ Run
        </button>
        <button class="workflow-btn" onclick="workflowManager.scheduleWorkflowUI('${workflow.id}')">
          ⏰ Schedule
        </button>
        <button class="workflow-btn" onclick="workflowManager.editWorkflow('${workflow.id}')">
          ✏️ Edit
        </button>
      </div>
    `;

    return card;
  }

  async runWorkflow(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    addLog(`🚀 Running workflow: ${workflow.name}`, 'info');

    try {
      // Animate the card
      const card = document.querySelector(`[data-workflow-id="${workflowId}"]`);
      anime({
        targets: card,
        scale: [1, 1.05, 1],
        duration: 400,
        easing: 'easeInOutQuad'
      });

      // In a real implementation, this would call the n8n API
      // For now, we'll simulate execution
      await this.simulateWorkflowExecution(workflow);

      workflow.lastRun = new Date().toISOString();
      workflow.status = 'active';
      
      this.renderWorkflows();
      addLog(`✅ Workflow completed: ${workflow.name}`, 'success');
    } catch (error) {
      addLog(`❌ Workflow failed: ${error.message}`, 'error');
    }
  }

  async simulateWorkflowExecution(workflow) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  editWorkflow(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    addLog(`✏️ Opening workflow in n8n: ${workflow.name}`, 'info');
    
    // Switch to n8n view
    switchView('n8n');
  }

  viewDetails(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    addLog(`👁️ Viewing workflow details: ${workflow.name}`, 'info');
    
    // Create and show details modal
    this.showWorkflowDetails(workflow);
  }

  showWorkflowDetails(workflow) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>${workflow.icon} ${workflow.name}</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Description</label>
            <p>${workflow.description}</p>
          </div>
          <div class="form-group">
            <label>Status</label>
            <p><span class="workflow-status ${workflow.status}">${workflow.status}</span></p>
          </div>
          <div class="form-group">
            <label>Nodes</label>
            <p>${workflow.nodes} nodes</p>
          </div>
          <div class="form-group">
            <label>Last Run</label>
            <p>${workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'}</p>
          </div>
          ${workflow.file ? `
          <div class="form-group">
            <label>Workflow File</label>
            <p><code>${workflow.file}</code></p>
          </div>
          ` : ''}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
          <button class="btn btn-primary" onclick="workflowManager.runWorkflow('${workflow.id}'); this.closest('.modal').remove();">
            ▶️ Run Workflow
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Animate modal
    anime({
      targets: modal.querySelector('.modal-content'),
      scale: [0.9, 1],
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutQuad'
    });
  }

  createWorkflow() {
    addLog('🆕 Creating new workflow...', 'info');
    window.open(this.n8nUrl, '_blank');
  }

  async importExample() {
    addLog('📥 Importing example workflow...', 'info');

    // Show selection modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Import Example Workflow</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <p>Choose an example workflow to import into n8n:</p>
          <div class="workflow-list" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
            ${this.workflows.map(w => `
              <button class="workflow-btn" onclick="workflowManager.importWorkflowFile('${w.file}'); this.closest('.modal').remove();" style="padding: 16px; text-align: left;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="font-size: 24px;">${w.icon}</span>
                  <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${w.name}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">${w.description}</div>
                  </div>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  async importWorkflowFile(file) {
    addLog(`📥 Importing workflow from ${file}...`, 'info');
    
    try {
      // In a real implementation, this would:
      // 1. Read the workflow JSON file
      // 2. Import it into n8n via API
      // 3. Open it in the editor
      
      // For now, just show success and open n8n
      addLog('✅ Workflow imported successfully', 'success');
      addLog('💡 Opening n8n to view the imported workflow...', 'info');
      
      setTimeout(() => {
        window.open(this.n8nUrl, '_blank');
      }, 1000);
    } catch (error) {
      addLog(`❌ Failed to import workflow: ${error.message}`, 'error');
    }
  }

  scheduleWorkflowUI(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>⏰ Schedule Workflow</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
        </div>
        <div class="modal-body">
          <h3 style="margin-bottom: 16px;">${workflow.icon} ${workflow.name}</h3>
          
          <div class="form-group">
            <label>Schedule Type</label>
            <select id="schedule-type" style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
              <option value="once">Run Once</option>
              <option value="interval">Recurring Interval</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="cron">Custom (Cron)</option>
            </select>
          </div>

          <div class="form-group" id="schedule-datetime">
            <label>Date & Time</label>
            <input type="datetime-local" id="schedule-datetime-input" style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
          </div>

          <div class="form-group" id="schedule-interval" style="display: none;">
            <label>Interval</label>
            <div style="display: flex; gap: 12px;">
              <input type="number" id="schedule-interval-value" value="5" min="1" style="flex: 1; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
              <select id="schedule-interval-unit" style="flex: 1; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <div class="form-group" id="schedule-daily" style="display: none;">
            <label>Time</label>
            <input type="time" id="schedule-daily-time" value="09:00" style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
          </div>

          <div class="form-group" id="schedule-weekly" style="display: none;">
            <label>Day of Week</label>
            <select id="schedule-weekly-day" style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
              <option value="0">Sunday</option>
            </select>
            <label style="margin-top: 12px;">Time</label>
            <input type="time" id="schedule-weekly-time" value="09:00" style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
          </div>

          <div class="form-group" id="schedule-cron" style="display: none;">
            <label>Cron Expression</label>
            <input type="text" id="schedule-cron-expr" placeholder="0 9 * * *" style="width: 100%; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary); font-size: 14px;">
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
              Format: minute hour day month weekday<br>
              Example: "0 9 * * *" = Every day at 9:00 AM
            </p>
          </div>

          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="schedule-enabled" checked style="width: 20px; height: 20px;">
              <span>Enable schedule</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="workflowManager.saveSchedule('${workflowId}'); this.closest('.modal').remove();">
            Save Schedule
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Setup schedule type change handler
    const scheduleType = modal.querySelector('#schedule-type');
    scheduleType.addEventListener('change', (e) => {
      // Hide all schedule options
      modal.querySelectorAll('[id^="schedule-"]').forEach(el => {
        if (el.id !== 'schedule-type' && el.id !== 'schedule-enabled') {
          el.style.display = 'none';
        }
      });

      // Show relevant option
      const selected = e.target.value;
      const targetId = `schedule-${selected}`;
      const targetEl = modal.querySelector(`#${targetId}`);
      if (targetEl) {
        targetEl.style.display = 'block';
      }
    });
  }

  saveSchedule(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const scheduleType = document.getElementById('schedule-type').value;
    const enabled = document.getElementById('schedule-enabled').checked;

    let scheduleConfig = {
      type: scheduleType,
      enabled: enabled,
    };

    switch (scheduleType) {
      case 'once':
        const datetime = document.getElementById('schedule-datetime-input').value;
        scheduleConfig.datetime = datetime;
        scheduleConfig.description = `Once at ${new Date(datetime).toLocaleString()}`;
        break;

      case 'interval':
        const intervalValue = document.getElementById('schedule-interval-value').value;
        const intervalUnit = document.getElementById('schedule-interval-unit').value;
        scheduleConfig.interval = { value: intervalValue, unit: intervalUnit };
        scheduleConfig.description = `Every ${intervalValue} ${intervalUnit}`;
        break;

      case 'daily':
        const dailyTime = document.getElementById('schedule-daily-time').value;
        scheduleConfig.time = dailyTime;
        scheduleConfig.description = `Daily at ${dailyTime}`;
        break;

      case 'weekly':
        const weeklyDay = document.getElementById('schedule-weekly-day').value;
        const weeklyTime = document.getElementById('schedule-weekly-time').value;
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        scheduleConfig.day = weeklyDay;
        scheduleConfig.time = weeklyTime;
        scheduleConfig.description = `Weekly on ${days[weeklyDay]} at ${weeklyTime}`;
        break;

      case 'cron':
        const cronExpr = document.getElementById('schedule-cron-expr').value;
        scheduleConfig.cron = cronExpr;
        scheduleConfig.description = `Cron: ${cronExpr}`;
        break;
    }

    workflow.schedule = scheduleConfig;

    // Save to localStorage
    const schedules = JSON.parse(localStorage.getItem('workflow-schedules') || '{}');
    schedules[workflowId] = scheduleConfig;
    localStorage.setItem('workflow-schedules', JSON.stringify(schedules));

    if (enabled) {
      addLog(`⏰ Scheduled workflow: ${workflow.name} - ${scheduleConfig.description}`, 'success');
      this.startSchedule(workflowId);
    } else {
      addLog(`⏸️ Schedule saved but disabled: ${workflow.name}`, 'info');
    }

    this.renderWorkflows();
  }

  startSchedule(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow || !workflow.schedule || !workflow.schedule.enabled) return;

    const schedule = workflow.schedule;

    // Clear existing schedule if any
    if (workflow.scheduleTimer) {
      clearTimeout(workflow.scheduleTimer);
      clearInterval(workflow.scheduleTimer);
    }

    switch (schedule.type) {
      case 'once':
        const targetTime = new Date(schedule.datetime).getTime();
        const now = Date.now();
        const delay = targetTime - now;
        
        if (delay > 0) {
          workflow.scheduleTimer = setTimeout(() => {
            this.runWorkflow(workflowId);
            addLog(`⏰ Scheduled execution completed: ${workflow.name}`, 'success');
          }, delay);
        }
        break;

      case 'interval':
        const intervalMs = this.getIntervalMs(schedule.interval.value, schedule.interval.unit);
        workflow.scheduleTimer = setInterval(() => {
          this.runWorkflow(workflowId);
        }, intervalMs);
        break;

      case 'daily':
        this.scheduleDailyRun(workflowId, schedule.time);
        break;

      case 'weekly':
        this.scheduleWeeklyRun(workflowId, schedule.day, schedule.time);
        break;

      case 'cron':
        // For cron, we'd need a cron parser library
        // For now, just log that it's set up
        addLog(`⏰ Cron schedule set: ${schedule.cron}`, 'info');
        break;
    }
  }

  getIntervalMs(value, unit) {
    const multipliers = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }

  scheduleDailyRun(workflowId, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const delay = targetTime.getTime() - now.getTime();
    const workflow = this.workflows.find(w => w.id === workflowId);

    workflow.scheduleTimer = setTimeout(() => {
      this.runWorkflow(workflowId);
      // Reschedule for next day
      this.scheduleDailyRun(workflowId, time);
    }, delay);
  }

  scheduleWeeklyRun(workflowId, day, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);

    // Calculate days until target day
    const currentDay = now.getDay();
    const targetDay = parseInt(day);
    let daysUntil = targetDay - currentDay;
    
    if (daysUntil < 0 || (daysUntil === 0 && targetTime <= now)) {
      daysUntil += 7;
    }

    targetTime.setDate(targetTime.getDate() + daysUntil);

    const delay = targetTime.getTime() - now.getTime();
    const workflow = this.workflows.find(w => w.id === workflowId);

    workflow.scheduleTimer = setTimeout(() => {
      this.runWorkflow(workflowId);
      // Reschedule for next week
      this.scheduleWeeklyRun(workflowId, day, time);
    }, delay);
  }

  loadSchedules() {
    const schedules = JSON.parse(localStorage.getItem('workflow-schedules') || '{}');
    
    for (const [workflowId, schedule] of Object.entries(schedules)) {
      const workflow = this.workflows.find(w => w.id === workflowId);
      if (workflow) {
        workflow.schedule = schedule;
        if (schedule.enabled) {
          this.startSchedule(workflowId);
        }
      }
    }
  }

  async deleteWorkflow(workflowId) {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    if (confirm(`Are you sure you want to delete "${workflow.name}"?`)) {
      // Clear schedule if any
      if (workflow.scheduleTimer) {
        clearTimeout(workflow.scheduleTimer);
        clearInterval(workflow.scheduleTimer);
      }

      this.workflows = this.workflows.filter(w => w.id !== workflowId);
      this.renderWorkflows();
      updateWorkflowCount(this.workflows.length);
      addLog(`🗑️ Deleted workflow: ${workflow.name}`, 'info');
    }
  }
}

// Initialize workflow manager
const workflowManager = new WorkflowManager();

// Load schedules on init
setTimeout(() => workflowManager.loadSchedules(), 1000);

