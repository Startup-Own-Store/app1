import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import supabase from '../../SupabaseClient';

// Define navigation types
type RootStackParamList = {
  LoginEmail: undefined;
  SignupEmail: undefined;
  VendorLogin: undefined;
  DeliveryLogin: undefined;
  AdminLogin: undefined;
  MainUser: undefined;
};

type LoginEmailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LoginEmail'>;

const LoginEmailScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginEmailScreenNavigationProp>();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else if (data.user) {
        Alert.alert('Success', 'Logged in successfully!');
        // Navigation will be handled by App.tsx auth state listener
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Error', error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Own Store</Text>
            <Text style={styles.subtitle}>Sign in with your email</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8a7260"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#8a7260"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signupLink}
              onPress={() => navigation.navigate('SignupEmail')}
            >
              <Text style={styles.signupLinkText}>
                Don't have an account? <Text style={styles.signupLinkBold}>Sign Up</Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.loginOptions}>
              <Text style={styles.optionsTitle}>Other Login Options</Text>
              
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('VendorLogin')}
              >
                <Text style={styles.linkText}>Vendor Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('DeliveryLogin')}
              >
                <Text style={styles.linkText}>Delivery Partner Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => navigation.navigate('AdminLogin')}
              >
                <Text style={styles.linkText}>Admin Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#181411',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#8a7260',
  },
  inputContainer: {
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#181411',
  },
  button: {
    backgroundColor: '#ec8627',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#181411',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupLink: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  signupLinkText: {
    fontSize: 14,
    color: '#8a7260',
  },
  signupLinkBold: {
    fontWeight: 'bold',
    color: '#ec8627',
  },
  loginOptions: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  optionsTitle: {
    fontSize: 14,
    color: '#8a7260',
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: '#f5f2f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginVertical: 4,
  },
  linkText: {
    color: '#181411',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default LoginEmailScreen;
