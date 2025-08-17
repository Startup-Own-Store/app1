// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signInWithCredential,
//   GoogleAuthProvider,
//   signInWithPhoneNumber,
//   PhoneAuthProvider,
// } from 'firebase/auth';
// import { auth } from '../../FirebaseConfig';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [phone, setPhone] = useState('');
//   const [verificationId, setVerificationId] = useState('');
//   const recaptchaVerifier = useRef(null);

//   useEffect(() => {
//     // Configure Google Sign-In
//     GoogleSignin.configure({
//       webClientId: '1054963152708-f18tik1hb0upf6d0ijhh2p7kki9fitac.apps.googleusercontent.com', // This should match the web client ID from google-services.json
//       offlineAccess: true,
//     });
//   }, []);

//   const onGoogleButtonPress = async () => {
//     try {
//       console.log('Starting Google Sign-In process...');
      
//       // Check if your device supports Google Play
//       await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
//       console.log('Google Play Services check passed');
      
//       // Get the users ID token
//       const result = await GoogleSignin.signIn();
//       console.log('Google Sign-In result:', result);
      
//       const idToken = (result as any).idToken;
//       console.log('ID Token received:', idToken ? 'Yes' : 'No');

//       if (!idToken) {
//         throw new Error("Google Sign-In failed: idToken is null");
//       }

//       // Create a Google credential with the token
//       const googleCredential = GoogleAuthProvider.credential(idToken);
//       console.log('Google credential created successfully');

//       // Sign-in the user with the credential
//       await signInWithCredential(auth, googleCredential);
//       console.log('Google sign-in successful!');
//       Alert.alert('Success', 'Google Sign-In successful!');
//     } catch (error: any) {
//       console.error('Google Sign-In Error Details:', error);
      
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         Alert.alert('Cancelled', 'Google Sign-In was cancelled.');
//       } else if (error.code === statusCodes.IN_PROGRESS) {
//         Alert.alert('In Progress', 'Google Sign-In already in progress.');
//       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         Alert.alert('Error', 'Play Services not available or outdated.');
//       } else {
//         Alert.alert('Google Sign In Error', error?.message || 'An unknown error occurred.');
//       }
//     }
//   };

//   const handleEmailSignIn = async () => {
//     if (!email || !password) return Alert.alert('Error', 'Please enter both email and password.');
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       console.log('User signed in with email!');
//       Alert.alert('Success', 'Email sign-in successful!');
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : String(error);
//       Alert.alert('Sign In Error', errorMessage);
//     }
//   };

//   const handleEmailSignUp = async () => {
//     if (!email || !password) return Alert.alert('Error', 'Please enter both email and password.');
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       console.log('User account created!');
//       Alert.alert('Success', 'Account created successfully!');
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : String(error);
//       Alert.alert('Sign Up Error', errorMessage);
//     }
//   };

//   const sendCode = async () => {
//     try {
//       const provider = new PhoneAuthProvider(auth);
//       const verificationId = await provider.verifyPhoneNumber(phone, recaptchaVerifier.current!);
//       setVerificationId(verificationId);
//       Alert.alert('Verification code sent');
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to send verification code');
//     }
//   };

//   const confirmCode = async () => {
//     try {
//       const credential = PhoneAuthProvider.credential(verificationId, '123456'); // Replace with actual code input
//       await signInWithCredential(auth, credential);
//       Alert.alert('Phone authentication successful!');
//     } catch (err) {
//       Alert.alert('Invalid code.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login</Text>

//       {/* Email/Password */}
//       <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
//       <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

//       <View style={styles.buttonContainer}>
//         <Button title="Sign In" onPress={handleEmailSignIn} />
//         <Button title="Sign Up" onPress={handleEmailSignUp} />
//       </View>

//       {/* Phone */}
//       <TextInput style={styles.input} placeholder="Phone Number (e.g. +91 9876543210)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
//       <Button title="Send Code" onPress={sendCode} />
//       <Button title="Confirm Code" onPress={confirmCode} />

//       {/* Google Sign-In */}
//       <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
//         <Text style={styles.googleButtonText}>Sign in with Google</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
//   title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//   input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingHorizontal: 8, borderRadius: 5, backgroundColor: 'white' },
//   buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
//   googleButton: { backgroundColor: '#4285F4', padding: 10, borderRadius: 5, marginTop: 20, alignItems: 'center' },
//   googleButtonText: { color: 'white', fontWeight: 'bold' },
// });

// export default Login;



// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   Button,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
// } from "react-native";
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signInWithCredential,
//   GoogleAuthProvider,
//   PhoneAuthProvider,
//   RecaptchaVerifier,
// } from "firebase/auth";
// import { auth } from "../../FirebaseConfig";
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";
// import { makeRedirectUri } from 'expo-auth-session';

// const redirectUri = makeRedirectUri();
// WebBrowser.maybeCompleteAuthSession();

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [phone, setPhone] = useState("");
//   const [verificationId, setVerificationId] = useState("");
//   const [code, setCode] = useState(""); // <-- Add this line
//   const recaptchaVerifier = useRef<any>(null);

