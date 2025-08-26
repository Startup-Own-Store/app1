import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from '../../SupabaseClient';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = React.useState('card');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');

  React.useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const session = await supabase.auth.getSession();
        const userId = session.data?.session?.user?.id;

        if (!userId) {
          console.error('User not authenticated.');
          return;
        }

        const { data, error } = await supabase
          .from('cart')
          .select('item_id, quantity, total_price, vendor_id, items(item_name)') // Added `vendor_id`
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching cart items:', error);
        } else {
          setCartItems(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchCartItems();
  }, []);

  const items = cartItems.map((item: any) => ({
    name: item.items.item_name,
    quantity: item.quantity,
    totalPrice: item.total_price,
  }));

  const total = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);

  // Update `placeOrder` to create a single order for all cart items
  const placeOrder = async () => {
    try {
      const session = await supabase.auth.getSession();
      const userId = session.data?.session?.user?.id;

      if (!userId) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      if (!deliveryAddress) {
        Alert.alert('Error', 'Please provide a delivery address.');
        return;
      }

      if (!cartItems[0]?.vendor_id) {
        console.error('Cart items:', cartItems); // Log cart items for debugging
        Alert.alert('Error', 'Vendor information is missing. Please try again.');
        return;
      }

      // Insert a single order into the database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          vendor_id: cartItems[0]?.vendor_id, // Assuming all items have the same vendor_id
          total_price: total,
          delivery_address: deliveryAddress,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        Alert.alert('Error', 'Failed to place order.');
        return;
      }

      // Insert all cart items as order items with the same `order_id`
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.order_id,
        item_name: item.items.item_name,
        quantity: item.quantity,
        price: item.total_price,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (orderItemsError) {
        console.error('Error creating order items:', orderItemsError);
        Alert.alert('Error', 'Failed to place order items.');
        return;
      }

      // Optionally, clear the cart after placing the order
      const { error: clearCartError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (clearCartError) {
        console.error('Error clearing cart:', clearCartError);
        Alert.alert('Error', 'Failed to clear cart.');
        return;
      }

      Alert.alert('Success', 'Order placed successfully!');
      navigation.navigate('MainUser' as never);
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#181411" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <MaterialIcons name="location-on" size={20} color="#ec8627" />
              <View style={styles.addressDetails}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                />
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Bill Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Total</Text>
              <Text style={styles.billValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f5f2f0' }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.footerButtonText, { color: '#181411' }]}>Add More Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#ec8627' }]} onPress={placeOrder}>
            <Text style={[styles.footerButtonText, { color: '#ffffff' }]}>Place Order • ${total.toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181411',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181411',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f2f0',
    padding: 16,
    borderRadius: 12,
  },
  addressDetails: {
    flex: 1,
    marginLeft: 12,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: '#181411',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181411',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#8a7260',
    marginTop: 2,
  },
  bottomContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  billLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181411',
  },
  billValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181411',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});

export default CheckoutScreen;