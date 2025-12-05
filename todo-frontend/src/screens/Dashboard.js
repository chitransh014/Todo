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
import { Swipeable } from "react-native-gesture-handler";
import AddTaskModal from "../components/AddTaskModal";
import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "../context/TaskContext";

const Dashboard = () => {
  const { tasks, addTask, updateTask, deleteTask, fetchTasks } = useTasks();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* 🔄 Pull to Refresh */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

  /* ✔ Mark complete */
  const toggleComplete = (task) => {
    updateTask(task._id, { status: "completed" });
  };

  /* ❌ Delete */
  const deleteTaskHandler = (taskId) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTask(taskId),
      },
    ]);
  };

  /* 🔴 Swipe delete UI */
  const renderRightActions = () => (
    <View style={styles.deleteSwipe}>
      <Ionicons name="trash" size={28} color="#fff" />
    </View>
  );

  /* 🔥 Render Single Task */
  const renderTask = ({ item }) => {
    return (
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => deleteTaskHandler(item._id)}
      >
        <View style={styles.taskItem}>
          {/* LEFT: Circle Complete Button */}
          <TouchableOpacity
            onPress={() => toggleComplete(item)}
            style={styles.circleWrapper}
          >
            {item.status === "completed" ? (
              <Ionicons name="checkmark-circle" size={28} color="#2ecc71" />
            ) : (
              <Ionicons
                name="ellipse-outline"
                size={28}
                color="#b2bec3"
              />
            )}
          </TouchableOpacity>

          {/* MIDDLE TEXT */}
          <View style={styles.taskContent}>
            <Text
              style={[
                styles.taskTitle,
                item.status === "completed" && styles.completedText,
              ]}
            >
              {item.title}
            </Text>
            {item.description ? (
              <Text
                style={[
                  styles.taskDescription,
                  item.status === "completed" && styles.completedText,
                ]}
              >
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>
      </Swipeable>
    );
  };

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

      {/* Floating Add Task Button */}
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
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 18,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 3,
  },

  circleWrapper: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  taskContent: { flex: 1 },

  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },

  taskDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#95a5a6",
  },

  deleteSwipe: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 16,
    marginVertical: 8,
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
});

export default Dashboard;
