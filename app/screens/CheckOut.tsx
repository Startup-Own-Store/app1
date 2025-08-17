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

const orderSummaryItems = [
    { id: 'summary_1', name: 'Chicken Sandwich × 1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChYUZPg7ICTEoXdBpe33V6NvtbP15G_wql4t_HSw5NMVHO0KXi1idsTW8TbsXEpC6JdzJpIcRhCOK0HgiOnLl7WiZ4tZMsOqAlkkIo5VJfCuTQBR1x1pZb-1CoU6eFLFxdStzXAMOYu2v3EnRVTmKxwTOWhMsSoiM_v9dLk1gogiQPEIJgpaMDlD-lw4Zrt4iT7qlUPem434PIypzKpOBtP4yw8hKb3DxWrqREcdEZhc7juSHo0BaIXIU0xjmeTMrLVkr0hkmtIFtQ' },
    { id: 'summary_2', name: 'Fries × 1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY6VNSC0XkvJiVKs54ShroscdZLUV1oCnlwjmJCMAQcaSQ_SSrX-x08zCjlTyS16HuOWy8fwtLY62pOiDxVfL_e5Ia57RvmNovqSBabdRPbQE0ZMQQRfoB4dUEIGtNcXITi3AgDAfomaHPkWToktcj5vSjdoIjlsM_sP7ACkYDa98G1CrScsmEJpI5oRAkq83ZTBqCmADpC8lW2v3KG7cPIl6A5r_AMfEf1RTCwLlsTtxnGKDoBaIOjdaUVzvM2hVS9C88NWJSK9ON' },
    { id: 'summary_3', name: 'Coke × 1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKHJtXa7AmIxR0uGlg9Ra3nVJO-6Xk57s8EXKp84VvgztClbc83S9oXw4Dsa3sr8lkKT7FDcfjWF6md4a6oXCt9zsdzraCBa4W1-leDH5H20SDyZvyfFZUzFkSHTA0JUB4mYQNEDi0ly89P6xGa6vk5gVBALqxrY7Yoin6-QJLNk3xIStg-BACoDa3qYZ9MOUPg38Az3S8wB2R4-52bJobSWIHxW7P8pLY6RBWc-b0mbMTV_jZR0cAqkmwq3WfAfutfbV_DMLCccUc' },
];

// Combine all data into a single array for FlatList
const listData = [
    { type: 'orderInfo', id: 'orderInfo' },
    { type: 'header', id: 'header_details', title: 'Order Details' },
    { type: 'detailsGrid', id: 'detailsGrid' },
    { type: 'header', id: 'header_summary', title: 'Order Summary' },
    ...orderSummaryItems.map(item => ({ type: 'summaryItem', ...item })),
    { type: 'total', id: 'total', price: '$21.47' },
    { type: 'header', id: 'header_contact', title: 'Contact' },
    { type: 'contact', id: 'contact_customer', icon: 'phone', text: 'Call Customer' },
    { type: 'contact', id: 'contact_delivery', icon: 'delivery-dining', text: 'Contact Delivery Person' },
    { type: 'header', id: 'header_notes', title: 'Notes' },
    { type: 'notes', id: 'notes', text: 'No onions on the sandwich.' },
];

const OrderAcceptedScreen = () => {

    const renderItem = ({ item }: { item: any }) => {
        switch (item.type) {
            case 'orderInfo':
                return (
                    <>
                        <Text style={styles.orderInfo}>Order #123456</Text>
                        <Text style={styles.orderInfo}>1 min ago</Text>
                    </>
                );
            case 'header':
                return <Text style={styles.sectionTitle}>{item.title}</Text>;
            case 'detailsGrid':
                return (
                    <View style={styles.detailsGridContainer}>
                        <View style={styles.detailItem}><Text style={styles.detailLabel}>Order ID</Text><Text style={styles.detailValue}>#12345</Text></View>
                        <View style={styles.detailItem}><Text style={styles.detailLabel}>Customer</Text><Text style={styles.detailValue}>Liam Harper</Text></View>
                        <View style={[styles.detailItem, {flexBasis: '100%'}]}><Text style={styles.detailLabel}>Accepted At</Text><Text style={styles.detailValue}>10:30 AM</Text></View>
                    </View>
                );
            case 'summaryItem':
                return (
                    <View style={styles.listItemContainer}>
                        <Image source={{ uri: item.image }} style={styles.orderItemImage} />
                        <Text style={styles.listItemTitle}>{item.name}</Text>
                    </View>
                );
            case 'total':
                return (
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Total</Text>
                        <Text style={styles.totalText}>{item.price}</Text>
                    </View>
                );
            case 'contact':
                return (
                    <TouchableOpacity style={styles.contactItemContainer}>
                        <View style={styles.contactDetails}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name={item.icon} size={24} color="#1b140d" />
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <MaterialIcons name="arrow-back" size={24} color="#1b140d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Accepted</Text>
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
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#f3ede7' }]}>
                <Text style={[styles.footerButtonText, { color: '#1b140d' }]}>Reject Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerButton, { backgroundColor: '#ec8627' }]}>
                <Text style={[styles.footerButtonText, { color: '#1b140d' }]}>Ready for Pickup</Text>
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
});

export default OrderAcceptedScreen;