import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AddTaskModal from "../components/AddTaskModal";
import { useTasks } from "../context/TaskContext";

const Dashboard = () => {
  const navigation = useNavigation();
  const { tasks, addTask, updateTask, deleteTask, fetchTasks } = useTasks();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* 🔄 Pull to Refresh */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

  const updateTaskStatus = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const deleteTaskHandler = (taskId) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(taskId),
      },
    ]);
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.taskDescription}>{item.description}</Text>
        ) : null}
      </View>
      <View style={styles.taskActions}>
        {item.status !== "completed" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateTaskStatus(item._id, "completed")}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteTaskHandler(item._id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Today's Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        renderItem={renderTask}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks for today. Add new tasks!</Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={{ fontSize: 32, color: "white" }}>+</Text>
      </TouchableOpacity>

      <AddTaskModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAddTask={addTask}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#34495e",
    textAlign: "center",
  },
  taskItem: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e8ed",
    elevation: 3,
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 18, fontWeight: "bold", color: "#2c3e50" },
  taskDescription: { fontSize: 14, color: "#7f8c8d", marginTop: 5 },
  taskActions: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "flex-end",
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
  },
  completeButton: { backgroundColor: "#27ae60" },
  deleteButton: { backgroundColor: "#e74c3c" },
  buttonText: { color: "white", fontSize: 14 },
  emptyText: {
    textAlign: "center",
    color: "#95a5a6",
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#85c1e9",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
});

export default Dashboard;
