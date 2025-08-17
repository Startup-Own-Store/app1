// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import TabNavigator from './app/(tabs)/TabNavigator';
// import { StatusBar } from 'react-native';
// import { StyleSheet, Text, View } from 'react-native';
// import Login from './app/screens/Login';
// import OrderTrackingScreen from './app/screens/Order';
// import UserHomeScreen from './app/screens/Login';
// import CheckOut from './app/screens/CheckOut';
// import { MenuProvider } from './app/screens/MenuContext';
// const Stack = createNativeStackNavigator();
// // export default function App() {
// //   return (
// //     <NavigationContainer>
// //       <TabNavigator />
// //       <Stack.Navigator initialRouteName="CheckOut">
// //         {/* <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/> */}
// //         <Stack.Screen name="OrderTrack" component={OrderTrackingScreen} />
// //         <Stack.Screen name="CheckOut" component={CheckOut} />
// //         <Stack.Screen name="UserHome" component={UserHomeScreen} />
// //         {/* Add other screens here */}
// //       </Stack.Navigator> 
// //     </NavigationContainer>
// //   );
// // }


// export default function App() {
//   return (
//     <MenuProvider>
//       <NavigationContainer>
//         <TabNavigator />
//       </NavigationContainer>
//     </MenuProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });




// App.tsx

import 'react-native-url-polyfill/auto'; // Must be at the top
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';

import supabase from './SupabaseClient'; // Make sure this path is correct
import TabNavigator from './app/(tabs)/TabNavigator';
import Login from './app/screens/Login';
import { MenuProvider } from './app/screens/MenuContext';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for an existing session when the app starts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (sign-in, sign-out)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup listener on component unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <MenuProvider>
      <NavigationContainer>
        {/* If a session exists, show the main app. Otherwise, show the Login screen. */}
        {session && session.user ? <TabNavigator /> : <Login />}
      </NavigationContainer>
    </MenuProvider>
  );
}