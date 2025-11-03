import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard({ navigation }) {
  const [energy, setEnergy] = useState(5);
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchPlan();
  }, [energy]);

const fetchPlan = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`http://localhost:3000/api/tasks/today?energy=${energy}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(response.data.tasks);
    setName(response.data.name);
  } catch (error) {
    console.error(error);
  }
};

  return (
    <View style={styles.container}>
      <Text>Hi, {name}</Text>
      <Text>Energy Level</Text>
      <Slider
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={energy}
        onValueChange={setEnergy}
      />
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
      <Button title="Add Task" onPress={() => navigation.navigate('AddTask')} />
      <Button title="Logout" onPress={() => {
        logout();
        navigation.navigate('Login');
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});
