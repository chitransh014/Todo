import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

const AddTaskBottomSheet = ({ isVisible, onClose, onAddTask }) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Add New Task</Text>

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
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (title.trim()) {
              onAddTask({ title, description });
              setTitle('');
              setDescription('');
              onClose();
            } else {
              alert('Please enter a title');
            }
          }}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: { color: 'white', fontWeight: 'bold' },
});

export default AddTaskBottomSheet;
