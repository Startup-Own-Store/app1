// app/AdminScreens/CreateDeliveryUser.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, SafeAreaView, Platform, StatusBar,
} from 'react-native';
import supabase from '../../SupabaseClient';

// Interface for the user data state object
interface DeliveryUserCreation {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

const CreateDeliveryUserScreen = () => {
  const [userData, setUserData] = useState<DeliveryUserCreation>({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    const { email, password } = userData;
    
    if (!email || !password) {
      return Alert.alert('Error', 'Email and password are required.');
    }

    setLoading(true);

    try {
      // Invoke the Edge Function to create the delivery user
      const { data, error } = await supabase.functions.invoke('create-delivery-user', {
        body: {
          ...userData,
          role: 'delivery' // Explicitly set the role
        }
      });

      if (error) throw error;

      // Success handling
      Alert.alert(
        'Success', 
        data.message || `Delivery user ${email} created successfully.`, // Use message from function
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (err: any) {
      // Error handling
      Alert.alert(
        'Creation Failed', 
        err.message || 'An unexpected error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserData({
      email: '',
      password: '',
      full_name: '',
      phone: ''
    });
  };

  // Reusable function to update the state object
  const updateUserData = (key: keyof DeliveryUserCreation, value: string) => {
    setUserData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Create New Delivery User</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Delivery User's Email" 
          value={userData.email} 
          onChangeText={(value) => updateUserData('email', value)}
          autoCapitalize="none" 
          keyboardType="email-address" 
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Set Temporary Password" 
          value={userData.password} 
          onChangeText={(value) => updateUserData('password', value)}
          secureTextEntry 
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Full Name (Optional)" 
          value={userData.full_name} 
          onChangeText={(value) => updateUserData('full_name', value)}
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Phone Number (Optional)" 
          value={userData.phone} 
          onChangeText={(value) => updateUserData('phone', value)}
          keyboardType="phone-pad"
        />
        
        <TouchableOpacity 
          style={[styles.button, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleCreateUser} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create Delivery User'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 30, 
    color: '#333' 
  },
  input: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  button: { 
    backgroundColor: '#27ae60', 
    padding: 15, 
    borderRadius: 10, 
    marginTop: 10 
  },
  buttonText: { 
    color: 'white', 
    textAlign: 'center', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
});

export default CreateDeliveryUserScreen;