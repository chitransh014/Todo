import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AuthStack from './navigation/AuthStack';
import MainTabs from './navigation/MainTabs';
import { TaskProvider } from './context/TaskContext';
import * as Notifications from 'expo-notifications';

// How notifications behave when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const RootStack = createNativeStackNavigator();

function RootNavigator() {
  const { user } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <RootStack.Screen name="AuthStack" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Enable notifications to get reminders");
      }
    };

    requestPermissions();
  }, []);

  return (
    <AuthProvider>
      <TaskProvider>
        <RootNavigator />
      </TaskProvider>
    </AuthProvider>
  );
}

