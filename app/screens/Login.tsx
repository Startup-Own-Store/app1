// // import React, { useState, useEffect, useRef } from 'react';
// // import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
// // import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// // import {
// //   signInWithEmailAndPassword,
// //   createUserWithEmailAndPassword,
// //   signInWithCredential,
// //   GoogleAuthProvider,
// //   signInWithPhoneNumber,
// //   PhoneAuthProvider,
// // } from 'firebase/auth';
// // import { auth } from '../../FirebaseConfig';

// // const Login = () => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [phone, setPhone] = useState('');
// //   const [verificationId, setVerificationId] = useState('');
// //   const recaptchaVerifier = useRef(null);

// //   useEffect(() => {
// //     // Configure Google Sign-In
// //     GoogleSignin.configure({
// //       webClientId: '1054963152708-f18tik1hb0upf6d0ijhh2p7kki9fitac.apps.googleusercontent.com', // This should match the web client ID from google-services.json
// //       offlineAccess: true,
// //     });
// //   }, []);

// //   const onGoogleButtonPress = async () => {
// //     try {
// //       console.log('Starting Google Sign-In process...');
      
// //       // Check if your device supports Google Play
// //       await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
// //       console.log('Google Play Services check passed');
      
// //       // Get the users ID token
// //       const result = await GoogleSignin.signIn();
// //       console.log('Google Sign-In result:', result);
      
// //       const idToken = (result as any).idToken;
// //       console.log('ID Token received:', idToken ? 'Yes' : 'No');

// //       if (!idToken) {
// //         throw new Error("Google Sign-In failed: idToken is null");
// //       }

// //       // Create a Google credential with the token
// //       const googleCredential = GoogleAuthProvider.credential(idToken);
// //       console.log('Google credential created successfully');

// //       // Sign-in the user with the credential
// //       await signInWithCredential(auth, googleCredential);
// //       console.log('Google sign-in successful!');
// //       Alert.alert('Success', 'Google Sign-In successful!');
// //     } catch (error: any) {
// //       console.error('Google Sign-In Error Details:', error);
      
// //       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
// //         Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
// //       } else if (error.code === statusCodes.IN_PROGRESS) {
// //         Alert.alert('In Progress', 'Google Sign-In already in progress.');
// //       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
// //         Alert.alert('Error', 'Play Services not available or outdated.');
// //       } else {
// //         Alert.alert('Google Sign In Error', error?.message || 'An unknown error occurred.');
// //       }
// //     }
// //   };

// //   const handleEmailSignIn = async () => {
// //     if (!email || !password) return Alert.alert('Error', 'Please enter both email and password.');
// //     try {
// //       await signInWithEmailAndPassword(auth, email, password);
// //       console.log('User signed in with email!');
// //       Alert.alert('Success', 'Email sign-in successful!');
// //     } catch (error) {
// //       const errorMessage = error instanceof Error ? error.message : String(error);
// //       Alert.alert('Sign In Error', errorMessage);
// //     }
// //   };

// //   const handleEmailSignUp = async () => {
// //     if (!email || !password) return Alert.alert('Error', 'Please enter both email and password.');
// //     try {
// //       await createUserWithEmailAndPassword(auth, email, password);
// //       console.log('User account created!');
// //       Alert.alert('Success', 'Account created successfully!');
// //     } catch (error) {
// //       const errorMessage = error instanceof Error ? error.message : String(error);
// //       Alert.alert('Sign Up Error', errorMessage);
// //     }
// //   };

// //   const sendCode = async () => {
// //     try {
// //       const provider = new PhoneAuthProvider(auth);
// //       const verificationId = await provider.verifyPhoneNumber(phone, recaptchaVerifier.current!);
// //       setVerificationId(verificationId);
// //       Alert.alert('Verification code sent');
// //     } catch (err) {
// //       console.error(err);
// //       Alert.alert('Error', 'Failed to send verification code');
// //     }
// //   };

// //   const confirmCode = async () => {
// //     try {
// //       const credential = PhoneAuthProvider.credential(verificationId, '123456'); // Replace with actual code input
// //       await signInWithCredential(auth, credential);
// //       Alert.alert('Phone authentication successful!');
// //     } catch (err) {
// //       Alert.alert('Invalid code.');
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Login</Text>

// //       {/* Email/Password */}
// //       <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
// //       <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

