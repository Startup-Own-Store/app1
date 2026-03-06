// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Platform,
//   StatusBar,
//   ActivityIndicator,
//   Dimensions,
//   TextInput,
//   ScrollView,
//   KeyboardAvoidingView,
// } from 'react-native';
// import MapView, { Marker, Region, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
// import { MaterialIcons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import supabase from '../../SupabaseClient';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// interface LocationData {
//   latitude: number;
//   longitude: number;
//   address_line1?: string;
//   city?: string;
//   state?: string;
//   postal_code?: string;
//   country?: string;
// }

// interface AddEditAddressProps {
//   onSave: (address: any) => void;
//   onCancel: () => void;
//   existingAddress?: any;
// }

// const AddEditAddress: React.FC<AddEditAddressProps> = ({ onSave, onCancel, existingAddress }) => {
//   const mapRef = useRef<MapView>(null);
  
//   const [location, setLocation] = useState<LocationData | null>(existingAddress || null);
//   const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(existingAddress || null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [region, setRegion] = useState<Region | null>(null);
//   const [showMap, setShowMap] = useState(false);
  
//   // Form fields
//   const [addressType, setAddressType] = useState(existingAddress?.type || 'Home');
//   const [addressLine1, setAddressLine1] = useState(existingAddress?.address_line1 || '');
//   const [city, setCity] = useState(existingAddress?.city || '');
//   const [state, setState] = useState(existingAddress?.state || '');
//   const [postalCode, setPostalCode] = useState(existingAddress?.postal_code || '');
//   const [country, setCountry] = useState(existingAddress?.country || 'India');

//   useEffect(() => {
//     if (existingAddress) {
//       setRegion({
//         latitude: existingAddress.latitude || 28.6139,
//         longitude: existingAddress.longitude || 77.2090,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       });
//     }
//   }, [existingAddress]);

//   const getUserLocation = async () => {
//     try {
//       setLoading(true);
      
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         const defaultLocation = {
//           latitude: 28.6139,
//           longitude: 77.2090,
//         };
        
//         setLocation(defaultLocation);
//         setSelectedLocation(defaultLocation);
//         setRegion({
//           ...defaultLocation,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         });
        
//         setLoading(false);
//         return;
//       }

//       let currentLocation = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       const { latitude, longitude } = currentLocation.coords;
      
//       const initialLocation: LocationData = {
//         latitude,
//         longitude,
//       };
      
//       setLocation(initialLocation);
//       setSelectedLocation(initialLocation);
      
//       const userRegion = {
//         latitude,
//         longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       };
//       setRegion(userRegion);
      
//       await reverseGeocode(latitude, longitude);

//     } catch (error) {
//       console.error('Error getting location:', error);
      
//       const fallbackRegion = {
//         latitude: 28.6139,
//         longitude: 77.2090,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       };
      
//       setRegion(fallbackRegion);
//       setSelectedLocation({
//         latitude: 28.6139,
//         longitude: 77.2090,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reverseGeocode = async (latitude: number, longitude: number) => {
//     try {
//       const geocode = await Location.reverseGeocodeAsync({
//         latitude,
//         longitude,
//       });

//       if (geocode.length > 0) {
//         const address = geocode[0];
//         const addressLine = `${address.street || ''} ${address.name || ''} ${address.streetNumber || ''}`.trim();
        
//         setAddressLine1(addressLine || addressLine1);
//         setCity(address.city || address.subregion || address.region || city);
//         setState(address.region || state);
//         setPostalCode(address.postalCode || postalCode);
//         setCountry(address.country || country);
        
//         const newLocation = {
//           latitude,
//           longitude,
//           address_line1: addressLine,
//           city: address.city || address.subregion || address.region || '',
//           state: address.region || '',
//           postal_code: address.postalCode || '',
//           country: address.country || 'India',
//         };
        
//         setSelectedLocation(newLocation);
//       }
//     } catch (error) {
//       console.error('Error reverse geocoding:', error);
//     }
//   };

//   const handleMapPress = (event: any) => {
//     const { coordinate } = event.nativeEvent;
//     const newLocation = {
//       latitude: coordinate.latitude,
//       longitude: coordinate.longitude,
//     };
//     setSelectedLocation(newLocation);
//     reverseGeocode(coordinate.latitude, coordinate.longitude);
//   };

//   const handleSaveAddress = async () => {
//     // Validation
//     if (!addressLine1.trim()) {
//       Alert.alert('Error', 'Please enter address line');
//       return;
//     }
//     if (!city.trim()) {
//       Alert.alert('Error', 'Please enter city');
//       return;
//     }

//     setSaving(true);

//     try {
//       const addressData = {
//         id: existingAddress?.id || `addr_${Date.now()}`,
//         type: addressType,
//         address: `${addressLine1}, ${city}, ${state} ${postalCode}`.trim(),
//         address_line1: addressLine1,
//         city,
//         state,
//         postal_code: postalCode,
//         country,
//         latitude: selectedLocation?.latitude || 28.6139,
//         longitude: selectedLocation?.longitude || 77.2090,
//       };

//       onSave(addressData);
//     } catch (error) {
//       console.error('Error saving address:', error);
//       Alert.alert('Error', 'Failed to save address');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleCurrentLocation = async () => {
//     try {
//       await getUserLocation();
//       setShowMap(true);
//     } catch (error) {
//       console.error('Error getting current location:', error);
//       Alert.alert('Error', 'Could not get your current location. Please try again.');
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.container}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={onCancel}>
//             <MaterialIcons name="close" size={24} color="#1c140c" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>
//             {existingAddress ? 'Edit Address' : 'Add New Address'}
//           </Text>
//           <View style={styles.headerSpacer} />
//         </View>

