// // import React from 'react';
// // import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// // import { createNativeStackNavigator } from '@react-navigation/native-stack';
// // import { MaterialIcons } from '@expo/vector-icons';

// // import OrderTrackingScreen from '../screens/Order';
// // import CheckoutScreen from '../screens/CheckOut';
// // import Login from '../screens/Login';
// // import Menu from '../screens/Menu';
// // import AddItemScreen from '../screens/add_item';
// // import DashboardScreen from '../screens/dashboard';
// // import { MenuProvider } from '../screens/MenuContext';
// // import ProductDetails from '../screens/product_details';

// // const Tab = createBottomTabNavigator();
// // const Stack = createNativeStackNavigator();

// // const MenuStack = () => {
// //   return (
// //     <Stack.Navigator screenOptions={{ headerShown: false }}>
// //       <Stack.Screen name="VendorMenuScreen" component={Menu} />
// //       <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
// //       <Stack.Screen name="ProductDetails" component={ProductDetails} />
// //     </Stack.Navigator>
// //   );
// // };

// // const TabNavigator = () => {
// //   return (
// //     <Tab.Navigator
// //       screenOptions={{
// //         headerShown: false, // hide top header if needed
// //         tabBarActiveTintColor: '#fb6d4dff',
// //       }}
// //     >

// //       <Tab.Screen
// //         name="Orders"
// //         component={Login}
// //         options={{
// //           tabBarIcon: ({ color, size }) => (
// //             <MaterialIcons name="production-quantity-limits" color={color} size={size} />
// //           ),
// //         }}
// //       />
// //       <Tab.Screen
// //         name="Menu"
// //         component={MenuStack}
// //         options={{
// //           tabBarIcon: ({ color, size }) => (
// //             <MaterialIcons name="list" color={color} size={size} />
// //           ),
// //         }}
// //       />
// //       <Tab.Screen
// //         name="Account"
// //         component={DashboardScreen}
// //         options={{
// //           tabBarIcon: ({ color, size }) => (
// //             <MaterialIcons name="person-outline" color={color} size={size} />
// //           ),
// //         }}
// //       />
// //     </Tab.Navigator>
// //   );
// // };

// // export default TabNavigator;


// // TabNavigator.tsx

// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { MaterialIcons } from '@expo/vector-icons';

// // Import your actual screens
// import OrderTrackingScreen from '../screens/Order'; 
// import Menu from '../screens/Menu';
// import AddItemScreen from '../screens/add_item';
// import DashboardScreen from '../screens/dashboard';
// import ProductDetails from '../screens/product_details';

// // ... (your MenuStack component remains the same)
// const MenuStack = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="VendorMenuScreen" component={Menu} />
//       <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
//       <Stack.Screen name="ProductDetails" component={ProductDetails} />
//     </Stack.Navigator>
//   );
// };


// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// const TabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: '#fb6d4dff',
//       }}
//     >
//       <Tab.Screen
//         name="Orders"
//         // ✅ Changed this from Login to the actual OrderTrackingScreen
//         component={OrderTrackingScreen} 
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="production-quantity-limits" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Menu"
//         component={MenuStack}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="list" color={color} size={size} />
//           ),
//         }}
//       />
//       <Tab.Screen
//         name="Account"
//         component={DashboardScreen}
//         options={{
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="person-outline" color={color} size={size} />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// };

// export default TabNavigator;



// app/(tabs)/TabNavigatorUser.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import your user screens
import UserHomeScreen from '../UserScreens/home';
import TrackOrderScreen from '../UserScreens/track_order';
import ProfileScreen from '../UserScreens/profile';

const Tab = createBottomTabNavigator();

const TabNavigatorUser = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TrackOrder') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ec8627',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={UserHomeScreen} />
      <Tab.Screen name="TrackOrder" component={TrackOrderScreen} options={{ title: 'My Orders' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigatorUser;