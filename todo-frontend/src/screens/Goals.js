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
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  useFocusEffect(
    useCallback(() => {
      fetchTasks(); // refresh every time you come back to this screen
    }, [fetchTasks])
  );

  const toggleExpanded = (taskId) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const renderTask = ({ item }) => {
    const isExpanded = expandedTasks.has(item.id);

    return (
      <View style={styles.taskItem}>
        <TouchableOpacity
          style={styles.taskHeader}
          onPress={() => toggleExpanded(item.id)}
        >
          <View style={styles.taskContent}>
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
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.expandedTitle}>Task Details</Text>
            <Text style={styles.expandedText}>
              <Text style={styles.label}>Title: </Text>{item.title}
            </Text>
            <Text style={styles.expandedText}>
              <Text style={styles.label}>Description: </Text>{item.description || 'No description'}
            </Text>
            <Text style={styles.expandedText}>
              <Text style={styles.label}>Status: </Text>{item.status}
            </Text>
            <Text style={styles.expandedText}>
              <Text style={styles.label}>Due Date: </Text>{item.dueDate ? new Date(item.dueDate).toDateString() : 'No due date'}
            </Text>
            {item.subtasks && item.subtasks.length > 0 && (
              <View style={styles.subtasksSection}>
                <Text style={styles.label}>Subtasks:</Text>
                {item.subtasks.map((subtask, index) => (
                  <Text key={index} style={[styles.subtaskItem, subtask.completed && styles.completedSubtask]}>
                    • {subtask.title} {subtask.completed ? '(✓)' : ''}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

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
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 18, fontWeight: 'bold' },
  taskDescription: { fontSize: 14, color: '#666', marginTop: 5 },
  taskStatus: { fontSize: 12, color: '#999', marginTop: 5 },
  subtaskCount: { fontSize: 12, color: '#666', marginTop: 5 },
  menuButton: {
    padding: 5,
  },
  menuDots: {
    fontSize: 20,
    color: '#666',
  },
  expandedContent: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  expandedText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
  },
  subtasksSection: {
    marginTop: 10,
  },
  subtaskItem: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
    color: '#555',
  },
  completedSubtask: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#999', marginTop: 20 },
});
