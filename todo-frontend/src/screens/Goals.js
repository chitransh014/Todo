import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';

export default function Goals() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEnergyLevel, setEditEnergyLevel] = useState('medium');

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data.tasks);
    } catch (error) {
      console.log('Fetch tasks error:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      // console.log('Token:', token);
      const response = await axios.post(`${BASE_URL}/tasks`, {
        title: title.trim(),
        description: description.trim(),
        energyLevel,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task added successfully');
      setTitle('');
      setDescription('');
      setEnergyLevel('medium');

      // Refresh list after adding
      fetchTasks();
    } catch (error) {
      console.error('Save task error:', error);
      alert('Failed to add task');
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${BASE_URL}/tasks/${taskId}`, {
        status: 'completed',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task marked as completed');
      fetchTasks();
    } catch (error) {
      console.error('Mark complete error:', error);
      alert('Failed to mark task as completed');
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      console.error('Delete task error:', error);
      alert('Failed to delete task');
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditEnergyLevel(task.energyLevel);
  };

  const handleUpdateTask = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/tasks/${editingTask.id}`,
        {
          title: editTitle,
          description: editDescription,
          energyLevel: editEnergyLevel,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Task updated successfully');
      setEditingTask(null);
      // Refresh task list
      fetchTasks();
    } catch (error) {
      console.error('Update task error:', error);
      alert('Failed to update task');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Task</Text>

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

      <Text style={styles.label}>Energy Level:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={energyLevel}
          onValueChange={(itemValue) => setEnergyLevel(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Low" value="low" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="High" value="high" />
        </Picker>
      </View>

      <Button title="Add Task" onPress={handleSave} />

      {/* Show list of tasks */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDesc}>{item.description}</Text>
            <Text style={styles.taskEnergy}>Energy: {item.energyLevel}</Text>
            <View style={styles.taskActions}>
              {item.status !== 'completed' && (
                <Button
                  title="Mark Complete"
                  onPress={() => handleMarkComplete(item.id)}
                  color="#4CAF50"
                />
              )}
              <Button
                title="Edit"
                onPress={() => startEditing(item)}
                color="orange"
              />
              <Button
                title="Delete"
                onPress={() => handleDelete(item.id)}
                color="#f44336"
              />
            </View>
          </View>
        )}
      />

      <Modal
        visible={!!editingTask}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingTask(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>

            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Task title"
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Task description"
              multiline
            />

            <Picker
              selectedValue={editEnergyLevel}
              onValueChange={(itemValue) => setEditEnergyLevel(itemValue)}
            >
              <Picker.Item label="Low" value="low" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="High" value="high" />
            </Picker>

            <Button title="Update Task" onPress={handleUpdateTask} />
            <Button title="Cancel" color="gray" onPress={() => setEditingTask(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
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
  label: { fontSize: 16, marginVertical: 10 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 10,
  },
  picker: { height: 50 },
  taskItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  taskTitle: { fontWeight: 'bold', fontSize: 16 },
  taskDesc: { fontSize: 14 },
  taskEnergy: { fontSize: 12, color: 'gray' },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});
