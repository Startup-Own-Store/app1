import React, { useState } from 'react';
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

// Combine all screen elements into a single data array for FlatList
const dashboardSections = [
    { type: 'header', id: 'header_status', title: 'Shop Status' },
    { type: 'status', id: 'status_item' },
    { type: 'header', id: 'header_revenue', title: 'Revenue' },
    { type: 'timeframe', id: 'timeframe_selector' },
    { type: 'card', id: 'card_revenue', title: 'Total Revenue', value: '$456.78' },
    { type: 'header', id: 'header_orders', title: 'Orders' },
    { type: 'card', id: 'card_orders', title: 'Total Orders', value: '34' },
];


const VendorDashboardScreen = () => {
    const [revenueTimeframe, setRevenueTimeframe] = useState('Today');

    const renderDashboardItem = ({ item }: { item: any }) => {
        switch(item.type) {
            case 'header':
                return <Text style={styles.sectionTitle}>{item.title}</Text>;
            case 'status':
                return (
                    <View style={styles.listItemContainer}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="storefront" size={24} color="#181410" />
                        </View>
                        <View>
                            <Text style={styles.listItemTitle}>Open</Text>
                            <Text style={styles.listItemSubtitle}>Open: 9 AM - 9 PM</Text>
                        </View>
                    </View>
                );
            case 'timeframe':
                return (
                    <View style={styles.segmentedControlContainer}>
                        <View style={styles.segmentedControl}>
                            <TouchableOpacity 
                                style={[styles.segmentButton, revenueTimeframe === 'Today' && styles.segmentButtonActive]}
                                onPress={() => setRevenueTimeframe('Today')}
                            >
                                <Text style={[styles.segmentText, revenueTimeframe === 'Today' && styles.segmentTextActive]}>Today</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.segmentButton, revenueTimeframe === 'This Month' && styles.segmentButtonActive]}
                                onPress={() => setRevenueTimeframe('This Month')}
                            >
                                <Text style={[styles.segmentText, revenueTimeframe === 'This Month' && styles.segmentTextActive]}>This Month</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'card':
                return (
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardValue}>{item.value}</Text>
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
            <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJpgkcHEV-_F0RPzH0djoNehRG3Hbbq-qfk-z6nKKKMRi6aJtYUNJV8jc_gP1da6h-NVMOJ7O97iABSMED1DzjAkNclpoG0hOm6nFoVqwTI07JNNDu3aZEaSQ_6jdg7drSvkvnuDn_nSiKpCY6_UbRxeNLc2XM11ljDyPjpPLQ-CwSKUKK6mNUaPicYhNb6KS0eXwbQFuIoJt_8_JFVmmvwUewbX8NRjRPcDBWPeHc_FdTux_y95EXULMP4w8uw6g8ZziJ8wg53cYj' }}
                style={styles.avatar}
            />
            <Text style={styles.headerTitle}>Dashboard</Text>
            <TouchableOpacity>
                <MaterialIcons name="settings" size={24} color="#181410" />
            </TouchableOpacity>
        </View>

        <FlatList
            data={dashboardSections}
            renderItem={renderDashboardItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
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
  avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#181410',
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
  // Segmented Control
  segmentedControlContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
  },
  segmentedControl: {
      flexDirection: 'row',
      backgroundColor: '#f1edea',
      borderRadius: 20,
      height: 40,
      padding: 4,
  },
  segmentButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
  },
  segmentButtonActive: {
      backgroundColor: '#fbfaf9',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  segmentText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#8a725c',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  segmentTextActive: {
      color: '#181410',
  },
  // Cards
  cardContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
  },
  card: {
      backgroundColor: '#f1edea',
      borderRadius: 12,
      padding: 24,
      gap: 8,
  },
  cardTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#181410',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  cardValue: {
      fontSize: 24,
      fontWeight: '700',
      color: '#181410',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default VendorDashboardScreen;