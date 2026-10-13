/**
 * Analytics Module for TaskFlow
 * Computes productivity metrics, trends, and renders interactive SVG charts.
 */

class ProductivityAnalytics {
  constructor() {}

  calculateMetrics(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const inReview = tasks.filter(t => t.status === 'in-review').length;
    const todo = tasks.filter(t => t.status === 'todo').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Subtask statistics
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    tasks.forEach(t => {
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter(s => s.completed).length;
      }
    });
    const subtaskRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 100;

    // Productivity Score (0 - 100)
    // Formula: baseline completion rate minus overdue penalty + in-progress velocity bonus
    let rawScore = completionRate * 0.7 + (subtaskRate * 0.3) - (overdue * 8);
    const productivityScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Priorities breakdown
    const priorities = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length
    };

    // Category breakdown
    const categories = {};
    tasks.forEach(t => {
      const cat = t.category || 'General';
      if (!categories[cat]) categories[cat] = { total: 0, completed: 0 };
      categories[cat].total++;
      if (t.status === 'completed') categories[cat].completed++;
    });

    // 7-day velocity (completed tasks per day over past 7 days)
    const velocityData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Count tasks completed on this date
      const count = tasks.filter(t => {
        if (!t.completedAt) return false;
        return t.completedAt.split('T')[0] === dateStr;
      }).length;

      velocityData.push({ date: dateStr, label: dayLabel, count });
    }

    return {
      total,
      completed,
      inProgress,
      inReview,
      todo,
      overdue,
      completionRate,
      subtaskRate,
      productivityScore,
      priorities,
      categories,
      velocityData
    };
  }

  generateInsights(metrics) {
    const insights = [];

    if (metrics.productivityScore >= 80) {
      insights.push({
        type: 'success',
        icon: 'zap',
        title: 'Peak Productivity Mode',
        text: `Outstanding momentum! Your completion rate is at ${metrics.completionRate}%, maintaining strong execution velocity.`
      });
    } else if (metrics.productivityScore >= 50) {
      insights.push({
        type: 'info',
        icon: 'trending-up',
        title: 'Steady Progress',
        text: `You have ${metrics.inProgress} task(s) in progress. Focusing on closing active items will boost your score.`
      });
    } else {
      insights.push({
        type: 'warning',
        icon: 'alert-circle',
        title: 'Attention Needed',
        text: 'Multiple tasks are pending. Consider tackling quick wins or decomposing tasks into smaller subtasks.'
      });
    }

    if (metrics.overdue > 0) {
      insights.push({
        type: 'danger',
        icon: 'clock',
        title: `${metrics.overdue} Overdue Item${metrics.overdue > 1 ? 's' : ''}`,
        text: 'Action required: Some tasks have surpassed their target completion date. Reschedule or resolve urgently.'
      });
    } else {
      insights.push({
        type: 'success',
        icon: 'check-circle-2',
        title: 'No Deadlines Missed',
        text: 'Zero overdue tasks currently on your board. Great job staying ahead of schedule!'
      });
    }

    return insights;
  }

  // Render SVG Donut Chart for Status Distribution
  renderStatusDonutChart(containerId, metrics) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = [
      { label: 'Completed', count: metrics.completed, color: '#10b981' },
      { label: 'In Progress', count: metrics.inProgress, color: '#6366f1' },
      { label: 'Under Review', count: metrics.inReview, color: '#f59e0b' },
      { label: 'To Do', count: metrics.todo, color: '#64748b' }
    ];

    const total = metrics.total;
    if (total === 0) {
      container.innerHTML = `<div class="chart-empty">No tasks available to plot</div>`;
      return;
    }

    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    const paths = data.map(slice => {
      if (slice.count === 0) return '';
      const percent = slice.count / total;
      const strokeDash = percent * circumference;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += strokeDash;

      return `
        <circle
          cx="${size / 2}"
          cy="${size / 2}"
          r="${radius}"
          fill="none"
          stroke="${slice.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${strokeDash} ${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          class="donut-segment"
          data-label="${slice.label}: ${slice.count}"
        >
          <title>${slice.label}: ${slice.count} (${Math.round(percent * 100)}%)</title>
        </circle>
      `;
    }).join('');

    const legendHtml = data.map(d => `
      <div class="chart-legend-item">
        <span class="legend-color-dot" style="background-color: ${d.color}"></span>
        <span class="legend-label">${d.label}</span>
        <span class="legend-count">${d.count} (${Math.round((d.count / total) * 100)}%)</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="donut-chart-wrapper">
        <div class="donut-svg-box">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="donut-svg">
            <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${strokeWidth}"/>
            ${paths}
          </svg>
          <div class="donut-center-info">
            <span class="donut-number">${metrics.completionRate}%</span>
            <span class="donut-sub">Complete</span>
          </div>
        </div>
        <div class="chart-legend">
          ${legendHtml}
        </div>
      </div>
    `;
  }

  // Render Priority Breakdown Bar Chart
  renderPriorityBarChart(containerId, metrics) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const data = [
      { label: 'Urgent', count: metrics.priorities.urgent, color: '#f43f5e' },
      { label: 'High', count: metrics.priorities.high, color: '#fb923c' },
      { label: 'Medium', count: metrics.priorities.medium, color: '#06b6d4' },
      { label: 'Low', count: metrics.priorities.low, color: '#94a3b8' }
    ];

    const maxCount = Math.max(...data.map(d => d.count), 1);

    const barsHtml = data.map(d => {
      const heightPercent = Math.max(8, Math.round((d.count / maxCount) * 100));
      return `
        <div class="bar-col">
          <span class="bar-count-badge">${d.count}</span>
          <div class="bar-track">
            <div class="bar-fill" style="height: ${heightPercent}%; background: ${d.color};"></div>
          </div>
          <span class="bar-label">${d.label}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="vertical-bars-container">
        ${barsHtml}
      </div>
    `;
  }

  // Continuous SVG Cubic Spline Area Chart (FR-2.3)
  renderVelocityChart(containerId, metrics) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const points = metrics.velocityData;
    const maxVal = Math.max(...points.map(p => p.count), 3);
    const width = 360;
    const height = 130;
    const padTop = 18;
    const padBottom = 24;
    const padX = 24;

    const innerWidth = width - padX * 2;
    const innerHeight = height - padTop - padBottom;
    const stepX = innerWidth / (points.length - 1);

    const coords = points.map((p, idx) => {
      const x = padX + idx * stepX;
      const y = padTop + innerHeight - (p.count / maxVal) * innerHeight;
      return { x, y, ...p };
    });

    // Compute continuous cubic spline curve through coordinates
    const buildCubicSplinePath = (pts) => {
      if (pts.length < 2) return '';
      let d = `M ${pts[0].x} ${pts[0].y}`;

      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      }
      return d;
    };

    const splineLineD = buildCubicSplinePath(coords);
    const baselineY = height - padBottom;
    const splineAreaD = `${splineLineD} L ${coords[coords.length - 1].x} ${baselineY} L ${coords[0].x} ${baselineY} Z`;

    const dots = coords.map(pt => `
      <g class="spline-dot-group">
        <circle cx="${pt.x}" cy="${pt.y}" r="8" fill="rgba(99, 102, 241, 0.15)" class="trend-dot-glow"></circle>
        <circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#6366f1" stroke="#ffffff" stroke-width="2" class="trend-dot">
          <title>${pt.label} (${pt.date}): ${pt.count} task${pt.count === 1 ? '' : 's'} completed</title>
        </circle>
        <text x="${pt.x}" y="${pt.y - 10}" text-anchor="middle" font-size="9" font-weight="700" fill="#818cf8" class="trend-count-text">${pt.count}</text>
      </g>
    `).join('');

    const labels = coords.map(pt => `
      <text x="${pt.x}" y="${height - 6}" text-anchor="middle" font-size="10.5" font-weight="600" fill="#94a3b8">${pt.label}</text>
    `).join('');

    container.innerHTML = `
      <div class="trend-chart-wrapper">
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <defs>
            <linearGradient id="velocitySplineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45"/>
              <stop offset="60%" stop-color="#6366f1" stop-opacity="0.12"/>
              <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <!-- Grid guides -->
          <line x1="${padX}" y1="${baselineY}" x2="${width - padX}" y2="${baselineY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
          <line x1="${padX}" y1="${padTop}" x2="${width - padX}" y2="${padTop}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3" />
          
          <!-- Spline Area Fill -->
          <path d="${splineAreaD}" fill="url(#velocitySplineGrad)" />
          
          <!-- Spline Continuous Curve -->
          <path d="${splineLineD}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- Interactive Nodes and Value Badges -->
          ${dots}
          ${labels}
        </svg>
      </div>
    `;
  }

  // Render Category Workload bars
  renderCategoryWorkload(containerId, metrics) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cats = Object.keys(metrics.categories);
    if (cats.length === 0) {
      container.innerHTML = `<div class="chart-empty">No category data available</div>`;
      return;
    }

    const totalTasks = metrics.total || 1;

    const rows = cats.map(catName => {
      const item = metrics.categories[catName];
      const percent = Math.round((item.total / totalTasks) * 100);
      const completionPercent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;

      return `
        <div class="category-workload-row">
          <div class="cat-row-header">
            <span class="cat-name">${catName}</span>
            <span class="cat-stats">${item.completed}/${item.total} Done (${completionPercent}%)</span>
          </div>
          <div class="cat-progress-track">
            <div class="cat-progress-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="cat-workload-list">${rows}</div>`;
  }
}

window.analytics = new ProductivityAnalytics();
