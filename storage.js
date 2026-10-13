/**
 * Storage Layer for TaskFlow
 * Manages LocalStorage persistence, sample data seeding, schema validation, and import/export.
 */

const STORAGE_KEY = 'taskflow_tasks_v1';
const THEME_KEY = 'taskflow_theme_pref';

const DEFAULT_SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: 'Design UI Design System & Component Library',
    description: 'Establish design tokens, typography scale, color variables, and interactive components in Figma.',
    priority: 'urgent',
    status: 'in-progress',
    category: 'Design',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], // tomorrow
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    completedAt: null,
    recurring: 'none',
    subtasks: [
      { id: 'sub-1', title: 'Define HSL color palettes & glassmorphic tokens', completed: true },
      { id: 'sub-2', title: 'Create reusable button & card components', completed: true },
      { id: 'sub-3', title: 'Document dark & light theme elevation styles', completed: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Implement Productivity Analytics Dashboard',
    description: 'Build interactive SVG charts for status distribution, velocity trend, and priority breakdowns.',
    priority: 'high',
    status: 'completed',
    category: 'Dev',
    dueDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // yesterday
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    recurring: 'none',
    subtasks: [
      { id: 'sub-4', title: 'Calculate KPI metrics (completion rate, overdue count)', completed: true },
      { id: 'sub-5', title: 'Generate SVG Donut chart for status breakdown', completed: true },
      { id: 'sub-6', title: 'Add 7-day velocity bar charts', completed: true }
    ]
  },
  {
    id: 'task-3',
    title: 'Security Audit & Vulnerability Assessment',
    description: 'Review dependencies, sanitize input vectors, and configure safe LocalStorage serialization.',
    priority: 'urgent',
    status: 'todo',
    category: 'Dev',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    completedAt: null,
    recurring: 'monthly',
    subtasks: [
      { id: 'sub-7', title: 'Sanitize user-provided HTML inputs against XSS', completed: true },
      { id: 'sub-8', title: 'Audit JSON import format validation', completed: false }
    ]
  },
  {
    id: 'task-4',
    title: 'Customer Onboarding Journey Optimization',
    description: 'Map friction points in the sign-up funnel and propose streamlined single-click onboarding flow.',
    priority: 'medium',
    status: 'in-review',
    category: 'Product',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    completedAt: null,
    recurring: 'none',
    subtasks: [
      { id: 'sub-9', title: 'Analyze survey feedback metrics', completed: true },
      { id: 'sub-10', title: 'Draft wireframe for progressive onboarding', completed: false }
    ]
  },
  {
    id: 'task-5',
    title: 'Prepare Q4 Product Launch Presentation',
    description: 'Assemble slide deck highlighting feature velocity, test coverage, and key milestone deliverables.',
    priority: 'low',
    status: 'todo',
    category: 'Marketing',
    dueDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    completedAt: null,
    recurring: 'none',
    subtasks: [
      { id: 'sub-11', title: 'Outline product capabilities and roadmap', completed: false },
      { id: 'sub-12', title: 'Export analytics screenshots and metrics', completed: false }
    ]
  },
  {
    id: 'task-6',
    title: 'Weekly Team Retrospective & Sprint Alignment',
    description: 'Review blocked items, celebrate wins, and calibrate priority goals for next sprint.',
    priority: 'medium',
    status: 'completed',
    category: 'Team',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    recurring: 'weekly',
    subtasks: [
      { id: 'sub-13', title: 'Collect asynchronous sprint thoughts', completed: true },
      { id: 'sub-14', title: 'Publish meeting action summary notes', completed: true }
    ]
  }
];

class TaskStorage {
  constructor() {
    this.init();
  }

