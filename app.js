/**
 * Main Application Orchestrator for TaskFlow
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentTab: 'analytics', // 'analytics', 'kanban', 'list'
    searchQuery: '',
    filterCategory: 'all',
    filterPriority: 'all',
    filterStatus: 'all',
    filterRecurring: 'all',
    sortBy: 'dueDate-asc',
    editingTaskId: null,
    tempSubtasks: [],
    confirmResolve: null
  };

  // DOM Elements
  const appContainer = document.getElementById('app');
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewSections = document.querySelectorAll('.view-section');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const searchInput = document.getElementById('taskSearchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const statusFilter = document.getElementById('statusFilter');
  const recurringFilter = document.getElementById('recurringFilter');
  const sortSelect = document.getElementById('sortSelect');
  const openNewTaskModalBtn = document.getElementById('openNewTaskModalBtn');
  const taskModal = document.getElementById('taskModal');
  const taskModalCloseBtn = document.getElementById('taskModalCloseBtn');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const taskForm = document.getElementById('taskForm');
  const modalTitle = document.getElementById('modalTitle');
  const subtasksListContainer = document.getElementById('subtasksListContainer');
  const newSubtaskInput = document.getElementById('newSubtaskInput');
  const addSubtaskBtn = document.getElementById('addSubtaskBtn');
  const taskRecurringInput = document.getElementById('taskRecurringInput');

  // Utility Actions
  const exportDataBtn = document.getElementById('exportDataBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const importFileInput = document.getElementById('importFileInput');
  const importDataBtn = document.getElementById('importDataBtn');
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  const notificationToggleBtn = document.getElementById('notificationToggleBtn');
  const notificationBadge = document.getElementById('notificationBadge');

  // Confirmation Modal Elements
  const confirmModal = document.getElementById('confirmModal');
  const confirmCancelBtn = document.getElementById('confirmCancelBtn');
  const confirmOkBtn = document.getElementById('confirmOkBtn');
  const confirmModalTitle = document.getElementById('confirmModalTitle');
  const confirmModalMessage = document.getElementById('confirmModalMessage');

  // Toasts
  const toastContainer = document.getElementById('toastContainer');

  // Initialize Theme
  const savedTheme = window.storage.getTheme();
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Initialize Application
  renderAll();
  updateNotificationStatus(false);

  // Navigation tab switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.getAttribute('data-tab');
      switchTab(targetView);
    });
  });

  function switchTab(viewName) {
    state.currentTab = viewName;
    navTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === viewName));
    viewSections.forEach(v => v.classList.toggle('active', v.id === `${viewName}View`));
    renderAll();
  }

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    window.storage.setTheme(next);
    updateThemeIcon(next);
    showToast(`Switched to ${next} theme`, 'info');
  });

  function updateThemeIcon(theme) {
    const isDark = theme === 'dark';
    themeToggleBtn.innerHTML = isDark
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  }

  // Filter & Search Handlers
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderCurrentViewOnly();
  });

  categoryFilter.addEventListener('change', (e) => {
    state.filterCategory = e.target.value;
    renderCurrentViewOnly();
  });

  priorityFilter.addEventListener('change', (e) => {
    state.filterPriority = e.target.value;
    renderCurrentViewOnly();
  });

  statusFilter.addEventListener('change', (e) => {
    state.filterStatus = e.target.value;
    renderCurrentViewOnly();
  });

  if (recurringFilter) {
    recurringFilter.addEventListener('change', (e) => {
      state.filterRecurring = e.target.value;
      renderCurrentViewOnly();
    });
  }

  sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderCurrentViewOnly();
  });

  // Modal Open / Close
  openNewTaskModalBtn.addEventListener('click', () => {
    openModalForNewTask();
  });

  taskModalCloseBtn.addEventListener('click', closeModal);
  cancelTaskBtn.addEventListener('click', closeModal);

  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) closeModal();
  });

  function openModalForNewTask(defaultStatus = 'todo') {
    state.editingTaskId = null;
    state.tempSubtasks = [];
    modalTitle.textContent = 'Create New Task';
    taskForm.reset();
    document.getElementById('taskStatusInput').value = defaultStatus;
    document.getElementById('taskPriorityInput').value = 'medium';
    document.getElementById('taskCategoryInput').value = 'Dev';
    if (taskRecurringInput) taskRecurringInput.value = 'none';
    document.getElementById('taskDueDateInput').value = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    renderModalSubtasks();
    taskModal.classList.add('active');
    document.getElementById('taskTitleInput').focus();
  }

  function openModalForEdit(taskId) {
    const task = window.storage.getById(taskId);
    if (!task) return;

    state.editingTaskId = taskId;
    state.tempSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : [];
    modalTitle.textContent = 'Edit Task';

    document.getElementById('taskTitleInput').value = task.title || '';
    document.getElementById('taskDescInput').value = task.description || '';
    document.getElementById('taskPriorityInput').value = task.priority || 'medium';
    document.getElementById('taskStatusInput').value = task.status || 'todo';
    document.getElementById('taskCategoryInput').value = task.category || 'General';
    document.getElementById('taskDueDateInput').value = task.dueDate || '';
    if (taskRecurringInput) taskRecurringInput.value = task.recurring || 'none';

    renderModalSubtasks();
    taskModal.classList.add('active');
  }

  function closeModal() {
    taskModal.classList.remove('active');
    state.editingTaskId = null;
    state.tempSubtasks = [];
  }

  // Keyboard Navigation: Escape to close modals, Ctrl+N / Alt+N to open new task
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (taskModal.classList.contains('active')) {
        closeModal();
      }
      if (confirmModal && confirmModal.classList.contains('active')) {
        closeConfirm(false);
      }
    } else if ((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      openModalForNewTask();
    }
  });

  // Custom Accessible Confirmation Modal Dialog
  function showConfirm(title, message, isDanger = true) {
    return new Promise((resolve) => {
      state.confirmResolve = resolve;
      confirmModalTitle.textContent = title;
      confirmModalMessage.textContent = message;

      if (isDanger) {
        confirmOkBtn.className = 'btn btn-danger';
        confirmOkBtn.textContent = 'Delete';
      } else {
        confirmOkBtn.className = 'btn btn-primary';
        confirmOkBtn.textContent = 'Confirm';
      }

      confirmModal.classList.add('active');
      confirmCancelBtn.focus();
    });
  }

  function closeConfirm(result) {
    confirmModal.classList.remove('active');
    if (state.confirmResolve) {
      state.confirmResolve(result);
      state.confirmResolve = null;
    }
  }

  confirmCancelBtn.addEventListener('click', () => closeConfirm(false));
  confirmOkBtn.addEventListener('click', () => closeConfirm(true));
  confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeConfirm(false);
  });

  // Subtask Management inside Modal
  addSubtaskBtn.addEventListener('click', handleAddModalSubtask);
  newSubtaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddModalSubtask();
    }
  });

  function handleAddModalSubtask() {
    const text = newSubtaskInput.value.trim();
    if (!text) return;

    state.tempSubtasks.push({
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: text,
      completed: false
    });
    newSubtaskInput.value = '';
    renderModalSubtasks();
  }

  function renderModalSubtasks() {
    if (state.tempSubtasks.length === 0) {
      subtasksListContainer.innerHTML = `<div class="subtask-empty-hint">No checklist items added yet.</div>`;
      return;
    }

    subtasksListContainer.innerHTML = state.tempSubtasks.map((sub, idx) => `
      <div class="modal-subtask-item">
        <input type="checkbox" id="modal-sub-${sub.id}" ${sub.completed ? 'checked' : ''} data-index="${idx}">
        <label for="modal-sub-${sub.id}" class="${sub.completed ? 'completed-sub' : ''}">${escapeHtml(sub.title)}</label>
        <button type="button" class="btn-remove-sub" data-index="${idx}" title="Remove item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('');

    // Bind subtask checkboxes and delete buttons
    subtasksListContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        if (state.tempSubtasks[idx]) {
          state.tempSubtasks[idx].completed = e.target.checked;
          renderModalSubtasks();
        }
      });
    });

    subtasksListContainer.querySelectorAll('.btn-remove-sub').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'));
        state.tempSubtasks.splice(idx, 1);
        renderModalSubtasks();
      });
    });
  }

  // Task Form Submit (Create or Update)
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitleInput').value.trim();
    if (!title) {
      showToast('Please enter a task title', 'warning');
      return;
    }

    const description = document.getElementById('taskDescInput').value.trim();
    const priority = document.getElementById('taskPriorityInput').value;
    const status = document.getElementById('taskStatusInput').value;
    const category = document.getElementById('taskCategoryInput').value.trim() || 'General';
    const dueDate = document.getElementById('taskDueDateInput').value;
    const recurring = taskRecurringInput ? taskRecurringInput.value : 'none';

    const taskData = {
      title,
      description,
      priority,
      status,
      category,
      dueDate,
      recurring,
      subtasks: state.tempSubtasks
    };

    if (state.editingTaskId) {
      const res = window.storage.update(state.editingTaskId, taskData);
      showToast('Task updated successfully', 'success');
      if (res && res.recurringResult) {
        showToast(`Next recurrence scheduled for ${res.recurringResult.nextDueDate}`, 'info');
      }
    } else {
      window.storage.add(taskData);
      showToast('New task added to backlog', 'success');
    }

    closeModal();
    renderAll();
    updateNotificationStatus(false);
  });

  // Listen for custom status changes (Drag & drop or Quick complete)
  window.addEventListener('task:status-change', (e) => {
    const { taskId, newStatus } = e.detail;
    const updateResult = window.storage.update(taskId, { status: newStatus });
    if (updateResult && updateResult.task) {
      const task = updateResult.task;
      if (newStatus === 'completed') {
        showCelebration();
        if (updateResult.recurringResult) {
          showToast(`🎉 "${task.title}" completed! Next recurrence auto-scheduled for ${updateResult.recurringResult.nextDueDate}`, 'success');
        } else {
          showToast(`🎉 "${task.title}" completed!`, 'success');
        }
      } else {
        showToast(`Moved to ${formatStatus(newStatus)}`, 'info');
      }
      renderAll();
      updateNotificationStatus(false);
    }
  });

  // Export JSON (PRD FR-6.2)
  exportDataBtn.addEventListener('click', () => {
    const jsonStr = window.storage.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaskFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Task database exported as JSON', 'success');
  });

  // Export CSV (PRD Roadmap v1.1)
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const csvStr = window.storage.exportCSV();
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TaskFlow_Tasks_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Task inventory exported as CSV (Spreadsheet compatible)', 'success');
    });
  }

  // Import JSON with Schema Validation (PRD FR-6.3 & Section 6)
  importDataBtn.addEventListener('click', () => {
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = window.storage.importJSON(event.target.result);
      if (res.success) {
        showToast(`Imported ${res.count} tasks verified against schema!`, 'success');
        renderAll();
        updateNotificationStatus(false);
      } else {
        showToast(`Import rejected: ${res.error}`, 'danger');
      }
      importFileInput.value = '';
    };
    reader.readAsText(file);
  });

  // Reset to Demo with Custom Modal Dialog
  resetDemoBtn.addEventListener('click', async () => {
    const confirmed = await showConfirm(
      'Reset Demo Data',
      'This will reload realistic demo tasks and overwrite local modifications. Proceed?',
      false
    );

    if (confirmed) {
      window.storage.resetToDemo();
      showToast('Reset to default sample tasks', 'info');
      renderAll();
      updateNotificationStatus(false);
    }
  });

  // Due Date Browser Notifications & Reminders (PRD Roadmap v1.1)
  if (notificationToggleBtn) {
    notificationToggleBtn.addEventListener('click', async () => {
      await handleNotificationClick();
    });
  }

  async function handleNotificationClick() {
    if (!('Notification' in window)) {
      showToast('Browser notifications not supported in this runtime environment.', 'warning');
      return;
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          showToast('Desktop alerts enabled!', 'success');
          sendDueNotifications(true);
        } else {
          showToast('Desktop notifications dismissed.', 'info');
        }
      } catch (err) {
        showToast('Notification permission request failed.', 'warning');
      }
    } else if (Notification.permission === 'granted') {
      sendDueNotifications(true);
    } else {
      showToast('Notifications are blocked in your browser settings.', 'warning');
    }
    updateNotificationStatus(false);
  }

  function updateNotificationStatus(sendAlerts = false) {
    const tasks = window.storage.getAll();
    const todayStr = new Date().toISOString().split('T')[0];

    const urgentTasks = tasks.filter(t => {
      if (t.status === 'completed' || !t.dueDate) return false;
      return t.dueDate <= todayStr;
    });

    if (notificationBadge) {
      if (urgentTasks.length > 0) {
        notificationBadge.textContent = urgentTasks.length;
        notificationBadge.style.display = 'flex';
      } else {
        notificationBadge.style.display = 'none';
      }
    }

    if (sendAlerts) {
      sendDueNotifications(false);
    }
  }

  function sendDueNotifications(forcedByUser = false) {
    const tasks = window.storage.getAll();
    const todayStr = new Date().toISOString().split('T')[0];

    const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr);
    const dueTodayTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate === todayStr);

    const totalUrgent = overdueTasks.length + dueTodayTasks.length;

    if (totalUrgent === 0) {
      if (forcedByUser) {
        showToast('All caught up! No tasks overdue or due today.', 'success');
      }
      return;
    }

    const summaryText = `${overdueTasks.length} overdue, ${dueTodayTasks.length} due today.`;

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification('TaskFlow Schedule Alert', {
          body: `You have ${totalUrgent} urgent task(s) requiring attention: ${summaryText}`,
          icon: 'favicon.ico'
        });
        notif.onclick = () => {
          window.focus();
        };
      } catch (e) {
        // Fallback to in-app toast if system notification fails
      }
    }

    if (forcedByUser) {
      showToast(`⚡ Priority Alert: ${summaryText}`, 'warning');
    }
  }

  // Global delegate for edit, delete, add col, quick complete, and interactive subtasks
  document.addEventListener('click', async (e) => {
    // Edit task button
    const editBtn = e.target.closest('.edit-task-btn');
    if (editBtn) {
      const taskId = editBtn.getAttribute('data-task-id');
      openModalForEdit(taskId);
      return;
    }

    // Delete task button with custom confirm dialog (PRD FR-1.4)
    const deleteBtn = e.target.closest('.delete-task-btn');
    if (deleteBtn) {
      const taskId = deleteBtn.getAttribute('data-task-id');
      const task = window.storage.getById(taskId);
      const title = task ? `"${task.title}"` : 'this task';

      const confirmed = await showConfirm('Delete Task', `Are you sure you want to permanently delete ${title}?`, true);
      if (confirmed) {
        window.storage.delete(taskId);
        showToast('Task removed from board', 'warning');
        renderAll();
        updateNotificationStatus(false);
      }
      return;
    }

    // Add column task button (from Kanban FR-3.4)
    const addColBtn = e.target.closest('.btn-add-col-task');
    if (addColBtn) {
      const colStatus = addColBtn.getAttribute('data-status');
      openModalForNewTask(colStatus);
      return;
    }

    // Interactive checklist chip inside list view (PRD FR-4.3)
    const subtaskChipBtn = e.target.closest('.subtask-chip-interactive');
    if (subtaskChipBtn) {
      const taskId = subtaskChipBtn.getAttribute('data-task-id');
      const subtaskId = subtaskChipBtn.getAttribute('data-subtask-id');
      const res = window.storage.toggleSubtask(taskId, subtaskId);
      if (res) {
        showToast(`Checklist item "${res.subtask.title}" ${res.subtask.completed ? 'completed' : 'reopened'}`, 'info');
        renderAll();
      }
      return;
    }

    // Quick complete checkbox in list view
    const quickComplete = e.target.closest('.quick-complete-checkbox');
    if (quickComplete) {
      const taskId = quickComplete.getAttribute('data-task-id');
      const isChecked = quickComplete.checked;
      const newStatus = isChecked ? 'completed' : 'todo';
      window.dispatchEvent(new CustomEvent('task:status-change', {
        detail: { taskId, newStatus }
      }));
    }
  });

  // Main Render Routine
  function renderAll() {
    const allTasks = window.storage.getAll();
    updateCategoryFilterDropdown(allTasks);

    // Compute metrics
    const metrics = window.analytics.calculateMetrics(allTasks);
    renderDashboardMetrics(metrics);

    // Render Current View
    renderCurrentViewOnly();
    updateNotificationStatus(false);
  }

  function renderCurrentViewOnly() {
    const allTasks = window.storage.getAll();
    const filteredTasks = applyFiltersAndSort(allTasks);

    if (state.currentTab === 'analytics') {
      const metrics = window.analytics.calculateMetrics(allTasks);
      renderDashboardCharts(metrics);
      renderRecentTasksWidget(filteredTasks);
    } else if (state.currentTab === 'kanban') {
      window.kanban.render('kanbanContainer', filteredTasks);
    } else if (state.currentTab === 'list') {
      renderListView('taskListContainer', filteredTasks);
    }
  }

  // Update dynamic category options in filter bar
  function updateCategoryFilterDropdown(tasks) {
    const existingVal = categoryFilter.value;
    const cats = new Set(['all']);
    tasks.forEach(t => {
      if (t.category) cats.add(t.category);
    });

    categoryFilter.innerHTML = Array.from(cats).map(c => `
      <option value="${escapeHtml(c)}">${c === 'all' ? 'All Categories' : escapeHtml(c)}</option>
    `).join('');

    if (cats.has(existingVal)) {
      categoryFilter.value = existingVal;
    }
  }

  // Filter & Multi-Attribute Sort Engine (PRD FR-5)
  function applyFiltersAndSort(tasks) {
    return tasks
      .filter(t => {
        // Search
        if (state.searchQuery) {
          const matchTitle = (t.title || '').toLowerCase().includes(state.searchQuery);
          const matchDesc = (t.description || '').toLowerCase().includes(state.searchQuery);
          const matchCat = (t.category || '').toLowerCase().includes(state.searchQuery);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // Category
        if (state.filterCategory !== 'all' && t.category !== state.filterCategory) {
          return false;
        }

        // Priority
        if (state.filterPriority !== 'all' && t.priority !== state.filterPriority) {
          return false;
        }

        // Status
        if (state.filterStatus !== 'all' && t.status !== state.filterStatus) {
          return false;
        }

        // Recurrence Filter
        if (state.filterRecurring !== 'all') {
          if (state.filterRecurring === 'none') {
            if (t.recurring && t.recurring !== 'none') return false;
          } else if (state.filterRecurring === 'recurring') {
            if (!t.recurring || t.recurring === 'none') return false;
          } else {
            if (t.recurring !== state.filterRecurring) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Multi-attribute sorting engine (FR-5.3)
        if (state.sortBy === 'dueDate-asc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (state.sortBy === 'dueDate-desc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        if (state.sortBy === 'priority-desc') {
          const rank = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        }
        if (state.sortBy === 'priority-asc') {
          const rank = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (rank[a.priority] || 0) - (rank[b.priority] || 0);
        }
        if (state.sortBy === 'title-asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (state.sortBy === 'title-desc') {
          return (b.title || '').localeCompare(a.title || '');
        }
        if (state.sortBy === 'created-desc') {
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        }
        if (state.sortBy === 'created-asc') {
          return (a.createdAt || '').localeCompare(b.createdAt || '');
        }
        if (state.sortBy === 'status') {
          const rank = { 'todo': 1, 'in-progress': 2, 'in-review': 3, 'completed': 4 };
          return (rank[a.status] || 0) - (rank[b.status] || 0);
        }
        return 0;
      });
  }

  // Render Top KPI Cards (PRD FR-2.1)
  function renderDashboardMetrics(metrics) {
    document.getElementById('metricTotalTasks').textContent = metrics.total;
    document.getElementById('metricCompletedTasks').textContent = metrics.completed;
    document.getElementById('metricCompletionRate').textContent = `${metrics.completionRate}%`;
    document.getElementById('metricOverdueTasks').textContent = metrics.overdue;
    document.getElementById('metricProductivityScore').textContent = metrics.productivityScore;

    // Progress bar in completion rate card
    const rateBar = document.getElementById('metricRateBar');
    if (rateBar) rateBar.style.width = `${metrics.completionRate}%`;

    // Productivity insights pills (PRD FR-2.2)
    const insightsContainer = document.getElementById('productivityInsightsContainer');
    if (insightsContainer) {
      const insights = window.analytics.generateInsights(metrics);
      insightsContainer.innerHTML = insights.map(item => `
        <div class="insight-pill insight-${item.type}">
          <div class="insight-header">
            <span class="insight-title">${item.title}</span>
          </div>
          <p class="insight-body">${item.text}</p>
        </div>
      `).join('');
    }
  }

  // Render SVG Charts in Analytics Tab (PRD FR-2.3)
  function renderDashboardCharts(metrics) {
    window.analytics.renderStatusDonutChart('donutChartContainer', metrics);
    window.analytics.renderPriorityBarChart('priorityChartContainer', metrics);
    window.analytics.renderVelocityChart('velocityChartContainer', metrics);
    window.analytics.renderCategoryWorkload('categoryChartContainer', metrics);
  }

  // Render Recent Tasks List inside Analytics View
  function renderRecentTasksWidget(tasks) {
    const container = document.getElementById('analyticsRecentTasksList');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `<div class="empty-state">No matching tasks found</div>`;
      return;
    }

    const top5 = tasks.slice(0, 5);
    container.innerHTML = top5.map(task => `
      <div class="recent-task-row ${task.status === 'completed' ? 'task-row-done' : ''}">
        <div class="row-left">
          <input
            type="checkbox"
            class="quick-complete-checkbox"
            data-task-id="${task.id}"
            ${task.status === 'completed' ? 'checked' : ''}
            aria-label="Mark task ${escapeHtml(task.title)} complete"
          >
          <div class="row-text">
            <span class="row-title">${escapeHtml(task.title)}</span>
            <span class="row-meta">
              ${escapeHtml(task.category || 'General')} • Due: ${task.dueDate || 'No date'}
              ${task.recurring && task.recurring !== 'none' ? ` • 🔄 ${task.recurring}` : ''}
            </span>
          </div>
        </div>
        <div class="row-right">
          <span class="priority-badge priority-${task.priority}">${task.priority}</span>
          <button class="btn-card-action edit-task-btn" data-task-id="${task.id}" title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render All Tasks List View (PRD FR-4)
  function renderListView(containerId, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>No Tasks Found</h3>
          <p>No tasks match your active search or filters. Clear your filters or create a new task!</p>
          <button class="btn btn-primary" onclick="document.getElementById('openNewTaskModalBtn').click()">
            Create New Task
          </button>
        </div>
      `;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const listHtml = tasks.map(task => {
      const isOverdue = task.status !== 'completed' && task.dueDate && task.dueDate < todayStr;
      const isDone = task.status === 'completed';

      const totalSub = task.subtasks ? task.subtasks.length : 0;
      const doneSub = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;

      const recurringBadge = task.recurring && task.recurring !== 'none' ? `
        <span class="recurring-pill" title="Repeats ${task.recurring}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          ${task.recurring}
        </span>
      ` : '';

      return `
        <div class="list-task-card ${isDone ? 'is-completed' : ''} ${isOverdue ? 'is-overdue' : ''}">
          <div class="list-card-main">
            <div class="list-card-start">
              <input
                type="checkbox"
                class="quick-complete-checkbox"
                data-task-id="${task.id}"
                ${isDone ? 'checked' : ''}
                aria-label="Toggle task completion"
              >
              <div class="list-content">
                <div class="list-header-row">
                  <h4 class="list-task-title">${escapeHtml(task.title)}</h4>
                  <span class="category-badge cat-${(task.category || 'general').toLowerCase().replace(/[^a-z0-9]/g, '')}">${escapeHtml(task.category || 'General')}</span>
                  ${recurringBadge}
                  <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                  <span class="status-badge status-${task.status}">${formatStatus(task.status)}</span>
                </div>
                ${task.description ? `<p class="list-desc">${escapeHtml(task.description)}</p>` : ''}
              </div>
            </div>

            <div class="list-card-end">
              <div class="list-date-info">
                ${task.dueDate ? `
                  <span class="due-pill ${isOverdue ? 'pill-overdue' : ''}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${task.dueDate} ${isOverdue ? '(Overdue)' : ''}
                  </span>
                ` : '<span class="due-pill pill-none">No Due Date</span>'}
              </div>

              ${totalSub > 0 ? `
                <div class="list-subtask-summary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  ${doneSub}/${totalSub} checklist
                </div>
              ` : ''}

              <div class="list-action-btns">
                <button class="btn-icon edit-task-btn" data-task-id="${task.id}" title="Edit Task" aria-label="Edit Task">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </button>
                <button class="btn-icon delete-task-btn" data-task-id="${task.id}" title="Delete Task" aria-label="Delete Task">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          ${totalSub > 0 ? `
            <div class="list-card-subtasks-preview">
              <span class="subtasks-inline-label">Interactive Checklist:</span>
              ${task.subtasks.map(s => `
                <button
                  type="button"
                  class="subtask-chip subtask-chip-interactive ${s.completed ? 'subtask-chip-done' : ''}"
                  data-task-id="${task.id}"
                  data-subtask-id="${s.id}"
                  title="Click to toggle item: ${escapeHtml(s.title)}"
                >
                  <span class="subtask-chip-icon">${s.completed ? '✓' : '○'}</span>
                  <span>${escapeHtml(s.title)}</span>
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="tasks-list-wrapper">${listHtml}</div>`;
  }

  // Toast Notifications
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span class="toast-text">${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Celebration Confetti Effect
  function showCelebration() {
    const celebrationEl = document.createElement('div');
    celebrationEl.className = 'celebration-layer';
    celebrationEl.innerHTML = `
      <div class="confetti-item c1"></div>
      <div class="confetti-item c2"></div>
      <div class="confetti-item c3"></div>
      <div class="confetti-item c4"></div>
      <div class="confetti-item c5"></div>
      <div class="confetti-item c6"></div>
    `;
    document.body.appendChild(celebrationEl);
    setTimeout(() => celebrationEl.remove(), 1800);
  }

  function formatStatus(status) {
    const map = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'in-review': 'Under Review',
      'completed': 'Done'
    };
    return map[status] || status;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

