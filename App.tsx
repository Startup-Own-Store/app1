// // // import { NavigationContainer } from '@react-navigation/native';
// // // import { createNativeStackNavigator } from '@react-navigation/native-stack';
// // // import TabNavigator from './app/(tabs)/TabNavigator';
// // // import { StatusBar } from 'react-native';
// // // import { StyleSheet, Text, View } from 'react-native';
// // // import Login from './app/screens/Login';
// // // import OrderTrackingScreen from './app/screens/Order';
// // // import UserHomeScreen from './app/screens/Login';
// // // import CheckOut from './app/screens/CheckOut';
// // // import { MenuProvider } from './app/screens/MenuContext';
// // // const Stack = createNativeStackNavigator();
// // // // export default function App() {
// // // //   return (
// // // //     <NavigationContainer>
// // // //       <TabNavigator />
// // // //       <Stack.Navigator initialRouteName="CheckOut">
// // // //         {/* <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/> */}
// // // //         <Stack.Screen name="OrderTrack" component={OrderTrackingScreen} />
// // // //         <Stack.Screen name="CheckOut" component={CheckOut} />
// // // //         <Stack.Screen name="UserHome" component={UserHomeScreen} />
// // // //         {/* Add other screens here */}
// // // //       </Stack.Navigator> 
// // // //     </NavigationContainer>
// // // //   );
// // // // }


// // // export default function App() {
// // //   return (
// // //     <MenuProvider>
// // //       <NavigationContainer>
// // //         <TabNavigator />
// // //       </NavigationContainer>
// // //     </MenuProvider>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#fff',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // // });




// // // App.tsx

// // import 'react-native-url-polyfill/auto'; // Must be at the top
// // import React, { useState, useEffect } from 'react';
// // import { NavigationContainer } from '@react-navigation/native';
// // import { Session } from '@supabase/supabase-js';

// // import supabase from './SupabaseClient'; // Make sure this path is correct
// // import TabNavigator from './app/(tabs)/TabNavigator';
// // import Login from './app/screens/Login';
// // import { MenuProvider } from './app/screens/MenuContext';

// // export type RootStackParamList = {
// //   Login: undefined;
// //   Main: undefined;
// // };

// // export default function App() {
// //   const [session, setSession] = useState<Session | null>(null);

// //   useEffect(() => {
// //     // Check for an existing session when the app starts
// //     supabase.auth.getSession().then(({ data: { session } }) => {
// //       setSession(session);
// //     });

// //     // Listen for auth state changes (sign-in, sign-out)
// //     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
// //       setSession(session);
// //     });

// //     // Cleanup listener on component unmount
// //     return () => {
// //       authListener.subscription.unsubscribe();
// //     };
// //   }, []);

// //   return (
// //     <MenuProvider>
// //       <NavigationContainer>
// //         {/* If a session exists, show the main app. Otherwise, show the Login screen. */}
// //         {session && session.user ? <TabNavigator /> : <Login />}
// //       </NavigationContainer>
// //     </MenuProvider>
// //   );
// // }






// // App.tsx
// import 'react-native-url-polyfill/auto';
// import React, { useState, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { Session } from '@supabase/supabase-js';

// import supabase from './SupabaseClient';
// import TabNavigator from './app/(tabs)/TabNavigatorUser';
// import Login from './app/UserScreens/Login';
// import OtpScreen from './app/screens/OtpScreen';
// import { MenuProvider } from './app/screens/MenuContext';
// import VendorLogin from './app/screens/VendorLogin';
// import DeliveryLogin from './app/DeliveryScreens/DeliveryLogin';

// // ✅ Route types
// export type RootStackParamList = {
//   Login: undefined;
//   OtpScreen: undefined;
//   VendorLogin: undefined;
//   DeliveryLogin: undefined;
//   Main: undefined; // wraps TabNavigator
// };

// const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function App() {
//   const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   return (
//     <MenuProvider>
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           {!session || !session.user ? (
//             <>
//               <Stack.Screen name="Login" component={Login} />
//               <Stack.Screen name="OtpScreen" component={OtpScreen} />
//               <Stack.Screen name="VendorLogin" component={VendorLogin} />
//               <Stack.Screen name="DeliveryLogin" component={DeliveryLogin} />
//             </>
//           ) : (
//             <Stack.Screen name="Main" component={TabNavigator} />
//           )}
//         </Stack.Navigator>
//       </NavigationContainer>
//     </MenuProvider>
//   );
// }



// App.tsx
// App.tsx
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';

import supabase from './SupabaseClient';
import { MenuProvider } from './app/screens/MenuContext';

// Import all Tab Navigators for logged-in users
import TabNavigatorUser from './app/(tabs)/TabNavigatorUser';
import TabNavigatorVendor from './app/(tabs)/TabNavigatorVendor';
import TabNavigatorDelivery from './app/(tabs)/TabNavigatorDelivery';

// Import all Authentication screens for logged-out users
import LoginScreen from './app/UserScreens/Login';
import OtpScreen from './app/UserScreens/OtpScreen'; // Note: You had UserScreens/OtpScreen, check path
import VendorLoginScreen from './app/screens/VendorLogin';
import DeliveryLoginScreen from './app/DeliveryScreens/DeliveryLogin';
import AdminLoginScreen from './app/Admin/AdminLogin'; // Note: You had Admin/AdminLogin, check path

// Import all Admin screens for the admin stack
import AdminDashboardScreen from './app/Admin/AdminDashboard'; // Note: You had Admin/AdminDashboard, check path
import CreateVendorUserScreen from './app/Admin/CreateVendorUser'; // Note: You had Admin/CreateVendorUser, check path
import CreateDeliveryUserScreen from './app/Admin/CreateDeliveryUser'; // Note: You had Admin/CreateDeliveryUser, check path

// Import all UserScreens for direct navigation from within the user's authenticated stack
import CheckoutScreen from './app/UserScreens/checkout';
import FoodDetailsScreen from './app/UserScreens/food_details';
import OrderSuccessScreen from './app/UserScreens/order_success';
import ShopsScreen from './app/UserScreens/shops';
import TrackOrderScreen from './app/UserScreens/track_order';
import ProfileScreen from './app/UserScreens/profile';

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

  // --- Other User-Specific Screens (navigated to from the MainUser tabs) ---
  Checkout: undefined;
  FoodDetails: undefined;
  OrderSuccess: undefined;
  Shops: undefined;
  TrackOrder: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUserRole(session?.user?.user_metadata?.role || null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUserRole(session?.user?.user_metadata?.role || null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session || !session.user ? (
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
            </>
          ) : userRole === 'vendor' ? (
            // --- Screen for the LOGGED IN VENDOR ---
            <Stack.Screen name="MainVendor" component={TabNavigatorVendor} />
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
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
}