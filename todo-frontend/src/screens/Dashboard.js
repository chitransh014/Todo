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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: '#2c3e50',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: '#34495e',
    textAlign: 'center',
  },
  taskItem: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e8ed",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskContent: { flex: 1 },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#2c3e50',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
    lineHeight: 20,
  },
  taskActions: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  completeButton: {
    backgroundColor: "#27ae60",
    shadowColor: "#27ae60",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    shadowColor: "#e74c3c",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#95a5a6",
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#3498db",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#3498db",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default Dashboard;
