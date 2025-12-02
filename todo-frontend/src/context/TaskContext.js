// context/TaskContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../api/auth';
import * as Notifications from 'expo-notifications';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ADD TASK
  const addTask = async (taskData) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(`${BASE_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => [response.data.task, ...prev]);
    } catch (err) {
      console.error("Add task error:", err);
    }
  };

  // UPDATE TASK  (FULL FIX)
  const updateTask = async (_id, updateData) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.put(
        `${BASE_URL}/tasks/${_id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setTasks((prev) =>
        prev.map((t) => (t._id === _id ? response.data.task : t))
      );
    } catch (err) {
      console.error("Update task error:", err);
    }
  };

  // DELETE TASK (FIXED)
  const deleteTask = async (_id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const task = tasks.find((t) => t._id === _id);

      // Cancel notification if exists
      if (task?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(task.notificationId);
      }

      await axios.delete(`${BASE_URL}/tasks/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => prev.filter((t) => t._id !== _id));
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
