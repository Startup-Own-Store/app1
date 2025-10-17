import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import supabase from '../../SupabaseClient';

const UserOrderDetails = ({ route, navigation }: { route: any; navigation: any }) => {
  const { order } = route?.params || {};
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!order?.order_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('order_item_id, item_name, price, quantity')
          .eq('order_id', order.order_id);

        if (error) {
          console.error('Error fetching order items:', error);
          setOrderItems([]);
        } else {
          setOrderItems(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
        setOrderItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [order?.order_id]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.item_name || 'N/A'}</Text>
      <Text style={styles.itemQuantity}>Quantity: {item.quantity || 0}</Text>
      <Text style={styles.itemPrice}>Price: ${item.price ? item.price.toFixed(2) : '0.00'}</Text>
    </View>
  );

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'accepted':
        return '#17a2b8';
      case 'completed':
        return '#28a745';
      case 'cancelled':
      case 'rejected':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.centeredContent}>
            <MaterialIcons name="error-outline" size={48} color="#ffc107" />
            <Text style={styles.errorText}>Order not found</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonError}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#181410" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderId}>Order ID: {order.order_id || 'N/A'}</Text>
          <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
            Status: {order.status || 'unknown'}
          </Text>
          <Text style={styles.orderTotal}>Total: ${order.total_price ? order.total_price.toFixed(2) : '0.00'}</Text>
          <Text style={styles.orderAddress}>Address: {order.delivery_address || 'N/A'}</Text>
          {order.payment_method && (
            <Text style={styles.orderPayment}>Payment: {order.payment_method.toUpperCase()}</Text>
          )}
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ec8627" />
            <Text style={styles.loadingText}>Loading order items...</Text>
          </View>
        ) : orderItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="shopping-cart-outlined" size={48} color="#999" />
            <Text style={styles.emptyText}>No items in this order</Text>
          </View>
        ) : (
          <FlatList
            data={orderItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.order_item_id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1edea',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181410',
  },
  orderInfoContainer: {
    padding: 16,
    backgroundColor: '#f1edea',
    borderRadius: 8,
    margin: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181410',
    marginBottom: 8,
  },
  orderStatus: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: 14,
    color: '#8a725c',
    marginBottom: 4,
    fontWeight: '500',
  },
  orderAddress: {
    fontSize: 14,
    color: '#8a725c',
  },
  orderPayment: {
    fontSize: 14,
    color: '#8a725c',
    marginTop: 4,
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1edea',
    backgroundColor: '#fff',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181410',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#8a725c',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#8a725c',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#8a725c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#8a725c',
  },
  listContainer: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#8a725c',
    textAlign: 'center',
  },
  backButtonError: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ec8627',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserOrderDetails;