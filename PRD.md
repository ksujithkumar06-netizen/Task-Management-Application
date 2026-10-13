# Product Requirement Document (PRD)
## Project: TaskFlow — Modern Task Management & Productivity Analytics

---

## 1. Document Control & Metadata

| Attribute | Details |
| :--- | :--- |
| **Product Name** | TaskFlow |
| **Document Version** | 1.0.0 |
| **Status** | Approved / Implemented |
| **Target Release** | Production v1.0 |
| **Owner / Author** | Product & Engineering Team |
| **Last Updated** | October 2026 |

---

## 2. Executive Summary & Product Vision

### 2.1 Vision Statement
To empower individuals, software engineers, and cross-functional teams with a blazing-fast, visually captivating task execution tool that merges tactical task tracking (Kanban & List views) with strategic productivity analytics, operating entirely client-side with zero latency and zero privacy compromises.

### 2.2 Problem Statement
Modern task management tools suffer from two extremes:
1. **Bloated Enterprise Suites**: Slow load times, complex setups, mandatory cloud logins, and steep learning curves.
2. **Oversimplified To-Do Lists**: Lack visual productivity insights, lack status stage workflows, and fail to provide analytics on completion velocity or overdue patterns.

### 2.3 Proposed Solution
**TaskFlow** delivers an instantaneous, privacy-first web application featuring:
- **Productivity Analytics Dashboard** with real-time SVG charts (Donut, Velocity Area, Priority & Category bars).
- **Kanban Board** with native drag-and-drop workflow progression.
- **Detailed Inventory List** with inline subtask checklists and overdue indicators.
- **Glassmorphic Dark & Light Theme** designed to minimize cognitive fatigue and maximize aesthetic engagement.
- **Client-Side Persistence & Portability** using structured LocalStorage and JSON export/import.

---

## 3. Product Goals & Success Metrics (OKRs & KPIs)

### 3.1 Objectives and Key Results (OKRs)
- **Objective 1 (Frictionless Onboarding)**: Enable a user to start managing tasks within 3 seconds of opening the application.
  - *KR 1.1*: Time-to-first-task creation under 5 seconds.
  - *KR 1.2*: Zero setup/install steps (pure standard web technologies).
- **Objective 2 (Productivity Awareness)**: Give users immediate clarity on their work velocity.
  - *KR 2.1*: 100% real-time reflection of task status updates across all analytics charts.
  - *KR 2.2*: Clear actionable recommendations generated dynamically based on overdue backlogs.

### 3.2 Key Performance Indicators (KPIs)
- **Page Load Speed**: First Contentful Paint (FCP) < 0.6s.
- **Application Responsiveness**: Interaction to Next Paint (INP) < 50ms.
- **Data Integrity**: 0% data loss across browser reloads via validated LocalStorage transactions.

---

## 4. User Personas

### Persona A: Alex — Software Engineer / Tech Lead
- **Goals**: Needs a lightweight tool to track daily sprint goals, break large user stories into subtasks, and monitor weekly velocity without Jira overhead.
- **Pain Points**: Frustrated by heavy web applications that require logins and lag when typing.
- **How TaskFlow Solves It**: Instant drag-and-drop Kanban, quick subtask checklists, and a 7-day velocity chart.

### Persona B: Priya — Product & Marketing Specialist
- **Goals**: Manages multiple campaigns across Design, Marketing, and Content with firm due dates.
- **Pain Points**: Losing track of deadlines and lack of high-level category workload visibility.
- **How TaskFlow Solves It**: Overdue badges, Category workload distribution chart, and multi-attribute filters.

---

## 5. Functional Requirements (FRD)

### FR-1: Task Lifecycle Management (CRUD)
- **FR-1.1 (Create)**: Users can create tasks with:
  - Title (Mandatory, non-empty text)
  - Scope / Description (Optional multi-line text)
  - Priority: `Urgent`, `High`, `Medium`, `Low`
  - Status: `To Do`, `In Progress`, `Under Review`, `Done`
  - Category / Project: Freeform text with autocomplete datalist (`Dev`, `Design`, `Product`, `Marketing`, `Finance`, `Team`, `Personal`)
  - Target Due Date: HTML5 date picker
  - Subtask Checklist: Dynamically add zero or more checklist items
- **FR-1.2 (Read & Display)**: Tasks render seamlessly across Analytics, Kanban, and List views with distinct color tokens.
- **FR-1.3 (Update)**: Users can edit any task attribute via the modal dialog or toggle statuses inline.
- **FR-1.4 (Delete)**: Users can delete tasks with confirmation dialog to prevent accidental data loss.

### FR-2: Productivity Analytics Dashboard
- **FR-2.1 (Executive KPI Cards)**:
  - **Total Tasks**: Total items currently in backlog.
  - **Completed Tasks**: Count of tasks in `Done` status.
  - **Completion Rate**: Calculated as `round((completed / total) * 100)%` with an animated progress bar.
  - **Overdue Items**: Tasks where `dueDate < today` and `status != completed`.
  - **Productivity Score**: Dynamic algorithm:
    $$\text{Score} = \min\Big(100, \max\Big(0, \text{round}\big(0.7 \times R_{\text{task}} + 0.3 \times R_{\text{subtask}} - 8 \times N_{\text{overdue}}\big)\Big)\Big)$$
