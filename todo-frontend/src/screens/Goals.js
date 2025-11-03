import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Goals() {
  const [title, setTitle] = useState('');
  const [subtasks, setSubtasks] = useState([]);

const handleBreakdown = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post('http://localhost:3000/api/tasks/breakdown', { title }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubtasks(response.data.subtasks);
  } catch (error) {
    alert('Failed to generate breakdown');
  }
};

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post('http://localhost:3000/api/tasks', { title, subtasks }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Task saved');
    } catch (error) {
      alert('Failed to save task');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Add Task</Text>
      <TextInput placeholder="Task Title" value={title} onChangeText={setTitle} style={styles.input} />
      <Button title="AI Breakdown" onPress={handleBreakdown} />
      <FlatList
        data={subtasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
      <Button title="Save Task" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10 },
});
