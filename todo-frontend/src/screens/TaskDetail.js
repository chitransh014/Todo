import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';

export default function TaskDetail({ route, navigation }) {
  const { task } = route.params;
  const [title, setTitle] = useState(task.title);
  const [details, setDetails] = useState(task.description || '');
  const [date, setDate] = useState(task.dueDate || '');

  const handleMarkComplete = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${BASE_URL}/tasks/${task.id}`, {
        status: 'completed',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task marked as completed');
      navigation.goBack();
    } catch (error) {
      console.error('Mark complete error:', error);
      alert('Failed to mark task as completed');
    }
  };

  const handleUpdateTitle = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${BASE_URL}/tasks/${task.id}`, {
        title: title.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task title updated');
    } catch (error) {
      console.error('Update title error:', error);
      alert('Failed to update task title');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        onBlur={handleUpdateTitle}
        placeholder="Task title"
      />

      <TouchableOpacity style={styles.row}>
        <Ionicons name="reorder-three-outline" size={20} color="#bbb" />
        <Text style={styles.option}>Add details</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Ionicons name="time-outline" size={20} color="#bbb" />
        <Text style={styles.option}>Add date/time</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row}>
        <Ionicons name="git-branch-outline" size={20} color="#bbb" />
        <Text style={styles.option}>Add subtasks</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.completeBtn} onPress={handleMarkComplete}>
        <Text style={styles.completeText}>Mark completed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1c1c1c', padding: 20 },
  titleInput: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  option: { color: '#ddd', fontSize: 16, marginLeft: 10 },
  completeBtn: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#e2b44e',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  completeText: { color: '#000', fontWeight: '600' },
});
