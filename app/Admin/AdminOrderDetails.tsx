// screens/AdminOrderDetailsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import supabase from '../../SupabaseClient';

interface Order {
  order_id: string;
  user_id: string;
  vendor_id: string;
  total_price: number;
  delivery_address: string;
  created_at: string;
  status: string;
  customer_name?: string;
  vendor_name?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  quantity: number;
  item_name?: string;
  price?: number;
}

const AdminOrderDetailsScreen = () => {
  const navigation = useNavigation();
 // Optional: you can pass orderId or fetch all
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  const fetchAcceptedOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch all orders with status 'accepted'
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching accepted orders:', error);
        return;
      }

      // Enhance orders with vendor and customer names
      const enhancedOrders = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: vendorName } = await supabase
            .rpc('get_vendor_name', { vendor_id: order.vendor_id });

          const { data: customerName } = await supabase
            .rpc('get_customer_name', { customer_id: order.user_id });

          // Fetch order items
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.order_id);

          return {
            ...order,
            vendor_name: vendorName || 'Vendor',
            customer_name: customerName || 'Customer',
            items: itemsData || [],
          };
        })
      );

      setOrders(enhancedOrders);
      
      // If specific orderId is provided, select it
     if (enhancedOrders.length > 0) {
        setSelectedOrder(enhancedOrders[0]); // Show first order by default
      }
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          {/* <MaterialIcons name="receipt" size={48} color="#ccc" /> */}
          <Text style={styles.errorText}>No accepted orders found</Text>
          <TouchableOpacity onPress={handleBack}>
            <Text>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Select an order to view details</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalItems = selectedOrder.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            {/* <MaterialIcons name="arrow-back" size={24} color="#1c140c" /> */}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Accepted Orders</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Order Selection */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorTitle}>Select Order:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.order_id}
                style={[
                  styles.orderSelector,
                  selectedOrder.order_id === order.order_id && styles.orderSelectorActive
                ]}
                onPress={() => handleOrderSelect(order)}
              >
                <Text style={styles.selectorText}>
                  #{order.order_id.slice(0, 8)}
                </Text>
                <Text style={styles.selectorVendor}>{order.vendor_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Order Details for selected order */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Order Details</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                <Text style={styles.statusText}>{selectedOrder.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>#{selectedOrder.order_id.slice(0, 8)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vendor:</Text>
              <Text style={styles.infoValue}>{selectedOrder.vendor_name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{selectedOrder.customer_name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Amount:</Text>
              <Text style={styles.totalPrice}>${selectedOrder.total_price.toFixed(2)}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delivery Address:</Text>
              <Text style={styles.infoValue}>{selectedOrder.delivery_address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order Date:</Text>
              <Text style={styles.infoValue}>
                {new Date(selectedOrder.created_at).toLocaleDateString()} at{' '}
                {new Date(selectedOrder.created_at).toLocaleTimeString()}
              </Text>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Items ({totalItems})</Text>
            {selectedOrder.items?.map((item,index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.item_name || 'Item'}</Text>
                  <Text style={styles.itemQuantity}>× {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${((item.price || 0) * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
   selectorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1c140c',
  },
  orderSelector: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 100,
  },
  orderSelectorActive: {
    backgroundColor: '#007bff',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  selectorVendor: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1c140c',
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  addressText: {
    fontSize: 14,
    color: '#1c140c',
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#1c140c',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c140c',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e9ecef',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  customerInfo: {
    fontSize: 14,
    color: '#1c140c',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AdminOrderDetailsScreen;