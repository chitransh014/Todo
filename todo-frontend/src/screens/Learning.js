import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/auth";

export default function Learning() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/tasks/learning/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(response.data);
    } catch (err) {
      console.error("Learning stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.heading}>Your Learning Stats</Text>

      {/* Streak Box */}
      <View style={styles.streakBox}>
        <Text style={styles.streakNumber}>{stats.streak} Days</Text>
        <Text style={styles.streakLabel}>Current Streak</Text>
      </View>

      {/* Two Stats Boxes */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completedTasks}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.timeSpent}h</Text>
          <Text style={styles.statLabel}>Time Spent</Text>
        </View>
      </View>

      {/* Weekly Activity */}
      <Text style={styles.sectionTitle}>Weekly Activity</Text>

      <View style={styles.weekRow}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <View key={i} style={styles.weekItem}>
            <View
              style={[
                styles.bar,
                {
                  height: stats.weekly[i] * 15, // bar height
                  backgroundColor:
                    stats.weekly[i] > 0 ? "#3498db" : "#d0d7de",
                },
              ]}
            />
            <Text style={styles.weekDay}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Recently Completed */}
      <Text style={styles.sectionTitle}>Recently Completed</Text>

      <FlatList
        data={stats.recentCompleted}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const date = new Date(item.completedAt);
          const readableDate = date.toLocaleDateString();

          return (
            <View style={styles.recentItem}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentDate}>{readableDate}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6fb",
    padding: 20,
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#2c3e50",
    textAlign: "center",
  },

  streakBox: {
    backgroundColor: "#fff7e6",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ff8c00",
  },
  streakLabel: {
    color: "#b37400",
    marginTop: 5,
    fontSize: 14,
  },

  row: { flexDirection: "row", justifyContent: "space-between" },

  statCard: {
    width: "48%",
    backgroundColor: "#3498db",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
  },
  statNumber: { fontSize: 30, color: "#fff", fontWeight: "bold" },
  statLabel: { color: "#fff", opacity: 0.8, marginTop: 5 },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 15,
    color: "#2c3e50",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  weekItem: {
    alignItems: "center",
    width: 30,
  },
  bar: {
    width: 18,
    borderRadius: 6,
    marginBottom: 6,
  },
  weekDay: {
    fontSize: 13,
    color: "#556",
  },

  recentItem: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2c3e50",
  },
  recentDate: {
    color: "#7f8c8d",
    marginTop: 4,
    fontSize: 13,
  },
});
