import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import supabase from '../../SupabaseClient'; // Import your Supabase client

type VendorHomeScreenProps = {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
};

// Define types
interface Order {
  order_id: string;
  user_id: string;
  vendor_id: string;
  total_price: number;
  delivery_address: string;
  created_at: string;
  status?: string;
  customer_name?: string;
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

const VendorHomeScreen: React.FC<VendorHomeScreenProps> = ({ navigation }) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders from the database
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Get current vendor's user_id (you might need to adjust this based on your auth setup)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch orders for this vendor
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return;
      }

      // For each order, fetch the customer name and order items
      const ordersWithDetails = await Promise.all(
        (ordersData || []).map(async (order) => {
          // Fetch customer name
          const { data: customerData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', order.user_id)
            .single();

          // Fetch order items (you'll need to create an order_items table)
          const { data: itemsData } = await supabase
            .from('order_items')
            .select(`
              id,
              quantity,
              items (
                item_name,
                price
              )
            `)
            .eq('order_id', order.order_id);

          return {
            ...order,
            customer_name: customerData?.full_name || 'Customer',
            items: itemsData || [],
            status: 'pending' // Default status
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Set up real-time subscription for new orders
 // Set up real-time subscription for new orders
useEffect(() => {
  const setupRealtimeSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const subscription = supabase
        .channel('orders_channel')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'orders',
            filter: `vendor_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('New order received!', payload.new);
            fetchOrders(); // Refresh orders when new one is added
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  setupRealtimeSubscription();
}, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const handleToggleShopStatus = () => {
    setIsShopOpen((previousState) => !previousState);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'accepted' })
        .eq('order_id', orderId);

      if (error) {
        console.error('Error accepting order:', error);
        return;
      }

      // Update local state
      setOrders(orders.map(order => 
        order.order_id === orderId 
          ? { ...order, status: 'accepted' }
          : order
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'rejected' })
        .eq('order_id', orderId);

      if (error) {
        console.error('Error rejecting order:', error);
        return;
      }

      setOrders(orders.map(order => 
        order.order_id === orderId 
          ? { ...order, status: 'rejected' }
          : order
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('order_id', orderId);

      if (error) {
        console.error('Error completing order:', error);
        return;
      }

      setOrders(orders.map(order => 
        order.order_id === orderId 
          ? { ...order, status: 'completed' }
          : order
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleViewDetails = (order: Order) => {
    navigation.navigate('OrderDetails', { order });
  };

  // Filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const acceptedOrders = orders.filter(order => order.status === 'accepted');
  const completedOrders = orders.filter(order => order.status === 'completed');

  const Dashboard = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardCard}>
        <Text style={styles.dashboardValue}>{orders.length}</Text>
        <Text style={styles.dashboardLabel}>Total Orders</Text>
      </View>
      <View style={styles.dashboardCard}>
        <Text style={styles.dashboardValue}>{pendingOrders.length}</Text>
        <Text style={styles.dashboardLabel}>Pending</Text>
      </View>
      <View style={styles.dashboardCard}>
        <Text style={styles.dashboardValue}>{completedOrders.length}</Text>
        <Text style={styles.dashboardLabel}>Completed</Text>
      </View>
    </View>
  );

const OrderCard = ({ order }: { order: Order }) => {
  const handleCardPress = () => {
    handleViewDetails(order);
  };

  const handleButtonPress = (e: any, callback: () => void) => {
    e.stopPropagation(); // Prevent the card press from triggering
    callback();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleCardPress} activeOpacity={0.9}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.order_id.slice(0, 8)}</Text>
        <Text style={[styles.statusBadge, 
          { backgroundColor: 
            order.status === 'pending' ? '#ffc107' :
            order.status === 'accepted' ? '#17a2b8' :
            order.status === 'completed' ? '#28a745' : '#dc3545'
          }]}>
          {order.status?.toUpperCase()}
        </Text>
      </View>
      
      <Text style={styles.customerName}>{order.customer_name}</Text>
      <Text style={styles.orderInfo}>Total: ${order.total_price.toFixed(2)}</Text>
      <Text style={styles.orderInfo}>Address: {order.delivery_address}</Text>
      <Text style={styles.orderInfo}>
        {order.items?.length || 0} items · {new Date(order.created_at).toLocaleTimeString()}
      </Text>

      <View style={styles.buttonContainer}>
        {order.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]} 
              onPress={(e) => handleButtonPress(e, () => handleAcceptOrder(order.order_id))}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.rejectButton]} 
              onPress={(e) => handleButtonPress(e, () => handleRejectOrder(order.order_id))}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
        {order.status === 'accepted' && (
          <TouchableOpacity 
            style={[styles.button, styles.completeButton]} 
            onPress={(e) => handleButtonPress(e, () => handleCompleteOrder(order.order_id))}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#1c140c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vendor Dashboard</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Dashboard />

          <View style={styles.mainContent}>
            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Pending Orders ({pendingOrders.length})</Text>
                {pendingOrders.map(order => (
                  <OrderCard key={order.order_id} order={order} />
                ))}
              </>
            )}

            {/* Accepted Orders */}
            {acceptedOrders.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>In Progress ({acceptedOrders.length})</Text>
                {acceptedOrders.map(order => (
                  <OrderCard key={order.order_id} order={order} />
                ))}
              </>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Completed ({completedOrders.length})</Text>
                {completedOrders.map(order => (
                  <OrderCard key={order.order_id} order={order} />
                ))}
              </>
            )}

            {orders.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="receipt" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No orders yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fcf9f7",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c140c",
  },
  headerSpacer: {
    width: 24,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: "#1c140c",
  },
  descriptionContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  descriptionText: {
    color: "#575757",
    fontSize: 14,
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#faf6f3',
    borderBottomWidth: 1,
    borderBottomColor: '#f4ede8',
  },
  dashboardCard: {
    alignItems: 'center',
    flex: 1,
  },
  dashboardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  dashboardLabel: {
    fontSize: 14,
    color: '#575757',
    marginTop: 4,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f4ede8'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#9b7049',
  },
  cardText: {
    fontSize: 14,
    color: '#575757',
    marginBottom: 4,
  },
  cardTextBold: {
      fontSize: 14,
      color: '#1c140c',
      fontWeight: '600',
      marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#28a745',
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    marginLeft: 8,
  },
  completeButton: {
      backgroundColor: '#007bff',
      paddingHorizontal: 16,
      marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
      marginTop: 16,
  },
  listTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1c140c',
      marginBottom: 12,
  },
  orderActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: 16,
  },
  detailsButton: {
      backgroundColor: '#6c757d',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
  },
  detailsButtonText: {
      color: '#fff',
      fontWeight: '500',
  },
  noOrdersText: {
      textAlign: 'center',
      color: '#888',
      marginTop: 20,
      fontSize: 16,
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f4ede8",
    backgroundColor: "#fcf9f7",
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    color: "#9b7049",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  statusBadge: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c140c',
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 14,
    color: '#575757',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c140c',
    marginBottom: 12,
    marginTop: 20,
  },
});
export default VendorHomeScreen;