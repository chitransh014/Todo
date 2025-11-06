import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoutButton({ setIsLoggedIn }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setIsLoggedIn(false); // 👈 instantly go to Login
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{ marginRight: 15 }}
    >
      <Ionicons name="log-out-outline" size={24} color="#000" />
    </TouchableOpacity>
  );
}
