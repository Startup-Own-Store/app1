import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useMenu, MenuItem } from "./MenuContext";

//firebase imports
import { db } from '../../FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// A custom checkbox component
const CustomCheckbox = ({
  label,
  isSelected,
  onValueChange,
}: {
  label: string;
  isSelected: boolean;
  onValueChange: () => void;
}) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onValueChange}>
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <MaterialIcons name="check" size={14} color="#181410" />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const formSections = [
    { type: 'input', id: 'itemName', label: 'Item Name', placeholder: 'e.g. Chicken Sandwich' },
    { type: 'textArea', id: 'description', label: 'Description', placeholder: 'e.g. Grilled chicken, lettuce, tomato, and mayo on a toasted bun' },
    { type: 'input', id: 'price', label: 'Price', placeholder: '$', keyboardType: 'decimal-pad' },
    { type: 'picker', id: 'category', label: 'Category' },
    { type: 'header', id: 'dietaryHeader', title: 'Dietary Options' },
    { type: 'checkbox', id: 'vegetarian', label: 'Vegetarian' },
    { type: 'checkbox', id: 'glutenFree', label: 'Gluten-Free' },
    { type: 'checkbox', id: 'vegan', label: 'Vegan' },
    { type: 'header', id: 'imageHeader', title: 'Add Images' },
    { type: 'upload', id: 'upload' },
];


import { useNavigation } from "@react-navigation/native";

const AddItemScreen = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const menuContext = useMenu();
  const addMenuItem = menuContext?.addMenuItem;
  const navigation = useNavigation();
  const [image, setImage] = useState<string | null>(null);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveItem = async () => {
    if (itemName && price && image) {
      const newItem = {
        name: itemName,
        price: `$${price}`,
        image: image,
      };

      try {
        // Save to Firestore
        const docRef = await addDoc(collection(db, 'products'), newItem);

        const itemWithId = { id: docRef.id, ...newItem };

        if (addMenuItem) {
          addMenuItem(itemWithId);
        }

        navigation.goBack();

        // Clear form
        setItemName('');
        setPrice('');
        setImage(null);
      } catch (error) {
        console.error('Error saving item:', error);
        alert('Failed to save item');
      }
    } else {
      alert('Please fill all fields');
    }
  };

  const [dietaryOptions, setDietaryOptions] = useState({
    vegetarian: false,
    glutenFree: false,
    vegan: false,
  });

  const handleCheckboxChange = (option: keyof typeof dietaryOptions) => {
    setDietaryOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const renderFormItem = ({ item }: { item: any }) => {
      switch(item.type) {
          case 'input':
              return (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TextInput
                    placeholder={item.placeholder}
                    placeholderTextColor="#8a725c"
                    style={styles.textInput}
                    keyboardType={item.keyboardType || 'default'}
                    value={item.id === 'itemName' ? itemName : price}
                    onChangeText={(text) =>
                      item.id === 'itemName' ? setItemName(text) : setPrice(text)
                    }
                  />
                </View>
              );
          case 'textArea':
              return (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TextInput
                    placeholder={item.placeholder}
                    placeholderTextColor="#8a725c"
                    style={[styles.textInput, { height: 144, textAlignVertical: "top" }]}
                    multiline
                  />
                </View>
              );
          case 'picker':
              return (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{item.label}</Text>
                  <TouchableOpacity style={styles.picker}>
                    <Text style={styles.pickerText}>Select Category</Text>
                    <MaterialIcons name="unfold-more" size={24} color="#8a725c" />
                  </TouchableOpacity>
                </View>
              );
          case 'header':
              return <Text style={styles.sectionTitle}>{item.title}</Text>;
          case 'checkbox':
              return (
                 <CustomCheckbox
                    label={item.label}
                    isSelected={dietaryOptions[item.id as keyof typeof dietaryOptions]}
                    onValueChange={() => handleCheckboxChange(item.id as keyof typeof dietaryOptions)}
                  />
              );
          case 'upload':
              return (
                <TouchableOpacity style={styles.uploadContainer} onPress={pickImage}>
                  <Text style={styles.uploadTitle}>Upload Images</Text>
                  <Text style={styles.uploadSubtitle}>
                    High-quality images help customers choose your items. (Min. 200x200px)
                  </Text>

                  {image && (
                    <Image
                      source={{ uri: image }}
                      style={{ width: 200, height: 200, borderRadius: 10, marginVertical: 10 }}
                    />
                  )}

                  <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    <Text style={styles.uploadButtonText}>Upload</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
          default:
              return null;
      }
  }

    return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={24} color="#181410" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Item</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <FlatList
          data={formSections}
          renderItem={({ item }) => <>{renderFormItem({ item })}</>}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
        {/* Saved Items */}
        {menuItems.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Saved Items</Text>
            <TextInput
              style={[styles.textInput, { marginBottom: 12 }]}
              placeholder="Search items..."
              placeholderTextColor="#8a725c"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView>
              {menuItems
              .filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <View key={item.id || index} style={styles.itemCard}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: '#666' }}>{item.price}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.footerButton, { backgroundColor: "#f1edea" }]}>
            <Text style={styles.footerButtonText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={saveItem} style={[styles.footerButton, { backgroundColor: "#f3e7dc" }]}>
            <Text style={styles.footerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fbfaf9",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181410",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Form
  inputGroup: {
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#181410",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  textInput: {
    backgroundColor: "#f1edea",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#181410",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  picker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1edea",
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  pickerText: {
    fontSize: 16,
    color: "#8a725c",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Dietary Options
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181410",
    paddingTop: 16,
    paddingBottom: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#e2dbd4",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#f3e7dc",
    borderColor: "#f3e7dc",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#181410",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Image Upload
  uploadContainer: {
    alignItems: "center",
    gap: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e2dbd4",
    paddingHorizontal: 24,
    paddingVertical: 56,
    marginTop: 8,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181410",
    textAlign: "center",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#181410",
    textAlign: "center",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  uploadButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1edea",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#181410",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fbfaf9",
    borderTopWidth: 1,
    borderTopColor: "#f1edea",
  },
  footerButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#181410",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Added style for itemCard
  itemCard: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181410",
    marginBottom: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default AddItemScreen;