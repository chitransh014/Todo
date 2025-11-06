import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';

export default function TaskDetail({ route, navigation }) {
  const { taskId } = route.params; // ✅ received from navigation
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch Task Details
  const fetchTask = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(res.data.task);
      setSubtasks(res.data.task.subtasks || []);
    } catch (error) {
      console.error('Fetch task error:', error);
      Alert.alert('Error', 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  // 🔹 Add Subtask
  const addSubtask = async () => {
    if (!newSubtask.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${BASE_URL}/tasks/${taskId}/subtasks`,
        { title: newSubtask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubtasks([...subtasks, res.data.subtask]);
      setNewSubtask('');
    } catch (error) {
      console.error('Add subtask error:', error);
      Alert.alert('Error', 'Failed to add subtask.');
    }
  };

  // 🔹 Toggle Subtask Completion
  const toggleSubtask = async (subtaskId, currentCompleted) => {
    // Optimistic update
    setSubtasks(subtasks.map(st => st.id === subtaskId ? { ...st, completed: !currentCompleted } : st));

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Toggle subtask error:', error);
      // Revert optimistic update on error
      setSubtasks(subtasks.map(st => st.id === subtaskId ? { ...st, completed: currentCompleted } : st));
      Alert.alert('Error', 'Failed to toggle subtask.');
    }
  };

  // 🔹 Mark Task Complete
  const markComplete = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/tasks/${taskId}`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Task Completed 🎉');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark task complete.');
    }
  };

  if (!task) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{task.title}</Text>

      <Text style={styles.label}>Details</Text>
      <TextInput
        style={styles.input}
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        placeholder="Add details"
        multiline
      />



      <Text style={styles.label}>Subtasks</Text>
      {subtasks.map((st) => (
        <TouchableOpacity key={st.id} style={styles.subtaskItem} onPress={() => toggleSubtask(st.id, st.completed)}>
          <Ionicons
            name={st.completed ? 'checkbox' : 'square-outline'}
            size={20}
            color={st.completed ? '#4CAF50' : '#ccc'}
          />
          <Text style={[styles.subtaskText, st.completed && styles.completedText]}>{st.title}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.row}>
        <TextInput
          placeholder="New Subtask"
          value={newSubtask}
          onChangeText={setNewSubtask}
          style={[styles.input, { flex: 1 }]}
        />
        <Button title="Add" onPress={addSubtask} />
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={markComplete}>
        <Text style={styles.completeText}>Mark Completed</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 16, marginTop: 20, color: '#555' },
  value: { fontSize: 16, marginTop: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 8,
    borderRadius: 5,
  },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 10 },
  subtaskText: { marginLeft: 10, fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: '#888' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  completeButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  completeText: { fontWeight: 'bold', color: '#000' },
});
