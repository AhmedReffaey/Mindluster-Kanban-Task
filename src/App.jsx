import React, { useMemo } from 'react';
import { Box, CssBaseline, ThemeProvider, Snackbar, Alert } from '@mui/material';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { useStore } from './store/useStore';
import { getTheme } from './theme';

function App() {
  const { notification, clearNotification, resolvedTheme } = useStore();
  const theme = useMemo(() => getTheme(resolvedTheme), [resolvedTheme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header />
        <FilterBar />
        <Box sx={{ flexGrow: 1, overflow: 'auto', backgroundColor: 'background.default', '&::-webkit-scrollbar': { height: 8 }, '&::-webkit-scrollbar-thumb': { backgroundColor: (t) => t.palette.custom.scrollThumb, borderRadius: 4 } }}>
          <TaskBoard />
        </Box>
        <TaskModal />
        <ConfirmDialog />
      </Box>

      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={clearNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification ? (
          <Alert
            onClose={clearNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%', fontWeight: 600 }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
