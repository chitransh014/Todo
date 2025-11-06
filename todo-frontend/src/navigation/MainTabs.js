import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../screens/Dashboard';
import GoalsStack from './GoalsStack';
import Learning from '../screens/Learning';
import Focus from '../screens/Focus';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from '../components/LogoutButton';

const Tab = createBottomTabNavigator();

export default function MainTabs({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerRight: () => <LogoutButton setIsLoggedIn={setIsLoggedIn} />,
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
      <Tab.Screen name="Dashboard">
        {(props) => <Dashboard {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
      <Tab.Screen name="Goals">
        {(props) => <GoalsStack {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
      <Tab.Screen name="Learning">
        {(props) => <Learning {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
      <Tab.Screen name="Focus">
        {(props) => <Focus {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