// //       <View style={styles.buttonContainer}>
// //         <Button title="Sign In" onPress={handleEmailSignIn} />
// //         <Button title="Sign Up" onPress={handleEmailSignUp} />
// //       </View>

// //       {/* Phone */}
// //       <TextInput style={styles.input} placeholder="Phone Number (e.g. +91 9876543210)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
// //       <Button title="Send Code" onPress={sendCode} />
// //       <Button title="Confirm Code" onPress={confirmCode} />

// //       {/* Google Sign-In */}
// //       <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
// //         <Text style={styles.googleButtonText}>Sign in with Google</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
// //   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
// //   input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8, borderRadius: 5, backgroundColor: 'white' },
// //   buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
// //   googleButton: { backgroundColor: '#4285F4', padding: 10, borderRadius: 5, marginTop: 20, alignItems: 'center' },
// //   googleButtonText: { color: 'white', fontWeight: 'bold' },
// // });

// // export default Login;



// // import React, { useState, useRef } from "react";
// // import {
// //   View,
// //   Text,
// //   TextInput,
// //   Button,
// //   StyleSheet,
// //   Alert,
// //   TouchableOpacity,
// // } from "react-native";
// // import {
// //   signInWithEmailAndPassword,
// //   createUserWithEmailAndPassword,
// //   signInWithCredential,
// //   GoogleAuthProvider,
// //   PhoneAuthProvider,
// //   RecaptchaVerifier,
// // } from "firebase/auth";
// // import { auth } from "../../FirebaseConfig";
// // import * as WebBrowser from "expo-web-browser";
// // import * as Google from "expo-auth-session/providers/google";
// // import { makeRedirectUri } from 'expo-auth-session';

// // const redirectUri = makeRedirectUri();
// // WebBrowser.maybeCompleteAuthSession();

// // const Login = () => {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [phone, setPhone] = useState("");
// //   const [verificationId, setVerificationId] = useState("");
// //   const [code, setCode] = useState(""); // <-- Add this line
// //   const recaptchaVerifier = useRef<any>(null);

// //   // ✅ Expo Google Auth
// //   const [request, response, promptAsync] = Google.useAuthRequest({
// //   clientId: "1054963152708-f18tik1hb0upf6d0ijhh2p7kki9fitac.apps.googleusercontent.com", // Web client for Expo Go
// //   androidClientId: "1054963152708-2078omssn8f9tc35nrk53jj3n7g3qq4j.apps.googleusercontent.com", // NEW Android client for com.ajay.ownstoredemo
// //   redirectUri: redirectUri
// // });
  
// //   React.useEffect(() => {
// //     if (response?.type === "success") {
// //       const { authentication } = response;
// //       if (authentication?.idToken) {
// //         const credential = GoogleAuthProvider.credential(
// //           authentication.idToken
// //         );
// //         signInWithCredential(auth, credential)
// //           .then(() => {
// //             Alert.alert("Success", "Google Sign-In successful!");
// //           })
// //           .catch((err) => {
// //             Alert.alert("Error", err.message);
// //           });
// //       }
// //     }
// //   }, [response]);

// //   // ✅ Email/Password login
// //   const handleEmailSignIn = async () => {
// //     if (!email || !password)
// //       return Alert.alert("Error", "Please enter both email and password.");
// //     try {
// //       await signInWithEmailAndPassword(auth, email, password);
// //       Alert.alert("Success", "Email sign-in successful!");
// //     } catch (error: any) {
// //       Alert.alert("Sign In Error", error.message);
// //     }
// //   };

// //   const handleEmailSignUp = async () => {
// //     if (!email || !password)
// //       return Alert.alert("Error", "Please enter both email and password.");
// //     try {
// //       await createUserWithEmailAndPassword(auth, email, password);
// //       Alert.alert("Success", "Account created successfully!");
// //     } catch (error: any) {
// //       Alert.alert("Sign Up Error", error.message);
// //     }
// //   };

// //   // ✅ Phone Auth with reCAPTCHA
// //   const sendCode = async () => {
// //     try {
// //       const provider = new PhoneAuthProvider(auth);

// //       // Only pass the phone number (no recaptchaVerifier)
// //       const verificationId = await provider.verifyPhoneNumber(phone);

// //       setVerificationId(verificationId);
// //       Alert.alert("Verification code sent!");
// //     } catch (err: any) {
// //       Alert.alert("Error", err.message);
// //     }
// //   };

