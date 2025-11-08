import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../App';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- ENHANCED WELCOME SCREEN FOR OWNSTORE (Clean, Modern, Hiring/Consulting Focus) ---
type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim]);

  // --- HIDDEN ADMIN LOGIN TRIGGER ---
  const handleAdminAccess = () => {
    Alert.alert('Admin Access', 'Enter admin credentials or navigate to login.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Login', onPress: () => navigation.navigate('AdminLogin') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Hidden Small Info Element */}
      <TouchableOpacity
        style={styles.adminInfo}
        onPress={handleAdminAccess}
        activeOpacity={0.6}
      >
        <Text style={styles.adminText}>ℹ️</Text>
      </TouchableOpacity>

      {/* Elegant Page Border with Subtle Design */}
      <View style={styles.pageBorder}>
        {/* Top & Bottom Gradient Borders */}
        <View style={styles.gradientBorderTop} />
        <View style={styles.gradientBorderBottom} />
        
        {/* Side Borders with Dotted Effect (Simulated with small views) */}
        <View style={styles.sideBorderLeft}>
          {[0, 8, 16, 24, 32].map(i => (
            <View key={i} style={[styles.dot, { top: i * 12 }]} />
          ))}
        </View>
        <View style={styles.sideBorderRight}>
          {[0, 8, 16, 24, 32].map(i => (
            <View key={i} style={[styles.dot, { top: i * 12 }]} />
          ))}
        </View>

        <View style={styles.innerContainer}>
          {/* Title with Integrated Border */}
          <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>OWNSTORE</Text>
            <View style={styles.titleAccent} />
          </Animated.View>

          {/* Hiring & Consulting Hook */}
          <Animated.View style={[styles.hookContainer, { opacity: fadeAnim }]}>
            <Text style={styles.hookEmoji}>👷‍♂️💼</Text>
            <Text style={styles.hookText}>Hire skilled pros & consult experts – reliable, on-demand, just a tap away!</Text>
          </Animated.View>

          {/* Enhanced Button */}
          <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnim, transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }]}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => navigation.navigate('NameInput')}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedButtonText}>Start Hiring Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES (Refined: Clean Borders, Better Flow) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F8F0', // Soft, professional green tint
  },
  adminInfo: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 20,
    backgroundColor: 'rgba(0, 121, 107, 0.15)',
    borderRadius: 14,
    opacity: 0.25, // Even subtler
  },
  adminText: {
    fontSize: 11,
    color: '#00796B',
  },
  // --- REFINED PAGE BORDER (Subtle, Modern Design) ---
  pageBorder: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  gradientBorderTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00796B',
    opacity: 0.2,
  },
  gradientBorderBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00796B',
    opacity: 0.2,
  },
  sideBorderLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(0, 121, 107, 0.15)',
  },
  sideBorderRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'rgba(0, 121, 107, 0.15)',
  },
  dot: {
    position: 'absolute',
    width: 3,
    height: 3,
    backgroundColor: '#00796B',
    borderRadius: 2,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: Math.min(40, SCREEN_WIDTH * 0.1),
    fontWeight: '900',
    color: '#00796B',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  titleAccent: {
    width: Math.min(80, SCREEN_WIDTH * 0.2),
    height: 3,
    backgroundColor: '#00796B',
    opacity: 0.6,
    borderRadius: 2,
  },
  hookContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  hookEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  hookText: {
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#00796B',
    paddingVertical: Math.min(16, SCREEN_HEIGHT * 0.02),
    paddingHorizontal: Math.min(40, SCREEN_WIDTH * 0.1),
    borderRadius: 28,
    minWidth: Math.min(200, SCREEN_WIDTH * 0.5),
    alignItems: 'center',
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;