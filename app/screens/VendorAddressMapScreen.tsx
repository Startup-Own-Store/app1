import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

const VendorAddressMapScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      setLoading(true);
      setPermissionDenied(false);
      
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setPermissionDenied(true);
        
        // For development: Use default location and continue
        const defaultLocation = {
          latitude: 28.6139, // New Delhi
          longitude: 77.2090,
        };
        
        setLocation(defaultLocation);
        setSelectedLocation(defaultLocation);
        
        const defaultRegion = {
          ...defaultLocation,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setRegion(defaultRegion);
        
        setLoading(false);
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      // Set initial location
      const initialLocation: LocationData = {
        latitude,
        longitude,
      };
      
      setLocation(initialLocation);
      setSelectedLocation(initialLocation);
      
      // Set region to user's current location
      const userRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(userRegion);
      
      // Get address from coordinates
      await reverseGeocode(latitude, longitude);

    } catch (error) {
      console.error('Error getting location:', error);
      
      // Development fallback - don't show alert, just use default location
      const fallbackRegion = {
        latitude: 28.6139, // New Delhi
        longitude: 77.2090,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      
      setRegion(fallbackRegion);
      setSelectedLocation({
        latitude: 28.6139,
        longitude: 77.2090,
      });
      
      console.log('Using fallback location for development');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        const newLocation = {
          latitude,
          longitude,
          address_line1: `${address.street || ''} ${address.name || ''} ${address.streetNumber || ''}`.trim(),
          city: address.city || address.subregion || address.region || '',
          state: address.region || '',
          postal_code: address.postalCode || '',
          country: address.country || 'India',
        };
        
        setSelectedLocation(newLocation);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // For development, create a mock address
      const mockLocation = {
        latitude,
        longitude,
        address_line1: 'Mock Street Address for Development',
        city: 'Development City',
        state: 'Test State',
        postal_code: '123456',
        country: 'India',
      };
      setSelectedLocation(mockLocation);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    const newLocation = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };
    setSelectedLocation(newLocation);
    reverseGeocode(coordinate.latitude, coordinate.longitude);
  };

  // In VendorAddressMapScreen.tsx
const handleSaveLocation = async () => {
  if (!selectedLocation) {
    Alert.alert('Error', 'Please select a location on the map');
    return;
  }

  try {
    setSaving(true);
    console.log('📍 Selected Location Data:', selectedLocation);
    console.log('📤 Navigating to VendorProfile with location data...');

    // Pass the selected location back to the previous screen
    navigation.navigate('VendorProfile', {
      selectedLocation: selectedLocation
    });
    
    console.log('✅ Navigation completed');
    
  } catch (error) {
    console.error('Error saving location:', error);
    Alert.alert('Error', 'Failed to save location');
  } finally {
    setSaving(false);
  }
};

  const handleCurrentLocation = async () => {
    await getUserLocation();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleUseMockLocation = () => {
    const mockLocation = {
      latitude: 28.6139,
      longitude: 77.2090,
      address_line1: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      postal_code: '110001',
      country: 'India',
    };
    
    setSelectedLocation(mockLocation);
    setRegion({
      ...mockLocation,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Getting your location...</Text>
          <Text style={styles.developmentText}>Development Mode</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="#1c140c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Development Banner */}
        <View style={styles.devBanner}>
          <Text style={styles.devBannerText}>🚧 Development Mode - Mock Data Enabled</Text>
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {region ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
              showsUserLocation={false}
                showsMyLocationButton={false}
                customMapStyle={mapStyle}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                loadingEnabled={true}
                loadingIndicatorColor="#666666"
                loadingBackgroundColor="#eeeeee"
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Selected Location"
                  description="Your restaurant location"
                >
                  <View style={styles.markerContainer}>
                    <MaterialIcons name="location-pin" size={40} color="#ec8627" />
                    <View style={styles.markerPulse} />
                  </View>
                </Marker>
              )}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#ec8627" />
              <Text style={styles.mapPlaceholderText}>Loading map...</Text>
            </View>
          )}

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color="#ec8627" />
          </TouchableOpacity>

          {/* Mock Location Button - Development Only */}
          <TouchableOpacity
            style={styles.mockLocationButton}
            onPress={handleUseMockLocation}
          >
            <MaterialIcons name="developer-mode" size={20} color="#fff" />
            <Text style={styles.mockButtonText}>Use Mock</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Location Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Selected Location</Text>
          
          {selectedLocation?.address_line1 ? (
            <View style={styles.addressDetails}>
              <Text style={styles.addressText}>
                {selectedLocation.address_line1}
              </Text>
              <Text style={styles.addressSubtext}>
                {[selectedLocation.city, selectedLocation.state, selectedLocation.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              <Text style={styles.coordinatesText}>
                Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
              </Text>
              <Text style={styles.devNoteText}>
                📝 Development Note: This data will be saved to your profile
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>
              Tap on the map to select your restaurant location
            </Text>
          )}

          <Text style={styles.instructionText}>
            📍 Tap anywhere on the map to set your restaurant location
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, (!selectedLocation || saving) && styles.saveButtonDisabled]}
            onPress={handleSaveLocation}
            disabled={!selectedLocation || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving Location...' : 'Save Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#f5f5f5" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#dadada" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#e0e0e0" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#c9c9c9" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  }
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  devBanner: {
    backgroundColor: '#ffeb3b',
    padding: 8,
    alignItems: 'center',
  },
  devBannerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  headerSpacer: {
    width: 24,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  mapPlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPulse: {
    position: 'absolute',
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ec8627',
    opacity: 0.3,
  },
  currentLocationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mockLocationButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: '#28a745',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mockButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1c140c',
  },
  addressDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1c140c',
    marginBottom: 4,
  },
  addressSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  devNoteText: {
    fontSize: 11,
    color: '#28a745',
    fontStyle: 'italic',
    marginTop: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#ec8627',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  developmentText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ff9800',
    fontWeight: 'bold',
  },
});

export default VendorAddressMapScreen;