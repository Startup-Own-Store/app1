// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   TextInput,
//   Platform,
//   StatusBar,
//   KeyboardAvoidingView,
//   Alert,
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import supabase from '../../SupabaseClient';
// import { useRoute, RouteProp } from '@react-navigation/native';

// type RootStackParamList = {
//   OtpScreen: { phone: string };
// };

// type OtpScreenRouteProp = RouteProp<RootStackParamList, 'OtpScreen'>;

// const OTPScreen = () => {
//     const route = useRoute<OtpScreenRouteProp>();
//     const { phone } = route.params;
//     const [otp, setOtp] = useState(['', '', '', '', '', '']);
//     const inputs = useRef<Array<TextInput | null>>([]);
//     const [loading, setLoading] = useState(false);
//     const handleOtpChange = (text: string, index: number) => {
//         const newOtp = [...otp];
//         newOtp[index] = text;
//         setOtp(newOtp);

//         // Move to the next input box automatically
//         if (text && index < 5) {
//             inputs.current[index + 1]?.focus();
//         }
//     };
    
//     const handleKeyPress = (e: any, index: number) => {
//         // Move to the previous input box on backspace if the current one is empty
//         if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
//             inputs.current[index - 1]?.focus();
//         }
//     };

//     const handleConfirmCode = async () => {
//         if (loading) {
//         return;
//         }

//         const enteredOtp = otp.join('');
//         if (enteredOtp.length !== 6) {
//         return Alert.alert("Error", "Please enter the complete 6-digit code.");
//         }

//         setLoading(true);

//         try {
//         // 1. Create a clean object with ONLY the required properties.
//         const verificationPayload = {
//             phone: phone, // The phone number passed from the previous screen
//             token: enteredOtp,
//             type: 'sms' as const,
//         };

//         // 2. (Crucial for Debugging) Log the object to see exactly what you're sending.
//         console.log('Sending to Supabase verifyOtp:', JSON.stringify(verificationPayload, null, 2));

//         // 3. Pass the clean object to the function.
//         const { data, error } = await supabase.auth.verifyOtp(verificationPayload);

//         if (error) {
//             Alert.alert("Verification Failed", error.message);
//         }
//         // If successful, the onAuthStateChange listener will handle navigation.

//         } catch (err) {
//         Alert.alert("An Unexpected Error Occurred", "Please try again.");
//         console.error("OTP Confirmation Error:", err);
//         } finally {
//         setLoading(false);
//         }
//     };

//     const handleResendCode = () => {
//         console.log('Resending code...');
//         // Add resend code logic here
//         Alert.alert("Code Sent", "A new verification code has been sent.");
//     };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//         <KeyboardAvoidingView 
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//             style={styles.container}
//         >
//             <View style={styles.container}>
//                 {/* Header Section */}
//                 <View style={styles.header}>
//                     <Text style={styles.title}>Verify Your Number</Text>
//                     <Text style={styles.subtitle}>
//                         Enter the 6-digit code sent to your phone.
//                     </Text>
//                 </View>

//                 {/* Form Section */}
//                 <View style={styles.formContainer}>
//                     <View style={styles.otpContainer}>
//                         {otp.map((digit, index) => (
//                             <TextInput
//                                 key={index}
//                                 ref={ref => { inputs.current[index] = ref; }}
//                                 style={styles.otpInput}
//                                 value={digit}
//                                 onChangeText={(text) => handleOtpChange(text, index)}
//                                 onKeyPress={(e) => handleKeyPress(e, index)}
//                                 keyboardType="number-pad"
//                                 maxLength={1}
//                             />
//                         ))}
//                     </View>
//                     <TouchableOpacity
//                         onPress={handleConfirmCode}
//                         disabled={loading}
//                         style={[styles.continueButton, { opacity: loading ? 0.5 : 1 }]}
//                         >
//                         <Text style={styles.continueButtonText}>
//                             {loading ? 'Verifying...' : 'Confirm Code'}
//                         </Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.resendContainer} onPress={handleResendCode}>
//                         <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
//                     </TouchableOpacity>
//                 </View>
                
//                 {/* Spacer to push content up */}
//                 <View style={{flex: 1}} />

//             </View>
//         </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fcfaf8',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//       alignItems: 'center',
//       paddingTop: 60,
//       paddingBottom: 40,
//       paddingHorizontal: 24,
//   },
//   title: {
//       fontSize: 32,
//       fontWeight: 'bold',
//       color: '#181411',
//       fontFamily: "'Plus Jakarta Sans', sans-serif",
//   },
//   subtitle: {
//       fontSize: 16,
//       color: '#8a7260',
//       marginTop: 8,
//       textAlign: 'center',
//       fontFamily: "'Plus Jakarta Sans', sans-serif",
//   },
//   formContainer: {
//       paddingHorizontal: 24,
//   },
//   otpContainer: {
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       marginBottom: 20,
//   },
//   otpInput: {
//       width: 48,
//       height: 56,
//       backgroundColor: '#f5f2f0',
//       borderRadius: 12,
//       textAlign: 'center',
//       fontSize: 20,
//       fontWeight: 'bold',
//       color: '#181411',
//       borderWidth: 1,
//       borderColor: '#e8dbce',
//   },
//   continueButton: {
//       backgroundColor: '#ec8627',
//       height: 52,
//       borderRadius: 26,
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginTop: 20,
//   },
//   continueButtonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: '#181411',
//       fontFamily: "'Plus Jakarta Sans', sans-serif",
//   },
//   resendContainer: {
//       alignItems: 'center',
//       marginTop: 24,
//   },
//   resendText: {
//       fontSize: 14,
//       color: '#8a7260',
//       fontFamily: "'Plus Jakarta Sans', sans-serif",
//   },
// });

// export default OTPScreen;




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
      }
      // On success, onAuthStateChange listener in App.tsx handles navigation
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