# Kanban ToDo List Dashboard

A production-ready Kanban-style task management application designed with optimal performance, modern UI/UX, and robust architecture. Built as a technical assignment for a Frontend Engineer position.

## 🌟 Highlights & Architecture Decisions

This project goes beyond a simple CRUD application. It incorporates advanced frontend patterns to handle complex state workflows, dynamic UI rendering, and mock-backend limitations gracefully:

- **Component Modularity:** Strict separation of concerns (e.g. `TaskModal` is split into dedicated logical units like `CreateTaskForm`, `EditTaskForm`, `TaskComments`, and `QuillEditor`).
- **State Management Strategy:** 
  - `Zustand` for global UI state (Theme, Filters, Dialogs) — guaranteeing minimal boilerplate and exact re-renders.
  - `React Query` (TanStack Query) for Server State management, data fetching, optimistic caching, and invalidation.
- **Advanced File Upload Architecture (IndexedDB):** Implemented a fallback local database driver using the browser's native `IndexedDB` to handle massive file sizes (100MB+ videos) effortlessly, completely bypassing the `json-server` (which defaults to a 100KB payload limit and would crash otherwise). 
- **Performance Optimizations:** Heavy usage of `React.memo` deep-equality checks in `TaskCard` to guarantee stable 60fps Drag-and-Drop (`@dnd-kit`) interactions without unnecessary DOM repaints across the board.
- **Micro-Interactions & UX:** Jira-style immersive layout, global standard Confirmation Dialogs, isolated column pagination, and resilient Error Boundaries to prevent White Screens of Death.

## 🛠️ Technology Stack

| Ecosystem | Tool / Library | Purpose |
|---|---|---|
| **Core** | React 19 + Vite | Fast compilation and modern React features. |
| **State** | Zustand | Predictable, lightweight global state control. |
| **Data Fetching** | React Query v5 | Automatic caching, synchronization, and query invalidation. |
| **UI Framework** | Material UI (MUI v7) | Accessible, theme-able, and highly customizable components. |
| **Interactions** | `@dnd-kit` | Accessible, hardware-accelerated drag-and-drop toolkit. |
| **Storage Engine** | Native `IndexedDB` | Handling large Video/Image attachments gracefully. |
| **Backend Mock** | `json-server` | Lightweight REST API simulation. |
| **HTTP Client**| `Axios` | Interceptible API communication. |

## ✨ Core Features

- **Dynamic Kanban Board:** 4 strict columns (`Backlog`, `In Progress`, `Review`, `Done`) with fluid Drag & Drop functionality.
- **Task Management:** Full CRUD (Create, Read, Update, Delete) with Rich Text Descriptions (`Quill.js`).
- **Advanced Filtering & Search:**
  - Real-time debounced text search (title & description, 400ms delay).
  - Multi-select filters (Priority, Type, Assignee).
- **Pagination & Infinite Scroll:** Manual "Load More" functionality per column (5 tasks chunking) to optimize DOM nodes.
- **Theme Support:** Fully mapped Custom Palette for seamless Dark / Light / System Mode transitions.
- **Immersive Task UI:** 
  - "Jira-style" task editor layout.
  - Interactive "Edit/Delete" comments system.
  - Priority and Work-Type badges directly on the Board Cards.
- **File Attachments:** Image and Video upload handling with fail-safes.
- **Error Boundaries:** Protective crash barriers for robust production stability.
- **Prop Types Validation:** Strict component prop typing for data stability.

## 📋 Task Fields Schema

Each task object stored in the database follows this structure:

- `id` *(String | Number)* - Unique identifier
- `title` *(String)* - Required task name
- `description` *(Rich Text HTML)* - Detailed description
- `column` *(String)* - Enum: `backlog`, `in_progress`, `review`, `done`
- `priority` *(String)* - Enum: `Low`, `Medium`, `High`
- `workType` *(String)* - Enum: `task`, `epic`, `bug`, `story`
- `assignee` *(String)* - Assigned team member
- `attachment` *(String)* - Base64 Image string **OR** `idb://` local database pointer for heavy files
- `attachmentType` *(String)* - `image` or `video`
- `comments` *(Array)* - List of comment objects (with inline edit functionality)
- `sortIndex` *(Number)* - Integer used for persistent DND reordering
- `createdAt` *(ISO String)* - Timestamp of creation

## 🔌 REST API Endpoints

The mock `json-server` runs locally and exposes the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | Fetch all tasks |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update a specific task |
| `DELETE` | `/tasks/:id` | Delete a task |

*Base URL: `http://localhost:4000`*

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kanban-todo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the environment (Concurrently):**
   ```bash
   npm run start
   ```
   *This command runs the Vite frontend (`http://localhost:5173`) and the Mock API (`http://localhost:4000`) simultaneously in the same terminal using the `concurrently` package.*

### Run Separately (Optional)

```bash
# Terminal 1 - Mock API
npm run server
# Runs: json-server --watch db.json --port 4000

# Terminal 2 - Frontend Application
npm run dev
# Runs: Vite server on port 5173
```

## 📂 Project Structure

```text
src/
├── api/             # Axios API client and endpoint configurations
├── components/      # Reusable and Domain-Specific Components
│   ├── task-modal/  # Complex Task Modal split into modular logic
│   │   ├── CreateTaskForm.jsx
│   │   ├── EditTaskForm.jsx
│   │   ├── TaskComments.jsx
│   │   └── QuillEditor.jsx
│   ├── TaskBoard.jsx      # DnD Context and column mapping
│   ├── TaskColumn.jsx     # Column layout and Pagination logic
│   ├── TaskCard.jsx       # Memoized Task Card UI
│   ├── FilterBar.jsx      # Advanced filtering controls
│   ├── ConfirmDialog.jsx  # Global standardized confirmation modal
│   └── ErrorBoundary.jsx  # React Crash-catcher
├── store/
│   └── useStore.js  # Zustand global state (search, filters, dialogs)
├── utils/
│   └── storage.js   # IndexedDB wrapper for large file interception
├── theme.js         # MUI Custom Palette layout overrides
└── App.jsx          # Root Layout and Providers
```

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run start` | Start frontend + mock API concurrently |
| `npm run dev` | Start Vite dev server only |
| `npm run server` | Start json-server only |
| `npm run build` | Build the project for production |
| `npm run lint` | Run ESLint for code formatting checks |
| `npm run preview` | Preview the compiled production build locally |

---
*Developed with focus on scalability, modern UX, and strict frontend engineering principles.*
