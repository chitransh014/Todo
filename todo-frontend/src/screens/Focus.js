import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AppState,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/auth";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

export default function Focus() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [minutesInput, setMinutesInput] = useState("25");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const appState = useRef(AppState.currentState);
  const lastTimestamp = useRef(Date.now());

  /* ------------------ Fetch not completed tasks ------------------ */
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const incomplete = res.data.tasks.filter((t) => t.status !== "completed");

      setTasks(incomplete);

      if (incomplete.length > 0)
        setSelectedTaskId(incomplete[0]._id);
    } catch (err) {
      console.log("Fetch task error:", err);
    }
  };

  /* ------------------ PLAY SOUND WHEN FINISHED ------------------ */
  const playFinishSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/focus-finish.mp3")
      );
      await sound.playAsync();
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  /* ------------------ Main Timer Logic ------------------ */
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isActive) {
      finishFocusSession();
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  /* ------------------ Support Background Timer ------------------ */
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current === "active" && next !== "active") {
        lastTimestamp.current = Date.now();
      }

      if (next === "active") {
        const now = Date.now();
        const diff = Math.floor((now - lastTimestamp.current) / 1000);

        setTimeLeft((prev) => Math.max(prev - diff, 0));
      }

      appState.current = next;
    });

    return () => sub.remove();
  }, []);

  /* ------------------ Handle Timer Finished ------------------ */
  const finishFocusSession = async () => {
    playFinishSound(); // 🔥 sound alert

    try {
      const token = await AsyncStorage.getItem("token");

      await axios.post(
        `${BASE_URL}/tasks/focus-session`,
        {
          taskId: selectedTaskId,
          minutes: parseInt(minutesInput),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.log("Focus save error:", err);
    }

    Alert.alert("🎉 Focus Completed", `You focused for ${minutesInput} minutes.`);
  };

  /* ------------------ Controls ------------------ */
  const startTimer = () => {
    const mins = parseInt(minutesInput);

    if (!selectedTaskId) {
      Alert.alert("Select task", "Please choose a task to focus on.");
      return;
    }

    if (isNaN(mins) || mins <= 0) {
      Alert.alert("Invalid Minutes", "Please enter valid focus duration.");
      return;
    }

    setTimeLeft(mins * 60);
    setIsActive(true);
  };

  const pauseTimer = () => setIsActive(false);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(parseInt(minutesInput) * 60);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  /* ------------------ UI ------------------ */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Focus Mode</Text>

      {/* Task Select */}
      <Text style={styles.label}>Select Task</Text>

      <View style={styles.dropdown}>
        {tasks.length === 0 ? (
          <Text>No active tasks</Text>
        ) : (
          tasks.map((t) => (
            <TouchableOpacity
              key={t._id}
              style={[
                styles.taskOption,
                selectedTaskId === t._id && styles.taskOptionSelected,
              ]}
              onPress={() => setSelectedTaskId(t._id)}
            >
              <Text style={{ color: selectedTaskId === t._id ? "#fff" : "#333" }}>
                {t.title}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Minutes Input */}
      <Text style={styles.label}>Enter Minutes</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={minutesInput}
        onChangeText={setMinutesInput}
      />

      {/* Timer */}
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      {/* Buttons */}
      {!isActive ? (
        <TouchableOpacity style={styles.startBtn} onPress={startTimer}>
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.btnText}>Start</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.pauseBtn} onPress={pauseTimer}>
          <Ionicons name="pause" size={20} color="#fff" />
          <Text style={styles.btnText}>Pause</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
        <Ionicons name="refresh" size={20} color="#fff" />
        <Text style={styles.btnText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#f8f9fa" },

  header: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#2c3e50",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#34495e",
  },

  dropdown: {
    marginBottom: 15,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  taskOption: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bbb",
    marginRight: 8,
    marginBottom: 8,
  },

  taskOptionSelected: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },

  timer: {
    fontSize: 48,
    textAlign: "center",
    marginVertical: 25,
    fontWeight: "700",
    color: "#2c3e50",
  },

  startBtn: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#27ae60",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  pauseBtn: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#e67e22",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  resetBtn: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 12,
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
