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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import supabase from '../../SupabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface AddEditAddressProps {
  onSave: (address: any) => void;
  onCancel: () => void;
  existingAddress?: any;
}

const AddEditAddress: React.FC<AddEditAddressProps> = ({ onSave, onCancel, existingAddress }) => {
  const mapRef = useRef<MapView>(null);
  
  const [location, setLocation] = useState<LocationData | null>(existingAddress || null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(existingAddress || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);
  const [showMap, setShowMap] = useState(false);
  
  // Form fields
  const [addressType, setAddressType] = useState(existingAddress?.type || 'Home');
  const [addressLine1, setAddressLine1] = useState(existingAddress?.address_line1 || '');
  const [city, setCity] = useState(existingAddress?.city || '');
  const [state, setState] = useState(existingAddress?.state || '');
  const [postalCode, setPostalCode] = useState(existingAddress?.postal_code || '');
  const [country, setCountry] = useState(existingAddress?.country || 'India');

  useEffect(() => {
    if (existingAddress) {
      setRegion({
        latitude: existingAddress.latitude || 28.6139,
        longitude: existingAddress.longitude || 77.2090,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [existingAddress]);

  const getUserLocation = async () => {
    try {
      setLoading(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const defaultLocation = {
          latitude: 28.6139,
          longitude: 77.2090,
        };
        
        setLocation(defaultLocation);
        setSelectedLocation(defaultLocation);
        setRegion({
          ...defaultLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      const initialLocation: LocationData = {
        latitude,
        longitude,
      };
      
      setLocation(initialLocation);
      setSelectedLocation(initialLocation);
      
      const userRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(userRegion);
      
      await reverseGeocode(latitude, longitude);

    } catch (error) {
      console.error('Error getting location:', error);
      
      const fallbackRegion = {
        latitude: 28.6139,
        longitude: 77.2090,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(fallbackRegion);
      setSelectedLocation({
        latitude: 28.6139,
        longitude: 77.2090,
      });
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
        const addressLine = `${address.street || ''} ${address.name || ''} ${address.streetNumber || ''}`.trim();
        
        setAddressLine1(addressLine || addressLine1);
        setCity(address.city || address.subregion || address.region || city);
        setState(address.region || state);
        setPostalCode(address.postalCode || postalCode);
        setCountry(address.country || country);
        
        const newLocation = {
          latitude,
          longitude,
          address_line1: addressLine,
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

  const handleSaveAddress = async () => {
    // Validation
    if (!addressLine1.trim()) {
      Alert.alert('Error', 'Please enter address line');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return;
    }

    setSaving(true);

    try {
      const addressData = {
        id: existingAddress?.id || `addr_${Date.now()}`,
        type: addressType,
        address: `${addressLine1}, ${city}, ${state} ${postalCode}`.trim(),
        address_line1: addressLine1,
        city,
        state,
        postal_code: postalCode,
        country,
        latitude: selectedLocation?.latitude || 28.6139,
        longitude: selectedLocation?.longitude || 77.2090,
      };

      onSave(addressData);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      await getUserLocation();
      setShowMap(true);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Could not get your current location. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <MaterialIcons name="close" size={24} color="#1c140c" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {existingAddress ? 'Edit Address' : 'Add New Address'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Address Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Type</Text>
            <View style={styles.typeContainer}>
              {['Home', 'Work', 'Other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    addressType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setAddressType(type)}
                >
                  <MaterialIcons
                    name={type === 'Home' ? 'home' : type === 'Work' ? 'work' : 'location-on'}
                    size={20}
                    color={addressType === type ? '#fff' : '#00796B'}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      addressType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Map Section - COMMENTED OUT FOR NOW */}
          {/* <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Location on Map</Text>
              <TouchableOpacity
                style={styles.toggleMapButton}
                onPress={async () => {
                  if (!showMap && !region) {
                    // First time showing map - get location
                    setLoading(true);
                    try {
                      await getUserLocation();
                      setShowMap(true);
                    } catch (error) {
                      console.error('Error:', error);
                      Alert.alert(
                        'Location Error',
                        'Could not get your location. You can still enter the address manually or try again.',
                        [
                          { text: 'OK', onPress: () => setLoading(false) },
                          { 
                            text: 'Try Again', 
                            onPress: async () => {
                              await getUserLocation();
                              setShowMap(true);
                            }
                          }
                        ]
                      );
                    } finally {
                      setLoading(false);
                    }
                  } else {
                    setShowMap(!showMap);
                  }
                }}
              >
                <Text style={styles.toggleMapText}>
                  {loading ? 'Loading...' : showMap ? 'Hide Map' : 'Show Map'}
                </Text>
              </TouchableOpacity>
            </View>

            {showMap && (
              <View style={styles.mapContainer}>
                {loading ? (
                  <View style={styles.mapLoading}>
                    <ActivityIndicator size="large" color="#00796B" />
                    <Text style={{ marginTop: 10, color: '#666' }}>Loading map...</Text>
                  </View>
                ) : region ? (
                  <>
                    <MapView
                      ref={mapRef}
                      style={styles.map}
                      initialRegion={region}
                      onRegionChangeComplete={setRegion}
                      onPress={handleMapPress}
                      showsUserLocation={true}
                      showsMyLocationButton={false}
                      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
                      loadingEnabled={true}
                      loadingIndicatorColor="#00796B"
                      loadingBackgroundColor="#f0f0f0"
                      moveOnMarkerPress={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                    >
                      {selectedLocation && (
                        <Marker
                          coordinate={{
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                          }}
                          title="Selected Location"
                          description="Tap map to change location"
                        >
                          <View style={styles.markerContainer}>
                            <MaterialIcons name="location-pin" size={40} color="#00796B" />
                          </View>
                        </Marker>
                      )}
                    </MapView>
                    <TouchableOpacity
                      style={styles.currentLocationButton}
                      onPress={handleCurrentLocation}
                    >
                      <MaterialIcons name="my-location" size={24} color="#00796B" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.mapLoading}>
                    <Text style={{ color: '#666' }}>Initializing map...</Text>
                  </View>
                )}
              </View>
            )}

            {selectedLocation && (
              <Text style={styles.coordinatesText}>
                Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
              </Text>
            )}
          </View> */}

          {/* Address Form Fields */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            
            <Text style={styles.label}>Address Line *</Text>
            <TextInput
              style={styles.input}
              placeholder="House No., Building Name, Street"
              placeholderTextColor="#999"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />

            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter city"
              placeholderTextColor="#999"
              value={city}
              onChangeText={setCity}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  placeholderTextColor="#999"
                  value={state}
                  onChangeText={setState}
                />
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Postal Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="PIN Code"
                  placeholderTextColor="#999"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Country"
              placeholderTextColor="#999"
              value={country}
              onChangeText={setCountry}
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveAddress}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Address'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c140c',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00796B',
    gap: 6,
  },
  typeButtonActive: {
    backgroundColor: '#00796B',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00796B',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  toggleMapButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#00796B',
  },
  toggleMapText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#999',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c140c',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1c140c',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#00796B',
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
});

export default AddEditAddress;
