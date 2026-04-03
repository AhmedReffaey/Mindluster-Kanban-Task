import { create } from 'zustand';

// Detect system preference
const getSystemMode = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const useStore = create((set, get) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Theme: 'system' | 'light' | 'dark'
  themeMode: 'system',
  resolvedTheme: getSystemMode(), // actual light/dark
  setThemeMode: (mode) => set({
    themeMode: mode,
    resolvedTheme: mode === 'system' ? getSystemMode() : mode,
  }),

  // Filters
  filters: {
    priority: [],
    workType: [],
    assignee: [],
  },
  setFilter: (key, values) => set((state) => ({
    filters: { ...state.filters, [key]: values }
  })),
  clearAllFilters: () => set({
    filters: { priority: [], workType: [], assignee: [] }
  }),

  isTaskModalOpen: false,
  taskToEdit: null,
  openTaskModal: (task = null) => set({ isTaskModalOpen: true, taskToEdit: task }),
  closeTaskModal: () => set({ isTaskModalOpen: false, taskToEdit: null }),

  notification: null,
  showNotification: (message, severity = 'error') => set({ notification: { message, severity } }),
  clearNotification: () => set({ notification: null }),

  confirmDialog: null,
  showConfirm: (message, onConfirm) => set(() => ({ confirmDialog: { message, onConfirm } })),
  clearConfirm: () => set({ confirmDialog: null }),
}));

// Listen for system theme changes
window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const store = useStore.getState();
  if (store.themeMode === 'system') {
    useStore.setState({ resolvedTheme: e.matches ? 'dark' : 'light' });
  }
});
