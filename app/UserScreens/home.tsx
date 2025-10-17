import React, { useState, useEffect, useRef } from 'react';
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
  ImageBackground,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// NOTE: The following imports assume your App.tsx and SupabaseClient.ts files are in the root directory.
// If your file structure is different, you may need to adjust these paths.
import { RootStackParamList } from '../../App';
import supabase from '../../SupabaseClient';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width;

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

const offers = [
    { id: '1', title: '50% OFF', subtitle: 'on your first order', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2881&auto=format&fit=crop' },
    { id: '2', title: 'Free Delivery', subtitle: 'on orders over $20', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2787&auto=format&fit=crop' },
    { id: '3', title: 'Buy 1 Get 1', subtitle: 'on selected items', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=2865&auto=format&fit=crop' },
];

const UserHomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(1); // Mock cart item count
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<any>>(null);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);

  const categories = [
    { id: '1', name: 'All', icon: 'restaurant' },
    { id: '2', name: 'Fast Food', icon: 'fastfood' },
    { id: '3', name: 'Coffee', icon: 'local-cafe' },
    { id: '4', name: 'Desserts', icon: 'cake' },
    { id: '5', name: 'Healthy', icon: 'spa' },
  ];

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

   useEffect(() => {
    if (offers.length > 0) {
        const interval = setInterval(() => {
            const nextIndex = (activeOfferIndex + 1) % offers.length;
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveOfferIndex(nextIndex);
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [activeOfferIndex]);

  const filteredRestaurants = allRestaurants.filter(restaurant =>
    restaurant.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredShops = allRestaurants.slice(0, 3);

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
       <View style={styles.bannerContainer}>
        <FlatList
          ref={flatListRef}
          data={offers}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e) => {
            setActiveOfferIndex(Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH));
          }}
          renderItem={({ item }) => (
             <TouchableOpacity style={styles.offerBanner}>
                <ImageBackground
                    source={{ uri: item.image }}
                    style={styles.offerBannerImage}
                    imageStyle={{ borderRadius: 16 }}
                >
                    <View style={styles.gradientOverlay}>
                        <Text style={styles.offerTitle}>{item.title}</Text>
                        <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
          )}
        />
         <View style={styles.pagination}>
          {offers.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1.4, 0.8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.6, 1, 0.6],
                extrapolate: 'clamp',
            });
            return <Animated.View key={`dot-${i}`} style={[styles.dot, { transform: [{ scale }], opacity }]} />;
          })}
        </View>
      </View>


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
      <FlatList
        horizontal
        data={featuredShops}
        renderItem={renderFeaturedShop}
        keyExtractor={item => item.user_id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredContainer}
      />
      <Text style={styles.sectionTitle}>All Restaurants</Text>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <View style={{flex: 1}}>
                <Text style={styles.locationLabel}>Delivering to</Text>
                <TouchableOpacity style={styles.locationContainer}>
                    <Text style={styles.locationText}>493 Main St, Springfield</Text>
                    <MaterialIcons name="expand-more" size={22} color="#000" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
                <MaterialIcons name="shopping-cart" size={28} color="#fff" />
                {cartItemCount > 0 && (
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                    </View>
                )}
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
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  locationLabel: {
      fontSize: 12,
      color: '#8a7260',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181411',
  },
  cartButton: {
      backgroundColor: '#F97316', // Vibrant orange
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
  },
  // Offer Banner
  bannerContainer: {
    marginTop: 16,
    marginBottom: 8,
    height: 160
  },
  offerBanner: {
    width: width,
    height: 150,
    paddingHorizontal: 16,
  },
  offerBannerImage: {
      flex: 1,
      justifyContent: 'center',
  },
  gradientOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    height: '100%',
    justifyContent: 'center',
    borderRadius: 16,
  },
  offerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
  },
  offerSubtitle: {
      fontSize: 16,
      color: '#ffffff',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    margin: 8,
  },
  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  // Sections
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#181411',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  // Featured Shops (Horizontal)
  featuredContainer: {
      paddingLeft: 16,
      paddingRight: 4,
  },
  featuredShopContainer: {
    width: 280,
    marginRight: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
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
  },
  featuredShopInfoText: {
    fontSize: 14,
    color: '#ffffff',
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
  },
  restaurantTime: {
      fontSize: 14,
      color: '#8a7260',
      marginLeft: 4,
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

