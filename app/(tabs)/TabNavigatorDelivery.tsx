// app/(tabs)/TabNavigatorDelivery.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import your delivery screens
import DeliveryHomeScreen from '../DeliveryScreens/Home';
import DeliveryAccountScreen from '../DeliveryScreens/Account';

const Tab = createBottomTabNavigator();

const TabNavigatorDelivery = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Tasks') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ec8627',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Tasks" component={DeliveryHomeScreen} />
      <Tab.Screen
        name="Account"
        component={({
          navigation,
        }: {
          navigation: import('@react-navigation/native').NavigationProp<any>;
        }) => (
          <DeliveryAccountScreen onBack={() => navigation.goBack()} />
        )}
      />
    </Tab.Navigator>
  );
};

export default TabNavigatorDelivery;