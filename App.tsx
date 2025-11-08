import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import WelcomeScreen from './app/UserScreens/WelcomeScreen';
import NameInputScreen from './app/UserScreens/NameInputScreen';
import HirePersonScreen from './app/UserScreens/HirePerson';
import ProfileTabScreen from './app/UserScreens/ProfileTab';
import AdminLoginScreen from './app/Admin/AdminLogin';
import HelpSupportScreen from './app/UserScreens/HelpSupp';
import NotificationsScreen from './app/UserScreens/Notifications';

export type RootStackParamList = {
  Welcome: undefined;
  NameInput: undefined;
  MainTabs: undefined;
  AdminLogin: undefined;
  HelpSupport: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Hire: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#00796B',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',     // ✅ makes tab bar white
        borderTopColor: '#DEE2E6',
      },
      tabBarIcon: ({ color, size }) => {
        const iconName = route.name === 'Hire' ? 'construct-outline' : 'person-circle-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Hire" component={HirePersonScreen} />
    <Tab.Screen name="Profile" component={ProfileTabScreen} />
  </Tab.Navigator>
);

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Welcome' | 'MainTabs' | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedName = await AsyncStorage.getItem('userName');
        setInitialRoute(storedName ? 'MainTabs' : 'Welcome');
      } catch (error) {
        console.error('Failed to load session', error);
        setInitialRoute('Welcome');
      }
    };
    loadSession();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00796B" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>  
      {/* ✅ Global background — removes black bar on all screens */}

      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: '#FFFFFF',     // ✅ ensures React Navigation uses white background
            card: '#FFFFFF',
            primary: '#00796B',
            text: '#212529',
            border: '#DEE2E6',
            notification: '#00796B',
          },
        }}
      >
        <Stack.Navigator
          key={initialRoute}
          screenOptions={{ headerShown: false }}
          initialRouteName={initialRoute}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="NameInput" component={NameInputScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
