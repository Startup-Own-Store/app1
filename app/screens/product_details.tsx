import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Switch,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const productData = {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu88bpbxVsUZOIU00VYvFiLx7X2J3IjC7IJvIgvPYddXrf12lw8zSRekuwsfPIyWbjQkuGcOmWVK1Jb00wZD0wEBeZjbHns79qZ9UWFCMcaQ3-F9lEl6N9oGsurfPaOXkesegaQjPGg6Stryk9byQZ_xesB7yZ0vXnTHsHuxcrnLZg6NXbK3iFBghIIKiBTQCpoXrcO1fa0RSryWSIGagl-xIBr0o0olgxtJp2lAEVvHAipF4rmkhDIaClsfJ-eZgTDCkHgYBuiqz4',
};

// Combine all screen elements into a single data array for FlatList
const listData = [
    { type: 'image', id: 'productImage', uri: productData.image },
    { type: 'input', id: 'productName', label: 'Product Name', defaultValue: 'Spicy Chicken Sandwich' },
    { type: 'textArea', id: 'description', label: 'Description', defaultValue: 'A crispy, juicy chicken fillet with spicy mayo, lettuce, and pickles on a toasted brioche bun.' },
    { type: 'input', id: 'price', label: 'Price', defaultValue: '$8.99', keyboardType: 'decimal-pad' },
    { type: 'picker', id: 'category', label: 'Category', value: 'Sandwiches' },
    { type: 'toggle', id: 'availability', label: 'Available' },
];

const ProductDetailsScreen = () => {
    const navigation = useNavigation();
    const [isAvailable, setIsAvailable] = useState(false);
    const toggleSwitch = () => setIsAvailable(previousState => !previousState);

    const renderItem = ({ item }: { item: any }) => {
        switch(item.type) {
            case 'image':
                return (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: item.uri }} style={styles.productImage} />
                    </View>
                );
            case 'input':
                return (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{item.label}</Text>
                        <TextInput
                            placeholderTextColor="#8a725c"
                            style={styles.textInput}
                            defaultValue={item.defaultValue}
                            keyboardType={item.keyboardType || 'default'}
                        />
                    </View>
                );
            case 'textArea':
                return (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{item.label}</Text>
                        <TextInput
                            placeholderTextColor="#8a725c"
                            style={[styles.textInput, { height: 144, textAlignVertical: 'top' }]}
                            multiline
                            defaultValue={item.defaultValue}
                        />
                    </View>
                );
            case 'picker':
                return (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{item.label}</Text>
                        <TouchableOpacity style={styles.picker}>
                            <Text style={styles.pickerText}>{item.value}</Text>
                            <MaterialIcons name="unfold-more" size={24} color="#8a725c" />
                        </TouchableOpacity>
                    </View>
                );
            case 'toggle':
                return (
                    <View style={styles.availabilityContainer}>
                        <Text style={styles.label}>{item.label}</Text>
                        <Switch
                            trackColor={{ false: "#f1edea", true: "#f3e7dc" }}
                            thumbColor={"#ffffff"}
                            ios_backgroundColor="#f1edea"
                            onValueChange={toggleSwitch}
                            value={isAvailable}
                        />
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#181410" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContainer}
        />

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f1edea' }]}>
            <Text style={styles.footerButtonText}>Delete Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f3e7dc' }]}>
            <Text style={styles.footerButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fbfaf9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Image
  imageContainer: {
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 218,
    borderRadius: 12,
  },
  // Form
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // For footer spacing
  },
  inputGroup: {
      gap: 8,
      marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  textInput: {
    backgroundColor: '#f1edea',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1edea',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 16,
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Availability
  availabilityContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fbfaf9',
    borderTopWidth: 1,
    borderTopColor: '#f1edea',
  },
  footerButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default ProductDetailsScreen;