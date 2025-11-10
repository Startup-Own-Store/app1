import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'NameInput'>>();

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name before continuing.');
      return;
    }

    setSaving(true);
    try {
      const storedSessionRaw = await AsyncStorage.getItem('userSession');
      let session: Record<string, unknown> = {};

      if (storedSessionRaw) {
        try {
          const parsed = JSON.parse(storedSessionRaw);
          if (parsed && typeof parsed === 'object') {
            session = parsed;
          }
        } catch (parseError) {
          console.warn('Unable to parse stored session, resetting it.', parseError);
        }
      }

      if (!session.id) {
        session.id = `local-${Date.now()}`;
      }

      const timestamp = new Date().toISOString();
      if (!session.createdAt) {
        session.createdAt = timestamp;
      }

      session.name = trimmed;
      session.updatedAt = timestamp;

      await AsyncStorage.multiSet([
        ['userName', trimmed],
        ['userSession', JSON.stringify(session)],
      ]);
      await AsyncStorage.setItem('guestOnboarded', 'true');

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (storageError) {
      console.error('Failed to persist session', storageError);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter Your Name</Text>
        <Text style={styles.subtitle}>We only ask once—future changes live in your profile.</Text>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor="#8a7260"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (error) {
              setError(null);
            }
          }}
          autoFocus
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.saveButton, (!name.trim() || saving) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || !name.trim()}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Continue'}</Text>
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
  errorText: {
    color: '#00796B',
    alignSelf: 'flex-start',
    marginBottom: 16,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#00796B',
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
