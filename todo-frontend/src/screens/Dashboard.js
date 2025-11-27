import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  AsyncStorage,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AddTaskModal from "../components/AddTaskModal";
import { useTasks } from "../context/TaskContext";



const Dashboard = () => {
  const navigation = useNavigation();
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
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

  // // ✅ TOKEN DEBUGGER (NEW)
  // const showToken = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("token");
  //     if (!token) {
  //       Alert.alert("No Token Found");
  //       return;
  //     }
  //     console.log("JWT TOKEN:", token);
  //     Alert.alert("Your Token", token);
  //   } catch (err) {
  //     console.log(err);
  //     Alert.alert("Error fetching token");
  //   }
  // };

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
      <Text style={styles.sectionTitle}>Today's Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTask}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks for today. Add new tasks!</Text>
        }
      />

      {/* ➕ ADD TASK BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={{ fontSize: 28, color: "white" }}>+</Text>
      </TouchableOpacity>

      {/* 🟡 TOKEN DEBUG BUTTON (NEW)
      <TouchableOpacity style={styles.debugButton} onPress={showToken}>
        <Text style={{ color: "white", fontWeight: "bold" }}>Token</Text>
      </TouchableOpacity> */}

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
    elevation: 3,
  },
  taskContent: { flex: 1 },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#2c3e50',
  },
  taskDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
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
  },
  completeButton: {
    backgroundColor: "#27ae60",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
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

  // // 🟡 NEW BUTTON STYLE
  // debugButton: {
  //   position: "absolute",
  //   bottom: 110,
  //   right: 20,
  //   backgroundColor: "#333",
  //   paddingVertical: 10,
  //   paddingHorizontal: 15,
  //   borderRadius: 10,
  //   elevation: 5,
  // },
});

export default Dashboard;
