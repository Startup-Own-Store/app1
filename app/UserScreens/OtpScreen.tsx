import React, { useState, useRef, useEffect } from 'react';
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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth, { PhoneAuthProvider } from '@react-native-firebase/auth';
import Home from '../UserScreens/home';
import { syncFirebaseUserToSupabase } from '../utils/firebaseSupabaseSync';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the RootStackParamList to match your App.tsx
type RootStackParamList = {
  Login: undefined;
  OtpScreen: { verificationId?: string; phoneNumber: string };
  VendorLogin: undefined;
  DeliveryLogin: undefined;
  AdminLogin: undefined;
};

type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpScreen'>;
type OtpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpScreen'>;

const OTPScreen = () => {
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();

  // Get parameters passed from Login screen - note the correct parameter names
  const { verificationId, phoneNumber } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [currentVerificationId, setCurrentVerificationId] = useState<string | null | undefined>(verificationId);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Effect to handle missing required parameters
  useEffect(() => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is required. Please try again.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
    if (!verificationId) {
      console.warn('No verificationId provided, user may need to resend OTP');
    }
  }, [verificationId, phoneNumber, navigation]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    // Auto-focus previous input on backspace
    if (text === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleConfirmCode = async () => {
    if (loading) return;
    
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      return Alert.alert('Error', 'Please enter the complete 6-digit code.');
    }
    
    setLoading(true);
    try {
      // Create credential using verificationId and OTP
      const credential = PhoneAuthProvider.credential(currentVerificationId, enteredOtp);
      
      // Sign in with the credential
      const userCredential = await auth().signInWithCredential(credential);
      
      console.log('User signed in successfully:', userCredential.user);
      
      // ✅ Sync Firebase user to Supabase
      console.log('Syncing user to Supabase...');
      const { success, error: syncError } = await syncFirebaseUserToSupabase('user');
      
      if (!success) {
        console.warn('Failed to sync user to Supabase:', syncError);
        // Don't block the user - they can still proceed
      } else {
        console.log('User successfully synced to Supabase');
      }
      
      // Success - navigation will be handled by your auth state listener in App.tsx
      Alert.alert('Success', 'Phone number verified successfully!');
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (error.code === 'auth/invalid-verification-id') {
        errorMessage = 'Invalid verification session. Please request a new code.';
      }
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      // Request new OTP using the phoneNumber
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      Alert.alert('Success', 'A new verification code has been sent.');
      
      // Update the current verification ID
      setCurrentVerificationId(confirmation.verificationId);
      
      // Reset OTP inputs and countdown
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      inputs.current[0]?.focus();
      
    } catch (error: any) {
      console.error('Resend OTP Error:', error);
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if phoneNumber is missing
  if (!phoneNumber) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.container}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {phoneNumber}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null
                  ]}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirmCode}
              disabled={loading || !currentVerificationId}
              style={[styles.continueButton, { 
                opacity: (loading || !currentVerificationId) ? 0.5 : 1 
              }]}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Text>
            </TouchableOpacity>

            {/* Show message if no verificationId */}
            {!currentVerificationId && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  Please request a new verification code to continue
                </Text>
              </View>
            )}

            {/* Resend Code */}
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={handleResendCode}
              disabled={countdown > 0 || loading}
            >
              <Text style={[styles.resendText, { 
                opacity: (countdown > 0 || loading) ? 0.5 : 1 
              }]}>
                {countdown > 0 
                  ? `Resend code in ${countdown}s` 
                  : 'Didn\'t receive code? Resend'
                }
              </Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>
                Change Phone Number
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />
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
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
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
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#f5f2f0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181411',
    borderWidth: 1,
    borderColor: '#e8dbce',
  },
  otpInputFilled: {
    borderColor: '#ec8627',
    backgroundColor: '#fff9f5',
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
  warningContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#d9534f',
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#8a7260',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 14,
    color: '#ec8627',
    fontWeight: '500',
  },
});

export default OTPScreen;