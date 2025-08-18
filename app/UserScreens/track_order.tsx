import React from 'react';
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
} from 'react-native';

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const deliveryDetails = [
    { id: 'detail_1', icon: 'location-on', title: 'Delivery Address', subtitle: '456 Oak Avenue, Springfield' },
    { id: 'detail_2', icon: 'description', title: 'Special Instructions', subtitle: 'Leave at the front door' },
];

const orderItems = [
    { id: 'item_1', name: 'Spicy Chicken Sandwich', quantity: 'x 1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3li95sdgf-hVhSefZFvrJ9DFFW0ekALI53mlBvKcL4ByZB1cLUBPEKUdTFtX0X7ZCJvByOcAYInizD6qbjGB2MHeamc_-SaeOkacgR5pqU-qVjfAHGxdha9fDll7MCYYQQWEl9DaWNZ16bFsDA4m5jJ1vbmqQT6LSVnbX0iVvAy1x04Z6O3rzKdO7hMmfRo6ZVNidTmAWQhHjFJ7m3mY_xdQPIA9DLZftwevLgVpAiimqTxmvDxgVZYcOZq6F9YqmtobItZOUW0PP' },
    { id: 'item_2', name: 'Fries', quantity: 'x 2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxBMtWKf_m42PYvpKSd2vV2jfsS_y6iLO-Bf8RWfb65K5Jeb-kJFsnk4o7KvjRtPb8zdjYVbDx7OmOOBBHRadZjIsYGzUF6l0RlrkQhMEfn8AtDiXRijtjcqHzxhFIt2e5NnvwAt304peknN3UROdf_m1rRa2QwOYHwHr7Em0hEkRVpIpVVyMhI1lw3o19_XR9Hj59V1mAA2xpmuLCc8Vgibf9_73B-cfcbY5dBN-kcnXtrjos6cgeA-4onwUEy6sQFO5iBmnaneu8' },
    { id: 'item_3', name: 'Coke', quantity: 'x 1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEnP4HeKTOhhuFyikc67irDsCkGewW6mhtOqrTUINrvd9judrqBAEovrcAc7DyoOFpXcEOMAgIPamsDzgkuS65b_pmMpuMKUozx9jU_qOpp3IxUAWt94GPAmkQemLl3VbnKYE6jQAFdL_tWAND28uYWGO65jHrNIKS9juV-3H22cbyt-rMtr88xlU7mKkDUVcStgqq9KuH9vzEqxGqjo2N318-arfmzsmRGyCGzY8TQkZrkiiPSq4y0fRnVW18EKdoRW1xnzQ5wJVa' },
];

const priceBreakdown = [
    { id: 'price_1', label: 'Subtotal', value: '$15.00' },
    { id: 'price_2', label: 'Delivery Fee', value: '$2.00' },
    { id: 'price_3', label: 'Taxes', value: '$1.50' },
    { id: 'price_4', label: 'Total', value: '$18.50', isTotal: true },
];

// Combine all data into a single array for FlatList
const listData = [
    { type: 'orderHeader', id: 'orderHeader' },
    { type: 'header', id: 'header_delivery', title: 'Delivery Details' },
    ...deliveryDetails.map(item => ({ type: 'deliveryDetail', ...item })),
    { type: 'header', id: 'header_summary', title: 'Order Summary' },
    ...orderItems.map(item => ({ type: 'orderItem', ...item })),
    { type: 'header', id: 'header_price', title: 'Price Breakdown' },
    ...priceBreakdown.map(item => ({ type: 'priceDetail', ...item })),
];

const OrderTrackingScreen = ({ onBack }: { onBack?: () => void }) => {

    const renderItem = ({ item }: { item: any }) => {
        switch (item.type) {
            case 'orderHeader':
                return (
                    <>
                        <Text style={styles.orderNumber}>Order #123456789</Text>
                        <Text style={styles.orderStatus}>Order accepted</Text>
                    </>
                );
            case 'header':
                return <Text style={styles.sectionTitle}>{item.title}</Text>;
            case 'deliveryDetail':
                return (
                    <View style={styles.listItemContainer}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name={item.icon} size={24} color="#181410" />
                        </View>
                        <View>
                            <Text style={styles.listItemTitle}>{item.title}</Text>
                            <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                        </View>
                    </View>
                );
            case 'orderItem':
                return (
                     <View style={styles.listItemContainer}>
                        <Image source={{ uri: item.image }} style={styles.orderItemImage} />
                        <View>
                            <Text style={styles.listItemTitle}>{item.name}</Text>
                            <Text style={styles.listItemSubtitle}>{item.quantity}</Text>
                        </View>
                    </View>
                );
            case 'priceDetail':
                return (
                    <View style={styles.priceContainer}>
                        <View style={styles.priceLineContainer}>
                            <Text style={[styles.priceLabel, item.isTotal && styles.totalLabel]}>{item.label}</Text>
                            <Text style={[styles.priceValue, item.isTotal && styles.totalValue]}>{item.value}</Text>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

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
            data={listData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
        />
        
        {/* Footer Buttons */}
        <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f1edea' }]}>
                <Text style={[styles.footerButtonText, { color: '#181410' }]}>Call Delivery Person</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f3e7dc' }]}>
                <Text style={[styles.footerButtonText, { color: '#181410' }]}>Help</Text>
            </TouchableOpacity>
        </View>
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
});

export default OrderTrackingScreen;