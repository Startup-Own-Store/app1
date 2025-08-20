import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useMenu, MenuItem } from './MenuContext';

import supabase from '../../SupabaseClient';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useEffect } from 'react';

// const menuItems = [
//     { id: '1', name: 'Spicy Chicken Sandwich', price: '$8.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUJlYMuKVaILDHvfppp6UjnIA_vi-wQqxZPr8fLlyd9bsdgrbJBP3q9zBbU5zJqBDvmBzsg7ng_SPW7C_o8PpV2GEhZUhzXDlNkgHzs2sgKjbA_D-rH64oeq7iQEuV6CVGHYMfO9fk8YhcVWLQH7WOEZraOJ14uSbUBbaqs_FhnzUeIPUVNgEB4YtQWkbnIHMuyGsPGVUefYjMYU_hJVJ0HXt79QF5ljFwCrjxZcVs9gncGJaoNwO0-9rd31agqouT2_el8dJpVwfx' },
//     { id: '2', name: 'Classic Cheeseburger', price: '$7.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiCgTcQLJiY6iTDf2TW8y1XLNY5sLfEctJB_5KPWC3tauaWpHisRgoSvWaLBjK3ZiK2gyW38O7vB6Evi2IVfa8Ubqj0FI5tpIeXw2qtbXVGvKQnlyzCKMx9q65me-yeSafPbvTpBgoKvr5kLkerac1leB9zBA2Wbb4vUe5rWrWYcc0WaJUYG0MQIIBxsOVikhapOGPfMWzncgc8mWH8AhAyOdbiNRsNgcL1GaRUoNsgCowTgqIvIbc-KYNMCJmpd8DxXhu-HyO39_B' },
//     { id: '3', name: 'Veggie Burger', price: '$6.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLspSFhiQXTF36LAycSS4QHVoUsgwzi04l_6ZoC8YtqXcyOFKf3hHmFTEuwyeNyAP0csOv0Ss4FYO2IfGuH5qxTzauldt6SA7TQdgorOZvTDWE_yu_pKlcnYxO80A0CLjp7PRSDx2S6ESy-j8FFIysQ5C1DKxl7Lzwtb9mKtBt0pXvRSwTuwUYJYgHvA2Oh6nR1LZVmKpD8piETiHAhwI-JI1r2qhl-J5PhHw-PMiluOgbFq90ImQXqNvRz2ZIbDSUcFzxkNNlsRG9' },
//     { id: '4', name: 'Fries', price: '$3.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE0pMvLg7bA5LHYbWuOrBlW1eej2VM1e58LGjBybIgGeUkO7_k4-K_cluQYcWJdPn-y5__Diyhv2YZ6AEQwhuuDpf_xat1z2VAG3fRARwE0qkR1zimAQJgOKoHLod__STd4AtBwBLhSLbxWA_0i1FVyIfEmQEoTXdijnvcTlCQFgKRznr73cAU5oNmfKmViuBOJuzLR2-KRfspj4oDste95WqvsizZnkWc2OgmQBr7xkbvABJGNBgZTQw1hg21vHaFnAJp54S-ABb5' },
//     { id: '5', name: 'Onion Rings', price: '$4.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQnwAI0yYvvlH-FmAJ_CiBvywTgJq77husJQSFIRszSv3o3j92zjwoeP5N6YTkKROvQhCCiAIrGb5nktXN6a_XpgnT5690yVaTGs9y15D9XI1e_sqjWWbyAcgrgks1HgCThK37CJ0E9HtSHpeu1b2Y92gYh3rrYOBCbUnh9axDWMUFX2Zl3zuUpemedNcBxFmjOyPjkQZYDfeE24mzeFAshOEM-0XeB-aC5p-G8SIZvwaPzCifBcxevbH0ZtTzWxDVHf1woBVLmuj9' },
//     { id: '6', name: 'Milkshake', price: '$5.99', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBE-e7_3vd_P-sk42oCr-jBYXkTIy75CZ-8LN_30qTJvGnNRNLyLZuJVRlEtC_Q9VdKQi_buV9bupQ8C4M3YjeWfnZMj1D2V8ZNBSuoHIDU7H8PDqP5HhQz2E9_b5JpRsaFTGvJSqzEwdGAiOse6K4tWsDZXPCXYH7Fi4uxz0G6syFp33zjwK2xVsr5R2LDJIFB2zG0AMab1lvS-krpnJDmJ-IhtRqyfpxE9-hXvtIbf6egdluKbWuSlc01ugk4HneSGotX0WHIOwYY' },
// ];

const VendorMenuScreen = () => {
  const [activeTab, setActiveTab] = useState('All');
  const navigation = useNavigation<any>();
  const menuContext = useMenu();
  // const menuItemsFromContext = menuContext?.menuItems ?? [];
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const allMenuItems = menuItems;
  const [searchQuery, setSearchQuery] = useState('');
  const filteredItems = allMenuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'All' ? true :
      activeTab === 'Unavailable' ? item.unavailable === true : true;

    return matchesSearch && matchesTab;
  });
  
   const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItemContainer}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      <View>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
  
    useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, item_name, price, image_url, vegetarian, vegan, gluten_free');

        if (error) {
          console.error('Error fetching products:', error.message);
          return;
        }

        const products = data.map((item: any) => ({
          id: item.id,
          name: item.item_name ?? '',
          price: item.price ?? '',
          image: item.image_url ?? '',
          unavailable: false, // Supabase doesn't track availability unless you add a column
        })) as MenuItem[];

        setMenuItems(products);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#181410" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
            <View style={styles.searchInputContainer}>
                <MaterialIcons name="search" size={24} color="#8a725c" />
                <TextInput
                  placeholder="Search items"
                  placeholderTextColor="#8a725c"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
            </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => setActiveTab('All')}>
                <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>All</Text>
                {activeTab === 'All' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('Unavailable')}>
                <Text style={[styles.tabText, activeTab === 'Unavailable' && styles.activeTabText]}>Unavailable</Text>
                {activeTab === 'Unavailable' && <View style={styles.activeTabIndicator} />}
            </TouchableOpacity>
        </View>
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
        
        {/* Add Item FAB */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddItemScreen')}>
            <MaterialIcons name="add" size={24} color="#181410" />
            <Text style={styles.fabText}>Add items</Text>
        </TouchableOpacity>

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
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 2,
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
  // Search
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1edea',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#181410',
    marginLeft: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e2dbd4',
    paddingBottom: 0,
  },
  tabText: {
    paddingTop: 16,
    paddingBottom: 13,
    fontSize: 14,
    fontWeight: '700',
    color: '#8a725c',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  activeTabText: {
    color: '#181410',
  },
  activeTabIndicator: {
    height: 3,
    backgroundColor: '#f3e7dc', // A bit different from HTML, might need adjustment
  },
  // Grid
  gridContainer: {
    padding: 16,
  },
  menuItemContainer: {
    flex: 1/2,
    flexDirection: 'column',
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 6,
  },
  menuItemImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#8a725c',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e7dc',
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 20,
    gap: 8,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Shadow for Android
    elevation: 5,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181410',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default VendorMenuScreen;
