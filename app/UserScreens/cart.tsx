import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from '../../SupabaseClient';
import { RootStackParamList } from '../../App';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define types for cart items
interface CartItem {
  cart_id: string;
  item_id: string;
  quantity: number;
  price: number;
  total_price: number;
  items: {
    item_name: string;
  };
}

const CartScreen = () => {
  const navigation = useNavigation<any>();
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

        // Correct Supabase query to fetch item_name from items table
        const { data, error } = await supabase
          .from('cart')
          .select('cart_id, item_id, quantity, price, total_price, items!inner(item_name)') // Ensure items is returned as an object
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

  const proceedToPayment = () => {
    navigation.navigate('Checkout')
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemContainer}>
      <Text style={styles.itemName}>{item.items.item_name}</Text>
      <Text style={styles.itemDetails}>Quantity: {item.quantity}</Text>
      <Text style={styles.itemDetails}>Total Price: ${item.total_price.toFixed(2)}</Text>
      <View style={styles.buttonContainer}>
        <Text
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.cart_id)}
        >
          Delete
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.cart_id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        }
      />
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceText}>Total Price: ${calculateTotalPrice().toFixed(2)}</Text>
        <TouchableOpacity style={styles.proceedButton} onPress={proceedToPayment}>
          <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  cartItemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181113',
  },
  itemDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  totalPriceContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181113',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ff4d4d',
    color: '#ffffff',
    borderRadius: 4,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    overflow: 'hidden',
  },
  proceedButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#ec8627',
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default CartScreen;
