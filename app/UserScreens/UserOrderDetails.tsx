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
} from 'react-native';
const MaterialIcons: any = (require('react-native-vector-icons/MaterialIcons').default ?? require('react-native-vector-icons/MaterialIcons'));
import supabase from '../../SupabaseClient';

const UserOrderDetails = ({ route, navigation }: { route: any; navigation: any }) => {
  const { order } = route.params;
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderItems = async () => {
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
  }, [order.order_id]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.item_name}</Text>
      <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
      <Text style={styles.itemPrice}>Price: ${item.price?.toFixed(2)}</Text>
    </View>
  );

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
          <Text style={styles.orderId}>Order ID: {order.order_id}</Text>
          <Text style={[styles.orderStatus, {
            color:
              order.status === 'pending' ? '#ffc107' :
              order.status === 'accepted' ? '#17a2b8' :
              order.status === 'completed' ? '#28a745' : '#dc3545'
          }]}>
            Status: {order.status}
          </Text>
          <Text style={styles.orderTotal}>Total: ${order.total_price.toFixed(2)}</Text>
          <Text style={styles.orderAddress}>Address: {order.delivery_address}</Text>
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text>Loading order items...</Text>
          </View>
        ) : (
          <FlatList
            data={orderItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.order_item_id}
            contentContainerStyle={{ paddingBottom: 20 }}
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
    color: '#8a725c',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 14,
    color: '#8a725c',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    color: '#8a725c',
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1edea',
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
});

export default UserOrderDetails;
