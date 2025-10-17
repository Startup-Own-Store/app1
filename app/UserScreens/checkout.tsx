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
  const navigation = useNavigation();
  const route = useRoute();

  const [cartItems, setCartItems] = React.useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = React.useState('cod');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [cardHolderName, setCardHolderName] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await supabase.auth.getSession();
        const userId = session.data?.session?.user?.id;

        if (!userId) {
          console.error('User not authenticated.');
          return;
        }

        // Fetch cart items
        const { data: cartData, error: cartError } = await supabase
          .from('cart')
          .select('item_id, quantity, total_price, vendor_id, items(item_name)')
          .eq('user_id', userId);

        if (cartError) {
          console.error('Error fetching cart items:', cartError);
        } else {
          setCartItems(cartData || []);
        }

        // Fetch user address from user_profiles (assuming table name and field)
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('address')
          .eq('user_id', userId)
          .single();

        if (profileError) {
          console.error('Error fetching user address:', profileError);
        } else if (profileData && profileData.address) {
          setDeliveryAddress(profileData.address);
        } else {
          Alert.alert('Address Not Found', 'Please update your address in profile.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchData();
  }, []);

  const items = cartItems.map((item: any) => ({
    name: item.items.item_name,
    quantity: item.quantity,
    totalPrice: item.total_price,
  }));

  const itemTotal = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);
  const deliveryFee = 40;
  const tax = itemTotal * 0.05;
  const platformFee = 5;
  const grandTotal = itemTotal + deliveryFee + tax + platformFee;

  // Helper function to place order in DB
  const handleOrderPlacement = async (userId: string) => {
    // Insert a single order into the database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        vendor_id: cartItems[0]?.vendor_id,
        total_price: grandTotal,
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

  // Handle Razorpay payment
  const handleRazorpayPayment = async (paymentMethod: 'card' | 'upi') => {
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
        console.error('Cart items:', cartItems);
        Alert.alert('Error', 'Vendor information is missing. Please try again.');
        return;
      }

      if (paymentMethod === 'card') {
        // Basic validation for card details
        if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
          Alert.alert('Error', 'Please fill in all card details.');
          return;
        }
        // Additional validations can be added here (e.g., card number length, expiry format)
      }

      // Log the total value being sent to backend
      console.log('Sending total to backend for Razorpay:', grandTotal);
      // Call backend to create Razorpay order
      const response = await axios.post('http://10.212.201.26:3000/app/api/create-order', {
        amount: grandTotal,
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
          name: cardHolderName || 'User',
        },
        theme: { color: '#ec8627' },
        ...(paymentMethod === 'card' && { method: { card: true } }),
        ...(paymentMethod === 'upi' && { method: { upi: true } }),
      };

      // In development, bypass payment and always store order
      if (__DEV__) {
        await handleOrderPlacement(userId);
        Alert.alert('Payment Success (Test Mode)', `Simulated ${paymentMethod.toUpperCase()} payment success in test mode. Order placed!`);
        return;
      }

      RazorpayCheckout.open(razorpayOptions)
        .then(async (data: any) => {
          // Log payment result
          console.log('Razorpay payment success:', data);
          // Only store order if payment is successful
          if (data && data.razorpay_payment_id) {
            await handleOrderPlacement(userId);
            Alert.alert('Payment Success', `Your ${paymentMethod.toUpperCase()} payment was successful and order placed!`);
          } else {
            Alert.alert('Payment Error', 'Payment response did not contain a payment ID.');
          }
        })
        .catch((error: any) => {
          console.log('Razorpay payment failed:', error);
          Alert.alert(
            'Payment Failed',
            `Reason: ${error.description || `${paymentMethod.toUpperCase()} payment was cancelled or failed.`}`
          );
        });
    } catch (err) {
      // Show backend error details if available
      const errorObj = err as any;
      const errorMsg = errorObj.response?.data?.error || errorObj.message || 'Failed to create Razorpay order.';
      const errorDetails = errorObj.response?.data ? JSON.stringify(errorObj.response.data) : '';
      Alert.alert('Payment Error', errorMsg + (errorDetails ? '\nDetails: ' + errorDetails : ''));
    }
  };

  // Place order based on selected payment
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
        console.error('Cart items:', cartItems);
        Alert.alert('Error', 'Vendor information is missing. Please try again.');
        return;
      }

      // Handle different payment methods
      if (selectedPayment === 'cod') {
        await handleOrderPlacement(userId);
      } else if (selectedPayment === 'card') {
        await handleRazorpayPayment('card');
      } else if (selectedPayment === 'upi') {
        await handleRazorpayPayment('upi');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const buttonText = {
    cod: `Place Order • ₹${grandTotal.toFixed(2)}`,
    card: `Pay by Card • ₹${grandTotal.toFixed(2)}`,
    upi: `Pay by UPI • ₹${grandTotal.toFixed(2)}`,
  }[selectedPayment];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#181411" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity style={styles.addressCard}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="location-on" size={24} color="#ec8627" />
              </View>
              <View style={styles.addressDetails}>
                <Text style={styles.addressText}>{deliveryAddress || 'Loading address...'}</Text>
                <Text style={styles.changeAddress}>Change</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentCard}>
              <TouchableOpacity
                style={[styles.paymentOption, selectedPayment === 'cod' && styles.selectedPaymentOption]}
                onPress={() => setSelectedPayment('cod')}
                activeOpacity={0.7}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radioOuter, selectedPayment === 'cod' && styles.radioOuterSelected]}>
                    {selectedPayment === 'cod' && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.paymentInfo}>
                  <MaterialIcons name="money" size={20} color="#ec8627" />
                  <View>
                    <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                    <Text style={styles.paymentSubtitle}>Pay when you receive your order</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedPaymentOption]}
                onPress={() => setSelectedPayment('card')}
                activeOpacity={0.7}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radioOuter, selectedPayment === 'card' && styles.radioOuterSelected]}>
                    {selectedPayment === 'card' && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.paymentInfo}>
                  <MaterialIcons name="credit-card" size={20} color="#ec8627" />
                  <View>
                    <Text style={styles.paymentTitle}>Debit/Credit Card</Text>
                    <Text style={styles.paymentSubtitle}>Secure payment with cards</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentOption, selectedPayment === 'upi' && styles.selectedPaymentOption]}
                onPress={() => setSelectedPayment('upi')}
                activeOpacity={0.7}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radioOuter, selectedPayment === 'upi' && styles.radioOuterSelected]}>
                    {selectedPayment === 'upi' && <View style={styles.radioInner} />}
                  </View>
                </View>
                <View style={styles.paymentInfo}>
                  <MaterialIcons name="payment" size={20} color="#ec8627" />
                  <View>
                    <Text style={styles.paymentTitle}>UPI</Text>
                    <Text style={styles.paymentSubtitle}>GPay, PhonePe, Paytm & more</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Details Section - shown when Card selected */}
          {selectedPayment === 'card' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Card Details</Text>
              <View style={styles.cardInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Card Number (e.g., 4111 1111 1111 1111)"
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={19}
                  placeholderTextColor="#999"
                />
                <View style={styles.rowInput}>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY (e.g., 12/25)"
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      keyboardType="numeric"
                      maxLength={5}
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="CVV"
                      value={cvv}
                      onChangeText={setCvv}
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Name on Card"
                  value={cardHolderName}
                  onChangeText={setCardHolderName}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          {/* Bill Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.billCard}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{itemTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Taxes (5%)</Text>
                <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Platform Fee</Text>
                <Text style={styles.billValue}>₹{platformFee.toFixed(2)}</Text>
              </View>
              <View style={styles.billDivider} />
              <View style={styles.billRowTotal}>
                <Text style={styles.billLabelTotal}>Grand Total</Text>
                <Text style={styles.billValueTotal}>₹{grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Add More Items</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={placeOrder}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>{buttonText}</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181411',
    marginBottom: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  addressDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#181411',
    lineHeight: 22,
    marginBottom: 4,
  },
  changeAddress: {
    color: '#ec8627',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  selectedPaymentOption: {
    backgroundColor: '#fff',
    borderBottomColor: '#ec8627',
  },
  radioContainer: {
    marginRight: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#ec8627',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ec8627',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    color: '#181411',
    fontWeight: '600',
    marginLeft: 12,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 12,
    marginTop: 2,
  },
  cardInputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#181411',
    marginBottom: 12,
  },
  rowInput: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  billCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 15,
    color: '#181411',
    fontWeight: '500',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  billRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  billLabelTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181411',
  },
  billValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ec8627',
  },
  bottomContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#ec8627',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default CheckoutScreen;