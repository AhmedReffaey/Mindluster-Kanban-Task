import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, Typography, IconButton, Box, Chip, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Delete as DeleteIcon, Assignment as TaskIcon, BugReport as BugIcon, FlashOn as EpicIcon, Bookmark as StoryIcon, ChatBubbleOutline as CommentIcon } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store/useStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask } from '../api/api';
import { getFileFromDB } from '../utils/storage';

const columnColors = { backlog: 'default', in_progress: 'primary', review: 'secondary', done: 'success' };

const WORK_TYPES = {
  task: <TaskIcon sx={{ color: '#4bade8', fontSize: 18 }} />,
  epic: <EpicIcon sx={{ color: '#904ee2', fontSize: 18 }} />,
  bug: <BugIcon sx={{ color: '#e5493a', fontSize: 18 }} />,
  story: <StoryIcon sx={{ color: '#65ba43', fontSize: 18 }} />,
};

export const TaskCard = React.memo(({ task, overlay }) => {
  const { openTaskModal, showConfirm, showNotification } = useStore();
  const theme = useTheme();
  const c = theme.palette.custom;

  const sortableId = overlay ? `overlay-${task.id}` : task.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: { type: 'Task', task },
    animateLayoutChanges: () => false,
    disabled: overlay,
  });

  const style = overlay ? {
    cursor: 'grabbing',
    marginBottom: '10px',
  } : {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition,
    willChange: 'transform',
    cursor: isDragging ? 'grabbing' : 'pointer',
    marginBottom: '10px',
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); showNotification('Task deleted successfully.', 'success'); },
    onError: () => { showNotification('Failed to delete task. Please try again.', 'error'); },
  });

  if (isDragging && !overlay) {
    return (
      <Box ref={setNodeRef} style={{ ...style, opacity: 0.4 }}
        sx={{ minHeight: '80px', backgroundColor: c.border, borderRadius: 2, border: `2px dashed ${c.scrollThumb}` }} />
    );
  }

  const [displayAttachment, setDisplayAttachment] = useState(() => {
    if (task.attachment?.startsWith('idb://')) return null;
    return task.attachment || null;
  });

  useEffect(() => {
    if (task.attachment && task.attachment.startsWith('idb://')) {
      const id = task.attachment.split('idb://')[1];
      let objectUrl = null;
      getFileFromDB(id).then(file => {
        if (file) {
          objectUrl = URL.createObjectURL(file);
          setDisplayAttachment(objectUrl);
        }
      }).catch(console.error);
      return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    } else {
      setDisplayAttachment(task.attachment);
    }
  }, [task.attachment]);

  const onPointerDown = (e) => { e.stopPropagation(); };
  const handleDeleteClick = (e) => { 
    e.stopPropagation(); 
    showConfirm('Are you sure you want to delete this task?', () => {
      deleteMutation.mutate(task.id);
    });
  };

  const finalAttributes = overlay ? {} : attributes;
  const finalListeners = overlay ? {} : listeners;

  const getPriorityColor = (p) => {
    if (p === 'High') return '#de350b';
    if (p === 'Medium') return '#ff991f';
    return '#006644';
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...finalAttributes}
        {...finalListeners}
        onClick={() => !overlay && openTaskModal(task)}
        sx={{
          mb: 1.5,
          cursor: overlay ? 'grabbing' : 'grab',
          borderRadius: 2,
          backgroundColor: c.cardBg,
          border: `1px solid ${c.border}`,
          boxShadow: isDragging ? `0 8px 16px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(9, 30, 66, 0.15)'}` : `0 1px 2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(9, 30, 66, 0.05)'}`,
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: `0 4px 8px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(9, 30, 66, 0.1)'}`,
            borderColor: c.borderLight
          },
        }}
      >
        <CardContent sx={{ p: 1.8, pb: '14px !important' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="flex-start" gap={1} flex={1}>
              <Box sx={{ mt: 0.3, display: 'flex' }}>{WORK_TYPES[task.workType] || WORK_TYPES.task}</Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: c.textPrimary, letterSpacing: 0.2, '&:hover': { color: theme.palette.primary.main } }}>
                {task.title}
              </Typography>
            </Box>
          </Box>

          {!overlay && displayAttachment && (
            <Box mb={1.5} borderRadius={1} overflow="hidden">
              {task.attachmentType === 'video'
                ? <video src={displayAttachment} width="100%" style={{ display: 'block', maxHeight: 150, objectFit: 'cover', pointerEvents: 'none' }} />
                : <img src={displayAttachment} alt="Attachment" loading="lazy" style={{ width: '100%', display: 'block', maxHeight: 150, objectFit: 'cover' }} />}
            </Box>
          )}
          <Box display="flex" justifyContent="space-between" alignItems="flex-end">
            <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
              <Chip label={task.column.replace('_', ' ')} size="small" color={columnColors[task.column]} onPointerDown={onPointerDown}
                sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.7rem', fontWeight: 'bold' }} />
              <Chip label={task.priority || 'Medium'} size="small" onPointerDown={onPointerDown}
                sx={{ 
                  backgroundColor: getPriorityColor(task.priority || 'Medium') + '22', 
                  color: getPriorityColor(task.priority || 'Medium'), 
                  height: 20, fontSize: '0.7rem', fontWeight: 'bold' 
                }} />
              {task.comments && task.comments.length > 0 && (
                <Box display="flex" alignItems="center" gap={0.3} onPointerDown={onPointerDown} sx={{ color: c.textSecondary, ml: 0.5 }}>
                  <CommentIcon sx={{ fontSize: '0.85rem' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, lineHeight: 1 }}>{task.comments.length}</Typography>
                </Box>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={0.5} onPointerDown={onPointerDown} ml={1}>
              <Tooltip title="Delete Task">
                <IconButton size="small" onClick={handleDeleteClick} sx={{ padding: '2px', color: c.textSecondary, '&:hover': { color: '#de350b', backgroundColor: 'transparent' } }}>
                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
              {task.assignee && (
                <Tooltip title={`Assigned to ${task.assignee}`}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: theme.palette.primary.main, cursor: 'pointer' }}>
                    {task.assignee.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}, (prevProps, nextProps) => {
  if (prevProps.overlay !== nextProps.overlay) return false;
  const t1 = prevProps.task;
  const t2 = nextProps.task;
  return (
    t1.id === t2.id &&
    t1.title === t2.title &&
    t1.column === t2.column &&
    t1.assignee === t2.assignee &&
    t1.priority === t2.priority &&
    t1.attachment === t2.attachment &&
    (t1.comments?.length || 0) === (t2.comments?.length || 0)
  );
});

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    column: PropTypes.string.isRequired,
    assignee: PropTypes.string,
    priority: PropTypes.string,
    workType: PropTypes.string,
    attachment: PropTypes.string,
    attachmentType: PropTypes.string,
    comments: PropTypes.array,
  }).isRequired,
  overlay: PropTypes.bool,
};
