import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import supabase from '../../SupabaseClient';

interface OrderItem {
  order_item_id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  price: number;
}

const OrderAcceptedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { order } = route.params as { order: any };
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch order items from the database
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.order_id)
          .order('item_name');

        if (error) {
          console.error('Error fetching order items:', error);
          return;
        }

        setOrderItems(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, [order.order_id]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRejectOrder = () => {
    console.log('Reject order:', order.order_id);
  };

  const handleReadyForPickup = () => {
    console.log('Ready for pickup:', order.order_id);
  };

  // Prepare order summary items from the database
  const orderSummaryItems = orderItems.map(item => ({
    id: item.order_item_id,
    name: `${item.item_name} × ${item.quantity}`,
    image: 'https://via.placeholder.com/40x40?text=Food', // You can add images to your order_items table later
    price: item.price * item.quantity,
    quantity: item.quantity
  }));

  const totalPrice = orderSummaryItems.reduce((total, item) => total + item.price, 0);

  // Combine all data into a single array for FlatList
  const listData = [
    { type: 'orderInfo', id: 'orderInfo', orderId: order.order_id, createdAt: order.created_at },
    { type: 'header', id: 'header_details', title: 'Order Details' },
    { type: 'detailsGrid', id: 'detailsGrid', order },
    { type: 'header', id: 'header_summary', title: 'Order Summary' },
    ...orderSummaryItems.map(item => ({ type: 'summaryItem', ...item })),
    { type: 'total', id: 'total', price: totalPrice },
    { type: 'header', id: 'header_contact', title: 'Contact' },
    { type: 'contact', id: 'contact_customer', icon: 'phone', text: 'Call Customer' },
    { type: 'contact', id: 'contact_delivery', icon: 'delivery-dining', text: 'Contact Delivery Person' },
    { type: 'header', id: 'header_notes', title: 'Notes' },
    { type: 'notes', id: 'notes', text: 'No onions on the sandwich.' },
  ];

  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'orderInfo':
        return (
          <>
            <Text style={styles.orderInfo}>Order #{item.orderId.slice(0, 8)}</Text>
            <Text style={styles.orderInfo}>
              {(() => {
                const date = new Date(item.createdAt);
                const day = String(date.getUTCDate()).padStart(2, '0');
                const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
                let hours = date.getUTCHours();
                const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                const seconds = String(date.getUTCSeconds()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours === 0 ? 12 : hours;
                const hourStr = String(hours).padStart(2, '0');
                return `${day} ${month} ${hourStr}:${minutes}:${seconds} ${ampm}`;
              })()}
            </Text>
          </>
        );
      case 'header':
        return <Text style={styles.sectionTitle}>{item.title}</Text>;
      case 'detailsGrid':
        return (
          <View style={styles.detailsGridContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>#{item.order.order_id.slice(0, 8)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>{item.order.customer_name}</Text>
            </View>
            <View style={[styles.detailItem, {flexBasis: '100%'}]}>
              <Text style={styles.detailLabel}>Delivery Address</Text>
              <Text style={styles.detailValue}>{item.order.delivery_address}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: 
                item.order.status === 'pending' ? '#ffc107' :
                item.order.status === 'accepted' ? '#17a2b8' :
                item.order.status === 'completed' ? '#28a745' : '#dc3545'
              }]}>
                {item.order.status?.toUpperCase()}
              </Text>
            </View>
          </View>
        );
      case 'summaryItem':
        return (
          <View style={styles.listItemContainer}>
            <Image source={{ uri: item.image }} style={styles.orderItemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.listItemTitle}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          </View>
        );
      case 'total':
        return (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>${item.price.toFixed(2)}</Text>
          </View>
        );
      case 'contact':
        return (
          <TouchableOpacity style={styles.contactItemContainer}>
            <View style={styles.contactDetails}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={item.icon as any} size={24} color="#1b140d" />
              </View>
              <Text style={styles.listItemTitle}>{item.text}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={28} color="#1b140d" />
          </TouchableOpacity>
        );
      case 'notes':
        return <Text style={styles.notesText}>{item.text}</Text>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#1b140d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        
        {/* Footer Buttons */}
        {order.status === 'accepted' && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.footerButton, { backgroundColor: '#f3ede7' }]}
              onPress={handleRejectOrder}
            >
              <Text style={[styles.footerButtonText, { color: '#1b140d' }]}>Reject Order</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.footerButton, { backgroundColor: '#ec8627' }]}
              onPress={handleReadyForPickup}
            >
              <Text style={[styles.footerButtonText, { color: '#1b140d' }]}>Ready for Pickup</Text>
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
    backgroundColor: '#fbfaf9',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b140d',
    fontFamily: "'Work Sans', sans-serif",
  },
  orderInfo: {
      fontSize: 14,
      color: '#9a714c',
      paddingHorizontal: 16,
      paddingTop: 4,
      fontFamily: "'Work Sans', sans-serif",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b140d',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    fontFamily: "'Work Sans', sans-serif",
  },
   // Details Grid
  detailsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  detailItem: {
    flexBasis: '50%',
    borderTopWidth: 1,
    borderColor: '#e7dbcf',
    paddingVertical: 16,
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#9a714c',
    fontFamily: "'Work Sans', sans-serif",
  },
  detailValue: {
    fontSize: 14,
    color: '#1b140d',
    fontFamily: "'Work Sans', sans-serif",
  },
  // List Items
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 56,
    gap: 16,
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  listItemTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1b140d',
    fontFamily: "'Work Sans', sans-serif",
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 56,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1b140d',
    fontFamily: "'Work Sans', sans-serif",
  },
  // Contact
  contactItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  contactDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3ede7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Notes
  notesText: {
    fontSize: 16,
    color: '#1b140d',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    fontFamily: "'Work Sans', sans-serif",
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fbfaf9',
  },
  footerButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: "'Work Sans', sans-serif",
  },
    itemDetails: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#9a714c',
    fontFamily: "'Work Sans', sans-serif",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderAcceptedScreen;