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
import auth from '@react-native-firebase/auth';
import { syncFirebaseUserToSupabase } from '../utils/firebaseSupabaseSync';

const NameInputScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Update the display name in Firebase and sync to Supabase
  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert('Error', 'Please enter your name.');
    }

    setLoading(true);
    try {
      const firebaseUser = auth().currentUser;
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }

      // Update Firebase user profile
      await firebaseUser.updateProfile({
        displayName: name.trim(),
      });

      console.log('Display name updated in Firebase');

      // ✅ Sync updated user data to Supabase
      const { success, error: syncError } = await syncFirebaseUserToSupabase('user');

      if (!success) {
        console.warn('Failed to sync to Supabase:', syncError);
        // Don't block the user - they can still proceed
      } else {
        console.log('User profile synced to Supabase successfully');
      }

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
