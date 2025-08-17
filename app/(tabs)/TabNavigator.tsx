// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import OrderTrackingScreen from '../screens/Order';
// import CheckoutScreen from '../screens/CheckOut';
// import Login from '../screens/Login';
// import Menu from '../screens/Menu';
// import AddItemScreen from '../screens/add_item';
// import DashboardScreen from '../screens/dashboard';
// import { MenuProvider } from '../screens/MenuContext';
// import ProductDetails from '../screens/product_details';

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// const MenuStack = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="VendorMenuScreen" component={Menu} />
//       <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
//       <Stack.Screen name="ProductDetails" component={ProductDetails} />
//     </Stack.Navigator>
//   );
// };

// const TabNavigator = () => {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false, // hide top header if needed
//         tabBarActiveTintColor: '#fb6d4dff',
//       }}
//     >

//       <Tab.Screen
//         name="Orders"
//         component={Login}
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


// TabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Import your actual screens
import OrderTrackingScreen from '../screens/Order'; 
import Menu from '../screens/Menu';
import AddItemScreen from '../screens/add_item';
import DashboardScreen from '../screens/dashboard';
import ProductDetails from '../screens/product_details';

// ... (your MenuStack component remains the same)
const MenuStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorMenuScreen" component={Menu} />
      <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
};


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#fb6d4dff',
      }}
    >
      <Tab.Screen
        name="Orders"
        // ✅ Changed this from Login to the actual OrderTrackingScreen
        component={OrderTrackingScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="production-quantity-limits" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;