/**
 * Kanban Board Module for TaskFlow
 * Manages Kanban columns, card drag-and-drop, and status updates.
 */

class KanbanBoard {
  constructor() {
    this.columns = [
      { id: 'todo', title: 'To Do', icon: 'circle', color: '#94a3b8' },
      { id: 'in-progress', title: 'In Progress', icon: 'clock', color: '#6366f1' },
      { id: 'in-review', title: 'Under Review', icon: 'eye', color: '#f59e0b' },
      { id: 'completed', title: 'Done', icon: 'check-circle-2', color: '#10b981' }
    ];
    this.draggedTaskId = null;
  }

  render(containerId, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const colsHtml = this.columns.map(col => {
      const colTasks = tasks.filter(t => t.status === col.id);

      const cardsHtml = colTasks.map(task => this.renderCard(task)).join('');

      return `
        <div class="kanban-column" data-status="${col.id}">
          <div class="kanban-column-header">
            <div class="kanban-col-title-group">
              <span class="kanban-col-indicator" style="background-color: ${col.color};"></span>
              <h3 class="kanban-col-title">${col.title}</h3>
              <span class="kanban-col-badge">${colTasks.length}</span>
            </div>
            <button class="btn-ghost-icon btn-add-col-task" data-status="${col.id}" title="Add task to ${col.title}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div class="kanban-dropzone" data-status="${col.id}">
            ${cardsHtml.length > 0 ? cardsHtml : `<div class="kanban-empty-dropzone">Drop tasks here</div>`}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="kanban-board-grid">
        ${colsHtml}
      </div>
    `;

    this.bindEvents(container);
  }

  renderCard(task) {
    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = task.status !== 'completed' && task.dueDate && task.dueDate < todayStr;
    const isDueToday = task.status !== 'completed' && task.dueDate && task.dueDate === todayStr;

    // Subtasks count
    const totalSub = task.subtasks ? task.subtasks.length : 0;
    const doneSub = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
    const subPercent = totalSub > 0 ? Math.round((doneSub / totalSub) * 100) : 0;

    let dueDateBadge = '';
    if (task.dueDate) {
      let dateClass = 'due-normal';
      let dateText = task.dueDate;
      if (isOverdue) {
        dateClass = 'due-overdue';
        dateText = `Overdue (${task.dueDate})`;
      } else if (isDueToday) {
        dateClass = 'due-today';
        dateText = 'Due Today';
      }

      dueDateBadge = `
        <span class="task-date-tag ${dateClass}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          ${dateText}
        </span>
      `;
    }

    let recurringBadge = '';
    if (task.recurring && task.recurring !== 'none') {
      recurringBadge = `
        <span class="recurring-badge" title="Repeats: ${task.recurring}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          ${task.recurring}
        </span>
      `;
    }

    return `
      <div
        class="kanban-card ${task.status === 'completed' ? 'is-completed' : ''}"
        draggable="true"
        data-task-id="${task.id}"
      >
        <div class="card-top-meta">
          <div class="card-badges-left">
            <span class="category-badge cat-${(task.category || 'general').toLowerCase().replace(/[^a-z0-9]/g, '')}">${this.escapeHtml(task.category || 'General')}</span>
            ${recurringBadge}
          </div>
          <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        </div>

        <h4 class="card-title">${this.escapeHtml(task.title)}</h4>
        ${task.description ? `<p class="card-desc">${this.escapeHtml(task.description)}</p>` : ''}

        ${totalSub > 0 ? `
          <div class="card-subtask-progress">
            <div class="subtask-progress-header">
              <span>Checklist</span>
              <span>${doneSub}/${totalSub}</span>
            </div>
            <div class="subtask-track">
              <div class="subtask-fill" style="width: ${subPercent}%;"></div>
            </div>
          </div>
        ` : ''}

        <div class="card-footer-meta">
          ${dueDateBadge}
          <div class="card-quick-actions">
            <button class="btn-card-action edit-task-btn" data-task-id="${task.id}" title="Edit Task">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button class="btn-card-action delete-task-btn" data-task-id="${task.id}" title="Delete Task">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(container) {
    const cards = container.querySelectorAll('.kanban-card');
    const dropzones = container.querySelectorAll('.kanban-dropzone');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.draggedTaskId = card.getAttribute('data-task-id');
        card.classList.add('is-dragging');
        e.dataTransfer.setData('text/plain', this.draggedTaskId);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        this.draggedTaskId = null;
        dropzones.forEach(dz => dz.classList.remove('drag-over'));
      });
    });

    dropzones.forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;
        const newStatus = zone.getAttribute('data-status');

        if (taskId && newStatus) {
          window.dispatchEvent(new CustomEvent('task:status-change', {
            detail: { taskId, newStatus }
          }));
        }
      });
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.kanban = new KanbanBoard();
