// VendorStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigatorVendor from '../(tabs)/TabNavigatorVendor';
import AddItemScreen from '../screens/add_item';

const Stack = createNativeStackNavigator();

const VendorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorTabs" component={TabNavigatorVendor} />
      <Stack.Screen name="AddItemScreen" component={AddItemScreen} />
    </Stack.Navigator>
  );
};

export default VendorStack;
