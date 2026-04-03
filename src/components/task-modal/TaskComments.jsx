import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  Button,
  Divider,
  useTheme
} from '@mui/material';

export const TaskComments = ({ comments, onAddComment, onDeleteComment, onEditComment }) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const theme = useTheme();
  const c = theme.palette.custom;

  const handleAdd = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment);
    setNewComment('');
  };

  const handleSaveEdit = (id) => {
    if (!editingText.trim()) return;
    if (onEditComment) {
      onEditComment(id, editingText);
    }
    setEditingId(null);
    setEditingText('');
  };

  return (
    <Box>
      <Divider sx={{ mb: 3, borderColor: c.borderLight }} />
      <Typography variant="body2" fontWeight={700} mb={2} color={c.textPrimary} sx={{ textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 0.8 }}>
        Activity
      </Typography>

      <Box display="flex" gap={1.5} alignItems="flex-start" mb={3}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: '0.75rem', fontWeight: 700, mt: 0.5 }}>Y</Avatar>
        <Box flex={1}>
          <TextField
            placeholder="Add a comment..."
            variant="outlined"
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                borderRadius: '8px', fontSize: '0.875rem', backgroundColor: c.inputBg, color: c.textPrimary,
                '& fieldset': { borderColor: c.border },
                '&:hover fieldset': { borderColor: c.borderLight },
                '&.Mui-focused': { backgroundColor: c.cardBg },
              } 
            }}
          />
          {newComment.trim() && (
            <Box mt={1} display="flex" justifyContent="flex-start" gap={1}>
              <Button 
                variant="contained" 
                size="small" 
                disableElevation 
                onClick={handleAdd}
                sx={{ 
                  backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark },
                  textTransform: 'none', fontWeight: 600, fontSize: '0.8rem',
                  borderRadius: '6px', px: 2
                }}
              >
                Save
              </Button>
              <Button 
                size="small" 
                onClick={() => setNewComment('')}
                sx={{ textTransform: 'none', color: c.textSecondary, fontWeight: 600, fontSize: '0.8rem', borderRadius: '6px', '&:hover':{bgcolor: c.hoverBg} }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={0}>
        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3, color: c.textTertiary }}>
            <Typography variant="body2" color="inherit">No comments yet — be the first to comment!</Typography>
          </Box>
        ) : (
          comments.map((c_comment, idx) => (
            <Box 
              key={c_comment.id} 
              display="flex" 
              gap={1.5} 
              sx={{ 
                py: 1.5,
                borderTop: idx > 0 ? `1px solid ${c.borderLight}` : 'none',
                '&:hover .comment-actions': { opacity: 1 },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#6554c0', fontSize: '0.75rem', fontWeight: 700, mt: 0.3 }}>
                {c_comment.author.charAt(0)}
              </Avatar>
              <Box flex={1}>
                <Box display="flex" alignItems="baseline" gap={1} mb={0.3}>
                  <Typography variant="body2" fontWeight={700} color={c.textPrimary} sx={{ fontSize: '0.85rem' }}>
                    {c_comment.author}
                  </Typography>
                  <Typography variant="caption" color={c.textTertiary} sx={{ fontSize: '0.7rem' }}>
                    {c_comment.timestamp}
                  </Typography>

                  <Box className="comment-actions" sx={{ opacity: 0, display: 'flex', gap: 1, ml: 'auto', transition: 'opacity 0.15s' }}>
                    <Typography
                      variant="caption"
                      onClick={() => { setEditingId(c_comment.id); setEditingText(c_comment.text); }}
                      sx={{ 
                        cursor: 'pointer', color: c.textSecondary, fontWeight: 600, fontSize: '0.7rem',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Edit
                    </Typography>
                    <Typography
                      variant="caption"
                      onClick={() => onDeleteComment(c_comment.id)}
                      sx={{ 
                        cursor: 'pointer', color: '#de350b', fontWeight: 600, fontSize: '0.7rem',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Delete
                    </Typography>
                  </Box>
                </Box>

                {editingId === c_comment.id ? (
                   <Box mt={1}>
                     <TextField
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '6px', fontSize: '0.875rem', backgroundColor: c.cardBg, color: c.textPrimary,
                            '& fieldset': { borderColor: theme.palette.primary.main }
                          } 
                        }}
                     />
                     <Box mt={1} display="flex" gap={1}>
                       <Button variant="contained" size="small" disableElevation onClick={() => handleSaveEdit(c_comment.id)} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '4px', px: 1.5 }}>
                         Save
                       </Button>
                       <Button size="small" onClick={() => setEditingId(null)} sx={{ textTransform: 'none', color: c.textSecondary, fontWeight: 600, borderRadius: '4px' }}>
                         Cancel
                       </Button>
                     </Box>
                   </Box>
                ) : (
                  <Box sx={{ 
                    backgroundColor: c.inputBg, borderRadius: '8px', px: 1.5, py: 1, 
                    display: 'inline-block', maxWidth: '100%'
                  }}>
                    <Typography variant="body2" color={c.textPrimary} sx={{ fontSize: '0.875rem', lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {c_comment.text}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

TaskComments.propTypes = {
  comments: PropTypes.array.isRequired,
  onAddComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
};
