import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Avatar,
  useTheme
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Close as CloseIcon, 
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { useStore } from '../../store/useStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask } from '../../api/api';
import { QuillEditor } from './QuillEditor';
import { WORK_TYPES, mockUsers } from './constants';
import { saveFileToDB } from '../../utils/storage';

export const CreateTaskForm = () => {
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
  const [attachment, setAttachment] = useState(null);
  const [attachmentType, setAttachmentType] = useState(null);
  const [displayAttachment, setDisplayAttachment] = useState(null);
  const [titleError, setTitleError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => { if (!isDirty) setIsDirty(true); };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignee('');
    setColumn('backlog');
    setPriority('Medium');
    setWorkType('task');
    setAttachment(null);
    setDisplayAttachment(null);
    setAttachmentType(null);
    setTitleError(false);
    setIsDirty(false);
  };

  const handleClose = () => {
    if (isDirty) {
      showConfirm('You have unsaved changes. Discard them?', () => {
        resetForm();
        closeTaskModal();
      });
    } else {
      resetForm();
      closeTaskModal();
    }
  };

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      showNotification('Task created successfully!', 'success');
      resetForm();
      closeTaskModal();
    },
    onError: () => {
      showNotification('Failed to create task. Please try again.', 'error');
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    createMutation.mutate({ 
      title, description, assignee, column, priority, workType, 
      attachment, attachmentType, comments: [], 
      id: Date.now().toString(), createdAt: new Date().toISOString() 
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      markDirty();
      const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v'];
      const isVideo = file.type.startsWith('video/') || videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      const objectUrl = URL.createObjectURL(file);
      setDisplayAttachment(objectUrl);
      setAttachmentType(isVideo ? 'video' : 'image');
      
      // Route ALL videos and any image > 50KB straight to IndexedDB.
      if (isVideo || file.size > 50 * 1024) {
        const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        saveFileToDB(fileId, file).then((idbUrl) => {
          setAttachment(idbUrl);
          showNotification('File successfully attached!', 'success');
        });
        return;
      }

      // Small images < 50KB can safely be converted to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isTaskModalOpen} onClose={handleClose} disableRestoreFocus fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, p: 1, backgroundColor: c.cardBg } }}>
      <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, m: 0 }}>
        <Typography variant="h6" component="span" fontWeight="bold" color={c.textPrimary}>
          Create New Task
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: c.textSecondary, '&:hover': { backgroundColor: c.hoverBg } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderTop: `1px solid ${c.border}`, borderBottom: 'none', px: 3, py: 3, borderColor: c.border }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} color={c.textSecondary}>
              Title <span style={{ color: '#de350b' }}>*</span>
            </Typography>
            <TextField
              placeholder="e.g. Design homepage"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (e.target.value.trim()) setTitleError(false); markDirty(); }}
              required
              autoFocus
              size="small"
              error={titleError}
              helperText={titleError ? 'Title is required' : ''}
              sx={{ 
                '& .MuiOutlinedInput-root': { borderRadius: 1.5, backgroundColor: c.inputBg },
                '& .MuiOutlinedInput-input': { color: c.textPrimary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: c.borderLight },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.border },
              }}
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} color={c.textSecondary}>Description</Typography>
            <Box sx={{ 
              '.ql-container': { borderRadius: '0 0 6px 6px', backgroundColor: c.cardBg, color: c.textPrimary, fontSize: '0.9rem', border: `1px solid ${c.border}`, borderTop: 'none', minHeight: '120px' },
              '.ql-toolbar': { borderRadius: '6px 6px 0 0', backgroundColor: c.inputBg, border: `1px solid ${c.border}` },
              '.ql-editor': { minHeight: '120px', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
              '& .ql-container.ql-snow': { border: `1px solid ${c.border}` },
              '& .ql-toolbar.ql-snow': { border: `1px solid ${c.border}` },
              '.ql-stroke': { stroke: c.textSecondary },
              '.ql-fill': { fill: c.textSecondary },
              '.ql-picker': { color: c.textSecondary },
              mb: 1
            }}>
              <QuillEditor 
                value={description} 
                onChange={setDescription} 
                placeholder="Add a more detailed description..." 
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} color={c.textSecondary}>Work Type</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                sx={{ borderRadius: 1.5, backgroundColor: c.inputBg, fontWeight: 600, color: c.textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: c.borderLight }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.border }, '.MuiSelect-icon': { color: c.textSecondary } }}
                renderValue={(selected) => {
                  const type = WORK_TYPES.find(wt => wt.value === selected) || WORK_TYPES[0];
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {React.cloneElement(type.icon, { sx: { fontSize: 18, color: type.icon.props.sx.color } })}
                      {type.label}
                    </Box>
                  );
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.cardBg, color: c.textPrimary } } }}
              >
                {WORK_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value} sx={{ '&:hover': { bgcolor: c.hoverBg } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {React.cloneElement(type.icon, { sx: { fontSize: 18, color: type.icon.props.sx.color } })}
                      {type.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} color={c.textSecondary}>Assign To</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 1.5, backgroundColor: c.inputBg, color: c.textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: c.borderLight }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.border }, '.MuiSelect-icon': { color: c.textSecondary } }}
                renderValue={(selected) => {
                  if (!selected) return <Typography color={c.textTertiary}>Select...</Typography>;
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: theme.palette.primary.main }}>{selected.charAt(0)}</Avatar>
                      {selected}
                    </Box>
                  );
                }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.cardBg, color: c.textPrimary } } }}
              >
                <MenuItem value="" sx={{ '&:hover': { bgcolor: c.hoverBg } }}><em>Unassigned</em></MenuItem>
                {mockUsers.map((user) => (
                  <MenuItem key={user} value={user} sx={{ '&:hover': { bgcolor: c.hoverBg } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: theme.palette.primary.main }}>{user.charAt(0)}</Avatar>
                      {user}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} color={c.textSecondary}>Priority</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                sx={{ borderRadius: 1.5, backgroundColor: c.inputBg, fontWeight: 600, color: c.textPrimary, '.MuiOutlinedInput-notchedOutline': { borderColor: c.borderLight }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.border }, '.MuiSelect-icon': { color: c.textSecondary } }}
                MenuProps={{ PaperProps: { sx: { bgcolor: c.cardBg, color: c.textPrimary } } }}
              >
                <MenuItem value="Low" sx={{ '&:hover': { bgcolor: c.hoverBg } }}>Low</MenuItem>
                <MenuItem value="Medium" sx={{ '&:hover': { bgcolor: c.hoverBg } }}>Medium</MenuItem>
                <MenuItem value="High" sx={{ '&:hover': { bgcolor: c.hoverBg } }}>High</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1} color={c.textSecondary}>Attachment</Typography>
            <Box>
              {displayAttachment ? (
                <Box position="relative" display="inline-block" p={1} border={`1px solid ${c.border}`} borderRadius={2} bgcolor={c.inputBg}>
                  {attachmentType === 'video' ? (
                    <video src={displayAttachment} width="100%" controls style={{ maxHeight: 200, borderRadius: 4 }} />
                  ) : (
                    <img src={displayAttachment} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }} />
                  )}
                  <IconButton size="small" sx={{ position: 'absolute', top: 12, right: 12, backgroundColor: c.cardBg, border: `1px solid ${c.border}`, color: c.textSecondary, '&:hover': { backgroundColor: '#ffebee', color: '#de350b' } }} onClick={() => { setAttachment(null); setAttachmentType(null); setDisplayAttachment(null); }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />} sx={{ color: c.textSecondary, boxShadow: 'none', borderColor: c.border, bgcolor: c.inputBg, py: 2, borderStyle: 'dashed', borderRadius: 2, textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: c.hoverBg, borderColor: c.textTertiary } }}>
                  Upload Image or Video
                  <input type="file" hidden accept="image/*,video/*,.mkv,.avi,.mov,.wmv,.flv,.webm,.m4v" onChange={handleFileChange} />
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, borderTop: 'none', backgroundColor: 'transparent' }}>
        <Button onClick={handleClose} sx={{ color: c.textSecondary, textTransform: 'none', fontWeight: 600, '&:hover': { backgroundColor: c.hoverBg } }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disableElevation sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark }, textTransform: 'none', fontWeight: 600, px: 3 }} disabled={!title.trim() || createMutation.isPending}>Create Task</Button>
      </DialogActions>
    </Dialog>
  );
};
