// // import { NavigationContainer } from '@react-navigation/native';
// // import { createNativeStackNavigator } from '@react-navigation/native-stack';
// // import TabNavigator from './app/(tabs)/TabNavigator';
// // import { StatusBar } from 'react-native';
// // import { StyleSheet, Text, View } from 'react-native';
// // import Login from './app/screens/Login';
// // import OrderTrackingScreen from './app/screens/Order';
// // import UserHomeScreen from './app/screens/Login';
// // import CheckOut from './app/screens/CheckOut';
// // import { MenuProvider } from './app/screens/MenuContext';
// // const Stack = createNativeStackNavigator();
// // // export default function App() {
// // //   return (
// // //     <NavigationContainer>
// // //       <TabNavigator />
// // //       <Stack.Navigator initialRouteName="CheckOut">
// // //         {/* <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/> */}
// // //         <Stack.Screen name="OrderTrack" component={OrderTrackingScreen} />
// // //         <Stack.Screen name="CheckOut" component={CheckOut} />
// // //         <Stack.Screen name="UserHome" component={UserHomeScreen} />
// // //         {/* Add other screens here */}
// // //       </Stack.Navigator> 
// // //     </NavigationContainer>
// // //   );
// // // }


// // export default function App() {
// //   return (
// //     <MenuProvider>
// //       <NavigationContainer>
// //         <TabNavigator />
// //       </NavigationContainer>
// //     </MenuProvider>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });




// // App.tsx

// import 'react-native-url-polyfill/auto'; // Must be at the top
// import React, { useState, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { Session } from '@supabase/supabase-js';

// import supabase from './SupabaseClient'; // Make sure this path is correct
// import TabNavigator from './app/(tabs)/TabNavigator';
// import Login from './app/screens/Login';
// import { MenuProvider } from './app/screens/MenuContext';

// export type RootStackParamList = {
//   Login: undefined;
//   Main: undefined;
// };

// export default function App() {
//   const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     // Check for an existing session when the app starts
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     // Listen for auth state changes (sign-in, sign-out)
//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     // Cleanup listener on component unmount
//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   return (
//     <MenuProvider>
//       <NavigationContainer>
//         {/* If a session exists, show the main app. Otherwise, show the Login screen. */}
//         {session && session.user ? <TabNavigator /> : <Login />}
//       </NavigationContainer>
//     </MenuProvider>
//   );
// }






// App.tsx
import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';

import supabase from './SupabaseClient';
import TabNavigator from './app/(tabs)/TabNavigator';
import Login from './app/screens/Login';
import OtpScreen from './app/screens/OtpScreen';
import { MenuProvider } from './app/screens/MenuContext';
import VendorLogin from './app/screens/VendorLogin';
import DeliveryLogin from './app/screens/DeliveryLogin';

// ✅ Route types
export type RootStackParamList = {
  Login: undefined;
  OtpScreen: undefined;
  VendorLogin: undefined;
  DeliveryLogin: undefined;
  Main: undefined; // wraps TabNavigator
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session || !session.user ? (
            <>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="OtpScreen" component={OtpScreen} />
              <Stack.Screen name="VendorLogin" component={VendorLogin} />
              <Stack.Screen name="DeliveryLogin" component={DeliveryLogin} />
            </>
          ) : (
            <Stack.Screen name="Main" component={TabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </MenuProvider>
  );
}