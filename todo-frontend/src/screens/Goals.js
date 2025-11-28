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
    }, [])
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
              {item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` : "No due date"}
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
              <Text style={styles.label}>Due Date: </Text>{item.dueDate ? new Date(item.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'No due date'}
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#2c3e50',
    textAlign: 'center',
  },
  list: { flex: 1 },
  taskItem: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  taskContent: { flex: 1 },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
    lineHeight: 20,
  },
  taskStatus: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 8,
    fontWeight: '500',
  },
  subtaskCount: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 8,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  menuDots: {
    fontSize: 20,
    color: '#34495e',
    fontWeight: 'bold',
  },
  expandedContent: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center',
  },
  expandedText: {
    fontSize: 15,
    marginBottom: 8,
    color: '#34495e',
    lineHeight: 22,
  },
  label: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtasksSection: {
    marginTop: 15,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  subtaskItem: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
    color: '#34495e',
    lineHeight: 20,
  },
  completedSubtask: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