// //   const confirmCode = async () => {
// //     try {
// //       const credential = PhoneAuthProvider.credential(verificationId, code);
// //       await signInWithCredential(auth, credential);
// //       Alert.alert("Phone authentication successful!");
// //     } catch (err: any) {
// //       Alert.alert("Invalid code");
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <Text style={styles.title}>Login</Text>

// //       {/* Email/Password */}
// //       <TextInput
// //         style={styles.input}
// //         placeholder="Email"
// //         value={email}
// //         onChangeText={setEmail}
// //         keyboardType="email-address"
// //         autoCapitalize="none"
// //       />
// //       <TextInput
// //         style={styles.input}
// //         placeholder="Password"
// //         value={password}
// //         onChangeText={setPassword}
// //         secureTextEntry
// //       />

// //       <View style={styles.buttonContainer}>
// //         <Button title="Sign In" onPress={handleEmailSignIn} />
// //         <Button title="Sign Up" onPress={handleEmailSignUp} />
// //       </View>
// //       {/* Phone */}
// //       <TextInput
// //         style={styles.input}
// //         placeholder="Phone Number (e.g. +91 9876543210)"
// //         value={phone}
// //         onChangeText={setPhone}
// //         keyboardType="phone-pad"
// //       />
// //       <Button title="Send Code" onPress={sendCode} />
// //       <TextInput
// //         style={styles.input}
// //         placeholder="Verification Code"
// //         value={code}
// //         onChangeText={setCode}
// //         keyboardType="number-pad"
// //       />
// //       <Button title="Confirm Code" onPress={confirmCode} />
// //       <Button title="Confirm Code" onPress={confirmCode} />

// //       {/* Google Sign-In */}
// //       <TouchableOpacity
// //         style={styles.googleButton}
// //         disabled={!request}
// //         onPress={() => promptAsync()}
// //       >
// //         <Text style={styles.googleButtonText}>Sign in with Google</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: "center",
// //     padding: 20,
// //     backgroundColor: "#f5f5f5",
// //   },
// //   title: {
// //     fontSize: 24,
// //     fontWeight: "bold",
// //     marginBottom: 20,
// //     textAlign: "center",
// //   },
// //   input: {
// //     height: 40,
// //     borderColor: "gray",
// //     borderWidth: 1,
// //     marginBottom: 12,
// //     paddingHorizontal: 8,
// //     borderRadius: 5,
// //     backgroundColor: "white",
// //   },
// //   buttonContainer: {
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     marginBottom: 20,
// //   },
// //   googleButton: {
// //     backgroundColor: "#4285F4",
// //     padding: 10,
// //     borderRadius: 5,
// //     marginTop: 20,
// //     alignItems: "center",
// //   },
// //   googleButtonText: { color: "white", fontWeight: "bold" },
// // });

// // export default Login;

















// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
// } from "react-native";
// import supabase from "../../SupabaseClient";
// import * as WebBrowser from "expo-web-browser";
// import { makeRedirectUri } from 'expo-auth-session';

// // This is the deep link that Supabase will redirect to after Google login.
// // It MUST match the scheme you configured in your app.json.
// const redirectTo = makeRedirectUri({
//   scheme: 'ownstore',
// });

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [phone, setPhone] = useState("");
//   const [code, setCode] = useState(""); // For OTP

//   // ✅ Supabase Email/Password login
//   const handleEmailSignIn = async () => {
//     if (!email || !password)
//       return Alert.alert("Error", "Please enter both email and password.");
    
//     const { error } = await supabase.auth.signInWithPassword({
//       email: email,
//       password: password,
//     });

//     if (error) Alert.alert("Sign In Error", error.message);
//     // If successful, the onAuthStateChange listener in App.js will handle navigation.
//   };

//   const handleEmailSignUp = async () => {
//     if (!email || !password)
//       return Alert.alert("Error", "Please enter both email and password.");

//     const { error } = await supabase.auth.signUp({
//       email: email,
//       password: password,
//     });

//     if (error) Alert.alert("Sign Up Error", error.message);
//     else Alert.alert("Success", "Account created! Please check your email to verify.");
//   };

//   // ✅ Supabase Phone Auth (OTP)
//   const sendCode = async () => {
//     if (!phone) return Alert.alert("Error", "Please enter a phone number.");

//     const { error } = await supabase.auth.signInWithOtp({
//       phone: phone,
//     });

