import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { WarningAmberRounded as WarningIcon } from '@mui/icons-material';
import { useStore } from '../store/useStore';

export const ConfirmDialog = () => {
  const { confirmDialog, clearConfirm } = useStore();
  const theme = useTheme();
  const c = theme.palette.custom;

  if (!confirmDialog) return null;

  const handleConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    clearConfirm();
  };

  return (
    <Dialog 
      open={Boolean(confirmDialog)} 
      onClose={clearConfirm}
      PaperProps={{ 
        sx: { 
          borderRadius: 3, 
          maxWidth: 400,
          backgroundColor: c.cardBg,
          boxShadow: `0 8px 32px rgba(9, 30, 66, 0.15), 0 0 0 1px ${c.borderLight}`
        } 
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{ display: 'flex', backgroundColor: '#fff0b3', color: '#ff991f', borderRadius: '50%', p: 0.8 }}>
          <WarningIcon />
        </Box>
        <Typography component="span" variant="h6" fontWeight="bold" sx={{ color: c.textPrimary, fontSize: '1.1rem' }}>
          Please Confirm
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ color: c.textSecondary, mt: 1 }}>
          {confirmDialog.message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button 
          onClick={clearConfirm} 
          sx={{ textTransform: 'none', color: c.textSecondary, fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disableElevation
          sx={{ 
            backgroundColor: theme.palette.primary.main, 
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            textTransform: 'none', fontWeight: 600 
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
