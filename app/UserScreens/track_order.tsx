import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import supabase from '../../SupabaseClient'; // Import Supabase client
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
const MaterialIcons: any = (require('react-native-vector-icons/MaterialIcons').default ?? require('react-native-vector-icons/MaterialIcons'));

const OrderTrackingScreen = ({ onBack, navigation }: { onBack?: () => void; navigation: any }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch current user's orders
  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch orders for the current user
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = (order: any) => {
    navigation.navigate('UserOrderDetails', { order });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleViewDetails(item)} style={styles.listItemContainer}>
      <Text style={styles.listItemTitle}>Order #{item.order_id.slice(0, 8)}</Text>
      <Text style={[styles.listItemSubtitle, {
        color:
          item.status === 'pending' ? '#ffc107' :
          item.status === 'accepted' ? '#17a2b8' :
          item.status === 'completed' ? '#28a745' : '#dc3545'
      }]}>Status: {item.status || 'Pending'}</Text>
      <Text style={styles.listItemSubtitle}>Total: ${item.total_price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#181410" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.order_id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
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
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#181410',
    paddingHorizontal: 16,
    paddingTop: 20,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  orderStatus: {
    fontSize: 16,
    color: '#181410',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181410',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // List Items
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 72,
    paddingVertical: 8,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f1edea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#8a725c',
    marginTop: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  orderItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  // Price Breakdown
  priceContainer: {
    paddingHorizontal: 16,
  },
  priceLineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#8a725c',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  priceValue: {
    fontSize: 14,
    color: '#181410',
    textAlign: 'right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalValue: {
    fontWeight: '700',
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
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderTrackingScreen;