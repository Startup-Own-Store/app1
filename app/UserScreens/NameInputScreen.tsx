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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const NameInputScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Save user data locally and navigate to main app
  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert('Error', 'Please enter your name.');
    }

    setLoading(true);
    try {
      // Save user data to AsyncStorage
      const userData = {
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('isLoggedIn', 'true');

      console.log('User data saved locally');
      
      // Navigate to main app - this will be handled by App.tsx state change
      // We'll trigger a re-render by using a callback or you can navigate directly
      // For now, we'll just set the flag and let App.tsx handle it
      
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter Your Name</Text>
        <Text style={styles.subtitle}>We'd love to know what to call you!</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor="#8a7260"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaf8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#181411',
  },
  subtitle: {
    fontSize: 16,
    color: '#8a7260',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#181411',
  },
  saveButton: {
    backgroundColor: '#ec8627',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 26,
    width: '100%',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default NameInputScreen;
