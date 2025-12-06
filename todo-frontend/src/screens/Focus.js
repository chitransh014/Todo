import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  AppState,
  RefreshControl,
  ScrollView
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
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

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
  <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
    <Text style={styles.header}>Focus Mode</Text>

    {/* Select Task */}
    <Text style={styles.label}>Select Task</Text>
    <View style={styles.taskContainer}>
      {tasks.length === 0 ? (
        <Text style={styles.noTask}>No active tasks</Text>
      ) : (
        tasks.map((t) => (
          <TouchableOpacity
            key={t._id}
            style={[
              styles.taskPill,
              selectedTaskId === t._id && styles.taskPillSelected,
            ]}
            onPress={() => setSelectedTaskId(t._id)}
          >
            <Text
              style={[
                styles.taskPillText,
                selectedTaskId === t._id && styles.taskPillTextSelected,
              ]}
            >
              {t.title}
            </Text>
          </TouchableOpacity>
        ))
      )}
    </View>

    {/* Enter Minutes */}
    <Text style={styles.label}>Enter Minutes</Text>
    <TextInput
      style={styles.input}
      keyboardType="numeric"
      value={minutesInput}
      onChangeText={setMinutesInput}
    />

    {/* Circular Timer */}
    <View style={styles.timerCircle}>
      <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
    </View>

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
  </ScrollView>
);

}

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F5F8FF",
  },

  header: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#1C3553",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#375B7F",
    marginBottom: 6,
    marginTop: 10,
  },

  /* Task Pills */
  taskContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },

  taskPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B7C8D9",
    backgroundColor: "#fff",
    marginRight: 10,
    marginBottom: 10,
  },

  taskPillSelected: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },

  taskPillText: {
    fontSize: 14,
    color: "#375B7F",
    fontWeight: "600",
  },

  taskPillTextSelected: {
    color: "#fff",
  },

  noTask: {
    color: "#999",
    fontStyle: "italic",
  },

  /* Input */
  input: {
    borderWidth: 1,
    borderColor: "#C8D6E5",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#ffffff",
    marginBottom: 25,
  },

  /* Timer Circle */
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 9,
    borderColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginVertical: 35,
  },

  timerText: {
    fontSize: 50,
    fontWeight: "700",
    color: "#1C3553",
  },

  /* Start Button */
  startBtn: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#28C76F",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  /* Pause Button */
  pauseBtn: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FF9F43",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  /* Reset Button */
  resetBtn: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#007BFF",
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

