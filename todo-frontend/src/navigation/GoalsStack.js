import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Goals from '../screens/Goals';
import TaskDetail from '../screens/TaskDetail';

const Stack = createNativeStackNavigator();

export default function GoalsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="GoalsMain"
        component={Goals}
        options={{ headerShown: false }}  // 👈 hides double header
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetail}
        options={{ title: 'Task Detail' }}
      />
    </Stack.Navigator>
  );
}
