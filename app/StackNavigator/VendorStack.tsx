// VendorStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigatorVendor from '../(tabs)/TabNavigatorVendor';
import AddItemScreen from '../screens/add_item';
import ProductDetailScreen from '../screens/product_details';
import OrderAcceptedScreen from '../screens/CheckOut';

const Stack = createNativeStackNavigator();

const VendorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorTabs" component={TabNavigatorVendor} />
      <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailScreen} />
      
    </Stack.Navigator>
  );
};

export default VendorStack;
