import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Learning() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

const fetchStats = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/api/tasks/learning/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setStats(response.data);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <View style={styles.container}>
      <Text>Learning Tracker</Text>
      <Text>Completed Tasks: {stats.completedTasks}</Text>
      <Text>Time Spent: {stats.timeSpent} hours</Text>
      <FlatList
        data={Object.entries(stats.progress || {})}
        keyExtractor={([key]) => key}
        renderItem={({ item: [category, progress] }) => (
          <Text>{category}: {progress}%</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});
