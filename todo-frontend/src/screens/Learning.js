import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/auth';


export default function Learning() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/tasks/learning/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error("Learning stats error:", err);
    }
  };

  if (!stats) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Learning Dashboard</Text>

      {/* Stats Cards */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.completedTasks}</Text>
          <Text style={styles.cardLabel}>Completed Tasks</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardValue}>{stats.timeSpent}h</Text>
          <Text style={styles.cardLabel}>Time Spent</Text>
        </View>
      </View>

      {/* Category Progress */}
      <Text style={styles.sectionTitle}>Progress by Category</Text>
      {Object.entries(stats.progress).map(([cat, percent]) => (
        <View style={styles.progressRow} key={cat}>
          <Text style={styles.progressLabel}>{cat}</Text>
          <Text style={styles.progressPercent}>{percent}%</Text>
        </View>
      ))}

      {/* Recent Completed */}
      <Text style={styles.sectionTitle}>Recent Completed Tasks</Text>
      <FlatList
        data={stats.recentCompleted}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskMeta}>{item.category || "General"}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8f9fa" },
  loading: { marginTop: 40, textAlign: "center" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 25, color: "#2c3e50" },

  cardContainer: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#3498db",
    padding: 20,
    borderRadius: 15,
  },
  cardValue: { color: "#fff", fontSize: 30, fontWeight: "bold" },
  cardLabel: { color: "#fff", opacity: 0.8, marginTop: 5 },

  sectionTitle: { fontSize: 22, fontWeight: "600", marginTop: 30, marginBottom: 15 },

  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressLabel: { fontSize: 16, color: "#333" },
  progressPercent: { fontSize: 16, fontWeight: "bold", color: "#3498db" },

  taskItem: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10 },
  taskTitle: { fontSize: 17, fontWeight: "600" },
  taskMeta: { color: "#7f8c8d", marginTop: 4 },
});
