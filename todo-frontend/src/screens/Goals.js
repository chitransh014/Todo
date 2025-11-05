import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';

export default function Goals({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/tasks`, {
        title: title.trim(),
        description: description.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Task added successfully');
      setTitle('');
      setDescription('');
      fetchTasks(); // Refresh the list
    } catch (error) {
      console.error('Save task error:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription}>{item.description || 'No description'}</Text>
      <Text style={styles.taskStatus}>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add one below!</Text>}
        style={styles.list}
      />

      <View style={styles.addTaskContainer}>
        <Text style={styles.addTitle}>Add New Task</Text>

        <TextInput
          placeholder="Task Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Task Description (optional)"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
        />

        <Button title="Add Task" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  list: { flex: 1 },
  taskItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  taskDescription: { fontSize: 14, color: '#666', marginTop: 5 },
  taskStatus: { fontSize: 12, color: '#999', marginTop: 5 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 20 },
  addTaskContainer: { marginTop: 20 },
  addTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
