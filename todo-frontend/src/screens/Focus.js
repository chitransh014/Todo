import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Focus() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (!isActive) {
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text>Focus Mode</Text>
      <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
      <Text>Stay focused!</Text>
      <Button title={isActive ? "Pause" : "Start"} onPress={isActive ? pauseTimer : startTimer} />
      <Button title="Reset" onPress={resetTimer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timer: { fontSize: 48, marginVertical: 20 },
});
