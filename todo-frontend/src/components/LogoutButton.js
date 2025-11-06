import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function LogoutButton() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
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
