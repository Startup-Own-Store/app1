// app/components/LiveLocationPermission.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { locationService } from './services/LocationService';


const LiveLocationPermission = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'idle' | 'granted' | 'denied' | 'error'>('idle');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [trackingActive, setTrackingActive] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      // Check if tracking is already active when screen comes into focus
      setTrackingActive(locationService.isTrackingActive());
    }, [])
  );

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setPermissionStatus('denied');
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to track your deliveries and update your availability.',
          [
            { text: 'Try Again', onPress: requestLocationPermission },
            { text: 'Skip for Now', onPress: handleSkipLocation }
          ]
        );
        return;
      }

      setPermissionStatus('granted');
      await startLocationTracking();
      
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setPermissionStatus('error');
      Alert.alert('Error', 'Failed to access location services');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      // Get initial location for UI
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(),
      };

      setCurrentLocation(initialLocation);
      
      // Start the persistent location service
      await locationService.startLocationTracking();
      setTrackingActive(true);
      
      console.log('📍 Location service STARTED - Continuous tracking active');

    } catch (error) {
      console.error('Error starting location tracking:', error);
      setPermissionStatus('error');
    }
  };

  const handleContinueToHome = () => {
    console.log('🚀 Navigating to Delivery Home - Location service continues running');
    navigation.navigate('MainDelivery' as never);
  };

  const handleSkipLocation = () => {
    Alert.alert(
      'Location Required',
      'Location access is required for optimal delivery tracking.',
      [
        {
          text: 'Enable Location',
          onPress: requestLocationPermission,
          style: 'default'
        },
        {
          text: 'Continue Anyway',
          onPress: () => {
            console.log('🚀 Skipping location, navigating to Delivery Home');
            navigation.navigate('MainDelivery' as never);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const formatIndianTime = (date: Date): string => {
    return date.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (permissionStatus === 'granted' && currentLocation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <MaterialIcons 
              name="location-on" 
              size={80} 
              color={trackingActive ? "#4CAF50" : "#FF9800"} 
            />
            <Text style={styles.successTitle}>
              {trackingActive ? 'Location Tracking Active' : 'Starting Location Service...'}
            </Text>
            <Text style={styles.successSubtitle}>
              {trackingActive 
                ? 'Your location is being tracked continuously' 
                : 'Location service is initializing...'
              }
            </Text>
            
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                📍 Current Location:
              </Text>
              <Text style={styles.coordinates}>
                Lat: {currentLocation.latitude.toFixed(6)}
                {'\n'}
                Lng: {currentLocation.longitude.toFixed(6)}
              </Text>
              <Text style={styles.lastUpdate}>
                Last Update: {formatIndianTime(currentLocation.timestamp)}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: trackingActive ? '#4CAF50' : '#FF9800' }
                ]} />
                <Text style={styles.statusText}>
                  {trackingActive ? 'ACTIVE' : 'STARTING'} - Updates every 10 seconds
                </Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <MaterialIcons name="update" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>Continuous 10-second updates</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="play-arrow" size={20} color="#2196F3" />
                <Text style={styles.featureText}>Service runs independently</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="schedule" size={20} color="#9C27B0" />
                <Text style={styles.featureText}>Indian time format (12-hour)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinueToHome}
              disabled={!trackingActive}
            >
              <MaterialIcons name="delivery-dining" size={20} color="#fff" />
              <Text style={styles.continueButtonText}>
                {trackingActive ? 'Continue to Dashboard' : 'Starting Service...'}
              </Text>
            </TouchableOpacity>

            {!trackingActive && (
              <ActivityIndicator size="small" color="#ec8627" style={styles.loadingIndicator} />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="delivery-dining" size={60} color="#ec8627" />
          <Text style={styles.title}>Live Location Required</Text>
          <Text style={styles.subtitle}>
            Enable continuous location tracking for delivery assignments
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <MaterialIcons name="gps-fixed" size={24} color="#4CAF50" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>Continuous background service</Text>
              <Text style={styles.featureSubtext}>Runs independently of app screens</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="update" size={24} color="#2196F3" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>10-second automatic updates</Text>
              <Text style={styles.featureSubtext}>Real-time location tracking</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <MaterialIcons name="error-outline" size={24} color="#FF9800" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureText}>Automatic error recovery</Text>
              <Text style={styles.featureSubtext}>Self-healing if tracking stops</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={requestLocationPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="location-searching" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  Enable Continuous Tracking
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkipLocation}
          >
            <Text style={styles.secondaryButtonText}>Skip Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>
            🔒 Continuous location service • 10-second updates • Indian time format • Stops on logout
          </Text>
        </View>
      </View>
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
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b140d',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b725b',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  featuresContainer: {
    marginVertical: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1b140d',
  },
  featureSubtext: {
    fontSize: 12,
    color: '#8b725b',
    marginTop: 2,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#ec8627',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#8b725b',
    fontSize: 16,
    fontWeight: '500',
  },
  privacyContainer: {
    backgroundColor: '#f3ede7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 12,
    color: '#8b725b',
    lineHeight: 16,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b140d',
    marginTop: 20,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#8b725b',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  locationInfo: {
    backgroundColor: '#f3ede7',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b140d',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#8b725b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
    lineHeight: 20,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1b140d',
  },
  continueButton: {
    backgroundColor: '#ec8627',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingIndicator: {
    marginTop: 10,
  },
});

export default LiveLocationPermission;