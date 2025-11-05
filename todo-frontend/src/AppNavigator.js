import React, { useContext } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from './context/AuthContext';
import Login from "./screens/Auth/Login";
import Signup from "./screens/Auth/Signup";
import Dashboard from "./screens/Dashboard";
import Goals from "./screens/Goals";
import TaskDetail from "./screens/TaskDetail";
import Learning from "./screens/Learning";
import Focus from "./screens/Focus";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const GoalsStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="GoalsMain" component={Goals} options={{ title: 'Goals' }} />
    <Stack.Screen name="TaskDetail" component={TaskDetail} options={{ title: 'Task Detail' }} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Goals" component={GoalsStack} />
    <Tab.Screen name="Learning" component={Learning} />
    <Tab.Screen name="Focus" component={Focus} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator key={user ? 'loggedIn' : 'loggedOut'} screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={TabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
