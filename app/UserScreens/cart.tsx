import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import supabase from '../../SupabaseClient';
import { RootStackParamList } from '../../App';

// Define types for cart items
interface CartItem {
  cart_id: string;
  item_id: string;
  quantity: number;
  price: number;
  total_price: number;
  items: {
    item_name: string;
    image_url?: string;
  };
}

const CartScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);

        const session = await supabase.auth.getSession();
        const userId = session.data?.session?.user?.id;

        if (!userId) {
          console.error('User not authenticated.');
          setLoading(false);
          return;
        }

        // Correct Supabase query to fetch item_name and image_url from items table
        const { data, error } = await supabase
          .from('cart')
          .select('cart_id, item_id, quantity, price, total_price, items!inner(item_name, image_url)')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching cart items:', error);
        } else {
          // Map items to ensure items is an object, not an array
          const mappedData = (data ?? []).map((item: any) => ({
            ...item,
            items: Array.isArray(item.items) ? item.items[0] : item.items,
          }));
          setCartItems(mappedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();

    const subscription = supabase
      .channel('cart')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cart' }, () => fetchCartItems())
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const updateQuantity = async (cartId: string, newQuantity: number, currentPrice: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart')
        .update({ 
          quantity: newQuantity, 
          total_price: currentPrice * newQuantity 
        })
        .eq('cart_id', cartId);

      if (error) {
        console.error('Error updating quantity:', error);
      } else {
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.cart_id === cartId 
              ? { ...item, quantity: newQuantity, total_price: currentPrice * newQuantity }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const deleteCartItem = async (cartId: string) => {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('cart_id', cartId);

      if (error) {
        console.error('Error deleting cart item:', error);
      } else {
        setCartItems(prevItems => prevItems.filter(item => item.cart_id !== cartId));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const confirmDelete = (cartId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCartItem(cartId) },
      ]
    );
  };

  const goToHome = () => {
    navigation.navigate({ name: 'UserHomeScreen' } as any);
  };

  const proceedToPayment = () => {
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemCard}>
      <Image
        source={{ uri: item.items.image_url || 'https://via.placeholder.com/80x80?text=Food' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetailsContainer}>
        <Text style={styles.itemName} numberOfLines={2}>{item.items.item_name}</Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.cart_id, item.quantity - 1, item.price)}
          >
            <MaterialIcons name="remove" size={16} color="#181113" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.cart_id, item.quantity + 1, item.price)}
          >
            <MaterialIcons name="add" size={16} color="#181113" />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalPrice}>₹{item.total_price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.cart_id)}
      >
        <MaterialIcons name="delete" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goToHome} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#181113" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyFullContainer}>
          <MaterialIcons name="shopping-cart" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some delicious items to get started!</Text>
          <TouchableOpacity style={styles.addItemsButton} onPress={goToHome}>
            <Text style={styles.addItemsButtonText}>Add Items</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const total = calculateTotalPrice();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToHome} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#181113" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.itemCount}>{cartItems.length} items</Text>
      </View>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.cart_id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.bottomBar}>
        <View style={styles.totalSummary}>
          <Text style={styles.totalLabel}>Total ({cartItems.length} items)</Text>
          <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.proceedButton, total > 0 && styles.proceedButtonActive]} 
          onPress={proceedToPayment}
          disabled={total === 0}
        >
          <Text style={styles.proceedButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemCount: {
    fontSize: 16,
    color: '#666',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  placeholder: {
    width: 24,
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
  emptyFullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181113',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  addItemsButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F97316',
    borderRadius: 12,
  },
  addItemsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  cartItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  itemDetailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181113',
    marginBottom: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemPrice: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181113',
    minWidth: 20,
    textAlign: 'center',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: Platform.OS === 'android' ? 8 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0,
    shadowRadius: 4,
  },
  totalSummary: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  proceedButton: {
    paddingVertical: 16,
    backgroundColor: '#ec8627',
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  proceedButtonActive: {
    backgroundColor: '#F97316',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default CartScreen;