//         <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//           {/* Address Type Selection */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Address Type</Text>
//             <View style={styles.typeContainer}>
//               {['Home', 'Work', 'Other'].map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   style={[
//                     styles.typeButton,
//                     addressType === type && styles.typeButtonActive,
//                   ]}
//                   onPress={() => setAddressType(type)}
//                 >
//                   <MaterialIcons
//                     name={type === 'Home' ? 'home' : type === 'Work' ? 'work' : 'location-on'}
//                     size={20}
//                     color={addressType === type ? '#fff' : '#00796B'}
//                   />
//                   <Text
//                     style={[
//                       styles.typeButtonText,
//                       addressType === type && styles.typeButtonTextActive,
//                     ]}
//                   >
//                     {type}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Map Section - COMMENTED OUT FOR NOW */}
//           {/* <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Location on Map</Text>
//               <TouchableOpacity
//                 style={styles.toggleMapButton}
//                 onPress={async () => {
//                   if (!showMap && !region) {
//                     // First time showing map - get location
//                     setLoading(true);
//                     try {
//                       await getUserLocation();
//                       setShowMap(true);
//                     } catch (error) {
//                       console.error('Error:', error);
//                       Alert.alert(
//                         'Location Error',
//                         'Could not get your location. You can still enter the address manually or try again.',
//                         [
//                           { text: 'OK', onPress: () => setLoading(false) },
//                           { 
//                             text: 'Try Again', 
//                             onPress: async () => {
//                               await getUserLocation();
//                               setShowMap(true);
//                             }
//                           }
//                         ]
//                       );
//                     } finally {
//                       setLoading(false);
//                     }
//                   } else {
//                     setShowMap(!showMap);
//                   }
//                 }}
//               >
//                 <Text style={styles.toggleMapText}>
//                   {loading ? 'Loading...' : showMap ? 'Hide Map' : 'Show Map'}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {showMap && (
//               <View style={styles.mapContainer}>
//                 {loading ? (
//                   <View style={styles.mapLoading}>
//                     <ActivityIndicator size="large" color="#00796B" />
//                     <Text style={{ marginTop: 10, color: '#666' }}>Loading map...</Text>
//                   </View>
//                 ) : region ? (
//                   <>
//                     <MapView
//                       ref={mapRef}
//                       style={styles.map}
//                       initialRegion={region}
//                       onRegionChangeComplete={setRegion}
//                       onPress={handleMapPress}
//                       showsUserLocation={true}
//                       showsMyLocationButton={false}
//                       provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
//                       loadingEnabled={true}
//                       loadingIndicatorColor="#00796B"
//                       loadingBackgroundColor="#f0f0f0"
//                       moveOnMarkerPress={false}
//                       pitchEnabled={false}
//                       rotateEnabled={false}
//                     >
//                       {selectedLocation && (
//                         <Marker
//                           coordinate={{
//                             latitude: selectedLocation.latitude,
//                             longitude: selectedLocation.longitude,
//                           }}
//                           title="Selected Location"
//                           description="Tap map to change location"
//                         >
//                           <View style={styles.markerContainer}>
//                             <MaterialIcons name="location-pin" size={40} color="#00796B" />
//                           </View>
//                         </Marker>
//                       )}
//                     </MapView>
//                     <TouchableOpacity
//                       style={styles.currentLocationButton}
//                       onPress={handleCurrentLocation}
//                     >
//                       <MaterialIcons name="my-location" size={24} color="#00796B" />
//                     </TouchableOpacity>
//                   </>
//                 ) : (
//                   <View style={styles.mapLoading}>
//                     <Text style={{ color: '#666' }}>Initializing map...</Text>
//                   </View>
//                 )}
//               </View>
//             )}

