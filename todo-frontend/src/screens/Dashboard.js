import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../api/auth';

export default function Dashboard({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
      setName(response.data.name);
    } catch (error) {
      console.error('Fetch tasks error:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${BASE_URL}/tasks/${taskId}`, {
        status: newStatus,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh tasks
      fetchTasks();
    } catch (error) {
      console.error('Update task error:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              // Refresh tasks
              fetchTasks();
            } catch (error) {
              console.error('Delete task error:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.taskDescription}>{item.description}</Text>
        )}
        <Text style={styles.taskMeta}>
          Priority: {item.priority} | Energy: {item.energyLevel}
        </Text>
      </View>
      <View style={styles.taskActions}>
        {item.status !== 'completed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateTaskStatus(item.id, 'completed')}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteTask(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hi, {name}</Text>

      <Text style={styles.sectionTitle}>Today's Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks for today. Add new tasks!</Text>}
      />

      <View style={styles.buttonContainer}>
        <Button title="Add Task" onPress={() => navigation.navigate('Goals')} />
        <Button
          title="Logout"
          onPress={() => {
            logout();
            navigation.navigate('Login');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  taskItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  taskDescription: { fontSize: 14, color: '#666', marginTop: 5 },
  taskMeta: { fontSize: 12, color: '#888', marginTop: 5 },
  taskActions: { flexDirection: 'row', marginTop: 10 },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  completeButton: { backgroundColor: '#4CAF50' },
  deleteButton: { backgroundColor: '#f44336' },
  buttonText: { color: 'white', fontSize: 12 },
  emptyText: { textAlign: 'center', fontStyle: 'italic', color: '#666', marginTop: 20 },
  buttonContainer: { marginTop: 20, gap: 10 },
});
