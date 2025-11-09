import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
const MaterialIcons: any = (require('react-native-vector-icons/MaterialIcons').default ?? require('react-native-vector-icons/MaterialIcons'));
import supabase from '../../SupabaseClient'; // Import your Supabase client
import { SafeAreaView } from 'react-native-safe-area-context';

// Define types
interface MenuItem {
  id: string;
  vendor_id: string;
  item_name: string;
  description: string | null;
  price: number;
  category: string | null;
  vegetarian: boolean | null;
  gluten_free: boolean | null;
  vegan: boolean | null;
  image_url: string | null;
  available: boolean | null;
}

interface VendorProfile {
  user_id: string;
  name: string;
  image?: string;
  rating?: number;
  time?: string;
  email?: string;
  full_name?: string;
  phone?: string;
}

interface RestaurantMenuScreenProps {
  navigation: any;
  route: any;
  onNavigateToCheckout?: () => void;
  onNavigateToFoodDetails?: (food: any) => void;
}

const menuTabs = ['Popular', 'Appetizers', 'Main Courses', 'Desserts', 'Drinks'];

const RestaurantMenuScreen = ({ navigation, route, onNavigateToCheckout }: RestaurantMenuScreenProps) => {
  const [activeTab, setActiveTab] = useState('Popular');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);

  const { shopId, shopName } = route.params || {};

  // Fetch vendor details and menu items
  useEffect(() => {
    fetchVendorData();
  }, [shopId]);

  // Filter items based on active tab
  useEffect(() => {
    if (activeTab === 'Popular') {
      // Show all available items for Popular tab
      setFilteredItems(menuItems.filter(item => item.available));
    } else {
      // Filter by category for other tabs
      const categoryMap: { [key: string]: string } = {
        'Appetizers': 'appetizer',
        'Main Courses': 'main',
        'Desserts': 'dessert',
        'Drinks': 'drink'
      };
      
      const category = categoryMap[activeTab];
      setFilteredItems(menuItems.filter(item => 
        item.category?.toLowerCase() === category?.toLowerCase() && item.available
      ));
    }
  }, [activeTab, menuItems]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor profile
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', shopId)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
      } else {
        setVendor(vendorData);
      }

      // Fetch menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('vendor_id', shopId)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Error fetching menu items:', itemsError);
      } else {
        setMenuItems(itemsData || []);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

const handleFoodItemPress = (food: MenuItem) => {
    navigation.navigate('ProductDetail', { 
      food: {
        id: food.id,
        name: food.item_name,
        description: food.description,
        price: food.price,
        image: food.image_url || 'https://via.placeholder.com/300x200?text=Food'
      }
    });
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.menuItemContainer} 
      onPress={() => handleFoodItemPress(item)}
      disabled={!item.available}
    >
      <View style={styles.menuItemTextContainer}>
        <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        {item.vegetarian && <Text style={styles.dietTag}>Vegetarian</Text>}
        {item.vegan && <Text style={styles.dietTag}>Vegan</Text>}
        {item.gluten_free && <Text style={styles.dietTag}>Gluten-Free</Text>}
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        {!item.available && (
          <Text style={styles.unavailableText}>Currently unavailable</Text>
        )}
      </View>
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/100x100?text=Food' }} 
        style={[styles.itemImage, !item.available && styles.unavailableImage]} 
      />
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      <ImageBackground 
        source={{ uri: vendor?.image || 'https://via.placeholder.com/400x200?text=Restaurant' }}
        style={styles.shopHeaderImage}
      >
        <View style={styles.headerGradientOverlay} />
      </ImageBackground>
      <View style={styles.shopInfoContainer}>
        <Text style={styles.shopName}>{vendor?.name || shopName || 'Restaurant'}</Text>
        <View style={styles.shopInfoRow}>
          <MaterialIcons name="star" size={16} color="#ffb400" />
          <Text style={styles.shopInfoText}>{vendor?.rating || '4.8'} (200+ ratings)</Text>
          <Text style={styles.shopInfoText}>·</Text>
          <Text style={styles.shopInfoText}>Italian</Text>
          <Text style={styles.shopInfoText}>·</Text>
          <Text style={styles.shopInfoText}>$$</Text>
        </View>
        <Text style={styles.shopDeliveryInfo}>{vendor?.time || '20-30 min'} · $3.99 delivery</Text>
      </View>
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          data={menuTabs}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setActiveTab(item)}>
              <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    </>
  );

  const onBack = () => {
    navigation.goBack();
  };

  // Update shopping-cart button to navigate to Cart screen
  const onNavigateToCart = () => {
    navigation.navigate('Cart');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#181113" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{vendor?.name || shopName || 'Restaurant'}</Text>
          {/* Update TouchableOpacity for shopping-cart */}
          <TouchableOpacity onPress={onNavigateToCart}>
            <MaterialIcons name="shopping-cart" size={24} color="#181113" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="restaurant-menu" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {activeTab === 'Popular' ? 'No items available' : `No ${activeTab.toLowerCase()} available`}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Shop Header
  shopHeaderImage: {
      height: 180,
      justifyContent: 'flex-end',
  },
  headerGradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
  },
  shopInfoContainer: {
      padding: 16,
      backgroundColor: '#ffffff',
  },
  shopName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#181113',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  shopInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
  },
  shopInfoText: {
      fontSize: 14,
      color: '#555',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  shopDeliveryInfo: {
      fontSize: 14,
      color: '#555',
      marginTop: 4,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Tabs
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabText: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#88636f',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  activeTabText: {
    color: '#181113',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#181113',
  },
  // Menu List Item
  menuItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  menuItemTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemDescription: {
    fontSize: 14,
    color: '#88636f',
    marginTop: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#181113',
    marginTop: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // NEW STYLES ADDED BELOW
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  dietTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  unavailableText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  unavailableImage: {
    opacity: 0.5,
  },
});
export default RestaurantMenuScreen;