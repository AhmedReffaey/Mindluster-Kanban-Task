import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ExpandMore as ExpandMoreIcon, InboxOutlined as EmptyIcon } from '@mui/icons-material';
import { TaskCard } from './TaskCard';
import { ErrorBoundary } from './ErrorBoundary';

const TASKS_PER_PAGE = 5;

export const TaskColumn = React.memo(({ column }) => {
  const [visibleCount, setVisibleCount] = useState(TASKS_PER_PAGE);
  const scrollContainerRef = useRef(null);
  const theme = useTheme();
  const c = theme.palette.custom;

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const prevLengthRef = useRef(column.tasks.length);
  useEffect(() => {
    prevLengthRef.current = column.tasks.length;
  }, [column.tasks.length]);

  const visibleTasks = useMemo(() => column.tasks.slice(0, visibleCount), [column.tasks, visibleCount]);
  const hasMore = visibleCount < column.tasks.length;
  const remainingCount = column.tasks.length - visibleCount;
  const taskIds = useMemo(() => visibleTasks.map((t) => t.id), [visibleTasks]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + TASKS_PER_PAGE);
  }, []);

  return (
    <Box
      sx={{
        width: 320, minWidth: 320,
        backgroundColor: c.columnBg,
        borderRadius: 2, p: 2,
        display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 180px)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', color: c.textSecondary, letterSpacing: '0.5px' }}>
            {column.title}
          </Typography>
          <Typography variant="body2" sx={{ backgroundColor: c.chipBg, borderRadius: '10px', px: 1, py: 0.1, fontSize: '0.75rem', fontWeight: 'bold', color: c.textPrimary }}>
            {column.tasks.length}
          </Typography>
        </Box>
      </Box>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <Box
          ref={(node) => { setNodeRef(node); scrollContainerRef.current = node; }}
          sx={{
            flexGrow: 1, overflowY: 'auto', minHeight: '200px',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: c.scrollThumb, borderRadius: 3 },
            '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
          }}
        >
          {column.tasks.length === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 5, color: c.textTertiary }}>
              <EmptyIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: c.textTertiary, fontSize: '0.85rem' }}>No tasks yet</Typography>
              <Typography variant="caption" sx={{ color: c.scrollThumb, mt: 0.5 }}>Drag a task here or create a new one</Typography>
            </Box>
          )}
          {visibleTasks.map((task) => (
            <ErrorBoundary key={task.id}>
              <TaskCard task={task} />
            </ErrorBoundary>
          ))}
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
              <Button size="small" onClick={handleLoadMore} startIcon={<ExpandMoreIcon />}
                sx={{ textTransform: 'none', color: c.textSecondary, fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px', px: 2, backgroundColor: c.chipBg, '&:hover': { backgroundColor: c.border } }}>
                Load {Math.min(remainingCount, TASKS_PER_PAGE)} more ({remainingCount} remaining)
              </Button>
            </Box>
          )}
        </Box>
      </SortableContext>
    </Box>
  );
});

TaskColumn.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    tasks: PropTypes.array.isRequired,
  }).isRequired,
};
