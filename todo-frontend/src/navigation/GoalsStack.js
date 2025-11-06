import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Goals from '../screens/Goals';
import TaskDetail from '../screens/TaskDetail';
import SubtaskScreen from '../screens/SubtaskScreen';
import LogoutButton from '../components/LogoutButton';

const Stack = createNativeStackNavigator();

export default function GoalsStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <LogoutButton setIsLoggedIn={setIsLoggedIn} />,
      }}
    >
      <Stack.Screen
        name="GoalsMain"
        options={{ headerShown: false }}  // 👈 hides double header
      >
        {(props) => <Goals {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen
        name="TaskDetail"
        options={{ title: 'Task Detail' }}
      >
        {(props) => <TaskDetail {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen
        name="SubtaskScreen"
        options={{ title: 'Add Subtask' }}
      >
        {(props) => <SubtaskScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
