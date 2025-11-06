import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SubtaskScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Subtask</Text>
      <Text>Subtask screen placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});
