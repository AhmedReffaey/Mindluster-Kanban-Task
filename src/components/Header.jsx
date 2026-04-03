import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, InputBase, Button, Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { Search as SearchIcon, LightMode, DarkMode, SettingsBrightness, Check as CheckIcon } from '@mui/icons-material';
import { useStore } from '../store/useStore';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: <LightMode fontSize="small" /> },
  { value: 'dark', label: 'Dark', icon: <DarkMode fontSize="small" /> },
  { value: 'system', label: 'System', icon: <SettingsBrightness fontSize="small" /> },
];

export const Header = () => {
  const { setSearchQuery, openTaskModal, themeMode, setThemeMode } = useStore();
  const [localSearch, setLocalSearch] = useState('');
  const debounceTimer = useRef(null);
  const theme = useTheme();
  const c = theme.palette.custom;
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [localSearch, setSearchQuery]);

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: `1px solid ${c.border}`, backgroundColor: c.headerBg, color: c.textPrimary }}>
      <Toolbar sx={{ minHeight: '56px !important', display: 'flex', justifyContent: 'space-between' }}>
        
        {/* Left Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: 1, backgroundColor: theme.palette.primary.main, color: '#fff', mr: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
              J
            </Typography>
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 600, fontSize: '1.1rem', mr: 3 }}>
            Agile Board
          </Typography>
        </Box>

        {/* Center: Search */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Search sx={{ backgroundColor: c.inputBg, border: `1px solid ${c.border}`, '&:hover': { backgroundColor: c.hoverBg }, width: '100%', maxWidth: '400px' }}>
            <SearchIconWrapper>
              <SearchIcon sx={{ color: c.textSecondary, fontSize: '1.2rem' }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search by title or description…"
              inputProps={{ 'aria-label': 'search' }}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              sx={{ color: c.textPrimary, fontSize: '0.9rem', width: '100%' }}
            />
          </Search>
        </Box>

        {/* Right Side */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', flex: 1, alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <Tooltip title="Theme">
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: c.textSecondary, '&:hover': { backgroundColor: c.hoverBg } }}
            >
              {themeMode === 'dark' ? <DarkMode fontSize="small" /> : themeMode === 'light' ? <LightMode fontSize="small" /> : <SettingsBrightness fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { borderRadius: '8px', minWidth: 160, boxShadow: `0 4px 12px ${c.shadow}` } }}
          >
            {THEME_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.value}
                onClick={() => { setThemeMode(opt.value); setAnchorEl(null); }}
                selected={themeMode === opt.value}
                dense
              >
                <ListItemIcon sx={{ minWidth: 32 }}>{opt.icon}</ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: themeMode === opt.value ? 600 : 400 }}>
                  {opt.label}
                </ListItemText>
                {themeMode === opt.value && <CheckIcon sx={{ fontSize: '1rem', color: theme.palette.primary.main, ml: 1 }} />}
              </MenuItem>
            ))}
          </Menu>

          <Button
            variant="contained"
            onClick={() => openTaskModal()}
            disableElevation
            sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark }, textTransform: 'none', fontWeight: 600, px: 2 }}
          >
            Create Task
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
