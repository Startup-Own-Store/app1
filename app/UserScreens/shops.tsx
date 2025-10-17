import React, { useState, useEffect, useMemo } from 'react';
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
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import supabase from '../../SupabaseClient'; // Import your Supabase client

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
  const [cartQuantities, setCartQuantities] = useState<{ [key: string]: number }>({});

  const { shopId, shopName } = route.params || {};

  const totalItems = useMemo(() => Object.values(cartQuantities).reduce((sum, qty) => sum + qty, 0), [cartQuantities]);

  const totalPrice = useMemo(() => 
    Object.entries(cartQuantities).reduce((sum, [id, qty]) => {
      const item = menuItems.find(i => i.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0), [cartQuantities, menuItems]
  );

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

  const addToCart = (item: MenuItem) => {
    setCartQuantities(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromCart = (item: MenuItem) => {
    setCartQuantities(prev => {
      const newQty = (prev[item.id] || 0) - 1;
      if (newQty <= 0) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [item.id]: newQty };
    });
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const quantity = cartQuantities[item.id] || 0;
    return (
      <View style={styles.menuItemCard}>
        <View style={styles.menuItemContainer}>
          <View style={styles.menuItemTextContainer}>
            <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.dietTagsContainer}>
              {item.vegetarian && <Text style={styles.dietTag}>Veg</Text>}
              {item.vegan && <Text style={styles.dietTag}>Vgn</Text>}
              {item.gluten_free && <Text style={styles.dietTag}>GF</Text>}
            </View>
            <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
            {!item.available && (
              <Text style={styles.unavailableText}>Currently unavailable</Text>
            )}
            {item.available && (
              quantity === 0 ? (
                <TouchableOpacity 
                  style={styles.addButton} 
                  onPress={() => addToCart(item)}
                >
                  <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.quantityContainer}>
                  <TouchableOpacity 
                    style={styles.quantityMinus} 
                    onPress={() => removeFromCart(item)}
                  >
                    <MaterialIcons name="remove" size={16} color="#181113" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityPlus} 
                    onPress={() => addToCart(item)}
                  >
                    <MaterialIcons name="add" size={16} color="#181113" />
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
          <Image 
            source={{ uri: item.image_url || 'https://via.placeholder.com/100x100?text=Food' }} 
            style={[styles.itemImage, !item.available && styles.unavailableImage]} 
          />
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <>
      <ImageBackground 
        source={{ uri: vendor?.image || 'https://via.placeholder.com/400x200?text=Restaurant' }}
        style={styles.shopHeaderImage}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.headerGradientOverlay} />
      </ImageBackground>
      <View style={styles.shopInfoContainer}>
        <Text style={styles.shopName}>{vendor?.name || shopName || 'Italian Delights'}</Text>
        <View style={styles.shopInfoRow}>
          <MaterialIcons name="star" size={16} color="#ffb400" />
          <Text style={styles.shopInfoText}>{vendor?.rating || '4.8'} (200+ ratings)</Text>
          <Text style={styles.shopInfoText}>·</Text>
          <Text style={styles.shopInfoText}>Italian</Text>
          <Text style={styles.shopInfoText}>·</Text>
          <Text style={styles.shopInfoText}>$$</Text>
        </View>
        <Text style={styles.shopDeliveryInfo}>{vendor?.time || '20-30 min'} · ₹3.99 delivery</Text>
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
          <Text style={styles.headerTitle}>{vendor?.name || shopName || 'Italian Delights'}</Text>
          {/* Update TouchableOpacity for shopping-cart */}
          <TouchableOpacity onPress={onNavigateToCart} style={[styles.cartButton, { position: 'relative' }]}>
            <MaterialIcons name="shopping-cart" size={24} color="#ffffff" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: totalItems > 0 ? 100 : 16 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="restaurant-menu" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {activeTab === 'Popular' ? 'No items available' : `No ${activeTab.toLowerCase()} available`}
              </Text>
            </View>
          }
        />

        {totalItems > 0 && (
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomText}>{totalItems} items</Text>
              <Text style={styles.bottomPrice}>₹{totalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={onNavigateToCart}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  cartButton: {
      backgroundColor: '#F97316', // Vibrant orange
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
  },
  // Shop Header
  shopHeaderImage: {
      height: 180,
      justifyContent: 'flex-end',
      margin: 16,
      borderRadius: 16,
      overflow: 'hidden',
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
      gap: 4,
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
  menuItemCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: Platform.OS === 'android' ? 2 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 2,
    overflow: 'hidden',
  },
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
  dietTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181113',
    marginTop: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  addButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  quantityMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityPlus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181113',
    minWidth: 20,
    textAlign: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 4,
  },
  bottomText: {
    fontSize: 14,
    color: '#666',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  checkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#22c55e',
  },
  checkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Other styles
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
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
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
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: '500',
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