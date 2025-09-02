import * as React from 'react';
import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';
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
  // Helper function to place order in DB
  const handleOrderPlacement = async (userId: string) => {
    // Insert a single order into the database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        vendor_id: cartItems[0]?.vendor_id,
        total_price: total,
        delivery_address: deliveryAddress,
        payment_method: selectedPayment,
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
  };
  const navigation = useNavigation();
  const route = useRoute();

  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = React.useState('cash');
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
  // Removed mock UPI payment simulation. All UPI payments will go through Razorpay test API.
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

      // If UPI selected, trigger Razorpay
      if (selectedPayment === 'upi') {
        try {
          // Log the total value being sent to backend
          console.log('Sending total to backend for Razorpay:', total);
          // Call backend to create Razorpay order
          const response = await axios.post('http://10.212.201.26:3000/app/api/create-order', {
            amount: total,
          });
          // Use the order_id from backend response
          const order_id = response.data.id;
          const razorpayOptions = {
            description: 'Order Payment',
            currency: 'INR',
            key: 'rzp_test_aSxggwJlgc2fij',
            amount: response.data.amount, // Use backend amount for consistency
            name: 'OwnStore',
            order_id: order_id,
            prefill: {
              email: 'user@example.com',
              contact: '9999999999',
              name: 'User',
              upi: 'success@razorpay', // Use Razorpay test UPI ID
            },
            theme: { color: '#ec8627' },
            method: { upi: true },
          };
          // In development, bypass payment and always store order
          if (__DEV__) {
            await handleOrderPlacement(userId);
            Alert.alert('Payment Success (Test Mode)', 'Simulated UPI payment success in test mode. Order placed!');
            return;
          }
          RazorpayCheckout.open(razorpayOptions)
            .then(async (data: any) => {
              // Log payment result
              console.log('Razorpay payment success:', data);
              // Only store order if payment is successful
              if (data && data.razorpay_payment_id) {
                await handleOrderPlacement(userId);
                Alert.alert('Payment Success', 'Your UPI payment was successful and order placed!');
              } else {
                Alert.alert('Payment Error', 'Payment response did not contain a payment ID.');
              }
            })
            .catch((error: any) => {
              console.log('Razorpay payment failed:', error);
              Alert.alert(
                'Payment Failed',
                `Reason: ${error.description || 'UPI payment was cancelled or failed.'}`
              );
            });
        } catch (err) {
          // Show backend error details if available
          const errorObj = err as any;
          const errorMsg = errorObj.response?.data?.error || errorObj.message || 'Failed to create Razorpay order.';
          const errorDetails = errorObj.response?.data ? JSON.stringify(errorObj.response.data) : '';
          Alert.alert('Payment Error', errorMsg + (errorDetails ? '\nDetails: ' + errorDetails : ''));
        }
        return;
      }

      // For Cash on Delivery, place order directly
      await handleOrderPlacement(userId);
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

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentBox}>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => setSelectedPayment('cash')}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {selectedPayment === 'cash' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentText}>Cash on Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => setSelectedPayment('upi')}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {selectedPayment === 'upi' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentText}>UPI Payment</Text>
              </TouchableOpacity>
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
  paymentBox: {
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'column',
    marginBottom: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ec8627',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ec8627',
  },
  paymentText: {
    fontSize: 16,
    color: '#181411',
    fontWeight: '500',
  },
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