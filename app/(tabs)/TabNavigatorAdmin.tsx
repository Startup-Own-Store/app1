// app/(tabs)/TabNavigatorAdmin.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AdminDashboard from '../Admin/AdminDashboard';
import AdminSettingsScreen from '../Admin/AdminDashboard';

const Tab = createBottomTabNavigator();

const TabNavigatorAdmin = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          // ✅ STEP 2: Use screen names that match the tabs
          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Use admin-appropriate colors
        tabBarActiveTintColor: '#c0392b', 
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* ✅ STEP 3: Assign the correct components to the tabs */}
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigatorAdmin;