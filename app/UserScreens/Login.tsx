// // Login.tsx
// import React, { useState } from 'react';
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
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import supabase from '../../SupabaseClient';
// import * as WebBrowser from 'expo-web-browser';
// import { makeRedirectUri } from 'expo-auth-session';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// // ✅ Define your stack param list
// export type RootStackParamList = {
//   Login: undefined;
//   OtpScreen: undefined;
//   VendorLogin: undefined;
//   DeliveryLogin: undefined;
//   Main: undefined;
// };

// // ✅ Create a typed navigation prop for Login
// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// const LoginScreen = () => {
//   // ✅ Correctly typed navigation hook INSIDE the component
//   const navigation = useNavigation<NavigationProp>();
//   const [loading, setLoading] = useState(false);
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
//   const [codeSent, setCodeSent] = useState(false);

//   // This must match your app.json scheme
//   const redirectTo = makeRedirectUri({ scheme: 'ownstore' });

//   // ✅ Supabase Phone Auth (OTP) - Send Code
//   const sendCode = async () => {
//     if (phone.length !== 10) {
//       return Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
//     }

//     const fullPhoneNumber = `+91${phone}`;

//     const { error } = await supabase.auth.signInWithOtp({
//       phone: fullPhoneNumber,
//     });

//     if (error) {
//       Alert.alert('Error sending code', error.message);
//     } else {
//       Alert.alert('Success', 'Verification code sent to your phone!');
//       setCodeSent(true);

//       // ✅ Navigate after sending code
//       navigation.navigate('OtpScreen');
//     }
//   };

//   // ✅ Supabase Phone Auth (OTP) - Confirm Code
//   const confirmCode = async () => {
//     if (loading) { // Prevent function from running if it's already loading
//       return;
//     }
    
//     if (!code) {
//       return Alert.alert('Error', 'Please enter the verification code.');
//     }

//     setLoading(true); // Disable the button

//     try {
//       const fullPhoneNumber = `+91${phone}`;

//       const { error } = await supabase.auth.verifyOtp({
//         phone: fullPhoneNumber,
//         token: code,
//         type: 'sms',
//       });
//       if (error) {
//         Alert.alert('Error verifying code', error.message);
//       }
      
//       // On success, navigation is handled elsewhere
//     } catch (err) {
//       // Catch any unexpected network errors
//       Alert.alert('Error', 'An unexpected error occurred.');
//       console.error(err);
//     } finally {
//       setLoading(false); // Re-enable the button
//     }
//   };

//   // ✅ Supabase Google Auth
//   const signInWithGoogle = async () => {
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: { redirectTo },
//     });

//     if (error) {
//       Alert.alert('Google Sign-In Error', error.message);
//       return;
//     }

//     if (data.url) {
//       const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
//       if (result.type === 'dismiss' || result.type === 'cancel') {
//         Alert.alert('Authentication Cancelled', 'The sign-in process was not completed.');
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoidingContainer}
//       >
//         <View style={styles.container}>
//           {/* Header Section */}
//           <View style={styles.header}>
//             <Text style={styles.title}>Own Store</Text>
//             <Text style={styles.subtitle}>
//               {codeSent ? 'Enter the code we sent you' : 'Enter your phone number to continue'}
//             </Text>
//           </View>

//           {/* Form Section */}
//           <View style={styles.formContainer}>
//             {!codeSent ? (
//               <>
//                 {/* Phone Input */}
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.countryCode}>+91</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     value={phone}
//                     onChangeText={setPhone}
//                     placeholder="Enter your phone number"
//                     placeholderTextColor="#8a7260"
//                     keyboardType="phone-pad"
//                     maxLength={10}
//                   />
//                 </View>

//                 <TouchableOpacity style={styles.continueButton} onPress={sendCode}>
//                   <Text style={styles.continueButtonText}>Continue</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               <>
//                 {/* Code Input */}
//                 <View style={styles.inputContainer}>
//                   <TextInput
//                     style={styles.textInput}
//                     value={code}
//                     onChangeText={setCode}
//                     placeholder="Enter verification code"
//                     placeholderTextColor="#8a7260"
//                     keyboardType="number-pad"
//                   />
//                 </View>

//                 <TouchableOpacity
//                   style={[styles.continueButton, { opacity: loading ? 0.5 : 1 }]} // Example: lower opacity when disabled
//                   onPress={confirmCode}
//                   disabled={loading} // This is the important part
//                 >
//                   <Text style={styles.continueButtonText}>
//                     {loading ? 'Confirming...' : 'Confirm Code'}
//                   </Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={{ alignSelf: 'center', marginTop: 15 }}
//                   onPress={() => setCodeSent(false)}
//                 >
//                   <Text style={styles.subtitle}>Wrong number?</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {/* <View style={styles.separatorContainer}>
//               <View style={styles.separatorLine} />
//               <Text style={styles.separatorText}>or</Text>
//               <View style={styles.separatorLine} />
//             </View> */}

