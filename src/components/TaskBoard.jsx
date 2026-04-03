import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, updateTask } from '../api/api';
import { useStore } from '../store/useStore';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';

export const TaskBoard = () => {
  const searchQuery = useStore((state) => state.searchQuery);
  const showNotification = useStore((state) => state.showNotification);
  const queryClient = useQueryClient();

  const { data: allTasks = [], isLoading, isError } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
  });

  const filters = useStore((state) => state.filters);

  // Client-side search + filter
  const tasks = useMemo(() => {
    let result = allTasks;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Priority filter
    if (filters.priority.length > 0) {
      result = result.filter((t) => filters.priority.includes(t.priority));
    }

    // Work type filter
    if (filters.workType.length > 0) {
      result = result.filter((t) => filters.workType.includes(t.workType));
    }

    // Assignee filter
    if (filters.assignee.length > 0) {
      result = result.filter((t) => filters.assignee.includes(t.assignee));
    }

    return result;
  }, [allTasks, searchQuery, filters]);

  const [activeTask, setActiveTask] = useState(null);
  const targetRef = useRef({ columnId: null, overTaskId: null });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onError: (err, newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      showNotification('Failed to move task. Please try again.', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const columns = useMemo(() => {
    const tasksMap = { backlog: [], in_progress: [], review: [], done: [] };
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (tasksMap[t.column]) {
        tasksMap[t.column].push(t);
      } else {
        tasksMap.backlog.push(t);
      }
    }
    // Sort each column by sortIndex so order is preserved after refresh
    for (const key in tasksMap) {
      tasksMap[key].sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0));
    }
    return [
      { id: 'backlog', title: 'Backlog', tasks: tasksMap.backlog },
      { id: 'in_progress', title: 'In Progress', tasks: tasksMap.in_progress },
      { id: 'review', title: 'Review', tasks: tasksMap.review },
      { id: 'done', title: 'Done', tasks: tasksMap.done },
    ];
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    const found = tasks.find((t) => t.id === active.id);
    setActiveTask(found || null);
    targetRef.current = { columnId: found?.column || null, overTaskId: null };
  }, [tasks]);

  const handleDragOver = useCallback((event) => {
    const { over } = event;
    if (!over) return;

    if (over.data.current?.type === 'Column') {
      targetRef.current = { columnId: over.id, overTaskId: null };
    } else if (over.data.current?.type === 'Task') {
      const overTask = over.data.current.task;
      if (overTask) {
        targetRef.current = { columnId: overTask.column, overTaskId: overTask.id };
      }
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    const draggedTask = activeTask;
    setActiveTask(null);

    if (!draggedTask) return;

    const { columnId, overTaskId } = targetRef.current;
    targetRef.current = { columnId: null, overTaskId: null };

    if (!columnId) return;

    // Build new tasks array with task at the correct position
    const newTasks = allTasks.filter(t => t.id !== draggedTask.id);
    const updatedTask = { ...draggedTask, column: columnId };

    if (overTaskId && overTaskId !== draggedTask.id) {
      const overIndex = newTasks.findIndex(t => t.id === overTaskId);
      if (overIndex !== -1) {
        newTasks.splice(overIndex, 0, updatedTask);
      } else {
        newTasks.push(updatedTask);
      }
    } else {
      let lastIndexInColumn = -1;
      for (let i = newTasks.length - 1; i >= 0; i--) {
        if (newTasks[i].column === columnId) {
          lastIndexInColumn = i;
          break;
        }
      }
      newTasks.splice(lastIndexInColumn + 1, 0, updatedTask);
    }

    // Calculate new sortIndex for the dragged task based on its neighbors in the target column
    const columnTasks = newTasks.filter(t => t.column === columnId);
    const taskIndexInColumn = columnTasks.findIndex(t => t.id === draggedTask.id);
    
    let newSortIndex;
    const prevTask = taskIndexInColumn > 0 ? columnTasks[taskIndexInColumn - 1] : null;
    const nextTask = taskIndexInColumn < columnTasks.length - 1 ? columnTasks[taskIndexInColumn + 1] : null;

    if (prevTask && nextTask) {
      newSortIndex = ((prevTask.sortIndex ?? 0) + (nextTask.sortIndex ?? 0)) / 2;
    } else if (prevTask) {
      newSortIndex = (prevTask.sortIndex ?? 0) + 1024;
    } else if (nextTask) {
      newSortIndex = (nextTask.sortIndex ?? 0) / 2;
    } else {
      newSortIndex = 1024;
    }

    updatedTask.sortIndex = newSortIndex;

    // Update cache immediately for instant visual feedback
    queryClient.setQueryData(['tasks'], newTasks);

    // Persist to server - both for cross-column moves AND same-column reordering
    if (draggedTask.column !== columnId || draggedTask.sortIndex !== newSortIndex) {
      updateMutation.mutate(
        { ...draggedTask, column: columnId, sortIndex: newSortIndex },
        {
          onMutate: async () => {
            const previousTasks = queryClient.getQueryData(['tasks']);
            return { previousTasks };
          },
        }
      );
    }
  }, [activeTask, allTasks, queryClient, updateMutation]);

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    targetRef.current = { columnId: null, overTaskId: null };
  }, []);

  if (isLoading) return <Box p={3}><Typography>Loading tasks...</Typography></Box>;
  if (isError) return <Box p={3} color="error.main"><Typography>Error loading tasks.</Typography></Box>;

  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3, overflowX: 'auto', minHeight: 'calc(100vh - 160px)', alignItems: 'flex-start' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {columns.map((column) => (
          <TaskColumn key={column.id} column={column} />
        ))}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <TaskCard task={activeTask} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
};
