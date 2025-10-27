import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [todaysMicroTasks, setTodaysMicroTasks] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    todays_micro_tasks: 0,
    completed_today: 0,
    progress_percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (taskData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
      await fetchTasks(); // Refresh tasks
      await fetchDashboardData();
      await fetchTodaysMicroTasks();
      return response.data;
    } catch (err) {
      setError('Failed to create task');
      console.error('Error creating task:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Complete a micro-task
  const completeMicroTask = async (microTaskId) => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/micro-tasks/${microTaskId}/complete`);
      await fetchTasks();
      await fetchDashboardData();
      await fetchTodaysMicroTasks();
    } catch (err) {
      setError('Failed to complete micro-task');
      console.error('Error completing micro-task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's micro-tasks
  const fetchTodaysMicroTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/micro-tasks/today`);
      setTodaysMicroTasks(response.data);
    } catch (err) {
      setError('Failed to fetch today\'s micro-tasks');
      console.error('Error fetching today\'s micro-tasks:', err);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`);
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Load initial data
  useEffect(() => {
    fetchTasks();
    fetchTodaysMicroTasks();
    fetchDashboardData();
  }, []);

  const value = {
    tasks,
    todaysMicroTasks,
    dashboardData,
    loading,
    error,
    fetchTasks,
    createTask,
    completeMicroTask,
    fetchTodaysMicroTasks,
    fetchDashboardData,
    clearError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};