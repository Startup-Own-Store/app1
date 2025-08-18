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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


import { useNavigation, useRoute } from '@react-navigation/native';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get cartItems from route params if passed
  const cartItems = (route.params as any)?.cartItems || [];
  const [selectedPayment, setSelectedPayment] = React.useState('card');
  const [itemQuantities, setItemQuantities] = React.useState<Record<string, number>>({});

  const items = cartItems.length ? cartItems.map((item: any) => ({
    id: item.id,
    name: item.name,
    price: parseFloat(item.price.replace('$', '')),
    quantity: itemQuantities[item.id] || 1
  })) : [];

  const updateQuantity = (itemId: string, change: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change)
    }));
  };

  const subtotal = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

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
                <Text style={styles.addressText}>123 Main Street</Text>
                <Text style={styles.addressSubtext}>Apartment 4B, New York, NY 10001</Text>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="edit" size={20} color="#8a7260" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {items.map((item: any) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.id, -1)}>
                      <MaterialIcons name="remove" size={16} color="#181411" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.id, 1)}>
                      <MaterialIcons name="add" size={16} color="#181411" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => {/* Optionally handle remove */}}>
                    <MaterialIcons name="delete" size={20} color="#e82630" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedPayment]}
              onPress={() => setSelectedPayment('card')}
            >
              <MaterialIcons name="credit-card" size={20} color="#181411" />
              <Text style={styles.paymentText}>Credit Card</Text>
              <MaterialIcons 
                name={selectedPayment === 'card' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                size={20} 
                color="#ec8627" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedPayment]}
              onPress={() => setSelectedPayment('cash')}
            >
              <MaterialIcons name="money" size={20} color="#181411" />
              <Text style={styles.paymentText}>Cash on Delivery</Text>
              <MaterialIcons 
                name={selectedPayment === 'cash' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                size={20} 
                color="#ec8627" 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === 'upi' && styles.selectedPayment]}
              onPress={() => setSelectedPayment('upi')}
            >
              <MaterialIcons name="payment" size={20} color="#181411" />
              <Text style={styles.paymentText}>UPI Payment</Text>
              <MaterialIcons 
                name={selectedPayment === 'upi' ? 'radio-button-checked' : 'radio-button-unchecked'} 
                size={20} 
                color="#ec8627" 
              />
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Subtotal</Text>
              <Text style={styles.billValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Tax</Text>
              <Text style={styles.billValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.billRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f5f2f0' }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.footerButtonText, { color: '#181411' }]}>Add More Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#ec8627' }]} onPress={() => {/* Optionally handle place order */}}>
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
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181411',
  },
  addressSubtext: {
    fontSize: 14,
    color: '#8a7260',
    marginTop: 2,
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
  itemPrice: {
    fontSize: 14,
    color: '#8a7260',
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff0f0',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f2f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181411',
    marginHorizontal: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedPayment: {
    backgroundColor: '#fff5e6',
    borderWidth: 2,
    borderColor: '#ec8627',
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#181411',
    marginLeft: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  billLabel: {
    fontSize: 16,
    color: '#8a7260',
  },
  billValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181411',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181411',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ec8627',
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
});

export default CheckoutScreen;