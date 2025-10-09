 import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import supabase from '../../SupabaseClient';
import { useNavigation } from '@react-navigation/native';

const NameInputScreen: React.FC = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation();
  const [checking, setChecking] = useState(true);

  // Only show this screen if display_name is empty
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
        }
        const displayName = data?.user?.user_metadata?.display_name;
        if (displayName && String(displayName).trim().length > 0) {
          // User already has a display name; skip this screen
          navigation.navigate('MainUser' as never);
          return;
        }
      } catch (err) {
        console.error('Unexpected error while checking display name:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [navigation]);

  // Update the `Display name` column using Supabase Authentication API
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: name },
      });

      if (error) {
        console.error('Error updating name:', error);
        Alert.alert('Error', 'Failed to save name.');
        return;
      }

      Alert.alert('Success', 'Name saved successfully!');
      navigation.navigate('MainUser' as never);
    } catch (err) {
      console.error('Unexpected error:', err);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#ec8627" />
        </View>
      </SafeAreaView>
    );
  }

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
