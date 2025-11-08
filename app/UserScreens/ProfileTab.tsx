import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../App';
import { getOrCreateGuestUserId } from '../utils/guestUser';

interface StoredSession {
  id?: string;
  name?: string;
  phone?: string;
  updatedAt?: string;
  createdAt?: string;
}

const ProfileTabScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogVariant, setDialogVariant] = useState<'success' | 'error' | 'info'>('success');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('userSession');
        if (stored) {
          const parsed: StoredSession = JSON.parse(stored);
          const baseSession = parsed && typeof parsed === 'object' ? parsed : {};
          if (baseSession.name) {
            setName(baseSession.name);
          }
          if (baseSession.updatedAt) {
            setLastUpdated(baseSession.updatedAt);
          }
        }
      } catch (error) {
        console.error('Failed to load stored session', error);
      }
    };

    loadSession();
  }, []);

  const showDialog = (title: string, message: string, variant: 'success' | 'error' | 'info') => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVariant(variant);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showDialog('Missing name', 'Please enter a name before saving.', 'error');
      return;
    }

    setSaving(true);

    try {
      const stored = await AsyncStorage.getItem('userSession');
      const parsedSession: StoredSession = stored ? JSON.parse(stored) : {};
      const session = (parsedSession && typeof parsedSession === 'object') ? { ...parsedSession } : {};

      const remoteUserId = await getOrCreateGuestUserId({
        currentId: session.id,
        name: trimmed,
        phone: session.phone,
      });

      session.id = remoteUserId;

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

      setLastUpdated(timestamp);
      showDialog('Saved', 'Your profile has been updated.', 'success');
    } catch (error) {
      console.error('Failed to update profile', error);
      showDialog('Error', 'Unable to save your profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Profile</Text>
        <Text style={styles.subheader}>
          Update how we address you.
        </Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#9c9c9c"
          autoCapitalize="words"
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>

        {lastUpdated ? (
          <Text style={styles.updatedAt}>
            Last updated on {new Date(lastUpdated).toLocaleString()}
          </Text>
        ) : null}

        <View style={styles.sectionDivider} />

        <TouchableOpacity
          style={styles.supportRow}
          onPress={() => navigation.navigate('HelpSupport')}
          accessibilityRole="button"
        >
          <View style={styles.supportIconWrapper}>
            <Ionicons name="information-circle" size={20} color="#667085" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>Help &amp; Support</Text>
            <Text style={styles.supportSubtitle}>View terms and contact options</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>App version: v1.0</Text>
      </View>

      <Modal
        visible={dialogVisible}
        animationType="fade"
        transparent
        onRequestClose={closeDialog}
      >
        <View style={styles.dialogOverlay}>
          <View
            style={[
              styles.dialogCard,
              dialogVariant === 'success'
                ? styles.dialogSuccess
                : dialogVariant === 'error'
                ? styles.dialogError
                : styles.dialogInfo,
            ]}
          >
            <Text style={styles.dialogTitle}>{dialogTitle}</Text>
            <Text style={styles.dialogMessage}>{dialogMessage}</Text>
            <TouchableOpacity style={styles.dialogButton} onPress={closeDialog} accessibilityRole="button">
              <Text style={styles.dialogButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 0,
  },
  container: {
    padding: 24,
    paddingBottom: 96,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 8,
    paddingTop: (StatusBar.currentHeight ?? 0) * 0.4,
    marginTop: 0,
  },
  subheader: {
    fontSize: 15,
    color: '#6f6f6f',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#00796B',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  updatedAt: {
    marginTop: 12,
    color: '#6f6f6f',
    fontSize: 13,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1f1f',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 24,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#ebeef2',
  },
  supportIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  supportSubtitle: {
    fontSize: 13,
    color: '#667085',
    marginTop: 2,
  },
  versionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: '#98A2B3',
    textAlign: 'center',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  dialogSuccess: {
    borderLeftWidth: 6,
    borderLeftColor: '#00796B',
  },
  dialogError: {
    borderLeftWidth: 6,
    borderLeftColor: '#c0392b',
  },
  dialogInfo: {
    borderLeftWidth: 6,
    borderLeftColor: '#ec8627',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#181411',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 15,
    color: '#4a4a4a',
    marginBottom: 20,
    lineHeight: 21,
  },
  dialogButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#00796B',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
  },
  dialogButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default ProfileTabScreen;
