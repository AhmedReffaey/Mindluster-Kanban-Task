import { createTheme } from '@mui/material/styles';

// Custom palette extensions for both modes
const lightCustom = {
  cardBg: '#ffffff',
  columnBg: '#f4f5f7',
  headerBg: '#ffffff',
  inputBg: '#fafbfc',
  hoverBg: '#091e420a',
  border: '#dfe1e6',
  borderLight: '#ebecf0',
  chipBg: '#dfe1e6',
  textPrimary: '#172b4d',
  textSecondary: '#5e6c84',
  textTertiary: '#97a0af',
  scrollThumb: '#c1c7d0',
  filterActiveBg: '#deebff',
  filterActiveBorder: '#b3d4ff',
  shadow: 'rgba(9, 30, 66, 0.25)',
  shadowLight: 'rgba(9, 30, 66, 0.08)',
};

const darkCustom = {
  cardBg: '#22304a',
  columnBg: '#1e2d44',
  headerBg: '#161b22',
  inputBg: '#283a54',
  hoverBg: 'rgba(255,255,255,0.04)',
  border: '#344563',
  borderLight: '#2c3e5a',
  chipBg: '#344563',
  textPrimary: '#c7d1db',
  textSecondary: '#8c9bab',
  textTertiary: '#67768a',
  scrollThumb: '#455a75',
  filterActiveBg: '#1c3a5e',
  filterActiveBorder: '#1c5aab',
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(0, 0, 0, 0.2)',
};

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#579dff' : '#0052cc' },
      background: {
        default: mode === 'dark' ? '#0d1117' : '#ffffff',
        paper: mode === 'dark' ? '#1b2638' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#c7d1db' : '#172b4d',
        secondary: mode === 'dark' ? '#8c9bab' : '#5e6c84',
      },
      divider: mode === 'dark' ? '#344563' : '#dfe1e6',
      custom: mode === 'dark' ? darkCustom : lightCustom,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });
