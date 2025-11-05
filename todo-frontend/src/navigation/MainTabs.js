import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../screens/Dashboard';
import GoalsStack from './GoalsStack';
import Learning from '../screens/Learning';
import Focus from '../screens/Focus';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'home-outline';
          else if (route.name === 'Goals') iconName = 'checkmark-circle-outline';
          else if (route.name === 'Learning') iconName = 'book-outline';
          else if (route.name === 'Focus') iconName = 'timer-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Goals" component={GoalsStack} />
      <Tab.Screen name="Learning" component={Learning} />
      <Tab.Screen name="Focus" component={Focus} />
    </Tab.Navigator>
  );
}