//   // ✅ Expo Google Auth
//   const [request, response, promptAsync] = Google.useAuthRequest({
//   clientId: "1054963152708-f18tik1hb0upf6d0ijhh2p7kki9fitac.apps.googleusercontent.com", // Web client for Expo Go
//   androidClientId: "1054963152708-2078omssn8f9tc35nrk53jj3n7g3qq4j.apps.googleusercontent.com", // NEW Android client for com.ajay.ownstoredemo
//   redirectUri: redirectUri
// });
  
//   React.useEffect(() => {
//     if (response?.type === "success") {
//       const { authentication } = response;
//       if (authentication?.idToken) {
//         const credential = GoogleAuthProvider.credential(
//           authentication.idToken
//         );
//         signInWithCredential(auth, credential)
//           .then(() => {
//             Alert.alert("Success", "Google Sign-In successful!");
//           })
//           .catch((err) => {
//             Alert.alert("Error", err.message);
//           });
//       }
//     }
//   }, [response]);

//   // ✅ Email/Password login
//   const handleEmailSignIn = async () => {
//     if (!email || !password)
//       return Alert.alert("Error", "Please enter both email and password.");
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       Alert.alert("Success", "Email sign-in successful!");
//     } catch (error: any) {
//       Alert.alert("Sign In Error", error.message);
//     }
//   };

//   const handleEmailSignUp = async () => {
//     if (!email || !password)
//       return Alert.alert("Error", "Please enter both email and password.");
//     try {
//       await createUserWithEmailAndPassword(auth, email, password);
//       Alert.alert("Success", "Account created successfully!");
//     } catch (error: any) {
//       Alert.alert("Sign Up Error", error.message);
//     }
//   };

//   // ✅ Phone Auth with reCAPTCHA
//   const sendCode = async () => {
//     try {
//       const provider = new PhoneAuthProvider(auth);

//       // Only pass the phone number (no recaptchaVerifier)
//       const verificationId = await provider.verifyPhoneNumber(phone);

//       setVerificationId(verificationId);
//       Alert.alert("Verification code sent!");
//     } catch (err: any) {
//       Alert.alert("Error", err.message);
//     }
//   };

//   const confirmCode = async () => {
//     try {
//       const credential = PhoneAuthProvider.credential(verificationId, code);
//       await signInWithCredential(auth, credential);
//       Alert.alert("Phone authentication successful!");
//     } catch (err: any) {
//       Alert.alert("Invalid code");
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
//       <Button title="Send Code" onPress={sendCode} />
//       <TextInput
//         style={styles.input}
//         placeholder="Verification Code"
//         value={code}
//         onChangeText={setCode}
//         keyboardType="number-pad"
//       />
//       <Button title="Confirm Code" onPress={confirmCode} />
//       <Button title="Confirm Code" onPress={confirmCode} />

//       {/* Google Sign-In */}
//       <TouchableOpacity
//         style={styles.googleButton}
//         disabled={!request}
//         onPress={() => promptAsync()}
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

















import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import supabase from "../../SupabaseClient";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from 'expo-auth-session';

// This is the deep link that Supabase will redirect to after Google login.
// It MUST match the scheme you configured in your app.json.
const redirectTo = makeRedirectUri({
  scheme: 'ownstore',
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(""); // For OTP

  // ✅ Supabase Email/Password login
  const handleEmailSignIn = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Please enter both email and password.");
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Sign In Error", error.message);
    // If successful, the onAuthStateChange listener in App.js will handle navigation.
  };

  const handleEmailSignUp = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Please enter both email and password.");

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Sign Up Error", error.message);
    else Alert.alert("Success", "Account created! Please check your email to verify.");
  };

  // ✅ Supabase Phone Auth (OTP)
  const sendCode = async () => {
    if (!phone) return Alert.alert("Error", "Please enter a phone number.");

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) Alert.alert("Error sending code", error.message);
    else Alert.alert("Success", "Verification code sent to your phone!");
  };

  const confirmCode = async () => {
    if (!phone || !code) return Alert.alert("Error", "Please enter phone and code.");

    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms',
    });

    if (error) Alert.alert("Error verifying code", error.message);
    // If successful, onAuthStateChange listener in App.js will handle navigation.
  };

  // ✅ Supabase Google Auth
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (data.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      // Supabase client handles the session when the user is redirected back.
      if (result.type === 'dismiss' || result.type === 'cancel') {
        Alert.alert(
          'Authentication Cancelled', 
          'The sign-in process was not completed.'
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email/Password */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={handleEmailSignIn} />
        <Button title="Sign Up" onPress={handleEmailSignUp} />
      </View>

      {/* Phone */}
      <TextInput
        style={styles.input}
        placeholder="Phone Number (e.g. +91 9876543210)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Verification Code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />
      <View style={styles.buttonContainer}>
         <Button title="Send Code" onPress={sendCode} />
         <Button title="Confirm Code" onPress={confirmCode} />
      </View>

      {/* Google Sign-In */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={signInWithGoogle}
      >
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  googleButtonText: { color: "white", fontWeight: "bold" },
});

export default Login;