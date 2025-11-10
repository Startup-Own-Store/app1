import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';

const MaterialIcons: any = (require('react-native-vector-icons/MaterialIcons').default ?? require('react-native-vector-icons/MaterialIcons'));
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from '../../SupabaseClient'; // adjust path

const ProductDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { itemId } = route.params as { itemId: string };

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  // new states for editing
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const toggleSwitch = () => setIsAvailable(prev => !prev);

  // ---- Fetch product details ----
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching product:", error.message);
      } else {
        setProduct(data);
        setIsAvailable(data.available);

        // set local editable states
        setName(data.item_name || "");
        setDescription(data.description || "");
        setPrice(data.price ? String(data.price) : "");
        setCategory(data.category || "");
      }
      setLoading(false);
    };

    fetchProduct();
  }, [itemId]);

  // ---- Save Changes ----
  const handleSave = async () => {
    const { error } = await supabase
      .from("items")
      .update({
        item_name: name,
        description,
        price: parseFloat(price) || 0,
        category,
        available: isAvailable,
      })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating product:", error.message);
      alert("Failed to update product");
    } else {
      alert("Product updated successfully!");
      navigation.goBack();
    }
  };

  // ---- Delete Product ----
  const handleDelete = async () => {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error deleting product:", error.message);
      alert("Failed to delete product");
    } else {
      alert("Product deleted successfully!");
      navigation.goBack();
    }
  };

  // ---- Build listData dynamically ----
  const listData = product
    ? [
        ...(product.image_url
          ? [{ type: "image", id: "productImage", uri: product.image_url }]
          : []),
        { type: "input", id: "productName", label: "Product Name", value: name, setter: setName },
        { type: "textArea", id: "description", label: "Description", value: description, setter: setDescription },
        { type: "input", id: "price", label: "Price", value: price, setter: setPrice, keyboardType: "decimal-pad" },
        { type: "input", id: "category", label: "Category", value: category, setter: setCategory },
        { type: "toggle", id: "availability", label: "Available" },
      ]
    : [];

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case "image":
        return (
          <View style={styles.imageContainer}>
            {item.uri ? (
              <Image source={{ uri: item.uri }} style={styles.productImage} />
            ) : (
              <View style={[styles.productImage, { justifyContent: "center", alignItems: "center", backgroundColor: "#f1edea" }]}>
                <Text style={{ color: "#8a725c" }}>No Image</Text>
              </View>
            )}
          </View>
        );
      case "input":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
              placeholderTextColor="#8a725c"
              style={styles.textInput}
              value={item.value}
              onChangeText={item.setter}
              keyboardType={item.keyboardType || "default"}
            />
          </View>
        );
      case "textArea":
        return (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput
              placeholderTextColor="#8a725c"
              style={[styles.textInput, { height: 144, textAlignVertical: "top" }]}
              multiline
              value={item.value}
              onChangeText={item.setter}
            />
          </View>
        );
      case "toggle":
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#8a725c" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>Product not found</Text>
      </SafeAreaView>
    );
  }

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
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContainer}
        />

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: "#f1edea" }]} onPress={handleDelete}>
            <Text style={styles.footerButtonText}>Delete Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: "#f3e7dc" }]} onPress={handleSave}>
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