//             {selectedLocation && (
//               <Text style={styles.coordinatesText}>
//                 Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
//               </Text>
//             )}
//           </View> */}

//           {/* Address Form Fields */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Address Details</Text>
            
//             <Text style={styles.label}>Address Line *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="House No., Building Name, Street"
//               placeholderTextColor="#999"
//               value={addressLine1}
//               onChangeText={setAddressLine1}
//             />

//             <Text style={styles.label}>City *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter city"
//               placeholderTextColor="#999"
//               value={city}
//               onChangeText={setCity}
//             />

//             <View style={styles.row}>
//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>State</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="State"
//                   placeholderTextColor="#999"
//                   value={state}
//                   onChangeText={setState}
//                 />
//               </View>

//               <View style={styles.halfInput}>
//                 <Text style={styles.label}>Postal Code</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="PIN Code"
//                   placeholderTextColor="#999"
//                   value={postalCode}
//                   onChangeText={setPostalCode}
//                   keyboardType="number-pad"
//                 />
//               </View>
//             </View>

//             <Text style={styles.label}>Country</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Country"
//               placeholderTextColor="#999"
//               value={country}
//               onChangeText={setCountry}
//             />
//           </View>
//         </ScrollView>

//         {/* Save Button */}
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//             onPress={handleSaveAddress}
//             disabled={saving}
//           >
//             <Text style={styles.saveButtonText}>
//               {saving ? 'Saving...' : 'Save Address'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//   },
//   headerTitle: {
//     flex: 1,
//     textAlign: 'center',
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1c140c',
//   },
//   headerSpacer: {
//     width: 24,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   section: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginBottom: 8,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#1c140c',
//     marginBottom: 12,
//   },
//   typeContainer: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   typeButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#00796B',
//     gap: 6,
//   },
//   typeButtonActive: {
//     backgroundColor: '#00796B',
//   },
//   typeButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#00796B',
//   },
//   typeButtonTextActive: {
//     color: '#fff',
//   },
//   toggleMapButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//     backgroundColor: '#00796B',
//   },
//   toggleMapText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   mapContainer: {
//     height: 250,
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginBottom: 8,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   mapLoading: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#e9ecef',
//   },
//   markerContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   currentLocationButton: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   coordinatesText: {
//     fontSize: 11,
//     color: '#999',
//     fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
//     marginTop: 4,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1c140c',
//     marginTop: 12,
//     marginBottom: 6,
//   },
//   input: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#1c140c',
//     borderWidth: 1,
//     borderColor: '#dee2e6',
//   },
//   row: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   halfInput: {
//     flex: 1,
//   },
//   footer: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#e9ecef',
//   },
//   saveButton: {
//     backgroundColor: '#00796B',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   saveButtonDisabled: {
//     backgroundColor: '#6c757d',
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default AddEditAddress;



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
  Modal,
  Pressable,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Form fields
  const [addressType, setAddressType] = useState(existingAddress?.type || 'Home');
  const [houseNo, setHouseNo] = useState('');
  const [apartmentRoad, setApartmentRoad] = useState('');
  const [directions, setDirections] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    setLoading(true);
    
    if (existingAddress) {
      const initialRegion = {
        latitude: existingAddress.latitude || 28.6139,
        longitude: existingAddress.longitude || 77.2090,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      setFullAddress(existingAddress.address || '');
      setLoading(false);
    } else {
      await getUserLocation();
    }
  };

  const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        const defaultLocation = {
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(defaultLocation);
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      const userRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(userRegion);
      setSelectedLocation({ latitude, longitude });
      
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
        const addressParts = [
          address.name,
          address.street,
          address.district,
          address.city || address.subregion,
          address.region,
          address.postalCode,
          address.country,
        ].filter(Boolean);
        
        const formattedAddress = addressParts.join(', ');
        setFullAddress(formattedAddress);
        
        setSelectedLocation({
          latitude,
          longitude,
          address_line1: address.street || '',
          city: address.city || address.subregion || address.region || '',
          state: address.region || '',
          postal_code: address.postalCode || '',
          country: address.country || 'India',
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    reverseGeocode(coordinate.latitude, coordinate.longitude);
  };

  const handleCurrentLocation = async () => {
    setLoading(true);
    await getUserLocation();
  };

  const handleConfirmLocation = () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }
    setShowDetailsModal(true);
  };

  const handleSaveAddress = async () => {
    if (!houseNo.trim()) {
      Alert.alert('Error', 'Please enter house/flat/block number');
      return;
    }

    setSaving(true);

    try {
      const addressData = {
        id: existingAddress?.id || `addr_${Date.now()}`,
        type: addressType,
        address: fullAddress,
        address_line1: `${houseNo}, ${apartmentRoad}`.trim(),
        city: selectedLocation?.city || '', 
        state: selectedLocation?.state || '',
        postal_code: selectedLocation?.postal_code || '',
        country: selectedLocation?.country || 'India',
        latitude: selectedLocation?.latitude || 28.6139,
        longitude: selectedLocation?.longitude || 77.2090,
        directions: directions,
      };

      onSave(addressData);
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !region) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00796B" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Map Header */}
        <View style={styles.mapHeader}>
          <TouchableOpacity onPress={onCancel} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#1c140c" />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search an area or address"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Map Container */}
        <View style={styles.mapWrapper}>
          {region && (
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
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                >
                  <View style={styles.customMarker}>
                    <MaterialIcons name="location-on" size={48} color="#FF5722" />
                  </View>
                </Marker>
              )}
            </MapView>
          )}

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color="#00796B" />
            <Text style={styles.currentLocationText}>Current location</Text>
          </TouchableOpacity>

          {/* Bottom Address Card */}
          <View style={styles.bottomCard}>
            <View style={styles.locationInfo}>
              <MaterialIcons name="location-on" size={28} color="#FF5722" />
              <View style={styles.addressDetails}>
                <Text style={styles.locationTitle}>
                  {selectedLocation?.city || 'Thokkavadi'}
                </Text>
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {fullAddress || 'Thokkavadi, Tamil Nadu 637215, India'}
                </Text>
              </View>
            </View>

            <Text style={styles.helperText}>
              Place the pin at exact delivery location
            </Text>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmLocation}
            >
              <Text style={styles.confirmButtonText}>Confirm & proceed</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Address Details Modal */}
        <Modal
          visible={showDetailsModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <MaterialIcons name="arrow-back" size={24} color="#1c140c" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {selectedLocation?.city || 'Location'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Location Display */}
            <View style={styles.locationDisplay}>
              <MaterialIcons name="location-on" size={24} color="#FF5722" />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationDisplayTitle}>
                  {selectedLocation?.city || 'Thokkavadi'}
                </Text>
                <Text style={styles.locationDisplayAddress} numberOfLines={2}>
                  {fullAddress}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Warning Message */}
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                A detailed address will help our Delivery Partner reach your doorstep easily
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              <Text style={styles.fieldLabel}>HOUSE / FLAT / BLOCK NO.</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter house/flat number"
                placeholderTextColor="#999"
                value={houseNo}
                onChangeText={setHouseNo}
              />

              <Text style={styles.fieldLabel}>APARTMENT / ROAD / AREA (RECOMMENDED)</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter apartment/road/area"
                placeholderTextColor="#999"
                value={apartmentRoad}
                onChangeText={setApartmentRoad}
              />

              <View style={styles.directionsSection}>
                <View style={styles.directionsHeader}>
                  <Text style={styles.fieldLabel}>DIRECTIONS TO REACH (OPTIONAL)</Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                </View>
                
                <Pressable style={styles.voiceButton}>
                  <Text style={styles.voiceButtonText}>Tap to record voice directions</Text>
                  <MaterialIcons name="mic" size={24} color="#666" />
                </Pressable>

                <TextInput
                  style={[styles.fieldInput, styles.directionsInput]}
                  placeholder="e.g. Ring the bell on the red gate"
                  placeholderTextColor="#999"
                  value={directions}
                  onChangeText={setDirections}
                  multiline
                  numberOfLines={3}
                />
                <Text style={styles.characterCount}>0 / 200</Text>
              </View>

              {/* Save As Options */}
              <Text style={styles.saveAsLabel}>save as</Text>
              <View style={styles.saveAsContainer}>
                {['Home', 'Work', 'Friends and Family', 'Other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.saveAsButton,
                      addressType === type && styles.saveAsButtonActive,
                    ]}
                    onPress={() => setAddressType(type)}
                  >
                    <MaterialIcons
                      name={
                        type === 'Home' ? 'home' :
                        type === 'Work' ? 'work' :
                        type === 'Friends and Family' ? 'group' :
                        'location-on'
                      }
                      size={20}
                      color={addressType === type ? '#00796B' : '#666'}
                    />
                    <Text
                      style={[
                        styles.saveAsButtonText,
                        addressType === type && styles.saveAsButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSaveAddress}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'SAVING...' : 'ENTER HOUSE / FLAT / BLOCK NO.'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
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
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1c140c',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 280,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00796B',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  locationInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  addressDetails: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c140c',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  helperText: {
    fontSize: 13,
    color: '#c17533',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c140c',
  },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 12,
  },
  locationDisplayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c140c',
    marginBottom: 4,
  },
  locationDisplayAddress: {
    fontSize: 13,
    color: '#666',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00796B',
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#c17533',
    lineHeight: 18,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  fieldInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#1c140c',
  },
  directionsSection: {
    marginTop: 8,
  },
  directionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  newBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  voiceButtonText: {
    fontSize: 14,
    color: '#666',
  },
  directionsInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  saveAsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  saveAsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  saveAsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    gap: 6,
  },
  saveAsButtonActive: {
    borderColor: '#00796B',
    backgroundColor: '#E0F2F1',
  },
  saveAsButtonText: {
    fontSize: 14,
    color: '#666',
  },
  saveAsButtonTextActive: {
    color: '#00796B',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
});

export default AddEditAddress;