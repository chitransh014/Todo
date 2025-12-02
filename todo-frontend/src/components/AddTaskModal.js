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
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/auth";
import * as Notifications from "expo-notifications";

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
  const [pickerValue, setPickerValue] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subtasks, setSubtasks] = useState([{ title: "", completed: false }]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [dueTime, setDueTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);


  const slideAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  // Animate modal open/close
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

  // Set initial values when editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      if (taskToEdit.dueDate) {
        const dueDateTime = new Date(taskToEdit.dueDate);
        setDueDate(new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate()));
        setDueTime(new Date(dueDateTime.getFullYear(), dueDateTime.getMonth(), dueDateTime.getDate(), dueDateTime.getHours(), dueDateTime.getMinutes()));
        setPickerValue(dueDateTime);
      } else {
        setDueDate(null);
        setDueTime(null);
        setPickerValue(new Date());
      }
      setSubtasks(
        taskToEdit.subtasks?.length
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
      setDueTime(null);
      setPickerValue(new Date());
      setSubtasks([{ title: "", completed: false }]);
    }
  }, [taskToEdit, isVisible]);

  // Subtask actions
  const addSubtask = () =>
    setSubtasks([...subtasks, { title: "", completed: false }]);

  const removeSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const updateSubtask = (index, title) => {
    const updated = [...subtasks];
    updated[index].title = title;
    setSubtasks(updated);
  };

  const toggleSubtaskCompletion = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  // AI SUBTASK GENERATOR
  const generateAISubtasks = async () => {
    if (!title.trim()) {
      alert("Enter a task title before using AI.");
      return;
    }

    try {
      setLoadingAI(true);
      const token = await AsyncStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/tasks/ai-breakdown`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiList = response.data.subtasks.map((t) => ({
        title: t,
        completed: false,
      }));

      setSubtasks(aiList);
    } catch (error) {
      console.error("AI Breakdown Error:", error);
      alert("AI failed to generate subtasks.");
    } finally {
      setLoadingAI(false);
    }
  };

  // On date choose
  const onDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      setDueDate(selectedDate);
    }
    setShowDatePicker(false);
  };

  // Submit
  const handleSubmit = async () => {
    if (!title.trim()) {
      return alert("Please enter a task title");
    }

    let finalDueDate = null;
    if (dueDate) {
      const date = new Date(dueDate);
      if (dueTime) {
        const time = new Date(dueTime);
        date.setHours(time.getHours(), time.getMinutes(), 0, 0);
      } else {
        date.setHours(23, 59, 59, 999);
      }
      finalDueDate = date.toISOString();
    }

    const cleanSubtasks = subtasks.filter((s) => s.title.trim() !== "");

    let notificationId = null;
    if (finalDueDate) {
      const triggerDate = new Date(finalDueDate);

      notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Task Reminder",
          body: `Don't forget: ${title}`,
          sound: true,
        },
        trigger: triggerDate,
      });

      console.log("Notification Scheduled with ID:", notificationId);
    }

    try {
      if (taskToEdit) {
        // Cancel old notification
        if (taskToEdit.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(taskToEdit.notificationId);
        }

        await onUpdateTask(taskToEdit.id, {
          title,
          description,
          dueDate: finalDueDate,
          subtasks: cleanSubtasks,
          notificationId,
        });
      } else {
        await onAddTask({
          title,
          description,
          dueDate: finalDueDate,
          subtasks: cleanSubtasks,
          notificationId,
        });
      }
      onClose();
    } catch (err) {
      alert("Error saving task.");
    }
  };

  // Close swipe-down gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) dragY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose());
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={isVisible} transparent animationType="none">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
                      outputRange: [600, 0],
                    })
                  ),
                },
              ],
            },
          ]}
        >
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <Ionicons name="create-outline" size={22} color="#007BFF" />
            <Text style={styles.headerText}>
              {taskToEdit ? "Edit Task" : "Add New Task"}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Date Picker */}
            <TouchableOpacity
              style={[styles.input, styles.datePicker]}
              onPress={() => {
                setPickerValue(dueDate || new Date());
                setShowDatePicker(true);
              }}
            >
              <Ionicons name="calendar-outline" size={18} color="#007BFF" />
              <Text style={{ marginLeft: 8 }}>
                {dueDate ? dueDate.toDateString() : "Select Due Date"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={pickerValue}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker */}
            <TouchableOpacity
              style={[styles.input, styles.datePicker]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={18} color="#007BFF" />
              <Text style={{ color: dueTime ? "#000" : "#888", marginLeft: 8 }}>
                {dueTime ? dueTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Select Time (optional)"}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={dueTime || new Date()}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  if (event.type === "set") {
                    setDueTime(selectedTime);
                  }
                  setShowTimePicker(false);
                }}
              />
            )}

            {/* AI BUTTON INSIDE SUBTASK SECTION */}
            <Text style={styles.subHeader}>Subtasks</Text>

            <TouchableOpacity
              style={styles.aiButton}
              onPress={generateAISubtasks}
              disabled={loadingAI}
            >
              {loadingAI ? (
                <Text style={{ color: "#fff" }}>Generating...</Text>
              ) : (
                <>
                  <Ionicons name="sparkles-outline" size={20} color="#fff" />
                  <Text style={styles.aiButtonText}>Generate with AI</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Subtask List */}
            {subtasks.map((sub, index) => (
              <View key={index} style={styles.subtaskRow}>
                <TouchableOpacity
                  onPress={() => toggleSubtaskCompletion(index)}
                >
                  {sub.completed ? (
                    <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={22} color="#ccc" />
                  )}
                </TouchableOpacity>

                <TextInput
                  style={[styles.subtaskInput]}
                  placeholder="Subtask"
                  value={sub.title}
                  onChangeText={(text) => updateSubtask(index, text)}
                />

                {subtasks.length > 1 && (
                  <TouchableOpacity onPress={() => removeSubtask(index)}>
                    <Text style={styles.crossIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.addSubtaskBtn} onPress={addSubtask}>
              <Ionicons name="add" size={20} color="#007BFF" />
              <Text style={styles.addSubtaskText}>Add another subtask</Text>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={styles.saveBtnText}>
                {taskToEdit ? "Update Task" : "Add Task"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
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
    width: "95%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: "85%",
  },
  handleBar: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 6,
    color: "#007BFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f8f8f8",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
  },
  subHeader: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: "center",
  },
  aiButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  subtaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 10,
  },
  subtaskInput: {
    flex: 1,
    marginLeft: 10,
  },
  crossIcon: {
    fontSize: 20,
    color: "#e74c3c",
    marginLeft: 10,
  },
  addSubtaskBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  addSubtaskText: {
    marginLeft: 8,
    color: "#007BFF",
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#007BFF",
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
  cancelText: {
    textAlign: "center",
    color: "#e74c3c",
    marginTop: 15,
    fontSize: 16,
  },
});
