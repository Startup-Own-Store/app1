// app/AdminScreens/CreateDeliveryUser.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, SafeAreaView, Platform, StatusBar, ScrollView,
} from 'react-native';
import supabase from '../../SupabaseClient';

const CreateDeliveryUserScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Email and password are required.');
    }
    setLoading(true);

    try {
      // ✅ CHANGED: Call the edge function for delivery user creation
      const { data, error } = await supabase.functions.invoke('quick-handler', {
        body: {
          email,
          password,
          full_name: fullName,
          phone,
          role: 'delivery', // Changed role to 'delivery'
        },
      });

      if (error) {
        Alert.alert('Creation Failed', error.message);
      } else {
        Alert.alert('Success!', data.message);
        // Clear the form
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
      }
    } catch (err: any) {
      Alert.alert('An Unexpected Error Occurred', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create New Delivery User</Text>

        <Text style={styles.label}>Email Address (Required)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="delivery@example.com" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none" 
          keyboardType="email-address" 
        />
        
        <Text style={styles.label}>Temporary Password (Required)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Min. 8 characters" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />
        
        <Text style={styles.label}>Full Name (Optional)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="John Doe" 
          value={fullName} 
          onChangeText={setFullName} 
        />

        <Text style={styles.label}>Phone Number (Optional)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="+91..." 
          value={phone} 
          onChangeText={setPhone} 
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
      </ScrollView>
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
  label: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 5, 
    marginLeft: 5 
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