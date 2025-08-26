import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ImageBackground,
  FlatList,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect } from 'react';

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RootStackParamList } from '../../App';
import supabase from '../../SupabaseClient';

interface Restaurant {
  user_id: string;
  image?: string;
  rating?: number;
  time?: string;
  created_at?: string;
  email?: string;
  full_name?: string;
  phone?: string;
}



const UserHomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
  { id: '1', name: 'All', icon: 'restaurant' },
  { id: '2', name: 'Fast Food', icon: 'fastfood' },
  { id: '3', name: 'Coffee', icon: 'local-cafe' },
  { id: '4', name: 'Desserts', icon: 'cake' },
  { id: '5', name: 'Healthy', icon: 'spa' },
];

  // Fetch restaurants from vendor_profiles table
  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching restaurants:', error);
        return;
      }

      setAllRestaurants(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Filter functions
  const filteredRestaurants = allRestaurants.filter(restaurant =>
    restaurant.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For featured shops, you might want to create a separate table or use a flag
  // For now, I'll use the first 3 restaurants as featured
  const featuredShops = allRestaurants.slice(0, 3);

  const filteredFeaturedShops = featuredShops.filter(shop =>
    shop.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render functions
  const renderFeaturedShop = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.featuredShopContainer}
      onPress={() => navigation.navigate('RestaurantMenu', { shopId: item.user_id, shopName: item.full_name || '' })}
    >
      <ImageBackground
        source={{ uri: item.image || 'https://via.placeholder.com/300x150?text=Restaurant' }}
        style={styles.featuredShopImage}
        imageStyle={{ borderRadius: 12 }}
      >
        <View style={styles.featuredGradientOverlay}>
          <Text style={styles.featuredShopName}>{item.full_name}</Text>
          <View style={styles.shopItemInfo}>
            <MaterialIcons name="star" size={16} color="#ffb400" />
            <Text style={styles.featuredShopInfoText}>
              {item.rating || '4.5'} · {item.time || '30-40 min'}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderAllRestaurants = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantContainer}
      onPress={() => navigation.navigate('RestaurantMenu', { shopId: item.user_id, shopName: item.full_name || '' })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/100x100?text=Restaurant' }}
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantDetails}>
        <Text style={styles.restaurantName}>{item.full_name}</Text>
        <View style={styles.shopItemInfo}>
          <MaterialIcons name="star" size={16} color="#ffb400" />
          <Text style={styles.restaurantRating}>{item.rating || '4.5'}</Text>
          <Text style={styles.restaurantTime}>· {item.time || '30-40 min'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* Offer Banner */}
      <TouchableOpacity style={styles.offerBanner}>
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPYHgU5ePFrCRnc1PTYALGNLx-ZIRyyr5tbE8EYtTJE1lRD0r_5PMKZCD7ThivzWEfxNQcx5yULn_O55fksGllV0KBwJWCAaxgvpmV9mrwAWDWRk6AGodqOoVLjNKI53gBMeN85MLOUnGfed-LAjbn_77ZYJMju22Oxg9EHDSnrtRij04wpz8oEtUkO-JOsDMYtJ8xz-mmtHqRGX81p_n74JsUE-nFiSGojOwHhTC4cuYBGCol91_xwmCKzILH7pe2CrogTrcaY1I' }}
          style={styles.offerBannerImage}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={styles.gradientOverlay}>
            <Text style={styles.offerTitle}>50% OFF</Text>
            <Text style={styles.offerSubtitle}>on your first order</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialIcons name="search" size={22} color="#8a7260" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Restaurants or items"
            placeholderTextColor="#8a7260"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.categoryChip}>
            <MaterialIcons name={item.icon} size={20} color="#181411" />
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      <Text style={styles.sectionTitle}>Featured Shops</Text>
      {filteredFeaturedShops.length > 0 ? (
        <FlatList
          horizontal
          data={filteredFeaturedShops}
          renderItem={renderFeaturedShop}
          keyExtractor={item => item.user_id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredContainer}
        />
      ) : (
        <Text style={styles.noResultsText}>No featured shops found</Text>
      )}

      <Text style={styles.sectionTitle}>All Restaurants</Text>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <MaterialIcons name="person" size={24} color="#050301ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Own Store</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <MaterialIcons name="shopping-cart" size={24} color="#050301ff" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredRestaurants}
          renderItem={renderAllRestaurants}
          keyExtractor={(item) => item.user_id}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            <Text style={styles.noResultsText}>
              {searchQuery ? 'No restaurants found for your search' : 'No restaurants available'}
            </Text>
          }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000ff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Offer Banner
  offerBanner: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
  },
  offerBannerImage: {
      height: 150,
      justifyContent: 'center',
  },
  gradientOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    borderRadius: 16,
    height: '100%',
    justifyContent: 'center',
  },
  offerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  offerSubtitle: {
      fontSize: 16,
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#181411',
    fontSize: 16,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Categories
  categoriesContainer: {
      paddingLeft: 16,
      paddingVertical: 8,
  },
  categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f5f2f0',
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginRight: 12,
      gap: 8,
  },
  categoryText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#181411',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Sections
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#181411',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // Featured Shops (Horizontal)
  featuredContainer: {
      paddingLeft: 16,
      paddingRight: 4,
  },
  featuredShopContainer: {
    width: 280,
    marginRight: 16,
  },
  featuredShopImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
  },
  featuredGradientOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  featuredShopName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  featuredShopInfoText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  // All Restaurants List (Vertical)
  listContentContainer: {
      paddingBottom: 16,
  },
  restaurantContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  restaurantDetails: {
      paddingTop: 12,
  },
  restaurantName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#181411',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  shopItemInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
  },
  restaurantRating: {
      fontSize: 14,
      color: '#181411',
      marginLeft: 4,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  restaurantTime: {
      fontSize: 14,
      color: '#8a7260',
      marginLeft: 4,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});

export default UserHomeScreen;