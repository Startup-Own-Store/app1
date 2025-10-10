import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import supabase from '../../SupabaseClient';
import { useNavigation } from '@react-navigation/native';

const NameInputScreen: React.FC = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation();

  // Update the `Display name` column using Supabase Authentication API
  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert('Error', 'Please enter your name.');
    }

    setLoading(true);
    try {
      const firebaseUser = FirebaseClient.getCurrentUser();
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }

      // Update user name in Supabase
      const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('firebase_uid', firebaseUser.uid);

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
      // Navigation will be handled by App.tsx auth state change
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#181411',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#181411',
  },
  saveButton: {
    backgroundColor: '#ec8627',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default NameInputScreen;
