import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../api/auth";
import { Ionicons } from "@expo/vector-icons";

export default function Learning() {
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/tasks/learning/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats(res.data);
    } catch (err) {
      console.error("Learning error:", err);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats().finally(() => setRefreshing(false));
  }, []);

  /* FORMAT DATE */
  const formatDate = (raw) => {
    if (!raw) return "No date";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString();
  };

  /* WEEKLY DAY LABELS */
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

  if (!stats) return <Text style={styles.loading}>Loading...</Text>;

  const { streak, weekly, recentCompleted, completedTasks, timeSpent } = stats;
  const dayLabels = getDayLabels();

  return (
    <FlatList
      data={recentCompleted}
      keyExtractor={(item) => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ padding: 20 }}
      ListHeaderComponent={
        <>
          {/* Header */}
          <Text style={styles.header}>Your Learning Stats</Text>

          {/* Streak Card */}
          <View style={styles.streakCard}>
            <Ionicons name="flame" size={40} color="#ff6b00" />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.streakNumber}>{streak} Days</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: "#3498db" }]}>
              <Text style={styles.summaryValue}>{completedTasks}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: "#1abc9c" }]}>
              <Text style={styles.summaryValue}>{timeSpent}h</Text>
              <Text style={styles.summaryLabel}>Time Spent</Text>
            </View>
          </View>

          {/* Weekly Activity Pills */}
          <Text style={styles.sectionTitle}>Weekly Activity</Text>

          <View style={styles.weeklyContainer}>
            {weekly.map((count, i) => (
              <View key={i} style={{ alignItems: "center" }}>
                <View
                  style={[
                    styles.pill,
                    count > 0 ? styles.pillActive : styles.pillInactive,
                  ]}
                />
                <Text style={styles.pillLabel}>{dayLabels[i]}</Text>
              </View>
            ))}
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
              {formatDate(item.completedAt || item.updatedAt)}
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
    marginBottom: 20,
    color: "#2c3e50",
  },

  /* Streak Card */
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 2,
    marginBottom: 20,
  },
  streakNumber: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ff6b00",
  },
  streakLabel: { color: "#7f8c8d", marginTop: 2 },

  /* Summary Cards */
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  summaryCard: {
    width: "48%",
    padding: 20,
    borderRadius: 15,
  },
  summaryValue: { fontSize: 28, color: "#fff", fontWeight: "700" },
  summaryLabel: { fontSize: 14, color: "#fff", opacity: 0.85 },

  /* Weekly Pills */
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2c3e50",
    marginTop: 10,
  },
  weeklyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  pill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 6,
  },
  pillActive: {
    backgroundColor: "#007BFF",
  },
  pillInactive: {
    borderWidth: 1.5,
    borderColor: "#cbd5e0",
    backgroundColor: "#f1f2f6",
  },
  pillLabel: { color: "#7f8c8d", fontSize: 12 },

  /* Recent Items */
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
  },
  recentTitle: { fontSize: 16, fontWeight: "600", color: "#2c3e50" },
  recentDate: { fontSize: 13, color: "#7f8c8d" },
});
