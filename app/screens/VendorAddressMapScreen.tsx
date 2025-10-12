import React, { useState, useEffect, useRef } from 'react';
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
  Dimensions,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import supabase from '../../SupabaseClient';

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
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [region, setRegion] = useState<Region | null>(null); // For map view only

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature');
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
      Alert.alert('Error', 'Failed to get current location');
      
      // Fallback to a reasonable location in India if GPS fails
      const fallbackRegion = {
        latitude: 28.6139, // New Delhi
        longitude: 77.2090,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      setRegion(fallbackRegion);
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

  // Remove the marker drag functionality since we want fixed marker
  // const handleMarkerDrag = (e: any) => {
  //   const { latitude, longitude } = e.nativeEvent.coordinate;
  //   const newLocation = { latitude, longitude };
  //   setSelectedLocation(newLocation);
  //   reverseGeocode(latitude, longitude);
  // };

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const updateData = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address_line1: selectedLocation.address_line1 || '',
        city: selectedLocation.city || '',
        state: selectedLocation.state || '',
        postal_code: selectedLocation.postal_code || '',
        country: selectedLocation.country || 'India',
        address_verified: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('vendor_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      Alert.alert('Success', 'Location saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
      
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Getting your location...</Text>
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

        {/* Map - Only render when region is available */}
        <View style={styles.mapContainer}>
          {region ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion} // This only updates the map view, not the marker
              onPress={handleMapPress} // Tap on map to set new marker location
              showsUserLocation={true}
              showsMyLocationButton={false}
              customMapStyle={mapStyle}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  // Remove draggable property to make marker fixed
                  // draggable
                  // onDragEnd={handleMarkerDrag}
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

// Use one of the map styles from previous suggestions
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

// ... keep your existing styles the same
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
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
});

export default VendorAddressMapScreen;