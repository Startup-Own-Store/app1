import React, { useState } from 'react';
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
import supabase from '../../SupabaseClient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ✅ MODIFIED: Added AdminLogin to the type definition
export type RootStackParamList = {
  Login: undefined;
  OtpScreen: { phone: string; channel?: 'sms' | 'whatsapp' };
  VendorLogin: undefined;
  DeliveryLogin: undefined;
  AdminLogin: undefined; // <-- ADDED
  Main: undefined;
  CreateUser: { role: 'vendor' | 'delivery' };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const sendCode = async () => {
    if (phone.length !== 10) {
      return Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
    }
    if (loading) return;

    setLoading(true);
    const fullPhoneNumber = `+91${phone}`;

    // First try via SMS (default). On Twilio block (60238), fall back to WhatsApp if available.
    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhoneNumber,
      options: { channel: 'sms' },
    });

    if (error) {
      const message = error.message || '';
      const isTwilioBlocked = message.includes('60238') || message.toLowerCase().includes('twilio');

      if (isTwilioBlocked) {
        // Try WhatsApp as a fallback if Twilio SMS is blocked (requires WhatsApp sender configured in Twilio & Supabase).
        const { error: waError } = await supabase.auth.signInWithOtp({
          phone: fullPhoneNumber,
          options: { channel: 'whatsapp' },
        });

        if (!waError) {
          navigation.navigate('OtpScreen', { phone: fullPhoneNumber, channel: 'whatsapp' });
          setLoading(false);
          return;
        }

        Alert.alert(
          'Error sending code',
          'Your OTP request was blocked by Twilio (error 60238). This usually happens when the Twilio account is under review/limited or the destination is restricted. If this is your project, complete Twilio account verification (TrustHub/A2P) or contact Twilio Support.\n\nMore info: https://www.twilio.com/docs/errors/60238',
        );
      } else {
        Alert.alert('Error sending code', message);
      }
    } else {
      navigation.navigate('OtpScreen', { phone: fullPhoneNumber, channel: 'sms' });
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Own Store</Text>
            <Text style={styles.subtitle}>Enter your phone number to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#8a7260"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={[styles.continueButton, { opacity: loading ? 0.5 : 1 }]}
              onPress={sendCode}
              disabled={loading}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Sending...' : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Other Login Options</Text>
            {/* ✅ MODIFIED: Container for stacked buttons */}
            <View style={styles.footerButtonsContainer}>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => navigation.navigate('VendorLogin')}
              >
                <Text style={styles.footerButtonText}>Vendor Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => navigation.navigate('DeliveryLogin')}
              >
                <Text style={styles.footerButtonText}>Delivery Login</Text>
              </TouchableOpacity>
              {/* ✅ ADDED: Admin Login Button */}
              <TouchableOpacity
                style={styles.footerButton}
                onPress={() => navigation.navigate('AdminLogin')}
              >
                <Text style={styles.footerButtonText}>Admin Login</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  keyboardAvoidingContainer: { flex: 1 },
  container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#181411' },
  subtitle: { fontSize: 16, color: '#8a7260', marginTop: 8 },
  formContainer: {
    // This container can be used for the main form elements
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  countryCode: { fontSize: 16, fontWeight: '500', color: '#181411', marginRight: 8 },
  textInput: { flex: 1, height: '100%', fontSize: 16, color: '#181411' },
  continueButton: {
    backgroundColor: '#ec8627',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: { fontSize: 16, fontWeight: 'bold', color: '#181411' },
  footer: { alignItems: 'center', paddingBottom: 24 },
  footerText: { fontSize: 14, color: '#8a7260', marginBottom: 16 },
  // ✅ MODIFIED: Styles for the stacked buttons
  footerButtonsContainer: {
    width: '100%',
    alignItems: 'stretch', // Makes buttons take full width
  },
  footerButton: {
    backgroundColor: '#f5f2f0',
    paddingVertical: 14, // Increased padding to make buttons bigger
    paddingHorizontal: 16,
    borderRadius: 12, // Slightly larger radius
    marginBottom: 12, // Space between stacked buttons
  },
  footerButtonText: {
    fontSize: 14, // Slightly larger font
    fontWeight: 'bold',
    color: '#181411',
    textAlign: 'center', // Center the text
  },
});

export default LoginScreen;