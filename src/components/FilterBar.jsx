import React, { useMemo } from 'react';
import { Box, Chip, Typography, Button, Menu, MenuItem, Checkbox, ListItemText, Divider, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  Assignment as TaskIcon,
  BugReport as BugIcon,
  FlashOn as EpicIcon,
  Bookmark as StoryIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useStore } from '../store/useStore';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/api';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const WORK_TYPE_OPTIONS = [
  { value: 'task', label: 'Task', icon: <TaskIcon sx={{ color: '#4bade8', fontSize: 16 }} /> },
  { value: 'epic', label: 'Epic', icon: <EpicIcon sx={{ color: '#904ee2', fontSize: 16 }} /> },
  { value: 'bug', label: 'Bug', icon: <BugIcon sx={{ color: '#e5493a', fontSize: 16 }} /> },
  { value: 'story', label: 'Story', icon: <StoryIcon sx={{ color: '#65ba43', fontSize: 16 }} /> },
];

const priorityColors = {
  Low: { bg: '#dfe1e6', color: '#42526e' },
  Medium: { bg: '#fff0b3', color: '#974f0c' },
  High: { bg: '#ffebe6', color: '#de350b' },
};

const FilterDropdown = ({ label, options, selected, onToggle, renderOption }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ArrowDownIcon sx={{ fontSize: '1rem !important' }} />}
        sx={{
          textTransform: 'none',
          color: selected.length > 0 ? 'primary.main' : 'text.secondary',
          fontWeight: 600,
          fontSize: '0.8rem',
          borderRadius: '6px',
          px: 1.5,
          py: 0.5,
          backgroundColor: selected.length > 0 ? (t) => t.palette.custom.filterActiveBg : 'transparent',
          border: selected.length > 0 ? (t) => `1px solid ${t.palette.custom.filterActiveBorder}` : '1px solid transparent',
          '&:hover': { backgroundColor: (t) => selected.length > 0 ? t.palette.custom.filterActiveBorder : t.palette.custom.hoverBg },
        }}
      >
        {label}
        {selected.length > 0 && (
          <Box
            component="span"
            sx={{
              ml: 0.5,
              backgroundColor: 'primary.main',
              color: '#fff',
              borderRadius: '10px',
              px: 0.8,
              py: 0,
              fontSize: '0.65rem',
              fontWeight: 700,
              lineHeight: '16px',
              minWidth: 16,
              textAlign: 'center',
            }}
          >
            {selected.length}
          </Box>
        )}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(9, 30, 66, 0.15), 0 0 1px rgba(9, 30, 66, 0.31)',
            mt: 0.5,
            minWidth: 180,
          }
        }}
      >
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const isSelected = selected.includes(value);
          return (
            <MenuItem
              key={value}
              onClick={() => onToggle(value)}
              dense
              sx={{ py: 0.5, px: 2, '&:hover': { backgroundColor: (t) => t.palette.custom.hoverBg } }}
            >
              <Checkbox
                checked={isSelected}
                size="small"
                sx={{
                  p: 0, mr: 1.5,
                  color: (t) => t.palette.custom.scrollThumb,
                  '&.Mui-checked': { color: 'primary.main' },
                }}
              />
              {renderOption ? renderOption(option, isSelected) : (
                <ListItemText primary={value} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400, color: 'text.primary' }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export const FilterBar = () => {
  const { filters, setFilter, clearAllFilters } = useStore();
  const { data: allTasks = [] } = useQuery({ queryKey: ['tasks'], queryFn: () => fetchTasks() });

  // Extract unique assignees from actual data
  const assigneeOptions = useMemo(() => {
    const set = new Set();
    allTasks.forEach((t) => { if (t.assignee) set.add(t.assignee); });
    return Array.from(set).sort();
  }, [allTasks]);

  const hasActiveFilters = filters.priority.length > 0 || filters.workType.length > 0 || filters.assignee.length > 0;

  const handleToggle = (key) => (value) => {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilter(key, next);
  };

  const removeChip = (key, value) => {
    setFilter(key, filters[key].filter((v) => v !== value));
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderBottom: (t) => `1px solid ${t.palette.custom.borderLight}`,
        backgroundColor: (t) => t.palette.custom.headerBg,
        flexWrap: 'wrap',
        minHeight: 44,
      }}
    >
      <FilterIcon sx={{ color: 'text.secondary', fontSize: '1.1rem', mr: 0.5 }} />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem', mr: 0.5 }}>
        Filter:
      </Typography>

      {/* Priority Filter */}
      <FilterDropdown
        label="Priority"
        options={PRIORITY_OPTIONS}
        selected={filters.priority}
        onToggle={handleToggle('priority')}
        renderOption={(option, isSelected) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: priorityColors[option]?.color || '#42526e',
            }} />
            <ListItemText primary={option} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400, color: 'text.primary' }} />
          </Box>
        )}
      />

      {/* Work Type Filter */}
      <FilterDropdown
        label="Type"
        options={WORK_TYPE_OPTIONS}
        selected={filters.workType}
        onToggle={handleToggle('workType')}
        renderOption={(option, isSelected) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {option.icon}
            <ListItemText primary={option.label} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 400, color: '#172b4d' }} />
          </Box>
        )}
      />

      {/* Assignee Filter */}
      {assigneeOptions.length > 0 && (
        <FilterDropdown
          label="Assignee"
          options={assigneeOptions}
          selected={filters.assignee}
          onToggle={handleToggle('assignee')}
        />
      )}

      {/* Separator + Active filter chips */}
      {hasActiveFilters && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: 'divider' }} />

          {filters.priority.map((v) => (
            <Chip
              key={`p-${v}`}
              label={v}
              size="small"
              onDelete={() => removeChip('priority', v)}
              deleteIcon={<CloseIcon sx={{ fontSize: '0.8rem !important' }} />}
              sx={{
                height: 24, fontSize: '0.75rem', fontWeight: 600,
                backgroundColor: priorityColors[v]?.bg || '#dfe1e6',
                color: priorityColors[v]?.color || '#42526e',
                '& .MuiChip-deleteIcon': { color: priorityColors[v]?.color || '#42526e', '&:hover': { color: '#de350b' } },
              }}
            />
          ))}

          {filters.workType.map((v) => {
            const wt = WORK_TYPE_OPTIONS.find((o) => o.value === v);
            return (
              <Chip
                key={`w-${v}`}
                label={wt?.label || v}
                icon={wt?.icon}
                size="small"
                onDelete={() => removeChip('workType', v)}
                deleteIcon={<CloseIcon sx={{ fontSize: '0.8rem !important' }} />}
                sx={{
                  height: 24, fontSize: '0.75rem', fontWeight: 600,
                  backgroundColor: (t) => t.palette.custom.chipBg, color: 'text.primary',
                  '& .MuiChip-icon': { ml: 0.5 },
                  '& .MuiChip-deleteIcon': { color: '#6b778c', '&:hover': { color: '#de350b' } },
                }}
              />
            );
          })}

          {filters.assignee.map((v) => (
            <Chip
              key={`a-${v}`}
              label={v}
              size="small"
              onDelete={() => removeChip('assignee', v)}
              deleteIcon={<CloseIcon sx={{ fontSize: '0.8rem !important' }} />}
              sx={{
                height: 24, fontSize: '0.75rem', fontWeight: 600,
                backgroundColor: '#deebff', color: '#0052cc',
                '& .MuiChip-deleteIcon': { color: '#0052cc', '&:hover': { color: '#de350b' } },
              }}
            />
          ))}

          <Tooltip title="Clear all filters">
            <Button
              size="small"
              onClick={clearAllFilters}
              sx={{
                textTransform: 'none',
                color: '#de350b',
                fontWeight: 600,
                fontSize: '0.75rem',
                minWidth: 'auto',
                px: 1,
                py: 0.3,
                borderRadius: '6px',
                '&:hover': { backgroundColor: '#ffebe6' },
              }}
            >
              Clear all
            </Button>
          </Tooltip>
        </>
      )}
    </Box>
  );
};
