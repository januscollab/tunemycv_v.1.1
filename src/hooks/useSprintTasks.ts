import { useState, useEffect, useCallback } from 'react';

interface SprintItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  sprintId: string;
  tags: string[];
  createdAt: Date;
}

const STORAGE_KEY = 'dev-sprint-tasks';

export const useSprintTasks = () => {
  const [tasks, setTasks] = useState<SprintItem[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt)
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error('[useSprintTasks] Failed to load tasks:', error);
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('[useSprintTasks] Failed to save tasks:', error);
    }
  }, [tasks]);

  const addTask = useCallback((taskData: Partial<SprintItem>) => {
    const newTask: SprintItem = {
      id: taskData.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title || '',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      sprintId: taskData.sprintId || 'backlog',
      tags: taskData.tags || [],
      createdAt: taskData.createdAt || new Date()
    };

    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<SprintItem>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const moveTask = useCallback((taskId: string, newSprintId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, sprintId: newSprintId } : task
    ));
  }, []);

  const getTasksBySprintId = useCallback((sprintId: string) => {
    return tasks.filter(task => task.sprintId === sprintId);
  }, [tasks]);

  const clearAllTasks = useCallback(() => {
    setTasks([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportTasks = useCallback(() => {
    return tasks;
  }, [tasks]);

  const importTasks = useCallback((importedTasks: SprintItem[]) => {
    const validatedTasks = importedTasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt)
    }));
    setTasks(validatedTasks);
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksBySprintId,
    clearAllTasks,
    exportTasks,
    importTasks
  };
};