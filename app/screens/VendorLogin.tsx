import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import supabase from '../../SupabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';

const VendorLoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter both email and password.");
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return Alert.alert("Sign In Error", error.message);
      }

      const user = data?.user;
      if (!user) {
        return Alert.alert("Sign In Error", "No user returned from sign in.");
      }

      // Check vendor profile and navigate accordingly
      const profileComplete = await checkVendorProfile(user.id);
      if (profileComplete) {
        navigation.navigate('VendorHome' as never);
      } else {
        navigation.navigate('VendorProfile' as never);
      }
    } catch (err: any) {
      Alert.alert("An Unexpected Error Occurred", err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkVendorProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('profile_completed, address_verified')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error checking vendor profile:', error);
      return false;
    }

    return data?.profile_completed && data?.address_verified;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.container}>
          {/* App Bar with Back Button */}
          <View style={styles.appBar}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#181411" />
            </TouchableOpacity>
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Vendor Login</Text>
            <Text style={styles.subtitle}>Enter your credentials to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#8a7260"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.inputContainer, { marginTop: 16 }]}>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#8a7260"
                secureTextEntry
              />
            </View>
            <TouchableOpacity 
              style={[styles.continueButton, { opacity: loading ? 0.7 : 1 }]} 
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Spacer - keeps the form centered */}
          <View style={styles.footer} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaf8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181411',
  },
  placeholder: {
    width: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#181411',
  },
  subtitle: {
    fontSize: 16,
    color: '#8a7260',
    marginTop: 8,
  },
  formContainer: {},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#181411',
  },
  continueButton: {
    backgroundColor: '#ec8627',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181411',
  },
  footer: {
    height: 100,
  },
});

export default VendorLoginScreen;