import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import supabase from './SupabaseClient';
import { MenuProvider } from './app/screens/MenuContext';

// Import all Tab Navigators for logged-in users
import TabNavigatorUser from './app/(tabs)/TabNavigatorUser';
import TabNavigatorVendor from './app/(tabs)/TabNavigatorVendor';
import TabNavigatorDelivery from './app/(tabs)/TabNavigatorDelivery';

// Import all Authentication screens for logged-out users
import LoginScreen from './app/UserScreens/Login';
import WelcomeScreen from './app/UserScreens/WelcomeScreen';
import OtpScreen from './app/UserScreens/OtpScreen';
import VendorLoginScreen from './app/screens/VendorLogin';
import DeliveryLoginScreen from './app/DeliveryScreens/DeliveryLogin';
import AdminLoginScreen from './app/Admin/AdminLogin';

// Import all Admin screens for the admin stack
import AdminDashboardScreen from './app/Admin/AdminDashboard';
import CreateVendorUserScreen from './app/Admin/CreateVendorUser';
import CreateDeliveryUserScreen from './app/Admin/CreateDeliveryUser';
import AdminOrderDetailsScreen from './app/Admin/AdminOrderDetails';

// Import all UserScreens for direct navigation
import CheckoutScreen from './app/UserScreens/checkout';
import FoodDetailsScreen from './app/UserScreens/food_details';
import OrderSuccessScreen from './app/UserScreens/order_success';
import ShopsScreen from './app/UserScreens/shops';
import TrackOrderScreen from './app/UserScreens/track_order';
import ProfileScreen from './app/UserScreens/profile';

// Import Vendor screens
import RestaurantMenuScreen from './app/UserScreens/shops';
import ProductDetailScreen from './app/UserScreens/food_details';
import CartScreen from './app/UserScreens/cart';
import NameInputScreen from './app/UserScreens/NameInputScreen';
import OrderAcceptedScreen from './app/screens/CheckOut';
import AddItemScreen from './app/screens/add_item';
import ProductDetailsScreen from './app/screens/product_details';
import UserOrderDetails from './app/UserScreens/UserOrderDetails';
import UserHomeScreen from './app/UserScreens/home';

/**
 * This is the single source of truth for all navigation routes in the app.
 */
export type RootStackParamList = {
  // --- Unauthenticated Screens ---
  Welcome: undefined;
  Home: undefined;
  Login: undefined;
  VendorLogin: undefined;
  DeliveryLogin: undefined;
  AdminLogin: undefined;
  OtpScreen: { phone: string };

  // --- Authenticated Main Screens (Each renders a Tab Navigator) ---
  MainUser: undefined;
  MainVendor: undefined;
  MainDelivery: undefined;

  // --- Authenticated Admin Stack Screens ---
  AdminDashboard: undefined;
  CreateVendorUser: undefined;
  CreateDeliveryUser: undefined;
  AdminOrderDetails: undefined;

  // --- Other User-Specific Screens ---
  Checkout: undefined;
  FoodDetails: undefined;
  OrderSuccess: undefined;
  Shops: undefined;
  TrackOrder: undefined;
  Profile: undefined;

  // --- Restaurant Menu Screen ---
  RestaurantMenu: { shopId: string; shopName: string };
  ProductDetail: { itemId: string };

  // --- Cart Screen ---
  Cart: undefined;
  OrderDetails: { orderId: string };

  // --- Name Input Screen ---
  NameInputScreen: undefined;

  // --- Vendor Screens ---
  VendorHome: undefined;
  AddItemScreen: undefined;
  ProductDetails: { itemId: string };

  // --- User Order Details Screen ---
  UserOrderDetails: { order: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  /**
   * Check if user is logged in using AsyncStorage
   */
  const checkLoginStatus = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      const role = await AsyncStorage.getItem('userRole');
      
      setIsLoggedIn(loggedIn === 'true');
      setUserRole(role || 'user');
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ec8627" />
      </View>
    );
  }

  return (
    <MenuProvider>
      <NavigationContainer
        onStateChange={() => {
          // Check login status whenever navigation state changes
          checkLoginStatus();
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            // --- Group of screens to show when the user is LOGGED OUT ---
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="NameInputScreen" component={NameInputScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="OtpScreen" component={OtpScreen} />
              <Stack.Screen name="VendorLogin" component={VendorLoginScreen} />
              <Stack.Screen name="DeliveryLogin" component={DeliveryLoginScreen} />
              <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
            </>
          ) : userRole === 'admin' ? (
            // --- Group of screens for the LOGGED IN ADMIN ---
            <>
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
              <Stack.Screen name="CreateVendorUser" component={CreateVendorUserScreen} />
              <Stack.Screen name="CreateDeliveryUser" component={CreateDeliveryUserScreen} />
              <Stack.Screen name="AdminOrderDetails" component={AdminOrderDetailsScreen} />
            </>
          ) : userRole === 'vendor' ? (
            // --- Screens for the LOGGED IN VENDOR ---
            <>
              <Stack.Screen name="MainVendor" component={TabNavigatorVendor} />
              <Stack.Screen name="OrderDetails" component={OrderAcceptedScreen} />
              <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
              <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
            </>
          ) : userRole === 'delivery' ? (
            // --- Screen for the LOGGED IN DELIVERY partner ---
            <Stack.Screen name="MainDelivery" component={TabNavigatorDelivery} />
          ) : (
            // --- Group of screens for the default LOGGED IN USER ---
            <>
              <Stack.Screen name="MainUser" component={TabNavigatorUser} />
              {/* Other screens reachable from the user's tabs */}
              <Stack.Screen name="Checkout" component={CheckoutScreen} />
              <Stack.Screen name="FoodDetails" component={FoodDetailsScreen} />
              <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
              <Stack.Screen name="Shops" component={ShopsScreen} />
              <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} />
              <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="NameInputScreen" component={NameInputScreen} />
              <Stack.Screen name="UserOrderDetails" component={UserOrderDetails} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
}