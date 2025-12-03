import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  RefreshControl,
} from "react-native";

export default function Focus() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min
  const [isActive, setIsActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  /* 🔄 Pull-to-refresh */
  const onRefresh = () => {
    setRefreshing(true);

    // RESET FOCUS SCREEN WHEN SWIPING DOWN
    resetTimer();

    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.heading}>Focus Mode</Text>

      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>

      <Text style={styles.subtitle}>Stay focused!</Text>

      <View style={{ marginTop: 20 }}>
        <Button
          title={isActive ? "Pause" : "Start"}
          onPress={isActive ? pauseTimer : startTimer}
        />
      </View>

      <View style={{ marginTop: 10 }}>
        <Button title="Reset" onPress={resetTimer} color="#e74c3c" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    alignItems: "center",
    paddingBottom: 150,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 20,
  },
  timer: {
    fontSize: 60,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#34495e",
  },
  subtitle: {
    fontSize: 18,
    color: "#7f8c8d",
  },
});
