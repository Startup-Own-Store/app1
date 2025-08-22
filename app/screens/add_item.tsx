import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, FlatList, Image, ListRenderItem, StatusBar, Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
//import { StatusBar } from "react-native";

import supabase  from "../../SupabaseClient";  // 👈 Supabase client

// ---- Types ----
type DietaryOptions = {
  vegetarian: boolean;
  glutenFree: boolean;
  vegan: boolean;
};

type FormSection =
  | { type: "input"; id: "itemName" | "price"; label: string; placeholder: string; keyboardType?: string }
  | { type: "textArea"; id: "description"; label: string; placeholder: string }
  | { type: "picker"; id: "category"; label: string }
  | { type: "header"; id: string; title: string }
  | { type: "checkbox"; id: "vegetarian" | "glutenFree" | "vegan"; label: string }
  | { type: "upload"; id: "upload" };

// ---- Custom Checkbox ----
const CustomCheckbox: React.FC<{
  label: string;
  isSelected: boolean;
  onValueChange: () => void;
}> = ({ label, isSelected, onValueChange }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onValueChange}>
    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
      {isSelected && <MaterialIcons name="check" size={14} color="#181410" />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// ---- Form Sections ----
const formSections: FormSection[] = [
  { type: "input", id: "itemName", label: "Item Name", placeholder: "e.g. Chicken Sandwich" },
  { type: "textArea", id: "description", label: "Description", placeholder: "e.g. Grilled chicken with mayo" },
  { type: "input", id: "price", label: "Price", placeholder: "$", keyboardType: "decimal-pad" },
  { type: "picker", id: "category", label: "Category" },
  { type: "header", id: "dietaryHeader", title: "Dietary Options" },
  { type: "checkbox", id: "vegetarian", label: "Vegetarian" },
  { type: "checkbox", id: "glutenFree", label: "Gluten-Free" },
  { type: "checkbox", id: "vegan", label: "Vegan" },
  { type: "header", id: "imageHeader", title: "Add Images" },
  { type: "upload", id: "upload" },
];

// ---- Main Screen ----
const AddItemScreen: React.FC = () => {
  const [itemName, setItemName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [dietaryOptions, setDietaryOptions] = useState<DietaryOptions>({
    vegetarian: false,
    glutenFree: false,
    vegan: false,
  });

  const navigation = useNavigation();

  // ---- Pick Image ----
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    };

  // ---- Save Item ----
const saveItem = async () => {
  if (!itemName || !price) {
    alert("Please fill all required fields");
    return;
  }

  try {
    // ---- Get current vendor/user (optional, since policy allows anon too) ----
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const userId = user?.id || "guest"; // fallback if anon uploads allowed

    let imageUrl: string | null = null;

    if (image) {
      const uri = image; // from ImagePicker
      const fileExt = uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `items/${userId}/${fileName}`;

      // ---- Read file as base64 ----
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // ---- Convert base64 -> Uint8Array ----
      const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // ---- Upload to Supabase ----
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(filePath, binary, { upsert: true });

      if (uploadError) throw uploadError;

      // ---- Get Public URL (requires SELECT policy) ----
      const { data } = supabase.storage
        .from("item-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    // ---- Save item in DB ----
    const { error } = await supabase.from("items").insert([
      {
        vendor_id: userId,
        item_name: itemName,
        description,
        price: parseFloat(price),
        category,
        vegetarian: dietaryOptions.vegetarian,
        gluten_free: dietaryOptions.glutenFree,
        vegan: dietaryOptions.vegan,
        image_url: imageUrl, // Supabase public URL
      },
    ]);

    if (error) throw error;

    alert("Item saved successfully!");
    navigation.goBack();
  } catch (err: any) {
    console.error("Error saving item:", err.message);
    alert("Failed to save item");
  }
};

  // ---- Toggle checkbox ----
  const handleCheckboxChange = (option: keyof DietaryOptions) => {
    setDietaryOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  // ---- Render form ----
  const renderFormItem: ListRenderItem<FormSection> = ({ item }) => {
    switch (item.type) {
      case "input":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
              placeholder={item.placeholder}
              style={styles.textInput}
              keyboardType={item.keyboardType as any}
              value={item.id === "itemName" ? itemName : price}
              onChangeText={(text) =>
                item.id === "itemName" ? setItemName(text) : setPrice(text)
              }
            />
          </View>
        );
      case "textArea":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
              placeholder={item.placeholder}
              style={[styles.textInput, { height: 100, textAlignVertical: "top" }]}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        );
      case "checkbox":
        return (
          <CustomCheckbox
            label={item.label}
            isSelected={dietaryOptions[item.id]}
            onValueChange={() => handleCheckboxChange(item.id)}
          />
        );
      case "upload":
        return (
          <TouchableOpacity style={styles.uploadContainer} onPress={pickImage}>
            <Text style={styles.uploadTitle}>Upload Image</Text>
           {image && image.startsWith("file") && (
  <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
)}
          </TouchableOpacity>
        );
      case "header":
        return <Text style={styles.sectionTitle}>{item.title}</Text>;
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
            <MaterialIcons name="close" size={24} color="#181410" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Item</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <FlatList
          data={formSections}
          renderItem={renderFormItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
        />

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.footerButton, { backgroundColor: "#f1edea" }]}
          >
            <Text style={styles.footerButtonText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={saveItem}
            style={[styles.footerButton, { backgroundColor: "#f3e7dc" }]}
          >
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