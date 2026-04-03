import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Assignment as TaskIcon
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask } from '../../api/api';
import { QuillEditor } from './QuillEditor';
import { TaskComments } from './TaskComments';
import { WORK_TYPES, columns, mockUsers, statusColors } from './constants';
import { saveFileToDB, getFileFromDB } from '../../utils/storage';

export const EditTaskForm = ({ task }) => {
  const { isTaskModalOpen, closeTaskModal, showNotification, showConfirm } = useStore();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const c = theme.palette.custom;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [column, setColumn] = useState('backlog');
  const [priority, setPriority] = useState('Medium');
  const [workType, setWorkType] = useState('task');
  const [attachment, setAttachment] = useState(task.attachment || null);
  const [attachmentType, setAttachmentType] = useState(task.attachmentType || null);
  const [displayAttachment, setDisplayAttachment] = useState(() => {
    if (task.attachment?.startsWith('idb://')) return null;
    return task.attachment || null;
  });
  const [titleError, setTitleError] = useState(false);
  const [comments, setComments] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (attachment && attachment.startsWith('idb://')) {
      const id = attachment.split('idb://')[1];
      let objectUrl = null;
      getFileFromDB(id).then(file => {
        if (file) {
          objectUrl = URL.createObjectURL(file);
          setDisplayAttachment(objectUrl);
        }
      }).catch(console.error);

      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    } else {
      setDisplayAttachment(attachment);
    }
  }, [attachment]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setAssignee(task.assignee || '');
      setColumn(task.column || 'backlog');
      setPriority(task.priority || 'Medium');
      setWorkType(task.workType || 'task');
      setAttachment(task.attachment || null);
      setAttachmentType(task.attachmentType || null);
      setComments(task.comments || []);
    }
  }, [task, isTaskModalOpen]);

  const markDirty = () => { if (!isDirty) setIsDirty(true); };

  const handleClose = () => {
    if (isDirty) {
      showConfirm('You have unsaved changes. Discard them?', () => {
        closeTaskModal();
      });
    } else {
      closeTaskModal();
    }
  };

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
    onError: () => {
      showNotification('Failed to update task. Please try again.', 'error');
    },
  });

  const handleSave = () => {
    if (!title.trim()) return;
    updateMutation.mutate({ ...task, title, description, assignee, column, priority, workType, attachment, attachmentType, comments });
    showNotification('Task updated successfully!', 'success');
    closeTaskModal();
  };

  const handleAddComment = (text) => {
    const commentObj = {
      id: Date.now().toString(),
      text,
      author: 'You',
      timestamp: new Date().toLocaleString()
    };
    const updatedComments = [...comments, commentObj];
    setComments(updatedComments);
    updateMutation.mutate({
      ...task,
      title, description, assignee, column, priority, workType, attachment, attachmentType,
      comments: updatedComments
    });
  };

  const handleDeleteComment = (id) => {
    showConfirm('Are you sure you want to delete this comment?', () => {
      const updated = comments.filter(cm => cm.id !== id);
      setComments(updated);
      updateMutation.mutate({
        ...task,
        title, description, assignee, column, priority, workType, attachment, attachmentType,
        comments: updated
      });
    });
  };

  const handleEditComment = (id, newText) => {
    const updated = comments.map(cm => cm.id === id ? { ...cm, text: newText } : cm);
    setComments(updated);
    updateMutation.mutate({
      ...task,
      title, description, assignee, column, priority, workType, attachment, attachmentType,
      comments: updated
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v'];
      const isVideo = file.type.startsWith('video/') || videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      // Route ALL videos and any image > 50KB straight to IndexedDB.
      if (isVideo || file.size > 50 * 1024) {
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        saveFileToDB(fileId, file).then((idbUrl) => {
          setAttachment(idbUrl);
          setAttachmentType(isVideo ? 'video' : 'image');
          markDirty();
          showNotification('File successfully attached!', 'success');
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result);
        setAttachmentType('image');
        markDirty();
      };
      reader.readAsDataURL(file);
    }
  };

  const currentStatusColor = statusColors[column] || statusColors.backlog;

  return (
    <Dialog
      open={isTaskModalOpen}
      onClose={handleClose}
      disableRestoreFocus
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          minHeight: '600px',
          maxHeight: '85vh',
          backgroundColor: c.cardBg,
          boxShadow: `0 0 0 1px ${c.borderLight}, 0 8px 32px rgba(9, 30, 66, 0.16), 0 20px 60px rgba(9, 30, 66, 0.06)`,
          overflow: 'hidden',
          backgroundImage: 'none'
        }
      }}
    >
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: 3, py: 1.5, borderBottom: `1px solid ${c.borderLight}`, backgroundColor: c.headerBg, minHeight: 52
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {WORK_TYPES.find(wt => wt.value === workType)?.icon || <TaskIcon sx={{ color: '#4bade8', fontSize: 18 }} />}
          <Typography variant="body2" sx={{ color: c.textSecondary, fontWeight: 700, fontSize: '0.8rem', letterSpacing: 0.5 }}>
            {task.id.toString().substring(0, 4).toUpperCase()}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: c.textSecondary, '&:hover': { backgroundColor: c.hoverBg, color: c.textPrimary }, borderRadius: '6px' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflow: 'auto', backgroundColor: c.cardBg }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: '540px' }}>
          <Box sx={{ flex: '1 1 60%', p: 3, pr: { md: 4 }, overflowY: 'auto' }}>
            <TextField
              placeholder="What needs to be done?"
              variant="standard"
              fullWidth
              value={title}
              onChange={(e) => { setTitle(e.target.value); markDirty(); }}
              required
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '1.4rem', fontWeight: 700, color: c.textPrimary, mb: 2, lineHeight: 1.4,
                  '&:hover': { backgroundColor: c.hoverBg, borderRadius: 1, px: 0.5, mx: -0.5 },
                  '&.Mui-focused': { backgroundColor: c.inputBg, borderRadius: 1, px: 0.5, mx: -0.5, outline: `2px solid ${theme.palette.primary.main}` }
                }
              }}
            />

            <Typography variant="body2" fontWeight={700} mb={1} color={c.textPrimary} sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.8 }}>
              Description
            </Typography>
            <Box sx={{
              mb: 4,
              '.ql-container': { borderRadius: '0 0 8px 8px', backgroundColor: c.cardBg, color: c.textPrimary, fontSize: '0.9rem', border: `1px solid ${c.border}`, borderTop: 'none', minHeight: '160px' },
              '.ql-toolbar': { borderRadius: '8px 8px 0 0', backgroundColor: c.inputBg, border: `1px solid ${c.border}` },
              '.ql-editor': { minHeight: '160px', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
              '& .ql-container.ql-snow': { border: `1px solid ${c.border}` },
              '& .ql-toolbar.ql-snow': { border: `1px solid ${c.border}` },
              '.ql-stroke': { stroke: c.textSecondary },
              '.ql-fill': { fill: c.textSecondary },
              '.ql-picker': { color: c.textSecondary }
            }}>
              <QuillEditor
                value={description}
                onChange={(val) => { setDescription(val); markDirty(); }}
                placeholder="Add a more detailed description..."
              />
            </Box>

            <Typography variant="body2" fontWeight={700} mb={1} color={c.textPrimary} sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.8 }}>
              Attachments
            </Typography>
            <Box mb={3}>
              {displayAttachment ? (
                <Box position="relative" display="inline-block" borderRadius="8px" overflow="hidden" border={`1px solid ${c.border}`} sx={{ transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 2px 8px rgba(9,30,66,0.12)' } }}>
                  {attachmentType === 'video' ? (
                    <video src={displayAttachment} width="100%" controls style={{ maxHeight: 180, display: 'block' }} />
                  ) : (
                    <img src={displayAttachment} alt="Preview" style={{ maxWidth: '100%', maxHeight: 180, display: 'block', objectFit: 'cover' }} />
                  )}
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: c.headerBg, backdropFilter: 'blur(4px)', color: c.textSecondary, '&:hover': { backgroundColor: '#ffebee', color: '#de350b' }, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
                    onClick={() => { setAttachment(null); setAttachmentType(null); markDirty(); }}
                  >
                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Box>
              ) : (
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon sx={{ fontSize: '1.1rem' }} />} sx={{ color: c.textSecondary, borderColor: c.border, bgcolor: c.inputBg, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', borderStyle: 'dashed', borderRadius: '8px', py: 1.5, px: 2.5, '&:hover': { backgroundColor: c.hoverBg, borderColor: c.textTertiary } }}>
                  Upload Image or Video
                  <input type="file" hidden accept="image/*,video/*,.mkv,.avi,.mov,.wmv,.flv,.webm,.m4v" onChange={handleFileChange} />
                </Button>
              )}
            </Box>

            <TaskComments comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onEditComment={handleEditComment} />
          </Box>

          <Box sx={{ flex: '0 0 280px', borderLeft: { md: `1px solid ${c.borderLight}` }, backgroundColor: c.columnBg, p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="body2" sx={{ color: c.textSecondary, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.8, mb: 0.8 }}>Status</Typography>
              <Select value={column} onChange={(e) => { setColumn(e.target.value); markDirty(); }} size="small" fullWidth sx={{ backgroundColor: currentStatusColor.bg, color: currentStatusColor.color, fontWeight: 700, fontSize: '0.8rem', '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, borderRadius: '6px', '& .MuiSelect-select': { py: 0.8 }, textTransform: 'uppercase', letterSpacing: 0.5 }} MenuProps={{ PaperProps: { sx: { bgcolor: c.cardBg, color: c.textPrimary } } }}>
                {columns.map((col) => <MenuItem key={col.value} value={col.value} sx={{ fontWeight: 600, fontSize: '0.85rem', '&:hover': { bgcolor: c.hoverBg } }}>{col.label}</MenuItem>)}
              </Select>
            </Box>

            <Box sx={{ border: `1px solid ${c.borderLight}`, borderRadius: '10px', bgcolor: c.cardBg, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${c.borderLight}`, '&:hover': { backgroundColor: c.hoverBg }, transition: 'background 0.15s' }}>
                <Typography variant="body2" sx={{ color: c.textSecondary, fontWeight: 600, fontSize: '0.8rem' }}>Assignee</Typography>
                <FormControl variant="standard" sx={{ minWidth: 100 }}>
                  <Select value={assignee} onChange={(e) => { setAssignee(e.target.value); markDirty(); }} disableUnderline displayEmpty sx={{ fontSize: '0.8rem', fontWeight: 600, color: c.textPrimary }} renderValue={(selected) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: selected ? theme.palette.primary.main : c.textTertiary }}>{selected ? selected.charAt(0) : '?'}</Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: selected ? c.textPrimary : c.textTertiary }}>{selected || 'Unassigned'}</Typography>
                    </Box>
                  )} MenuProps={{ PaperProps: { sx: { bgcolor: c.cardBg, color: c.textPrimary } } }}>
                    <MenuItem value="" sx={{ '&:hover': { bgcolor: c.hoverBg } }}><em>Unassigned</em></MenuItem>
                    {mockUsers.map((user) => (
                      <MenuItem key={user} value={user} sx={{ fontSize: '0.85rem', '&:hover': { bgcolor: c.hoverBg } }}>
                        <Box display="flex" alignItems="center" gap={1}><Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: theme.palette.primary.main }}>{user.charAt(0)}</Avatar>{user}</Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${c.borderLight}` }}>
                <Typography variant="body2" sx={{ color: c.textSecondary, fontWeight: 600, fontSize: '0.8rem' }}>Reporter</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', fontWeight: 700, bgcolor: theme.palette.primary.main }}>Y</Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', color: c.textPrimary }}>You</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${c.borderLight}` }}>
                <Typography variant="body2" sx={{ color: c.textSecondary, fontWeight: 600, fontSize: '0.8rem' }}>Work Type</Typography>
                <FormControl variant="standard" sx={{ minWidth: 100 }}>
                  <Select value={workType} onChange={(e) => { setWorkType(e.target.value); markDirty(); }} disableUnderline sx={{ fontSize: '0.8rem', fontWeight: 700, color: c.textPrimary, textAlign: 'right' }} renderValue={(selected) => {
                    const type = WORK_TYPES.find(wt => wt.value === selected) || WORK_TYPES[0];
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', backgroundColor: c.inputBg, px: 1, py: 0.3, borderRadius: 1 }}>{React.cloneElement(type.icon, { sx: { fontSize: 14, color: type.icon.props.sx.color } })}<Typography variant="caption" fontWeight={600} color={c.textPrimary}>{type.label}</Typography></Box>
                    );
                  }} MenuProps={{ PaperProps: { sx: { bgcolor: c.cardBg, color: c.textPrimary } } }}>
                    {WORK_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value} sx={{ fontSize: '0.85rem', '&:hover': { bgcolor: c.hoverBg } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{React.cloneElement(type.icon, { sx: { fontSize: 16, color: type.icon.props.sx.color } })}{type.label}</Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${c.borderLight}` }}>
                <Typography variant="body2" sx={{ color: c.textSecondary, fontWeight: 600, fontSize: '0.8rem' }}>Priority</Typography>
                <FormControl variant="standard" sx={{ minWidth: 80 }}>
                  <Select value={priority} onChange={(e) => { setPriority(e.target.value); markDirty(); }} disableUnderline sx={{ fontSize: '0.8rem', fontWeight: 700, color: c.textPrimary, textAlign: 'right' }} renderValue={(selected) => {
                    const priorityColors = { Low: { bg: '#e3fcef', color: '#006644' }, Medium: { bg: '#fff0b3', color: '#974f0c' }, High: { bg: '#ffebe6', color: '#bf2600' } };
                    const current = priorityColors[selected] || priorityColors.Medium;
                    return <Chip label={selected} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, backgroundColor: current.bg, color: current.color, borderRadius: '4px', cursor: 'pointer' }} />;
                  }} MenuProps={{ PaperProps: { sx: { bgcolor: c.cardBg, color: c.textPrimary } } }}>
                    <MenuItem value="Low" sx={{ fontSize: '0.85rem', '&:hover': { bgcolor: c.hoverBg } }}>Low</MenuItem>
                    <MenuItem value="Medium" sx={{ fontSize: '0.85rem', '&:hover': { bgcolor: c.hoverBg } }}>Medium</MenuItem>
                    <MenuItem value="High" sx={{ fontSize: '0.85rem', '&:hover': { bgcolor: c.hoverBg } }}>High</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ pt: 1, borderTop: `1px solid ${c.borderLight}` }}>
              <Typography variant="caption" sx={{ color: c.textTertiary, fontSize: '0.7rem' }}>
                Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unknown'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 3, py: 1.5, borderTop: `1px solid ${c.borderLight}`, backgroundColor: c.inputBg }}>
        <Button onClick={handleClose} size="small" sx={{ textTransform: 'none', color: c.textSecondary, fontWeight: 600, fontSize: '0.85rem', mr: 1, borderRadius: '6px', '&:hover': { bgcolor: c.hoverBg } }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" size="small" disableElevation sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark }, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', borderRadius: '6px', px: 3, py: 0.8 }} disabled={!title.trim() || updateMutation.isPending}>Save Changes</Button>
      </Box>
    </Dialog>
  );
};

EditTaskForm.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    column: PropTypes.string,
    assignee: PropTypes.string,
    priority: PropTypes.string,
    workType: PropTypes.string,
    attachment: PropTypes.string,
    attachmentType: PropTypes.string,
    comments: PropTypes.array,
  }).isRequired,
};
