import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';

export default function Goals() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [energyLevel, setEnergyLevel] = useState('medium');

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
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
    } catch (error) {
      console.error('Save task error:', error);
      alert('Failed to add task');
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
});
