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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';





interface ProductDetailScreenProps {
  onAddToCart?: (item: any) => void;
  onNavigateToCheckout?: () => void;
}

const ProductDetailScreen = ({ onAddToCart, onNavigateToCheckout }: ProductDetailScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { food } = route.params as { food: any }; 

  const [size, setSize] = useState('Regular');
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
  const [selectedSides, setSelectedSides] = useState<Record<string, boolean>>({});

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

  const handleAddToOrder = () => {
    const orderItem = {
      id: food?.id || Date.now().toString(),
      name: productData.title,
      size,
      addOns: Object.keys(selectedAddOns).filter(key => selectedAddOns[key]),
      sides: Object.keys(selectedSides).filter(key => selectedSides[key]),
      price: productData.price,
      originalPrice: food?.price // Keep original price for reference
    };
    
    onAddToCart?.(orderItem);
    Alert.alert('Success', 'Successfully added to cart!', [
      { 
        text: 'Continue Shopping', 
        onPress: handleBack,
        style: 'cancel'
      },
      { 
        text: 'Go to Checkout', 
        onPress: onNavigateToCheckout 
      }
    ]);
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
        return <Text style={styles.description}>{item.text}</Text>;
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
              Add to Order - ${typeof productData.price === 'number' ? productData.price.toFixed(2) : productData.price}
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

export default ProductDetailScreen;