import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AddTaskModal from "../components/AddTaskModal";
import { useTasks } from "../context/TaskContext";

const Dashboard = () => {
  const navigation = useNavigation();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [name, setName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

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
            onPress={() => updateTaskStatus(item.id, "completed")}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteTaskHandler(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <Text style={styles.greeting}> {name}</Text> */}
      <Text style={styles.sectionTitle}>Today's Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks for today. Add new tasks!</Text>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={{ fontSize: 28, color: "white" }}>+</Text>
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
  container: { flex: 1, padding: 20 },
  greeting: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  taskItem: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 18, fontWeight: "bold" },
  taskDescription: { fontSize: 14, color: "#666", marginTop: 5 },
  taskActions: { flexDirection: "row", marginTop: 10 },
  actionButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  completeButton: { backgroundColor: "#4CAF50" },
  deleteButton: { backgroundColor: "#f44336" },
  buttonText: { color: "white", fontSize: 12 },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#666",
    marginTop: 20,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007BFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default Dashboard;
