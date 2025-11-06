import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';
import AddTaskBottomSheet from '../components/AddTaskBottomSheet';

const Dashboard = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');
  const [isSheetVisible, setIsSheetVisible] = useState(false);

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

  const addTask = async (task) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/tasks`, task, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh tasks
      fetchTasks();
    } catch (error) {
      console.error('Add task error:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity style={styles.taskContent} onPress={() => navigation.navigate('TaskDetail', { task: item })}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.taskDescription}>{item.description}</Text>
        )}

      </TouchableOpacity>
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

      <TouchableOpacity style={styles.fab} onPress={() => setIsSheetVisible(true)}>
        <Text style={{ fontSize: 28, color: 'white' }}>+</Text>
      </TouchableOpacity>

      <AddTaskBottomSheet
        isVisible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onAddTask={(task) => {
          console.log('New Task:', task);
          addTask(task);
        }}
      />
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#007BFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  miniButton: {
    position: 'absolute',
    right: 30,
  },
  innerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

});

export default Dashboard;
