import React from 'react';
import {
  Assignment as TaskIcon,
  BugReport as BugIcon,
  FlashOn as EpicIcon,
  Bookmark as StoryIcon
} from '@mui/icons-material';

export const WORK_TYPES = [
  { value: 'task', label: 'Task', icon: <TaskIcon sx={{ color: '#4bade8', fontSize: 18 }} /> },
  { value: 'epic', label: 'Epic', icon: <EpicIcon sx={{ color: '#904ee2', fontSize: 18 }} /> },
  { value: 'bug', label: 'Bug', icon: <BugIcon sx={{ color: '#e5493a', fontSize: 18 }} /> },
  { value: 'story', label: 'Story', icon: <StoryIcon sx={{ color: '#65ba43', fontSize: 18 }} /> },
];

export const columns = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

export const mockUsers = ['Ahmed', 'Mohamed', 'Sara', 'Omar', 'Aya'];

export const statusColors = {
  backlog: { bg: '#dfe1e6', color: '#42526e' },
  in_progress: { bg: '#deebff', color: '#0052cc' },
  review: { bg: '#fff0b3', color: '#974f0c' },
  done: { bg: '#e3fcef', color: '#006644' },
};
