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
import { useNavigation } from '@react-navigation/native';
import supabase from '../../SupabaseClient';
 
 const VendorLoginScreen = () => {
  const navigation = useNavigation();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
 
   // ✅ Supabase Email/Password sign-in function
 const handleEmailSignIn = async () => {
   if (!email || !password) {
     return Alert.alert("Error", "Please enter both email and password.");
   }

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.container}>
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
            <TouchableOpacity style={styles.continueButton} onPress={handleEmailSignIn}>
              <Text style={styles.continueButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Spacer - keeps the form centered */}
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

export default VendorLoginScreen;