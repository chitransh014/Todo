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
    try {
      if (taskToEdit) {
        await onUpdateTask(taskToEdit.id, { title, description, dueDate, subtasks: filteredSubtasks });
      } else {
        await onAddTask({ title, description, dueDate, subtasks: filteredSubtasks });
      }
      onClose();
    } catch (error) {
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
                minimumDate={new Date()}
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
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="#aaa" />
                  )}
                </TouchableOpacity>

                {/* Subtask Text Input */}
                <TextInput
                  style={[
                    styles.subtaskInput,
                    subtask.completed && { textDecorationLine: "line-through", color: "#888" },
                  ]}
                  placeholder={`Subtask ${index + 1}`}
                  value={subtask.title}
                  onChangeText={(text) => updateSubtask(index, text)}
                  editable={!subtask.completed}
                  placeholderTextColor="#999"
                />

                {/* Delete Button */}
                {subtasks.length > 1 && (
                  <TouchableOpacity onPress={() => removeSubtask(index)} style={styles.removeBtn}>
                    <Ionicons name="trash" size={20} color="#FF4B4B" />
                  </TouchableOpacity>
                )}
              </View>
            ))}


            <TouchableOpacity style={styles.addSubtaskBtn} onPress={addSubtask}>
              <Ionicons name="add" size={18} color="#007BFF" />
              <Text style={styles.addSubtaskText}>Add Subtask</Text>
            </TouchableOpacity>

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
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    width: "98%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: "85%",
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#007BFF",
    marginLeft: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#fafafa",
    marginVertical: 6,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  datePicker: { flexDirection: "row", alignItems: "center" },
  subHeader: {
    fontWeight: "600",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 6,
    color: "#333",
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtaskInput: { flex: 1 },
  removeBtn: { marginLeft: 8 },
  addSubtaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  addSubtaskText: { color: "#007BFF", fontWeight: "600", marginLeft: 4 },
  addBtn: {
    backgroundColor: "#007BFF",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
  },
  addBtnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelText: {
    textAlign: "center",
    fontSize: 16,
    color: "#FF4B4B",
    fontWeight: "600",
    marginTop: 12,
  },
});