//             {/* <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
//               <FontAwesome name="google" size={20} color="#181411" />
//               <Text style={styles.googleButtonText}>Sign in with Google</Text>
//             </TouchableOpacity> */}
//           </View>

//           {/* Footer Section */}
//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Other Login Options</Text>
//             <View style={styles.footerButtonsContainer}>
//               <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('VendorLogin')}>
//                 <Text style={styles.footerButtonText}>Vendor Login</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('DeliveryLogin')}>
//                 <Text style={styles.footerButtonText}>Delivery Login</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fcfaf8',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   keyboardAvoidingContainer: { flex: 1 },
//   container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },
//   header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
//   title: { fontSize: 32, fontWeight: 'bold', color: '#181411' },
//   subtitle: { fontSize: 16, color: '#8a7260', marginTop: 8 },
//   formContainer: {},
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f5f2f0',
//     borderRadius: 12,
//     height: 56,
//     paddingHorizontal: 16,
//   },
//   countryCode: { fontSize: 16, fontWeight: '500', color: '#181411', marginRight: 8 },
//   textInput: { flex: 1, height: '100%', fontSize: 16, color: '#181411' },
//   continueButton: {
//     backgroundColor: '#ec8627',
//     height: 52,
//     borderRadius: 26,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   continueButtonText: { fontSize: 16, fontWeight: 'bold', color: '#181411' },
//   separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
//   separatorLine: { flex: 1, height: 1, backgroundColor: '#e8dbce' },
//   separatorText: { marginHorizontal: 16, color: '#8a7260', fontSize: 14 },
//   googleButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f5f2f0',
//     height: 52,
//     borderRadius: 26,
//     gap: 12,
//   },
//   googleButtonText: { fontSize: 16, fontWeight: 'bold', color: '#181411' },
//   footer: { alignItems: 'center', paddingBottom: 24 },
//   footerText: { fontSize: 14, color: '#8a7260', marginBottom: 16 },
//   footerButtonsContainer: { flexDirection: 'row', gap: 16 },
//   footerButton: {
//     backgroundColor: '#f5f2f0',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 16,
//   },
//   footerButtonText: { fontSize: 12, fontWeight: 'bold', color: '#181411' },
// });

// export default LoginScreen;


// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// // Login.tsx
// import React, { useState } from 'react';
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
// import supabase from '../../SupabaseClient';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// // ✅ STEP 1: Define that OtpScreen receives a 'phone' parameter
// export type RootStackParamList = {
//   Login: undefined;
//   OtpScreen: { phone: string }; // <-- This is a crucial change
//   VendorLogin: undefined;
//   DeliveryLogin: undefined;
//   Main: undefined;
// };

// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// const LoginScreen = () => {
//   const navigation = useNavigation<NavigationProp>();
//   const [loading, setLoading] = useState(false);
//   const [phone, setPhone] = useState('');

//   // ❌ REMOVED: 'code' and 'codeSent' states are no longer needed here.

//   const sendCode = async () => {
//     if (phone.length !== 10) {
//       return Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
//     }
//     if (loading) return;

//     setLoading(true);
//     const fullPhoneNumber = `+91${phone}`;

//     const { error } = await supabase.auth.signInWithOtp({
//       phone: fullPhoneNumber,
//     });

//     if (error) {
//       Alert.alert('Error sending code', error.message);
//     } else {
//       // Alert.alert('Success', 'Verification code sent to your phone!');
//       // ✅ STEP 2: Pass the phone number when navigating
//       navigation.navigate('OtpScreen', { phone: fullPhoneNumber });
//     }
//     setLoading(false);
//   };

//   // ❌ REMOVED: The 'confirmCode' function does not belong in this file.

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardAvoidingContainer}
//       >
//         <View style={styles.container}>
//           {/* Header Section */}
//           <View style={styles.header}>
//             <Text style={styles.title}>Own Store</Text>
//             <Text style={styles.subtitle}>Enter your phone number to continue</Text>
//           </View>

//           {/* Form Section */}
//           <View style={styles.formContainer}>
//             {/* ✅ SIMPLIFIED: UI is no longer conditional */}
//             <View style={styles.inputContainer}>
//               <Text style={styles.countryCode}>+91</Text>
//               <TextInput
//                 style={styles.textInput}
//                 value={phone}
//                 onChangeText={setPhone}
//                 placeholder="Enter your phone number"
//                 placeholderTextColor="#8a7260"
//                 keyboardType="phone-pad"
//                 maxLength={10}
//               />
//             </View>

