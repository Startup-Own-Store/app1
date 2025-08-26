// OTPScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ✅ Import your central navigation types from App.tsx
import { RootStackParamList } from '../../App';

// Define the specific types for this screen's route and navigation
type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpScreen'>;
type OtpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OtpScreen'>;

const OTPScreen = () => {
  // ✅ Correctly typed navigation hooks
  const navigation = useNavigation<OtpScreenNavigationProp>();
  const route = useRoute<OtpScreenRouteProp>();

  const phone = route.params?.phone;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

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

  // Effect to handle missing phone number
  useEffect(() => {
    if (!phone) {
      Alert.alert('Error', 'Something went wrong. Please try again.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [phone, navigation]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
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
      const { error } = await supabase.auth.verifyOtp({
        phone: phone!,
        token: enteredOtp,
        type: 'sms',
      });
      if (error) {
        Alert.alert('Verification Failed', error.message);
        return;
      }

      // Update raw_user_meta_data with role "user"
      const { data: user, error: userError } = await supabase.auth.updateUser({
        data: {
          role: 'user',
        },
      });

      if (userError) {
        Alert.alert('Error', 'Failed to update user role.');
        return;
      }

      // Navigate to Home.tsx
      navigation.navigate('MainUser');
    } catch (err) {
      Alert.alert('An Unexpected Error Occurred', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: phone! });
    if (error) {
      Alert.alert('Error', 'Failed to resend code.');
    } else {
      Alert.alert('Success', 'A new code has been sent.');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      // ✅ Improved UX: Focus on the first input
      inputs.current[0]?.focus();
    }
    setLoading(false);
  };

  if (!phone) {
    return null; // Render nothing while navigating back
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Number</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your phone.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={handleConfirmCode}
              disabled={loading}
              style={[styles.continueButton, { opacity: loading ? 0.5 : 1 }]}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Verifying...' : 'Confirm Code'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={handleResendCode}
              disabled={countdown > 0}
            >
              <Text style={[styles.resendText, { opacity: countdown > 0 ? 0.5 : 1 }]}>
                Didn't receive the code? {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
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
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#8a7260',
  },
});

export default OTPScreen;