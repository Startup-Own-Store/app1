import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIconsImport from 'react-native-vector-icons/MaterialIcons';
const MaterialIcons = MaterialIconsImport as any;

const ProfileScreen = ({ onBack, onTrackOrder }: { onBack?: () => void, onTrackOrder?: () => void }) => {
  const [userName, setUserName] = React.useState('');
  const [userPhone, setUserPhone] = React.useState('');

  const handleLogout = async () => {
    const { error } = await FirebaseClient.signOut();
    if (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const menuItems = [
    { id: '1', title: 'Track Your Order', icon: 'local-shipping', onPress: onTrackOrder },
    { id: '2', title: 'Order History', icon: 'history', onPress: () => {} },
    { id: '3', title: 'Delivery Address', icon: 'location-on', onPress: () => {} },
    { id: '4', title: 'Payment Methods', icon: 'payment', onPress: () => {} },
    { id: '5', title: 'Notifications', icon: 'notifications', onPress: () => {} },
    { id: '6', title: 'Help & Support', icon: 'help', onPress: () => {} },
    { id: '7', title: 'Settings', icon: 'settings', onPress: () => {} },
    { id: '8', title: 'Logout', icon: 'logout', onPress: handleLogout },
  ];

  // Fetch the `Display name` and phone number using Supabase Authentication API
  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = FirebaseClient.getCurrentUser();
        if (user) {
          setUserName(user.displayName || '');
          setUserPhone(user.phoneNumber || '');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#181113" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <MaterialIcons name="person" size={60} color="#8a7260" />
            </View>
            <Text style={styles.profileName}>{userName || 'Your Name'}</Text>
            <Text style={styles.profilePhone}>{userPhone || 'Your Phone'}</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
                <MaterialIcons name={item.icon} size={24} color="#181113" />
                <Text style={styles.menuItemText}>{item.title}</Text>
                <MaterialIcons name="chevron-right" size={24} color="#8a7260" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181113',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f2f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181113',
    marginBottom: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  profileEmail: {
    fontSize: 16,
    color: '#8a7260',
    marginBottom: 4,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  profilePhone: {
    fontSize: 16,
    color: '#8a7260',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  menuSection: {
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#181113',
    marginLeft: 16,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default ProfileScreen;