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

// FIX: If you see an error on the line below, it's likely because the type
// definitions for react-native-vector-icons are not installed.
// Run this command in your terminal to fix it:
// npm install @types/react-native-vector-icons --save-dev
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const categories = [
    { id: '1', name: 'Offers', icon: 'local-offer' },
    { id: '2', name: 'Pizza', icon: 'local-pizza' },
    { id: '3', name: 'Burgers', icon: 'fastfood' },
    { id: '4', name: 'Healthy', icon: 'spa' },
    { id: '5', name: 'Desserts', icon: 'cake' },
    { id: '6', name: 'Asian', icon: 'ramen-dining' },
];

const featuredShops = [
    { id: '1', name: 'The Gourmet Kitchen', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArAa5uYdP47N-dQFSh3GshvRDTij-EP_UAkjhw0ngwfaj0Q9h2_Vp7FzQT9_tuQbescpyEbNMecFpIpVdyqYMGQnVemyWHU4EH3TSkHiPmoM1bijpHY1-RnqUtb-zWrBoQFHk08BLjGwwVxhFH-s_pWqErzO9388OLi5HF1ua6EpnmNv-3Rj1XV2yE4fVu2EIL9oOQD2eonOjrUYgTxrdhItIGPrAdRMfi0hox9f1j979IKT3Z2JgoVvaatUx_oGugP7QmjkX5R8o', rating: '4.8', time: '25-30 min' },
    { id: '2', name: 'Urban Bites', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB0GKNPVPbYRnrUKEIsuurhsQeMM97Uvhc1XBXHbWMfq3zKADfDdffwmM1csMo-mnumEcup__B_WJuhDqoEUYIu5TKtHfJ5n732JCQdCgyOz7HnMfyM4itoTliJJ1KlJ-0OdWxXxwIlOUjdyAjzTuI-lCliMKPXSSlPh04IHD0224ZQkdh9BpHWOMwwNJhtolhqCPFMHeSZX06wQPTcf8VAFUKGooLAziCQ_S4dsp2QtNDrPLhthewp2Of4wh-IinvbQCuEfLr2Xk', rating: '4.5', time: '20-25 min' },
    { id: '3', name: 'Nature\'s Table', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC78xQitrYnaA4mcwXJs52uHJlKOvn-PW4aXR5M-G5XfDYbjKsJxSQFCr4TN3hEmbWauBaYWpJgqqQW1zu3zU5No53rFB5cdY5iDWhW-sWG3FwFsV2W_xLiaxhCloMU4FW_NLzQcP1qmvHnQhA3UKy5YaR9VnpTjs0CIvq8S-_xtE5x3iKHJiZ7ACvsbV4ysjQ17KW1Up-qoxZBaKTItu-kMtCruQxrnLSF9LdDDkh91BtjEUfDeyMDdk8f-od5waGgtBTIcUf8Y9I', rating: '4.9', time: '30-35 min' },
];

const allRestaurants = [
    { id: '4', name: 'The Burger Joint', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_9KFsl1P3kEJpDAbS9Z_sbEOCfyb2GbzzrQn6hwYwNYkr9xL9P71WVvJqMbgWfUsYzwYIPWDwm3NrXp6QJ5N2ONN3VUrZ_WAMQcCrc1-0NBzOeEmy0FroLegd72uzYdxXtCWXFdgviaUWXTebRDsuqbeol1MhRZ67pcpj3PUTiLMVn5wzh_e50swEABSksdN40xB1iUTslKGd3K1K1rvteA8ij-70KYbBEtjojaps9XVx3u4oVKQVTuHXidcUeq0xrFSw8428IHg', rating: '4.6', time: '15-20 min' },
    { id: '5', name: 'Sushi Central', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPYHgU5ePFrCRnc1PTYALGNLx-ZIRyyr5tbE8EYtTJE1lRD0r_5PMKZCD7ThivzWEfxNQcx5yULn_O55fksGllV0KBwJWCAaxgvpmV9mrwAWDWRk6AGodqOoVLjNKI53gBMeN85MLOUnGfed-LAjbn_77ZYJMju22Oxg9EHDSnrtRij04wpz8oEtUkO-JOsDMYtJ8xz-mmtHqRGX81p_n74JsUE-nFiSGojOwHhTC4cuYBGCol91_xwmCKzILH7pe2CrogTrcaY1I', rating: '4.7', time: '25-30 min' },
    { id: '6', name: 'Pasta Palace', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA56V307I0j73BYKi-LZkJzePTS99ICQvX8XoFefgYWpD0KXVOaB7V4FuhTai2tJ3y29l-apKWQbRTdU6Vcnp5ky-JgMaE42MhxhBlIIKy9D24BKCCWlgTeFMWWg7JKHx7JFg07gCBP_kACvOJfabwK-kaZ8FKWEURXxiT31VZ3kMKnThulncux3IC3QTEiCzguVtTM7VMTcMOVTUkrrPr8VumSfRRHtiZV1cZBHOwr-TG0hZztcEvCiSVIIJlQYI2ji4QTPQqQ3bg', rating: '4.8', time: '20-30 min' },
];


const UserHomeScreen = ({ onNavigateToCheckout, onNavigateToShop, onNavigateToProfile }: { onNavigateToCheckout?: () => void, onNavigateToShop?: (shop: any) => void, onNavigateToProfile?: () => void }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredFeaturedShops = featuredShops.filter(shop => 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredRestaurants = allRestaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderFeaturedShop = ({ item }: { item: typeof featuredShops[0] }) => (
        <TouchableOpacity style={styles.featuredShopContainer} onPress={() => onNavigateToShop?.(item)}>
            <ImageBackground source={{ uri: item.image }} style={styles.featuredShopImage} imageStyle={{ borderRadius: 12 }}>
                <View style={styles.featuredGradientOverlay}>
                    <Text style={styles.featuredShopName}>{item.name}</Text>
                    <View style={styles.shopItemInfo}>
                        <MaterialIcons name="star" size={16} color="#ffb400" />
                        <Text style={styles.featuredShopInfoText}>{item.rating} · {item.time}</Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );

    const renderAllRestaurants = ({ item }: { item: typeof allRestaurants[0] }) => (
        <TouchableOpacity style={styles.restaurantContainer} onPress={() => onNavigateToShop?.(item)}>
            <Image source={{ uri: item.image }} style={styles.restaurantImage} />
            <View style={styles.restaurantDetails}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <View style={styles.shopItemInfo}>
                    <MaterialIcons name="star" size={16} color="#ffb400" />
                    <Text style={styles.restaurantRating}>{item.rating}</Text>
                    <Text style={styles.restaurantTime}>· {item.time}</Text>
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
            <FlatList
                horizontal
                data={filteredFeaturedShops}
                renderItem={renderFeaturedShop}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredContainer}
            />

            <Text style={styles.sectionTitle}>All Restaurants</Text>
        </>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateToProfile}>
            <MaterialIcons name="person" size={24} color="#050301ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Own Store</Text>
          <TouchableOpacity onPress={onNavigateToCheckout}>
            <MaterialIcons name="shopping-cart" size={24} color="#050301ff" />
          </TouchableOpacity>
        </View>

        <FlatList
            data={filteredRestaurants}
            renderItem={renderAllRestaurants}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
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
});

export default UserHomeScreen;