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
  ImageBackground,
} from 'react-native';

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const popularItems = [
    { id: '1', name: 'Spaghetti Carbonara', description: 'Classic pasta dish with eggs, cheese, pancetta, and black pepper', price: '$14.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDojOQj-e3hmQXoKMS9Cua2IQpAL3Eh6Gu1ssfAK1dD-6v9g_TAIAPjpK_WAZ0Ff6IhEGMVtNo4irQ-yJ2T7y5btMywILDmeZvqu-C3fITcSvEXPff3ggOmDwdy10j6XWDtndw2hAQ0waDS9gcYXSCKrj9JFNgYzd-v3cTREPJ3Wr93p6erWXjBVAVVFW1VjhqRxOG9ZBB1bjYuEczpBjEGmr22iRdWGQ4oJ_6dIzj-JvZNfSoHJQmvXfDNKbbERXBs4-y3LvtCVbQ' },
    { id: '2', name: 'Caprese Salad', description: 'Fresh mozzarella, ripe tomatoes, and basil leaves, drizzled with balsamic glaze', price: '$10.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2vgyL_VPGnIvrlLOgTQCN6wIzI_EJuyXc1WYZdv5JRjVlQ6wTEMrlC4QuAPWwCvyfu32cGDzC2-p0B9adr1cBbz-3Vk-6OcCagoHNX4Id2jzCf9lbm-_GQeWfdbqKR7WY3W4AeMQSh-IYCF5HgQEMI_lKKtqOrOIBqsEjRyMEths6pGykHz9MTGDzHl8lhfC-emKlxxsAMMnKBdfbg2VRY7pRgnq0TtW5NTG1Fo4BtfbTmgau2VQbhb5Z_OnjhrMGa_fhnEepOWA' },
    { id: '3', name: 'Bruschetta', description: 'Toasted bread topped with fresh tomatoes, basil, and a drizzle of balsamic glaze', price: '$8.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDHE2LzLDYhl7CE6x1bd9lzyBVDgFmZt6Kd3uv2GbnTaWAf5ON4czCGM9XYBg5nOOmCx-Yj5ENnzjKZCKgAINnJ-6RHEPLCCw9rWaQd700hyO8cBDtVjpjHvQQwUsCnUFWwWjtapxPGN7knDFL0dCkrxvUTGzmTKPTwc2psuVj2oR_r91OnJjf6FZ2O3l4AipkzBHT3srw6M4UgfzO4XbtCh5SIJz0xm54LwsSTKv5ux-VmT9gtsbVZ9X6pI5oAmlE7JOKDukqxU4' },
    { id: '4', name: 'Tiramisu', description: 'Coffee-flavored Italian dessert with layers of ladyfingers, mascarpone cheese, and cocoa', price: '$7.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATbeFC7ZtcrZ_ojtsrZmh92jCJyhv-HthV3obV13ZcsST__uhwh6Oanpgw7rF15nFAsz4hMNVYjRIhc3BMHoXDN4hChOaH6CJ34s514ww9GfPVkJowOFKlWVKYCqNtp3zZnPSZd5aVJvSi5bicCfxfv6ymA0QFj8Fe-YQUnML-O76zulyyYfrv_lsSSgtj_iztFjs13cJalQpJZcjHHdF2QpxQKwwAV3JgGrM68ewBXSnfcGuMJhRi9H6BeLa6aUe3VynPXcBnKrQ' },
];

const menuTabs = ['Popular', 'Appetizers', 'Main Courses', 'Desserts', 'Drinks'];

const RestaurantMenuScreen = ({ onBack, shop, onNavigateToCheckout, onNavigateToFoodDetails }: { onBack?: () => void, shop?: any, onNavigateToCheckout?: () => void, onNavigateToFoodDetails?: (food: any) => void }) => {
    const [activeTab, setActiveTab] = useState('Popular');

    const renderMenuItem = ({ item }: { item: typeof popularItems[0] }) => (
        <TouchableOpacity style={styles.menuItemContainer} onPress={() => onNavigateToFoodDetails?.(item)}>
            <View style={styles.menuItemTextContainer}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <>
            <ImageBackground 
                source={{ uri: shop?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuArAa5uYdP47N-dQFSh3GshvRDTij-EP_UAkjhw0ngwfaj0Q9h2_Vp7FzQT9_tuQbescpyEbNMecFpIpVdyqYMGQnVemyWHU4EH3TSkHiPmoM1bijpHY1-RnqUtb-zWrBoQFHk08BLjGwwVxhFH-s_pWqErzO9388OLi5HF1ua6EpnmNv-3Rj1XV2yE4fVu2EIL9oOQD2eonOjrUYgTxrdhItIGPrAdRMfi0hox9f1j979IKT3Z2JgoVvaatUx_oGugP7QmjkX5R8o' }}
                style={styles.shopHeaderImage}
            >
                <View style={styles.headerGradientOverlay} />
            </ImageBackground>
            <View style={styles.shopInfoContainer}>
                <Text style={styles.shopName}>{shop?.name || 'The Italian Place'}</Text>
                <View style={styles.shopInfoRow}>
                    <MaterialIcons name="star" size={16} color="#ffb400" />
                    <Text style={styles.shopInfoText}>{shop?.rating || '4.8'} (200+ ratings)</Text>
                    <Text style={styles.shopInfoText}>·</Text>
                    <Text style={styles.shopInfoText}>Italian</Text>
                    <Text style={styles.shopInfoText}>·</Text>
                    <Text style={styles.shopInfoText}>$$</Text>
                </View>
                <Text style={styles.shopDeliveryInfo}>{shop?.time || '20-30 min'} · $3.99 delivery</Text>
            </View>
            <View style={styles.tabContainer}>
                <FlatList
                    horizontal
                    data={menuTabs}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => setActiveTab(item)}>
                            <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>
        </>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#181113" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{shop?.name || 'The Italian Place'}</Text>
          <TouchableOpacity onPress={onNavigateToCheckout}>
            <MaterialIcons name="shopping-cart" size={24} color="#181113" />
          </TouchableOpacity>
        </View>

        <FlatList
            data={popularItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 16 }}
        />
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
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Shop Header
  shopHeaderImage: {
      height: 180,
      justifyContent: 'flex-end',
  },
  headerGradientOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
  },
  shopInfoContainer: {
      padding: 16,
      backgroundColor: '#ffffff',
  },
  shopName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#181113',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  shopInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
  },
  shopInfoText: {
      fontSize: 14,
      color: '#555',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  shopDeliveryInfo: {
      fontSize: 14,
      color: '#555',
      marginTop: 4,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Tabs
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabText: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#88636f',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  activeTabText: {
    color: '#181113',
    fontWeight: '700',
    borderBottomWidth: 2,
    borderBottomColor: '#181113',
  },
  // Menu List Item
  menuItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  menuItemTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemDescription: {
    fontSize: 14,
    color: '#88636f',
    marginTop: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#181113',
    marginTop: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },
});

export default RestaurantMenuScreen;