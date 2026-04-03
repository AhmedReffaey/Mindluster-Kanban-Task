import React from 'react';
import { useStore } from '../store/useStore';
import { CreateTaskForm } from './task-modal/CreateTaskForm';
import { EditTaskForm } from './task-modal/EditTaskForm';

export const TaskModal = () => {
  const { isTaskModalOpen, taskToEdit } = useStore();

  if (!isTaskModalOpen) return null;

  return taskToEdit ? <EditTaskForm task={taskToEdit} /> : <CreateTaskForm />;
};