  init() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      this.resetToDemo();
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse stored tasks:', e);
      return [];
    }
  }

  saveAll(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch (e) {
      console.error('Failed to write tasks to storage:', e);
      return false;
    }
  }

  getById(id) {
    return this.getAll().find(t => t.id === id) || null;
  }

  add(taskData) {
    const tasks = this.getAll();
    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      createdAt: new Date().toISOString(),
      completedAt: taskData.status === 'completed' ? new Date().toISOString() : null,
      subtasks: [],
      recurring: 'none',
      ...taskData
    };
    tasks.unshift(newTask);
    this.saveAll(tasks);
    return newTask;
  }

  update(id, updates) {
    const tasks = this.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const current = tasks[index];
    const willBeCompleted = updates.status === 'completed' && current.status !== 'completed';
    const willBeUncompleted = updates.status && updates.status !== 'completed' && current.status === 'completed';

    let completedAt = current.completedAt;
    if (willBeCompleted) completedAt = new Date().toISOString();
    if (willBeUncompleted) completedAt = null;

    const updatedTask = {
      ...current,
      ...updates,
      completedAt
    };

    tasks[index] = updatedTask;
    this.saveAll(tasks);

    // If recurring task was marked completed, trigger next scheduled recurrence
    let recurringResult = null;
    if (willBeCompleted && updatedTask.recurring && updatedTask.recurring !== 'none') {
      recurringResult = this.spawnNextRecurring(updatedTask);
    }

    return { task: updatedTask, recurringResult };
  }

  spawnNextRecurring(task) {
    const baseDateStr = task.dueDate || new Date().toISOString().split('T')[0];
    const baseDate = new Date(baseDateStr);

    let nextDate = new Date(baseDate);
    if (task.recurring === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (task.recurring === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (task.recurring === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    const nextDueDateStr = nextDate.toISOString().split('T')[0];

    // Reset subtasks for next iteration
    const freshSubtasks = (task.subtasks || []).map(s => ({
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: s.title,
      completed: false
    }));

    const nextTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      status: 'todo',
      category: task.category || 'General',
      dueDate: nextDueDateStr,
      recurring: task.recurring,
      createdAt: new Date().toISOString(),
      completedAt: null,
      subtasks: freshSubtasks
    };

    const tasks = this.getAll();
    tasks.unshift(nextTask);
    this.saveAll(tasks);

    return {
      nextTask,
      nextDueDate: nextDueDateStr,
      frequency: task.recurring
    };
  }

  delete(id) {
    const tasks = this.getAll();
    const filtered = tasks.filter(t => t.id !== id);
    this.saveAll(filtered);
    return filtered.length < tasks.length;
  }

  toggleSubtask(taskId, subtaskId) {
    const tasks = this.getAll();
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return null;

    const sub = task.subtasks.find(s => s.id === subtaskId);
    if (!sub) return null;

    sub.completed = !sub.completed;
    this.saveAll(tasks);
    return { task, subtask: sub };
  }

  resetToDemo() {
    this.saveAll(DEFAULT_SAMPLE_TASKS);
    return DEFAULT_SAMPLE_TASKS;
  }

  exportJSON() {
    const tasks = this.getAll();
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'TaskFlow',
      version: '1.1',
      tasks
    };
    return JSON.stringify(payload, null, 2);
  }

  exportCSV() {
    const tasks = this.getAll();
    const headers = [
      'Task ID',
      'Title',
      'Description',
      'Priority',
      'Status',
      'Category',
      'Due Date',
      'Recurring',
      'Subtasks Completed',
      'Subtasks Total',
      'Created At',
      'Completed At'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = tasks.map(t => {
      const totalSub = t.subtasks ? t.subtasks.length : 0;
      const doneSub = t.subtasks ? t.subtasks.filter(s => s.completed).length : 0;
      return [
        escapeCsv(t.id),
        escapeCsv(t.title),
        escapeCsv(t.description || ''),
        escapeCsv(t.priority),
        escapeCsv(t.status),
        escapeCsv(t.category || 'General'),
        escapeCsv(t.dueDate || ''),
        escapeCsv(t.recurring || 'none'),
        escapeCsv(doneSub),
        escapeCsv(totalSub),
        escapeCsv(t.createdAt || ''),
        escapeCsv(t.completedAt || '')
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const rawTasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
      if (!Array.isArray(rawTasks)) {
        throw new Error('Invalid structure: Task payload must be an array or contain a tasks array.');
      }

      const validPriorities = ['urgent', 'high', 'medium', 'low'];
      const validStatuses = ['todo', 'in-progress', 'in-review', 'completed'];
      const validRecurrings = ['none', 'daily', 'weekly', 'monthly'];

      const sanitizedTasks = [];

      for (let i = 0; i < rawTasks.length; i++) {
        const item = rawTasks[i];
        if (!item || typeof item !== 'object') {
          throw new Error(`Item at index ${i} is not a valid task object.`);
        }
        if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
          throw new Error(`Item at index ${i} is missing a required non-empty "title".`);
        }

        const priority = validPriorities.includes(String(item.priority).toLowerCase())
          ? String(item.priority).toLowerCase()
          : 'medium';

        const status = validStatuses.includes(String(item.status).toLowerCase())
          ? String(item.status).toLowerCase()
          : 'todo';

        const recurring = validRecurrings.includes(String(item.recurring).toLowerCase())
          ? String(item.recurring).toLowerCase()
          : 'none';

        const subtasks = Array.isArray(item.subtasks)
          ? item.subtasks.map((s, sIdx) => ({
              id: s.id || `sub-${Date.now()}-${sIdx}`,
              title: String(s.title || 'Checklist item').trim(),
              completed: Boolean(s.completed)
            }))
          : [];

        sanitizedTasks.push({
          id: item.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: item.title.trim(),
          description: typeof item.description === 'string' ? item.description.trim() : '',
          priority,
          status,
          category: typeof item.category === 'string' && item.category.trim() ? item.category.trim() : 'General',
          dueDate: item.dueDate || null,
          recurring,
          createdAt: item.createdAt || new Date().toISOString(),
          completedAt: status === 'completed' ? (item.completedAt || new Date().toISOString()) : null,
          subtasks
        });
      }

      this.saveAll(sanitizedTasks);
      return { success: true, count: sanitizedTasks.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
  }
}

// Export singleton instance
window.storage = new TaskStorage();

