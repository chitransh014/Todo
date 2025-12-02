import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/auth";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Learning() {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [streak, setStreak] = useState(0);

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
      calculateWeeklyGraph(response.data.recentCompleted);
      calculateStreak(response.data.recentCompleted);
    } catch (err) {
      console.error("Learning stats error:", err);
    }
  };

  /* ---------- Weekly Graph ---------- */
  const calculateWeeklyGraph = (completedTasks) => {
    const last7 = Array(7).fill(0);
    const today = new Date();

    completedTasks.forEach((t) => {
      if (!t.completedAt) return;

      const date = new Date(t.completedAt);
      const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

      if (diff < 7 && diff >= 0) last7[6 - diff] += 1;
    });

    setWeeklyData(last7);
  };

  /* ---------- Streak ---------- */
  const calculateStreak = (tasks) => {
    const today = new Date();
    let streakCount = 0;

    for (let i = 0; i < 50; i++) {
      const checkDay = new Date();
      checkDay.setDate(today.getDate() - i);

      const done = tasks.some((t) => {
        if (!t.completedAt) return false;
        const d = new Date(t.completedAt);
        return (
          d.getDate() === checkDay.getDate() &&
          d.getMonth() === checkDay.getMonth() &&
          d.getFullYear() === checkDay.getFullYear()
        );
      });

      if (done) streakCount++;
      else break;
    }

    setStreak(streakCount);
  };

  if (!stats) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <FlatList
      data={stats.recentCompleted}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 20 }}
      ListHeaderComponent={
        <>
          {/* HEADER */}
          <Text style={styles.header}>Your Learning Stats</Text>

          {/* STREAK CARD */}
          <View style={styles.streakCard}>
            <Ionicons name="flame" size={40} color="#ff6b00" />
            <View>
              <Text style={styles.streakNumber}>{streak} Days</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
          </View>

          {/* SUMMARY CARDS */}
          <View style={styles.cardRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.completedTasks}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.timeSpent}h</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>
          </View>

          {/* WEEKLY GRAPH */}
          <Text style={styles.sectionTitle}>Weekly Activity</Text>

          <View style={styles.graphContainer}>
            {weeklyData.map((count, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={[styles.bar, { height: count * 20 }]} />
                <Text style={styles.barLabel}>
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </Text>
              </View>
            ))}
          </View>

          {/* RECENT TITLE */}
          <Text style={styles.sectionTitle}>Recently Completed</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.recentItem}>
          <Ionicons name="checkmark-circle" size={26} color="#27ae60" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.recentTitle}>{item.title}</Text>
            <Text style={styles.recentDate}>
              {new Date(item.completedAt || item.updatedAt || item.createdAt).toLocaleDateString()}
            </Text>

          </View>
        </View>
      )}
    />
  );
}

/* ---------------------- STYLES ---------------------- */

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#f8f9fa" },
  loading: { marginTop: 40, textAlign: "center" },

  header: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
    color: "#2c3e50",
  },

  /* Streak */
  streakCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 10,
    color: "#ff6b00",
  },
  streakLabel: { marginLeft: 10, color: "#7f8c8d" },

  /* Summary cards */
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#3498db",
    padding: 20,
    borderRadius: 15,
  },
  statValue: { fontSize: 28, fontWeight: "700", color: "#fff" },
  statLabel: { color: "#fff", opacity: 0.8, marginTop: 5 },

  /* Graph */
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 15,
    color: "#2c3e50",
  },
  graphContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
  },
  barWrapper: { alignItems: "center" },
  bar: {
    width: 20,
    backgroundColor: "#3498db",
    borderRadius: 10,
  },
  barLabel: { marginTop: 6, color: "#7f8c8d", fontSize: 14 },

  /* Recent tasks */
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  recentTitle: { fontSize: 16, fontWeight: "600" },
  recentDate: { color: "#7f8c8d", fontSize: 13 },
});
