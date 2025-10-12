import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import supabase from '../../SupabaseClient'; // Corrected import for Supabase client




interface ProductDetailScreenProps {
  onAddToCart?: (item: any) => void;
  onNavigateToCheckout?: () => void;
}

const FoodDetailsScreen = ({ onAddToCart, onNavigateToCheckout }: ProductDetailScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { food } = route.params as { food: any }; 

  const [size, setSize] = useState('Regular');
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const [selectedSides, setSelectedSides] = useState<Record<string, boolean>>({});
  const [quantity, setQuantity] = useState(1); // State for quantity

  const productData = {
    image: food?.image || 'https://via.placeholder.com/300x200?text=Food',
    title: food?.name || 'Food Item',
    description: food?.description || 'No description available',
    price: food?.price || 0,
    sizes: ['Regular', 'Large'],
    addOns: [
      { id: 'addOn1', label: 'Extra Cheese' },
      { id: 'addOn2', label: 'Bacon' },
      { id: 'addOn3', label: 'Avocado' },
    ],
    sides: [
      { id: 'side1', label: 'Coleslaw' },
      { id: 'side2', label: 'Onion Rings' },
    ]
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Update handleAddToOrder to show alert and remove navigation
  const handleAddToOrder = async () => {
    const session = await supabase.auth.getSession();
    const userId = session.data?.session?.user?.id;

    if (!userId) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    // Fetch vendor_id if not already present
    if (!food?.vendor_id) {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('vendor_id')
          .eq('id', food?.id)
          .single();

        if (error || !data?.vendor_id) {
          console.log('Error fetching vendor_id:', error);
          Alert.alert('Error', 'Vendor ID is missing and could not be fetched.');
          return;
        }

        food.vendor_id = data.vendor_id; // Assign fetched vendor_id to food object
      } catch (err) {
        console.log('Unexpected error fetching vendor_id:', err);
        Alert.alert('Error', 'An unexpected error occurred while fetching vendor ID.');
        return;
      }
    }

    const vendorId = food?.vendor_id ?? null;

    if (!vendorId) {
      Alert.alert('Error', 'Vendor ID is missing. Cannot add item to cart.');
      return;
    }

    try {
      // Check if the item already exists in the cart
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', food?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "row not found" error
        console.log('Error fetching existing cart item:', fetchError);
        Alert.alert('Error', 'Failed to check existing cart item.');
        return;
      }

      if (existingItem) {
        // Update the existing item
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = newQuantity * productData.price;

        const { error: updateError } = await supabase
          .from('cart')
          .update({
            quantity: newQuantity,
            total_price: newTotalPrice,
          })
          .eq('cart_id', existingItem.cart_id);

        if (updateError) {
          console.log('Error updating cart item:', updateError);
          Alert.alert('Error', 'Failed to update cart item.');
          return;
        }

        Alert.alert('Success', 'Cart item updated successfully.');
      } else {
        // Insert a new item
        const { error: insertError } = await supabase.from('cart').insert({
          user_id: userId,
          vendor_id: vendorId,
          item_id: food?.id,
          quantity,
          price: productData.price,
          total_price: productData.price * quantity,
        });

        if (insertError) {
          console.log('Error inserting cart item:', insertError);
          Alert.alert('Error', 'Failed to add item to cart.');
          return;
        }

        Alert.alert('Success', 'Food added to the cart.');
      }
    } catch (err) {
      console.log('Unexpected Error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Update the listData to include price if needed
  const listData = [
    { type: 'image', id: 'productImage', uri: productData.image },
    { type: 'title', id: 'productTitle', text: productData.title },
    // You might want to add a price display here
    { type: 'price', id: 'productPrice', price: productData.price },
    { type: 'description', id: 'productDescription', text: productData.description },
    { type: 'header', id: 'sizeHeader', title: 'Size' },
    ...productData.sizes.map(size => ({ type: 'sizeOption', id: size, label: size })),
    { type: 'header', id: 'addOnHeader', title: 'Add-ons' },
    ...productData.addOns.map(addOn => ({ type: 'addOnOption', ...addOn })),
    { type: 'header', id: 'sidesHeader', title: 'Sides' },
    ...productData.sides.map(side => ({ type: 'sideOption', ...side })),
  ];

  // Add a case for price in renderItem
  const renderItem = ({ item }: { item: any }) => {
    switch(item.type) {
      case 'image':
        return <Image source={{ uri: item.uri }} style={styles.productImage} />;
      case 'title':
        return <Text style={styles.title}>{item.text}</Text>;
      case 'price':
        return (
          <Text style={styles.price}>
            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
          </Text>
        );
      case 'description':
        return (
          <>
            <Text style={styles.description}>{item.text}</Text>
            {/* Quantity Selector Below Description */}
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.quantityButton} onPress={handleDecrement}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={handleIncrement}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialIcons name="close" size={24} color="#1b0e0f" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        
        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.addToOrderButton} onPress={handleAddToOrder}>
            <Text style={styles.addToOrderButtonText}>
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf8f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  productImage: {
      width: '100%',
      height: 218,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b0e0f',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  description: {
    fontSize: 16,
    color: '#1b0e0f',
    paddingHorizontal: 16,
    paddingBottom: 12,
    lineHeight: 24,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b0e0f',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  optionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  // Radio Button
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e7d0d1',
    borderRadius: 12,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1b0e0f',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e7d0d1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#e82630',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e82630',
  },
  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e7d0d1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#e82630',
    borderColor: '#e82630',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1b0e0f',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Quantity
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e7d0d1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b0e0f',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0e0f',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fcf8f8',
  },
  addToOrderButton: {
    backgroundColor: '#e82630',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToOrderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fcf8f8',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e82630',
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default FoodDetailsScreen;