import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
  PanResponder,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

export default function AddTaskModal({
  isVisible,
  onClose,
  onAddTask,
  taskToEdit,
  onUpdateTask,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState([{ title: "", completed: false }]);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  // Animate sheet open/close
  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [isVisible]);

  // Set task values
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : null);
      setSubtasks(
        taskToEdit?.subtasks?.length
          ? taskToEdit.subtasks.map((st) => ({
            title: st.title,
            completed: st.completed || false,
          }))
          : [{ title: "", completed: false }]
      );

    } else {
      setTitle("");
      setDescription("");
      setDueDate(null);
      setSubtasks([{ title: "" }]);
    }
  }, [taskToEdit, isVisible]);

  const addSubtask = () => setSubtasks([...subtasks, { title: "", completed: false }]);

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index, title) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = title;
    setSubtasks(newSubtasks);
  };

  // ✅ Add this one:
  const toggleSubtaskCompletion = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };


const handleSubmit = async () => {
  if (!title.trim()) {
    alert("Please enter a task title");
    return;
  }

  const filteredSubtasks = subtasks.filter((st) => st.title.trim() !== "");
  const formattedDate = dueDate ? dueDate.toISOString() : null;

  try {
    if (taskToEdit) {
      await onUpdateTask(taskToEdit.id, {
        title,
        description,
        dueDate: formattedDate,
        subtasks: filteredSubtasks,
        energyLevel: "medium", // ✅ add default
      });
    } else {
      await onAddTask({
        title,
        description,
        dueDate: formattedDate,
        subtasks: filteredSubtasks,
        energyLevel: "medium", // ✅ add default
      });
    }
    onClose();
  } catch (error) {
    console.error("Add task error:", error);
    alert("Error saving task. Please try again.");
  }
};


  const onDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      // ✅ User picked a date
      setDueDate(selectedDate);
    }
    // ✅ Always close the picker afterward
    setShowDatePicker(false);
  };

  // 👉 Swipe-down gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) dragY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 120) {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            dragY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: Animated.add(
                    dragY,
                    slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0],
                    })
                  ),
                },
              ],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <Ionicons name="create-outline" size={22} color="#007BFF" />
            <Text style={styles.headerText}>
              {taskToEdit ? "Edit Task" : "Add New Task"}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#888"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#888"
            />

            <TouchableOpacity
              style={[styles.input, styles.datePicker]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#007BFF" />
              <Text style={{ color: dueDate ? "#000" : "#888", marginLeft: 8 }}>
                {dueDate ? dueDate.toDateString() : "Select Due Date (optional)"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={onDateChange}
                minimumDate={taskToEdit ? null : new Date()}
              />
            )}


            <Text style={styles.subHeader}>Subtasks</Text>

            {subtasks.map((subtask, index) => (
  <View key={index} style={styles.subtaskRow}>
    {/* Checkbox Icon */}
    <TouchableOpacity
      onPress={() => toggleSubtaskCompletion(index)}
      style={styles.checkbox}
    >
      {subtask.completed ? (
        <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
      ) : (
        <Ionicons name="ellipse-outline" size={22} color="#ccc" />
      )}
    </TouchableOpacity>

    {/* Subtask Input */}
    <TextInput
      style={[
        styles.subtaskInput,
        subtask.completed && { textDecorationLine: "line-through", color: "#999" },
      ]}
      placeholder="Add subtask"
      value={subtask.title}
      onChangeText={(text) => {
        updateSubtask(index, text);
        // Auto-add next blank subtask when user types in the last one
        if (index === subtasks.length - 1 && text.trim().length > 0) {
          addSubtask();
        }
      }}
      placeholderTextColor="#aaa"
    />

    {/* Minimal Cross (instead of trash) */}
    {subtasks.length > 1 && (
      <TouchableOpacity onPress={() => removeSubtask(index)}>
        <Text style={styles.crossIcon}>✕</Text>
      </TouchableOpacity>
    )}
  </View>
))}





            <TouchableOpacity style={styles.addBtn} onPress={handleSubmit}>
              <Text style={styles.addBtnText}>
                {taskToEdit ? "Update Task" : "Add Task"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 15,
    maxHeight: "85%",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  handleBar: {
    width: 60,
    height: 6,
    backgroundColor: "#bdc3c7",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3498db",
    marginLeft: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e1e8ed",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2c3e50",
    backgroundColor: "#f8f9fa",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e1e8ed",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subHeader: {
    fontWeight: "700",
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    color: "#34495e",
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e1e8ed",
  },
  checkbox: {
    marginRight: 10,
  },
  subtaskInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#bdc3c7",
    fontSize: 16,
    paddingVertical: 8,
    color: "#2c3e50",
    backgroundColor: "transparent",
  },
  crossIcon: {
    fontSize: 20,
    color: "#e74c3c",
    marginLeft: 10,
    fontWeight: "bold",
  },
  addBtn: {
    backgroundColor: "#27ae60",
    borderRadius: 15,
    paddingVertical: 16,
    marginTop: 25,
    shadowColor: "#27ae60",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addBtnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelText: {
    textAlign: "center",
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "600",
    marginTop: 15,
  },
});
