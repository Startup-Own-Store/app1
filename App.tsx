import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import supabase from './SupabaseClient';
import { MenuProvider } from './app/screens/MenuContext';

// Import all Tab Navigators for logged-in users
import TabNavigatorUser from './app/(tabs)/TabNavigatorUser';
import TabNavigatorVendor from './app/(tabs)/TabNavigatorVendor';
import TabNavigatorDelivery from './app/(tabs)/TabNavigatorDelivery';

// Import all Authentication screens for logged-out users
import LoginScreen from './app/UserScreens/Login';
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

/**
 * This is the single source of truth for all navigation routes in the app.
 */
export type RootStackParamList = {
  // --- Unauthenticated Screens ---
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      console.log('Firebase auth state changed:', user?.uid);
      setFirebaseUser(user);

      if (user) {
        // User is signed in with Firebase
        // Fetch their role from Supabase database
        await fetchUserRole(user.uid);
      } else {
        // User is signed out
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Fetches user role from Supabase database using Firebase UID
   */
  const fetchUserRole = async (firebaseUid: string) => {
    try {
      console.log('Fetching user role for Firebase UID:', firebaseUid);

      const { data, error } = await supabase
        .from('firebase_users')
        .select('role')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) {
        // PGRST116 means no rows found - user doesn't exist yet (will be created by sync)
        if (error.code === 'PGRST116') {
          console.log('User not found in database yet, will be created by sync');
          setUserRole('user');
          return;
        }
        console.error('Error fetching user role:', error);
        setUserRole('user');
        return;
      }

      if (data) {
        console.log('User role fetched:', data.role);
        setUserRole(data.role || 'user');
      } else {
        console.log('No user data found, defaulting to user role');
        setUserRole('user');
      }
    } catch (error) {
      console.error('Exception while fetching user role:', error);
      setUserRole('user');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!firebaseUser ? (
            // --- Group of screens to show when the user is LOGGED OUT ---
            <>
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