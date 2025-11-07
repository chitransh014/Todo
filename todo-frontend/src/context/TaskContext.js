// context/TaskContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../api/auth';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch tasks once at startup
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // helper to add task
  const addTask = async (task) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => [response.data.task, ...prev]);
    } catch (err) {
      console.error('Add task error:', err);
    }
  };

  // helper to update task
  const updateTask = async (taskId, data) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${BASE_URL}/tasks/${taskId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? response.data.task : t))
      );
    } catch (err) {
      console.error('Update task error:', err);
    }
  };

  // helper to delete task
  const deleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  return (
    <TaskContext.Provider
      value={{ tasks, loading, fetchTasks, addTask, updateTask, deleteTask }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
