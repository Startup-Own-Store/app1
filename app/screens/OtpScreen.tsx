import React, { useState, useRef } from 'react';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// This screen would typically receive the phone number from the previous screen
// For example: const OTPScreen = ({ route, navigation }) => {
// const { phoneNumber } = route.params;
const OTPScreen = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Move to the next input box automatically
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };
    
    const handleKeyPress = (e: any, index: number) => {
        // Move to the previous input box on backspace if the current one is empty
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleConfirmCode = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            return Alert.alert("Error", "Please enter the complete 6-digit code.");
        }
        console.log('Confirming OTP:', enteredOtp);
        // Add OTP confirmation logic here
    };

    const handleResendCode = () => {
        console.log('Resending code...');
        // Add resend code logic here
        Alert.alert("Code Sent", "A new verification code has been sent.");
    };

  return (
    <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.title}>Verify Your Number</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to your phone.
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.formContainer}>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={ref => { inputs.current[index] = ref; }}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                            />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.continueButton} onPress={handleConfirmCode}>
                        <Text style={styles.continueButtonText}>Confirm Code</Text>
                    </TouchableOpacity>
                     <TouchableOpacity style={styles.resendContainer} onPress={handleResendCode}>
                        <Text style={styles.resendText}>Didn't receive the code? Resend</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Spacer to push content up */}
                <View style={{flex: 1}} />

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
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  subtitle: {
      fontSize: 16,
      color: '#8a7260',
      marginTop: 8,
      textAlign: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
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
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  resendContainer: {
      alignItems: 'center',
      marginTop: 24,
  },
  resendText: {
      fontSize: 14,
      color: '#8a7260',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
});

export default OTPScreen;