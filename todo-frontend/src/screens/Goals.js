import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity,RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useTasks } from '../context/TaskContext';
import AddTaskModal from '../components/AddTaskModal';

export default function Goals({ navigation }) {
  const { tasks, fetchTasks, updateTask, addTask } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchTasks(); // refresh every time you come back to this screen
    }, [fetchTasks])
  );

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => {
        setSelectedTask(item);
        setIsModalVisible(true);
      }}
    >
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDescription}>
        {item.description || 'No description'}
      </Text>
      <Text style={styles.taskStatus}>
  {item.dueDate ? `Due: ${new Date(item.dueDate).toDateString()}` : "No due date"}
</Text>

      {item.subtasks && item.subtasks.length > 0 && (
        <Text style={styles.subtaskCount}>
          Subtasks: {item.subtasks.filter(st => st.completed).length}/{item.subtasks.length}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet.</Text>
        }
        style={styles.list}
      />

      <AddTaskModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedTask(null);
        }}
        onAddTask={addTask}
        taskToEdit={selectedTask}
        onUpdateTask={updateTask}
      />
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
  subtaskCount: { fontSize: 12, color: '#666', marginTop: 5 },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 20 },

});
