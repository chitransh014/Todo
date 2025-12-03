import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/auth";
import { Ionicons } from "@expo/vector-icons";

export default function Learning() {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false); // 🔥 NEW

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

      const completed = response.data.recentCompleted || [];

      calculateWeeklyGraph(completed);
      calculateStreak(completed);
    } catch (err) {
      console.error("Learning stats error:", err);
    }
  };

  /* 🔄 Pull-to-refresh handler */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setTimeout(() => setRefreshing(false), 500);
  };

  /* ---------- WEEKLY GRAPH ---------- */
  const calculateWeeklyGraph = (completedTasks) => {
    const last7 = Array(7).fill(0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    completedTasks.forEach((t) => {
      if (!t.completedAt) return;

      const d = new Date(t.completedAt);
      d.setHours(0, 0, 0, 0);

      const diff = Math.round(
        (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diff >= 0 && diff < 7) last7[6 - diff] += 1;
    });

    setWeeklyData(last7);
  };

  /* ---------- DAY LABELS ---------- */
  const getDayLabels = () => {
    const labels = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString("en-US", { weekday: "short" })[0]);
    }
    return labels;
  };

  /* ---------- STREAK ---------- */
  const calculateStreak = (tasks) => {
    let streakCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const check = new Date(today);
      check.setDate(today.getDate() - i);

      const hasTask = tasks.some((t) => {
        if (!t.completedAt) return false;
        const d = new Date(t.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === check.getTime();
      });

      if (hasTask) streakCount++;
      else break;
    }

    setStreak(streakCount);
  };

  /* ---------- DATE PARSER ---------- */
  const formatTaskDate = (rawDate) => {
    if (!rawDate) return "No date";
    let parsed = new Date(rawDate);

    if (isNaN(parsed.getTime())) {
      const parts = rawDate.split(/[-/]/);
      if (parts.length >= 3) {
        parsed = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
      }
    }

    return isNaN(parsed.getTime())
      ? rawDate
      : parsed.toLocaleDateString();
  };

  if (!stats) return <Text style={styles.loading}>Loading...</Text>;

  const dayLabels = getDayLabels();

  return (
    <FlatList
      data={stats.recentCompleted}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 20 }}
      
      /* 🔥 SWIPE-TO-REFRESH ADDED HERE */
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#3498db"]}
        />
      }

      ListHeaderComponent={
        <>
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
            <View style={[styles.statCard, { backgroundColor: "#3498db" }]}>
              <Text style={styles.statValue}>{stats.completedTasks}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#1abc9c" }]}>
              <Text style={styles.statValue}>{stats.timeSpent}h</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>
          </View>

          {/* WEEKLY ACTIVITY */}
          <Text style={styles.sectionTitle}>Weekly Activity</Text>

          <View style={styles.weekRow}>
            {weeklyData.map((count, index) => {
              const isCompleted = count > 0;
              return (
                <View key={index} style={styles.weekItem}>
                  <View
                    style={[
                      styles.dayCircle,
                      isCompleted ? styles.dayFilled : styles.dayMissed,
                    ]}
                  />
                  <Text style={styles.dayLabel}>{dayLabels[index]}</Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Recently Completed</Text>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.recentItem}>
          <Ionicons name="checkmark-circle" size={26} color="#27ae60" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.recentTitle}>{item.title}</Text>

            <Text style={styles.recentDate}>
              {formatTaskDate(
                item.completedAt || item.updatedAt || item.createdAt
              )}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

/* ---------------------- STYLES ---------------------- */
const styles = StyleSheet.create({
  loading: { marginTop: 40, textAlign: "center" },

  header: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
    color: "#2c3e50",
  },

  /* Streak Card */
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

  /* Summary Cards */
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 15,
  },
  statValue: { fontSize: 28, fontWeight: "700", color: "#fff" },
  statLabel: { color: "#fff", opacity: 0.8, marginTop: 5 },

  /* Weekly Tracker */
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
  },
  weekItem: {
    alignItems: "center",
    width: 35,
  },
  dayCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginBottom: 8,
  },
  dayFilled: {
    backgroundColor: "#3498db",
  },
  dayMissed: {
    backgroundColor: "#dfe6e9",
  },
  dayLabel: {
    fontSize: 14,
    color: "#34495e",
    fontWeight: "500",
  },

  /* Recent Items */
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