//     if (error) Alert.alert("Error sending code", error.message);
//     else Alert.alert("Success", "Verification code sent to your phone!");
//   };

//   const confirmCode = async () => {
//     if (!phone || !code) return Alert.alert("Error", "Please enter phone and code.");

//     const { error } = await supabase.auth.verifyOtp({
//       phone: phone,
//       token: code,
//       type: 'sms',
//     });

//     if (error) Alert.alert("Error verifying code", error.message);
//     // If successful, onAuthStateChange listener in App.js will handle navigation.
//   };

//   // ✅ Supabase Google Auth
//   const signInWithGoogle = async () => {
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo,
//       },
//     });

//     if (error) {
//       Alert.alert('Error', error.message);
//       return;
//     }

//     if (data.url) {
//       const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
//       // Supabase client handles the session when the user is redirected back.
//       if (result.type === 'dismiss' || result.type === 'cancel') {
//         Alert.alert(
//           'Authentication Cancelled', 
//           'The sign-in process was not completed.'
//         );
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>

//       {/* Email/Password */}
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />
//       <View style={styles.buttonContainer}>
//         <Button title="Sign In" onPress={handleEmailSignIn} />
//         <Button title="Sign Up" onPress={handleEmailSignUp} />
//       </View>

//       {/* Phone */}
//       <TextInput
//         style={styles.input}
//         placeholder="Phone Number (e.g. +91 9876543210)"
//         value={phone}
//         onChangeText={setPhone}
//         keyboardType="phone-pad"
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Verification Code"
//         value={code}
//         onChangeText={setCode}
//         keyboardType="number-pad"
//       />
//       <View style={styles.buttonContainer}>
//          <Button title="Send Code" onPress={sendCode} />
//          <Button title="Confirm Code" onPress={confirmCode} />
//       </View>

//       {/* Google Sign-In */}
//       <TouchableOpacity
//         style={styles.googleButton}
//         onPress={signInWithGoogle}
//       >
//         <Text style={styles.googleButtonText}>Sign in with Google</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     padding: 20,
//     backgroundColor: "#f5f5f5",
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     height: 40,
//     borderColor: "gray",
//     borderWidth: 1,
//     marginBottom: 12,
//     paddingHorizontal: 8,
//     borderRadius: 5,
//     backgroundColor: "white",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   googleButton: {
//     backgroundColor: "#4285F4",
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 20,
//     alignItems: "center",
//   },
//   googleButtonText: { color: "white", fontWeight: "bold" },
// });

// export default Login;





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
// };

// // ✅ Create a typed navigation prop for Login
// type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// // This is the deep link that Supabase will redirect to after Google login.
// // It MUST match the scheme you configured in your app.json.

// const redirectTo = makeRedirectUri({
//   scheme: 'ownstore',
// });
// const LoginScreen = () => {
//   const navigation = useNavigation<NavigationProp>();
//   const [phone, setPhone] = useState('');
//   const [code, setCode] = useState('');
  
//   // New state to manage which view to show: phone input or code input
//   const [codeSent, setCodeSent] = useState(false);

//   // ✅ Supabase Phone Auth (OTP) - Send Code
//   const sendCode = async () => {
//     if (phone.length !== 10) {
//       return Alert.alert("Error", "Please enter a valid 10-digit phone number.");
//     }

//     // Prepend the country code for Supabase
//     const fullPhoneNumber = `+91${phone}`;

//     const { error } = await supabase.auth.signInWithOtp({
//       phone: fullPhoneNumber,
//     });

//     if (error) {
//       Alert.alert("Error sending code", error.message);
//     } else {
//       Alert.alert("Success", "Verification code sent to your phone!");
//       setCodeSent(true); // Switch to the code input view
//     }
//   };

//   // ✅ Supabase Phone Auth (OTP) - Confirm Code
//   const confirmCode = async () => {
//     if (!code) return Alert.alert("Error", "Please enter the verification code.");
    
//     const fullPhoneNumber = `+91${phone}`;

//     const { error } = await supabase.auth.verifyOtp({
//       phone: fullPhoneNumber,
//       token: code,
//       type: 'sms',
//     });

//     if (error) Alert.alert("Error verifying code", error.message);
//     // If successful, the onAuthStateChange listener in App.tsx will handle navigation.
//   };
  
