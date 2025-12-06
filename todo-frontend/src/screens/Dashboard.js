import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AddTaskModal from "../components/AddTaskModal";
import { useTasks } from "../context/TaskContext";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

export default function Dashboard() {
  const navigation = useNavigation();
  const { tasks, addTask, updateTask, deleteTask, fetchTasks } = useTasks();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* 🔄 Pull To Refresh */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

  /* 🔘 Toggle Task Complete */
  const toggleComplete = (item) => {
    const newStatus = item.status === "completed" ? "pending" : "completed";
    updateTask(item._id, { status: newStatus });
  };

  /* 🗑 Swipe To Delete UI */
  const renderRightActions = (taskId) => (
    <TouchableOpacity
      style={styles.deleteSwipe}
      onPress={() => deleteTask(taskId)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  /* 🎨 Task Item UI */
  const renderTask = ({ item }) => {
    const scaleAnim = new Animated.Value(1);

    const animateCheck = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const onCheckPress = () => {
      animateCheck();
      toggleComplete(item);
    };

    return (
      <GestureHandlerRootView>
        <Swipeable renderRightActions={() => renderRightActions(item._id)}>
          <View style={styles.taskCard}>
            {/* Checkbox */}
            <TouchableOpacity onPress={onCheckPress}>
              <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
                {item.status === "completed" && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </Animated.View>
            </TouchableOpacity>

            {/* Task Text */}
            <View style={styles.taskInfo}>
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
                    styles.taskDesc,
                    item.status === "completed" && styles.completedDesc,
                  ]}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>
        </Swipeable>
      </GestureHandlerRootView>
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
          <Text style={styles.emptyText}>
            No tasks for today. Add new tasks!
          </Text>
        }
      />

      {/* Floating Add Button */}
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
}

/* ---------------------------- STYLES ---------------------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 15,
    color: "#2c3e50",
    textAlign: "center",
  },

  /* Task Card */
  taskCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eaeaea",
  },

  /* Checkbox */
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#007BFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
  },

  /* Task Text */
  taskInfo: { flex: 1 },
  taskTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2c3e50",
  },
  taskDesc: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 3,
  },

  /* Completed Style */
  completedText: {
    color: "#95a5a6",
    textDecorationLine: "line-through",
  },
  completedDesc: {
    color: "#bdc3c7",
    textDecorationLine: "line-through",
  },

  /* Swipe Delete */
  deleteSwipe: {
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 16,
    marginVertical: 6,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /* Empty */
  emptyText: {
    textAlign: "center",
    color: "#95a5a6",
    marginTop: 40,
    fontSize: 16,
  },

  /* FAB */
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
  },
});