//             <TouchableOpacity
//               style={[styles.continueButton, { opacity: loading ? 0.5 : 1 }]}
//               onPress={sendCode}
//               disabled={loading}
//             >
//               <Text style={styles.continueButtonText}>
//                 {loading ? 'Sending...' : 'Continue'}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Footer Section (unchanged) */}
//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Other Login Options</Text>
//             <View style={styles.footerButtonsContainer}>
//               <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('VendorLogin')}>
//                 <Text style={styles.footerButtonText}>Vendor Login</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('DeliveryLogin')}>
//                 <Text style={styles.footerButtonText}>Delivery Login</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// // --- Your styles remain unchanged ---
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#fcfaf8',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   keyboardAvoidingContainer: { flex: 1 },
//   container: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 24 },
//   header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
//   title: { fontSize: 32, fontWeight: 'bold', color: '#181411' },
//   subtitle: { fontSize: 16, color: '#8a7260', marginTop: 8 },
//   formContainer: {},
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f5f2f0',
//     borderRadius: 12,
//     height: 56,
//     paddingHorizontal: 16,
//   },
//   countryCode: { fontSize: 16, fontWeight: '500', color: '#181411', marginRight: 8 },
//   textInput: { flex: 1, height: '100%', fontSize: 16, color: '#181411' },
//   continueButton: {
//     backgroundColor: '#ec8627',
//     height: 52,
//     borderRadius: 26,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   continueButtonText: { fontSize: 16, fontWeight: 'bold', color: '#181411' },
//   separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
//   separatorLine: { flex: 1, height: 1, backgroundColor: '#e8dbce' },
//   separatorText: { marginHorizontal: 16, color: '#8a7260', fontSize: 14 },
//   googleButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f5f2f0',
//     height: 52,
//     borderRadius: 26,
//     gap: 12,
//   },
//   googleButtonText: { fontSize: 16, fontWeight: 'bold', color: '#181411' },
//   footer: { alignItems: 'center', paddingBottom: 24 },
//   footerText: { fontSize: 14, color: '#8a7260', marginBottom: 16 },
//   footerButtonsContainer: { flexDirection: 'row', gap: 16 },
//   footerButton: {
//     backgroundColor: '#f5f2f0',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 16,
//   },
//   footerButtonText: { fontSize: 12, fontWeight: 'bold', color: '#181411' },
// });

// export default LoginScreen;





// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform, // ✅ ADDED: To detect the operating system (iOS/Android)
  StatusBar,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import supabase from '../../SupabaseClient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';

// ... (RootStackParamList and NavigationProp types remain the same)
export type RootStackParamList = {
    Login: undefined;
    OtpScreen: { phone: string };
    VendorLogin: undefined;
    DeliveryLogin: undefined;
    AdminLogin: undefined;
    Main: undefined;
    CreateUser: { role: 'vendor' | 'delivery' };
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;


const colors = {
  background: '#FFFBF5',
  primary: '#DD6B20',
  primaryText: '#2D3748',
  secondaryText: '#718096',
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  white: '#FFFFFF',
  error: '#E53E3E',
};

const LoginScreen = () => {
    // ... (all the logic inside the component remains the same)
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState('');
    const [showOtherLogins, setShowOtherLogins] = useState(false);

    const sendCode = async () => {
        if (phone.length !== 10) {
            return Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
        }
        if (loading) return;

        setLoading(true);
        const fullPhoneNumber = `+91${phone}`;

        const { error } = await supabase.auth.signInWithOtp({
            phone: fullPhoneNumber,
        });

        if (error) {
            Alert.alert('Error Sending Code', error.message);
        } else {
            navigation.navigate('OtpScreen', { phone: fullPhoneNumber });
        }
        setLoading(false);
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandContainer}>
            <Text style={styles.brandName}>OWNSTORE</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Enter your phone number to sign in or sign up.</Text>
          </View>
          
          {/* Form and Footer sections remain the same */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Icon name="phone" size={20} color={colors.secondaryText} style={styles.inputIcon} />
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="98765 43210"
                placeholderTextColor={colors.secondaryText}
                keyboardType="phone-pad"
                maxLength={10}
                textContentType="telephoneNumber"
              />
            </View>

            <TouchableOpacity
              style={[styles.continueButton, { opacity: loading ? 0.8 : 1 }]}
              onPress={sendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.continueButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setShowOtherLogins(!showOtherLogins)}>
              <Text style={styles.footerToggleText}>
                {showOtherLogins ? 'Hide' : 'Other Login'}
              </Text>
            </TouchableOpacity>

            {showOtherLogins && (
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
                <TouchableOpacity
                  style={styles.footerButton}
                  onPress={() => navigation.navigate('AdminLogin')}
                >
                  <Text style={styles.footerButtonText}>Admin Login</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  brandName: {
    fontSize: 48,
    // ✅ MODIFIED: Use a platform-specific serif font for a classic, premium look
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: 'bold', // Re-add fontWeight as it works well with inbuilt fonts
    color: colors.primaryText,
    letterSpacing: 1.5, // Slightly increased spacing for elegance
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  // ... (the rest of the styles are unchanged)
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.primaryText,
  },
  continueButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerToggleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 24,
  },
  footerButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  footerButton: {
    backgroundColor: colors.inputBackground,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
  },
});

export default LoginScreen;