- **FR-2.2 (Dynamic Productivity Insights)**:
  - Classifies current backlog health into actionable notification pills:
    - `Peak Productivity Mode` (Score $\ge 80$)
    - `Steady Progress` ($50 \le \text{Score} < 80$)
    - `Attention Needed` (Score $< 50$)
    - `Overdue Alert` ($N_{\text{overdue}} > 0$) vs. `No Deadlines Missed` ($N_{\text{overdue}} = 0$)
- **FR-2.3 (Visual SVG Charts)**:
  - **Status Donut Chart**: Proportional SVG ring displaying counts and percentages with central completion callout.
  - **7-Day Velocity Trend**: Continuous SVG cubic spline area chart mapping tasks completed per day.
  - **Priority Breakdown**: Vertical comparative bar chart showing relative severity distribution.
  - **Category Workload**: Horizontal progress bars showing volume and completion % per department.

### FR-3: Interactive Kanban Board
- **FR-3.1 (Columns)**: Four distinct workflow states: `To Do`, `In Progress`, `Under Review`, `Done`.
- **FR-3.2 (Drag and Drop)**: Native HTML5 drag-and-drop with dragover dropzone highlighting.
- **FR-3.3 (Card Metadata)**: Displays category badge, priority badge, subtask progress track, and due date alerts (`Due Today`, `Overdue`).
- **FR-3.4 (Quick Add)**: Column headers include a `+` button pre-filling the target column status.

### FR-4: Inventory List View
- **FR-4.1 (Dense View)**: Compact rows for high-volume task review.
- **FR-4.2 (Quick Complete)**: Single-click checkbox directly toggling between `Done` and `To Do`.
- **FR-4.3 (Subtask Chips)**: Displays checklist preview pills showing items completed.

### FR-5: Search, Filter & Multi-Attribute Sorting
- **FR-5.1 (Instant Search)**: Real-time case-insensitive keyword search against title, description, and category.
- **FR-5.2 (Categorical Filtering)**: Independent filtering by Category, Priority, and Status.
- **FR-5.3 (Sorting Engine)**:
  - Due Date (Earliest / Latest)
  - Priority Severity (Urgent $\rightarrow$ Low)
  - Alphabetical (A-Z)
  - Date Created (Newest first)

### FR-6: Data Portability & Persistence
- **FR-6.1 (Storage)**: Automatically synced to `localStorage` under key `taskflow_tasks_v1`.
- **FR-6.2 (JSON Export)**: Downloads a formatted `TaskFlow_Backup_YYYY-MM-DD.json` file.
- **FR-6.3 (JSON Import)**: Validates and loads external task JSON payloads.
- **FR-6.4 (Demo Seed)**: Pre-populates realistic data for first-time evaluation, with a one-click Reset to Demo option.

### FR-7: Appearance & Micro-Interactions
- **FR-7.1 (Dark / Light Theme)**: Smooth theme toggling with persisted preference in `localStorage`.
- **FR-7.2 (Feedback & Celebrations)**: Non-intrusive toast messages on actions; confetti explosion on task completion.

---

## 6. Data Model Specification

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "TaskFlowItem",
  "type": "object",
  "properties": {
    "id": { "type": "string", "example": "task-1728800000000-abcde" },
    "title": { "type": "string", "example": "Redesign Landing Page" },
    "description": { "type": "string", "example": "Update hero typography and CTA buttons" },
    "priority": { "type": "string", "enum": ["urgent", "high", "medium", "low"] },
    "status": { "type": "string", "enum": ["todo", "in-progress", "in-review", "completed"] },
    "category": { "type": "string", "example": "Design" },
    "dueDate": { "type": ["string", "null"], "format": "date", "example": "2026-10-15" },
    "createdAt": { "type": "string", "format": "date-time" },
    "completedAt": { "type": ["string", "null"], "format": "date-time" },
    "subtasks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "completed": { "type": "boolean" }
        },
        "required": ["id", "title", "completed"]
      }
    }
  },
  "required": ["id", "title", "priority", "status", "createdAt"]
}
```

---

## 7. Non-Functional Requirements (NFR)

| Category | Requirement Specification |
| :--- | :--- |
| **Performance** | Instant rendering (< 60ms) for up to 1,000 tasks. Zero external network calls required for app execution. |
| **Security & Privacy** | Zero data sent over the wire. Pure local client-side storage. Input sanitization prevents XSS in task titles and notes. |
| **Reliability** | Safe fallback to demo data if corrupted storage is detected. Resilient JSON schema validation on import. |
| **Accessibility (a11y)**| Contrast ratios meet WCAG 2.1 AA standard (> 4.5:1). Keyboard navigable modal dialogs with Escape key and backdrop dismissal. |
| **Browser Compatibility** | Chrome 90+, Microsoft Edge 90+, Firefox 90+, Safari 15+ across Windows, macOS, Linux, iOS, and Android. |

---

## 8. Release Roadmap

- **v1.0 (Current Release - Delivered)**:
  - Complete core Task CRUD and modal workflows.
  - Analytics dashboard with 5 KPI cards, dynamic insights, and 4 SVG charts.
  - 4-column drag-and-drop Kanban board.
  - Dense list view with subtasks checklist.
  - Dark/Light mode theme system.
  - JSON backup and restore capabilities.
- **v1.1 (Upcoming Enhancements)**:
  - Due date browser push notifications.
  - Export to CSV format for Excel/Google Sheets compatibility.
  - Recurring tasks support (daily, weekly, monthly).
- **v2.0 (Future Vision)**:
  - Optional cloud peer-to-peer sync via WebRTC or Encrypted Cloud Storage.
  - Customizable Kanban column names and workflows.
