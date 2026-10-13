# TaskFlow — Modern Task Management & Productivity Analytics

A high-performance, responsive task management web application featuring interactive **Kanban boards**, a **Productivity Analytics Dashboard**, **Checklist Subtasks**, **Recurring Task Scheduling**, and **Data Portability**.

---

## 🚀 Key Features

### 1. 📊 Productivity Analytics Dashboard
- **Executive KPI Metrics**: Live count of Total Tasks, Completed Tasks, Completion Rate %, Overdue Items, and overall Productivity Execution Score (0–100).
- **Interactive SVG Charts**:
  - **Status Donut Chart**: Real-time proportional breakdown (`To Do`, `In Progress`, `Under Review`, `Done`) with central completion callout.
  - **7-Day Velocity Trend**: Continuous SVG cubic spline area chart with gradient fills and hover inspection nodes mapping tasks completed per day.
  - **Priority Breakdown**: Vertical comparative bar chart across `Urgent`, `High`, `Medium`, and `Low`.
  - **Category Workload**: Horizontal progress bars showing volume and completion % per department/project.
- **Productivity Intelligence**: Dynamic actionable recommendations classified into real-time health pills (`Peak Productivity Mode`, `Steady Progress`, `Attention Needed`, `Overdue Alert`).

### 2. 📋 Interactive Kanban Board
- 4 distinct workflow stages: **To Do**, **In Progress**, **Under Review**, and **Done**.
- Native HTML5 **drag-and-drop** interaction to move cards effortlessly with dropzone highlighting.
- Column headers with task counter badges and quick `+` buttons to add tasks directly into target columns.
- Card metadata displaying Category, Priority, Checklist progress track, Due date alerts, and Recurrence badges.

### 3. 📝 All Tasks (Inventory List View)
- Comprehensive dense view with one-click completion checkboxes.
- **Interactive Subtask Checklists**: Directly check off subtask items inline from the list view without opening modals.
- Priority and category chips with customized color tokens.
- Due date indicators with automatic **Overdue** and **Due Today** alerts.
- Recurrence indicators (`🔄 Daily`, `🔄 Weekly`, `🔄 Monthly`).

### 4. 🔄 Recurring Tasks Automation (PRD Roadmap Feature)
- Supports recurring task schedules: **Daily**, **Weekly**, and **Monthly**.
- When a recurring task is completed, TaskFlow automatically calculates the next target date, resets the subtask checklist, and spawns the next scheduled occurrence in `To Do`, preserving historical velocity in analytics.

### 5. 🔔 Due Date Browser Notifications & Reminders (PRD Roadmap Feature)
- Web Notifications integration to warn users of upcoming deadlines and overdue tasks.
- Header notification bell with live urgency badge counting overdue and due-today tasks.
- One-click notification permission request and manual deadline status check.

### 6. 🔍 Search, Filter & Multi-Attribute Sort
- Live instant search across titles, descriptions, and categories.
- Independent multi-filtering by Category, Priority, Status, and Recurrence.
- Enhanced sorting engine:
  - Due Date (Earliest First / Latest First)
  - Priority Severity (Highest / Lowest)
  - Alphabetical (A-Z / Z-A)
  - Date Created (Newest First / Oldest First)
  - Status Workflow Stage

### 7. 💾 Data Persistence, Portability & Validation
- Local client-side persistence in `localStorage` under `taskflow_tasks_v1`.
- **JSON Export**: Downloads formatted `TaskFlow_Backup_YYYY-MM-DD.json`.
- **CSV Export**: Downloads RFC 4180-compliant `TaskFlow_Tasks_YYYY-MM-DD.csv` for Microsoft Excel and Google Sheets.
- **JSON Import with Schema Validation**: Validates external JSON against PRD Section 6 data model specifications.
- **Reset to Demo Data**: Accessible confirmation dialog to reload realistic sample data.

### 8. 🎨 Aesthetic Design System & Accessibility
- Sleek futuristic **Dark Mode** (default) with smooth toggle to **Light Mode**.
- Glassmorphism surfaces (`backdrop-filter: blur(16px)`), luminous borders, and micro-interactions.
- Accessible modal dialogs with `Escape` key dismissal and `Ctrl+N` / `Alt+N` quick creation shortcut.
- Confetti celebration explosion upon task completion!

---

## 💻 How to Run

Because TaskFlow is built with modern standard web technologies (HTML5, CSS3, Vanilla JS), you can run it instantly using any of these simple methods:

### Option A: Directly in Your Browser (No Server Needed)
Double click `index.html` or open it directly in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option B: Local Python Web Server
Open a terminal in this directory and run:
```bash
python -m http.server 8000
```
Then navigate to: [http://localhost:8000](http://localhost:8000)

---

## 📂 Project Structure
```
Task Management Application/
├── index.html          # Semantic HTML5 layout, toolbar, modals & dialogs
├── css/
│   └── style.css       # Complete design system, glassmorphism, responsive grid
├── js/
│   ├── app.js          # Main orchestrator, modal controls, filters, notifications, toasts
│   ├── storage.js      # LocalStorage layer, schema validation, JSON & CSV export/import
│   ├── analytics.js    # Metric calculations, cubic spline chart renderers & insights
│   └── kanban.js       # Kanban board renderer & drag/move interactions
├── PRD.md              # Product Requirement Document
└── README.md           # Documentation
```