//   // ✅ Supabase Google Auth
//   const signInWithGoogle = async () => {
//     const { data, error } = await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo,
//       },
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

//   // Placeholder functions for other logins
//   const handleVendorLogin = () => console.log('Navigating to Vendor Login');
//   const handleDeliveryLogin = () => console.log('Navigating to Delivery Login');

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.keyboardAvoidingContainer}
//       >
//         <View style={styles.container}>
//           {/* Header Section */}
//           <View style={styles.header}>
//             <Text style={styles.title}>Own Store</Text>
//             <Text style={styles.subtitle}>
//               {codeSent ? "Enter the code we sent you" : "Enter your phone number to continue"}
//             </Text>
//           </View>

//           {/* Form Section */}
//           <View style={styles.formContainer}>
//             {!codeSent ? (
//               // -- Phone Number Input View --
//               <>
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
//                 <TouchableOpacity style={styles.continueButton} onPress={() => { sendCode(); navigation.navigate('OtpScreen'); }}>
//                   <Text style={styles.continueButtonText}>Continue</Text>
//                 </TouchableOpacity>
//               </>
//             ) : (
//               // -- Verification Code Input View --
//               <>
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
//                 <TouchableOpacity style={styles.continueButton} onPress={confirmCode}>
//                   <Text style={styles.continueButtonText}>Confirm Code</Text>
//                 </TouchableOpacity>
//                  <TouchableOpacity style={{alignSelf:'center', marginTop: 15}} onPress={() => setCodeSent(false)}>
//                     <Text style={styles.subtitle}>Wrong number?</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             <View style={styles.separatorContainer}>
//               <View style={styles.separatorLine} />
//               <Text style={styles.separatorText}>or</Text>
//               <View style={styles.separatorLine} />
//             </View>

//             <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
//               <FontAwesome name="google" size={20} color="#181411" />
//               <Text style={styles.googleButtonText}>Sign in with Google</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Footer Section */}
//           <View style={styles.footer}>
//             <Text style={styles.footerText}>Other Login Options</Text>
//             <View style={styles.footerButtonsContainer}>
//               <TouchableOpacity style={styles.footerButton} onPress={handleVendorLogin}>
//                 <Text style={styles.footerButtonText}>Vendor Login</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.footerButton} onPress={handleDeliveryLogin}>
//                 <Text style={styles.footerButtonText}>Delivery Login</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// // --- Styles (Copied from your file, no changes needed) ---
// const styles = StyleSheet.create({
//     safeArea: {
//       flex: 1,
//       backgroundColor: '#fcfaf8',
//       paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//     },
//     keyboardAvoidingContainer: {
//       flex: 1,
//     },
//     container: {
//       flex: 1,
//       justifyContent: 'space-between',
//       paddingHorizontal: 24,
//     },
//     header: {
//       alignItems: 'center',
//       paddingTop: 60,
//       paddingBottom: 40,
//     },
//     title: {
//       fontSize: 32,
//       fontWeight: 'bold',
//       color: '#181411',
//     },
//     subtitle: {
//       fontSize: 16,
//       color: '#8a7260',
//       marginTop: 8,
//     },
//     formContainer: {},
//     inputContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       backgroundColor: '#f5f2f0',
//       borderRadius: 12,
//       height: 56,
//       paddingHorizontal: 16,
//     },
//     countryCode: {
//       fontSize: 16,
//       fontWeight: '500',
//       color: '#181411',
//       marginRight: 8,
//     },
//     textInput: {
//       flex: 1,
//       height: '100%',
//       fontSize: 16,
//       color: '#181411',
//     },
//     continueButton: {
//       backgroundColor: '#ec8627',
//       height: 52,
//       borderRadius: 26,
//       justifyContent: 'center',
//       alignItems: 'center',
//       marginTop: 20,
//     },
//     continueButtonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: '#181411',
//     },
//     separatorContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginVertical: 32,
//     },
//     separatorLine: {
//       flex: 1,
//       height: 1,
//       backgroundColor: '#e8dbce',
//     },
//     separatorText: {
//       marginHorizontal: 16,
//       color: '#8a7260',
//       fontSize: 14,
//     },
//     googleButton: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       backgroundColor: '#f5f2f0',
//       height: 52,
//       borderRadius: 26,
//       gap: 12,
//     },
//     googleButtonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//       color: '#181411',
//     },
//     footer: {
//       alignItems: 'center',
//       paddingBottom: 24,
//     },
//     footerText: {
//       fontSize: 14,
//       color: '#8a7260',
//       marginBottom: 16,
//     },
//     footerButtonsContainer: {
//       flexDirection: 'row',
//       gap: 16,
//     },
//     footerButton: {
//       backgroundColor: '#f5f2f0',
//       paddingVertical: 8,
//       paddingHorizontal: 16,
//       borderRadius: 16,
//     },
//     footerButtonText: {
//       fontSize: 12,
//       fontWeight: 'bold',
//       color: '#181411',
//     },
//   });

