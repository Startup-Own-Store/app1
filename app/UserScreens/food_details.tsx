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


const CustomRadioButton = ({ label, selected, onSelect }: { label: string, selected: boolean, onSelect: () => void }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onSelect}>
        <Text style={styles.radioLabel}>{label}</Text>
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && <View style={styles.radioInner} />}
        </View>
    </TouchableOpacity>
);

const CustomCheckbox = ({ label, isSelected, onValueChange }: { label: string, isSelected: boolean, onValueChange: () => void }) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onValueChange}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <MaterialIcons name="check" size={14} color="#fcf8f8" />}
        </View>
        <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
);


const ProductDetailScreen = ({ onBack, food, onAddToCart, onNavigateToCheckout }: { onBack?: () => void, food?: any, onAddToCart?: (item: any) => void, onNavigateToCheckout?: () => void }) => {
    const [size, setSize] = useState('Regular');
    const [selectedAddOns, setSelectedAddOns] = useState<Record<string, boolean>>({});
    const [selectedSides, setSelectedSides] = useState<Record<string, boolean>>({});

    const productData = {
        image: food?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCG3sqtAHYL-64o6h4azrhNvxZGRjn-T5yfscbR8VOD71ZwGf3eqMguPuX2pWryXrrSe33cH3ZM80OPYOSlUM9lGU_acJLboIyLe_WcEIhRkxyvsTGstCkT_GxxU9pt1dl0ZKylGqSopjJ-rPMW5phCYpZ7ZMengdZp0d7v0g_epoOy_OiDWKgVyCQ_wJTAk0qJpGFU70z2w84B79pqLIstGDmmBH4Cnj5a_IZ_wmA_pFU0NM4jgiJYAVofEetW1EyJMz1Ps-Fu-H0n',
        title: food?.name || 'Classic Cheeseburger',
        description: food?.description || 'A juicy beef patty topped with melted cheddar cheese, crisp lettuce, ripe tomato, and a tangy pickle, all nestled in a toasted sesame seed bun. Served with a side of golden, crispy fries.',
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

    const listData = [
        { type: 'image', id: 'productImage', uri: productData.image },
        { type: 'title', id: 'productTitle', text: productData.title },
        { type: 'description', id: 'productDescription', text: productData.description },
        { type: 'header', id: 'sizeHeader', title: 'Size' },
        ...productData.sizes.map(size => ({ type: 'sizeOption', id: size, label: size })),
        { type: 'header', id: 'addOnHeader', title: 'Add-ons' },
        ...productData.addOns.map(addOn => ({ type: 'addOnOption', ...addOn })),
        { type: 'header', id: 'sidesHeader', title: 'Sides' },
        ...productData.sides.map(side => ({ type: 'sideOption', ...side })),
    ];

    const handleAddOnToggle = (id: string) => {
        setSelectedAddOns(prev => ({ ...prev, [id]: !prev[id] }));
    };
    const handleSideToggle = (id: string) => {
        setSelectedSides(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderItem = ({ item }: { item: any }) => {
        switch(item.type) {
            case 'image':
                return <Image source={{ uri: item.uri }} style={styles.productImage} />;
            case 'title':
                return <Text style={styles.title}>{item.text}</Text>;
            case 'description':
                return <Text style={styles.description}>{item.text}</Text>;
            case 'header':
                return <Text style={styles.sectionTitle}>{item.title}</Text>;
            case 'sizeOption':
                return (
                    <View style={styles.optionsContainer}>
                        <CustomRadioButton label={item.label} selected={size === item.label} onSelect={() => setSize(item.label)} />
                    </View>
                );
            case 'addOnOption':
                return (
                    <View style={styles.optionsContainer}>
                        <CustomCheckbox label={item.label} isSelected={!!selectedAddOns[item.id]} onValueChange={() => handleAddOnToggle(item.id)} />
                    </View>
                );
            case 'sideOption':
                 return (
                    <View style={styles.optionsContainer}>
                        <CustomCheckbox label={item.label} isSelected={!!selectedSides[item.id]} onValueChange={() => handleSideToggle(item.id)} />
                    </View>
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
          <TouchableOpacity onPress={onBack}>
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
            <TouchableOpacity style={styles.addToOrderButton} onPress={() => {
                const orderItem = {
                    id: Date.now().toString(),
                    name: productData.title,
                    size,
                    addOns: Object.keys(selectedAddOns).filter(key => selectedAddOns[key]),
                    sides: Object.keys(selectedSides).filter(key => selectedSides[key]),
                    price: food?.price || '$12.99'
                };
                onAddToCart?.(orderItem);
                Alert.alert('Success', 'Successfully added to cart!', [
                    { text: 'OK', onPress: onNavigateToCheckout }
                ]);
            }}>
                <Text style={styles.addToOrderButtonText}>Add to Order</Text>
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
});

export default ProductDetailScreen;