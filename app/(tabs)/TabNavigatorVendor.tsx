// app/(tabs)/TabNavigatorVendor.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import your vendor screens
import DashboardScreen from '../screens/dashboard';
import OrderScreen from '../screens/Order';
import MenuScreen from '../screens/Menu';
//import AddItemScreen from '../screens/add_item';


const Tab = createBottomTabNavigator();

const TabNavigatorVendor = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ec8627',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrderScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
    
    </Tab.Navigator>
  );
};

export default TabNavigatorVendor;