// export default LoginScreen;





// Login.tsx
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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import supabase from '../../SupabaseClient';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ✅ Define your stack param list
export type RootStackParamList = {
  Login: undefined;
  OtpScreen: undefined;
  VendorLogin: undefined;
  DeliveryLogin: undefined;
  Main: undefined;
};

// ✅ Create a typed navigation prop for Login
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  // ✅ Correctly typed navigation hook INSIDE the component
  const navigation = useNavigation<NavigationProp>();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // This must match your app.json scheme
  const redirectTo = makeRedirectUri({ scheme: 'ownstore' });

  // ✅ Supabase Phone Auth (OTP) - Send Code
  const sendCode = async () => {
    if (phone.length !== 10) {
      return Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
    }

    const fullPhoneNumber = `+91${phone}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: fullPhoneNumber,
    });

    if (error) {
      Alert.alert('Error sending code', error.message);
    } else {
      Alert.alert('Success', 'Verification code sent to your phone!');
      setCodeSent(true);

      // ✅ Navigate after sending code
      navigation.navigate('OtpScreen');
    }
  };

  // ✅ Supabase Phone Auth (OTP) - Confirm Code
  const confirmCode = async () => {
    if (!code) {
      return Alert.alert('Error', 'Please enter the verification code.');
    }

    const fullPhoneNumber = `+91${phone}`;

    const { error } = await supabase.auth.verifyOtp({
      phone: fullPhoneNumber,
      token: code,
      type: 'sms',
    });

    if (error) {
      Alert.alert('Error verifying code', error.message);
    }
    // If successful, the onAuthStateChange listener in App.tsx will handle navigation.
  };

  // ✅ Supabase Google Auth
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      Alert.alert('Google Sign-In Error', error.message);
      return;
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type === 'dismiss' || result.type === 'cancel') {
        Alert.alert('Authentication Cancelled', 'The sign-in process was not completed.');
      }
    }
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
            <Text style={styles.subtitle}>
              {codeSent ? 'Enter the code we sent you' : 'Enter your phone number to continue'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {!codeSent ? (
              <>
                {/* Phone Input */}
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

                <TouchableOpacity style={styles.continueButton} onPress={sendCode}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Code Input */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter verification code"
                    placeholderTextColor="#8a7260"
                    keyboardType="number-pad"
                  />
                </View>

                <TouchableOpacity style={styles.continueButton} onPress={confirmCode}>
                  <Text style={styles.continueButtonText}>Confirm Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ alignSelf: 'center', marginTop: 15 }}
                  onPress={() => setCodeSent(false)}
                >
                  <Text style={styles.subtitle}>Wrong number?</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or</Text>
              <View style={styles.separatorLine} />
            </View>

            <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
              <FontAwesome name="google" size={20} color="#181411" />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Other Login Options</Text>
            <View style={styles.footerButtonsContainer}>
              <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('VendorLogin')}>
                <Text style={styles.footerButtonText}>Vendor Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('DeliveryLogin')}>
                <Text style={styles.footerButtonText}>Delivery Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
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
  formContainer: {},
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
  separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 32 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#e8dbce' },
  separatorText: { marginHorizontal: 16, color: '#8a7260', fontSize: 14 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f2f0',
    height: 52,
    borderRadius: 26,
    gap: 12,
  },
  googleButtonText: { fontSize: 16, fontWeight: 'bold', color: '#181411' },
  footer: { alignItems: 'center', paddingBottom: 24 },
  footerText: { fontSize: 14, color: '#8a7260', marginBottom: 16 },
  footerButtonsContainer: { flexDirection: 'row', gap: 16 },
  footerButton: {
    backgroundColor: '#f5f2f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  footerButtonText: { fontSize: 12, fontWeight: 'bold', color: '#181411' },
});

export default LoginScreen;
