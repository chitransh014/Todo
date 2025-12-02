import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';

export default function TaskDetail({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  /* ------------------- Fetch Task Details ------------------- */
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

  /* ------------------- Add Subtask ------------------- */
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

  /* ------------------- Toggle Subtask Completion ------------------- */
  const toggleSubtask = async (subtaskId, currentCompleted) => {
    // Optimistic UI update
    setSubtasks(
      subtasks.map(st =>
        st._id === subtaskId ? { ...st, completed: !currentCompleted } : st
      )
    );

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Toggle subtask error:', error);
      // Rollback
      setSubtasks(
        subtasks.map(st =>
          st._id === subtaskId ? { ...st, completed: currentCompleted } : st
        )
      );
      Alert.alert('Error', 'Failed to toggle subtask.');
    }
  };

  /* ------------------- Edit Subtask Title ------------------- */
  const startEditing = (subtaskId, currentTitle) => {
    setEditingSubtaskId(subtaskId);
    setEditingTitle(currentTitle);
  };

  const saveEdit = async () => {
    if (!editingTitle.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/tasks/${taskId}/subtasks/${editingSubtaskId}`,
        { title: editingTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubtasks(
        subtasks.map(st =>
          st._id === editingSubtaskId ? { ...st, title: editingTitle } : st
        )
      );

      setEditingSubtaskId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Edit subtask error:', error);
      Alert.alert('Error', 'Failed to update subtask.');
    }
  };

  const cancelEdit = () => {
    setEditingSubtaskId(null);
    setEditingTitle('');
  };

  /* ------------------- Delete Subtask ------------------- */
  const deleteSubtask = async (subtaskId) => {
    Alert.alert(
      'Delete Subtask',
      'Are you sure you want to delete this subtask?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(
                `${BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              setSubtasks(subtasks.filter(st => st._id !== subtaskId));
            } catch (error) {
              console.error('Delete subtask error:', error);
              Alert.alert('Error', 'Failed to delete subtask.');
            }
          },
        },
      ]
    );
  };

  /* ------------------- Mark Task Completed ------------------- */
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

      {/* Details */}
      <Text style={styles.label}>Details</Text>
      <TextInput
        style={styles.input}
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        placeholder="Add details"
        multiline
      />

      {/* Due Date */}
      <Text style={styles.label}>Due Date</Text>
      <Text style={styles.value}>
        {task.dueDate
          ? new Date(task.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
          : 'No due date set'}
      </Text>

      {/* Subtasks Section */}
      <TouchableOpacity
        onPress={() => setShowAddSubtask(!showAddSubtask)}
        style={styles.addSubtaskHeader}
      >
        <Text style={styles.label}>Subtasks</Text>
        <Ionicons
          name={showAddSubtask ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#555"
        />
      </TouchableOpacity>

      {subtasks.map((st) => (
        <View key={st._id} style={styles.subtaskItem}>

          {/* Checkbox */}
          <TouchableOpacity
            onPress={() => toggleSubtask(st._id, st.completed)}
            style={styles.checkboxContainer}
          >
            <Ionicons
              name={st.completed ? 'checkbox' : 'square-outline'}
              size={20}
              color={st.completed ? '#4CAF50' : '#ccc'}
            />
          </TouchableOpacity>

          {/* Title or Edit Mode */}
          {editingSubtaskId === st._id ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={editingTitle}
                onChangeText={setEditingTitle}
                autoFocus
              />
              <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
                <Ionicons name="checkmark" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelEdit} style={styles.cancelBtn}>
                <Ionicons name="close" size={20} color="#ff0000" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => startEditing(st._id, st.title)}
              style={styles.textContainer}
            >
              <Text
                style={[
                  styles.subtaskText,
                  st.completed && styles.completedText,
                ]}
              >
                {st.title}
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete */}
          <TouchableOpacity
            onPress={() => deleteSubtask(st._id)}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash" size={20} color="#ff0000" />
          </TouchableOpacity>
        </View>
      ))}

      {/* Add Subtask */}
      {showAddSubtask && (
        <View style={styles.addSubtaskContainer}>
          <TextInput
            placeholder="Add a subtask"
            value={newSubtask}
            onChangeText={setNewSubtask}
            style={styles.addSubtaskInput}
          />
          <TouchableOpacity onPress={addSubtask} style={styles.addSubtaskBtn}>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Mark Completed */}
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
  checkboxContainer: { marginRight: 10 },
  textContainer: { flex: 1 },
  subtaskText: { fontSize: 16 },
  completedText: { textDecorationLine: 'line-through', color: '#888' },
  editContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  saveBtn: { marginRight: 10 },
  cancelBtn: { marginRight: 10 },
  deleteBtn: { marginLeft: 10 },
  addSubtaskHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  addSubtaskContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 10 },
  addSubtaskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addSubtaskBtn: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
  },
  completeText: { fontWeight: 'bold', color: '#000' },
});
