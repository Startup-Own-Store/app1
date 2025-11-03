// app/AdminScreens/AdminDashboard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import supabase from '../../SupabaseClient';
import { RootStackParamList } from '../../App';

// ✅ Corrected: The navigation prop should be typed relative to its own screen name
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;

const AdminDashboard = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Logout Error', error.message);
      } else {
        Alert.alert('Success', 'Logged out successfully');
      }
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {/* ✅ Button to navigate to the specific vendor creation screen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateVendorUser')}
      >
        <Text style={styles.buttonText}>Create Vendor User</Text>
      </TouchableOpacity>
      {/* ✅ Button to navigate to the specific delivery creation screen */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateDeliveryUser')}
      >
        <Text style={styles.buttonText}>Create Delivery User</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminOrderDetails')}
      >
        <Text style={styles.buttonText}>Order Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminHireRequests')}
      >
        <Text style={styles.buttonText}>Hire Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5ff' },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
    button: {
        backgroundColor: '#2980b9',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    buttonText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
    logoutButton: { backgroundColor: '#c0392b', marginTop: 40 },
});

export default AdminDashboard;