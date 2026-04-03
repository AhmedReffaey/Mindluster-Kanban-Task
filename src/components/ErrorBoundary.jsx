import React from 'react';
import { Box, Typography } from '@mui/material';
import { WarningAmber as WarningIcon } from '@mui/icons-material';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorName: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorName: error.name || 'Error' };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error in a task card:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            p: 1.5, mb: 1.5, 
            borderRadius: 2, 
            backgroundColor: '#ffebe6', 
            border: '1px solid #ff8f73',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <WarningIcon sx={{ color: '#de350b', fontSize: 20 }} />
          <Box>
            <Typography variant="body2" sx={{ color: '#de350b', fontWeight: 700, fontSize: '0.8rem' }}>
              Something went wrong
            </Typography>
            <Typography variant="caption" sx={{ color: '#bf2600' }}>
              We couldn't render this task.
            </Typography>
          </Box>
        </Box>
      );
    }

    return this.props.children; 
  }
}
