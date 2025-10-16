import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from '../../SupabaseClient';

const DeliveryLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Check if user is already logged in
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // User is already logged in, navigate directly to location permission
      navigation.navigate('LiveLocationPermission' as never);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter both email and password.");
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        Alert.alert("Sign In Error", error.message);
      } else {
        // Successfully logged in, navigate to location permission screen
        navigation.navigate('LiveLocationPermission' as never);
      }
    } catch (err: any) {
      Alert.alert("An Unexpected Error Occurred", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Delivery Login</Text>
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

          {/* Footer Spacer */}
          <View style={styles.footer} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles (Consistent with your theme) ---
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
  header: {
    alignItems: 'center',
    paddingTop: 60,
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
    // This is an empty view to push the content up,
    // creating a balanced layout.
    height: 100,
  },
});

export default DeliveryLoginScreen;