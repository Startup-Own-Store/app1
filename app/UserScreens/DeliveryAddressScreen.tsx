import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Region } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Default location (Salem, Tamil Nadu) for the map's initial view.
const INITIAL_REGION: Region = {
  latitude: 11.6643,
  longitude: 78.1460,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

type AddressType = 'Home' | 'Work' | 'Other';

const DeliveryAddressScreen: React.FC = () => {
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [markerCoordinate, setMarkerCoordinate] = useState(INITIAL_REGION);
  const [addressDetails, setAddressDetails] = useState({
    houseNumber: '',
    landmark: '',
  });
  const [addressType, setAddressType] = useState<AddressType>('Home');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // --- MOCK FUNCTION ---
  // TODO: Replace this with your actual logic to fetch the user's current location.
  const handleGetCurrentLocation = async () => {
    console.log('Fetching current location...');
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would get coords from a geolocation service
      const currentCoords = { latitude: 11.6643, longitude: 78.1460 };
      setMarkerCoordinate({
        ...currentCoords,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });
      setRegion({
        ...currentCoords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
      Alert.alert('Location Set', 'Your current location has been set on the map.');
    }, 1500);
  };

  // --- MOCK FUNCTION ---
  // TODO: Replace this with your Supabase insert logic.
  const handleSaveAddress = async () => {
    if (!addressDetails.houseNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your House / Flat / Block No.');
      return;
    }
    if (!markerCoordinate) {
      Alert.alert('Validation Error', 'Please set a location on the map.');
      return;
    }

    setLoading(true);
    console.log('Saving address...');
    
    const addressData = {
      ...addressDetails,
      ...markerCoordinate,
      addressType,
    };
    console.log('Address Data to be saved:', addressData);

    // Simulate API call to Supabase
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Address saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 2000);
  };

  const onMarkerDragEnd = (e: any) => {
    setMarkerCoordinate(e.nativeEvent.coordinate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Set Delivery Location</Text>
        </View>

        <TouchableOpacity style={styles.locationButton} onPress={handleGetCurrentLocation}>
          <Icon name="crosshairs-gps" size={22} color="#ec8627" />
          <Text style={styles.locationButtonText}>Use my current location</Text>
        </TouchableOpacity>

        <View style={styles.mapContainer}>
          <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
            <Marker
              draggable
              coordinate={markerCoordinate}
              onDragEnd={onMarkerDragEnd}
              title="Delivery Location"
              description="Drag to adjust"
            />
          </MapView>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Enter Address Details</Text>
          <TextInput
            style={styles.input}
            placeholder="House / Flat / Block No. *"
            value={addressDetails.houseNumber}
            onChangeText={text => setAddressDetails(prev => ({ ...prev, houseNumber: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Landmark (e.g. Near Apollo Hospital)"
            value={addressDetails.landmark}
            onChangeText={text => setAddressDetails(prev => ({ ...prev, landmark: text }))}
          />

          <Text style={styles.addressTypeTitle}>Save address as</Text>
          <View style={styles.addressTypeContainer}>
            {(['Home', 'Work', 'Other'] as AddressType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.addressTypeButton,
                  addressType === type && styles.selectedAddressTypeButton,
                ]}
                onPress={() => setAddressType(type)}>
                <Icon
                  name={type === 'Home' ? 'home' : type === 'Work' ? 'briefcase' : 'map-marker'}
                  size={20}
                  color={addressType === type ? '#ffffff' : '#ec8627'}
                />
                <Text
                  style={[
                    styles.addressTypeButtonText,
                    addressType === type && styles.selectedAddressTypeButtonText,
                  ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSaveAddress}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181411',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff7ed',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#feddc2',
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ec8627',
    marginLeft: 12,
  },
  mapContainer: {
    height: 250,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#181411',
  },
  addressTypeTitle: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ec8627',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedAddressTypeButton: {
    backgroundColor: '#ec8627',
  },
  addressTypeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ec8627',
    marginLeft: 8,
  },
  selectedAddressTypeButtonText: {
    color: '#ffffff',
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#ec8627',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#f5b170',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default DeliveryAddressScreen;