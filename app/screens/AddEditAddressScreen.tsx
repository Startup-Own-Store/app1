import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import supabase from '../../SupabaseClient';


const AddEditAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const existingAddress = route?.params?.address ?? null;

  const [formData, setFormData] = useState({
    address_type: 'home',
    full_name: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (existingAddress) {
      setFormData({
        address_type: existingAddress.address_type,
        full_name: existingAddress.full_name,
        phone_number: existingAddress.phone_number,
        address_line1: existingAddress.address_line1,
        address_line2: existingAddress.address_line2 || '',
        city: existingAddress.city,
        state: existingAddress.state,
        postal_code: existingAddress.postal_code,
        country: existingAddress.country,
        is_default: existingAddress.is_default,
      });
      setUserLoading(false);
    }
  }, [existingAddress]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Get user's display name directly
        const displayName = user.user_metadata?.display_name || '';
        
        // Only pre-fill if it's a new address (not editing existing)
        if (!existingAddress) {
          setFormData(prev => ({
            ...prev,
            full_name: displayName
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const handlePlaceSelect = (data: any, details: any = null) => {
    if (details) {
      const addressComponents = details.address_components;
      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let postalCode = '';
      let country = 'India';

      addressComponents.forEach((component: any) => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        } else if (types.includes('route')) {
          route = component.long_name;
        } else if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.long_name;
        } else if (types.includes('postal_code')) {
          postalCode = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
        }
      });

      const addressLine1 = `${streetNumber} ${route}`.trim();
      
      setFormData(prev => ({
        ...prev,
        address_line1: addressLine1,
        city: city,
        state: state,
        postal_code: postalCode,
        country: country
      }));

      setSelectedPlace({
        address: details.formatted_address,
        coordinates: details.geometry.location
      });
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.full_name || !formData.phone_number || !formData.address_line1 || 
        !formData.city || !formData.state || !formData.postal_code) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      if (existingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update(formData)
          .eq('id', existingAddress.id);

        if (error) throw error;
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;
        Alert.alert('Success', 'Address added successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading...</Text>
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
          <Text style={styles.headerTitle}>
            {existingAddress ? 'Edit Address' : 'Add New Address'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Address Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Type</Text>
            <View style={styles.typeButtons}>
              {['home', 'work', 'other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.address_type === type && styles.typeButtonActive
                  ]}
                  onPress={() => setFormData({...formData, address_type: type})}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.address_type === type && styles.typeButtonTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={formData.full_name}
              onChangeText={(text) => setFormData({...formData, full_name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={formData.phone_number}
              onChangeText={(text) => setFormData({...formData, phone_number: text})}
              keyboardType="phone-pad"
            />
          </View>

          {/* Google Maps Address Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Address</Text>
            <GooglePlacesAutocomplete
              placeholder="Search for your address"
              onPress={handlePlaceSelect}
              query={{
                key: 'AIzaSyClZ3TXRsXBWRcaZp_kcw5LaxJNK9LM83Q', // Replace with your API key
                language: 'en',
                components: 'country:in', // Restrict to India, remove for global
              }}
              styles={{
                textInput: styles.googleInput,
                container: styles.googleContainer,
                listView: styles.googleListView,
                description: styles.googleDescription,
                predefinedPlacesDescription: styles.googleDescription,
              }}
              fetchDetails={true}
              enablePoweredByContainer={false}
              textInputProps={{
                placeholderTextColor: '#999',
              }}
            />
          </View>

          {/* Address Details (Auto-filled from Google Maps) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Address Line 1 *"
              value={formData.address_line1}
              onChangeText={(text) => setFormData({...formData, address_line1: text})}
              editable={!selectedPlace} // Make read-only if selected from Google
            />
            <TextInput
              style={styles.input}
              placeholder="Address Line 2 (Optional)"
              value={formData.address_line2}
              onChangeText={(text) => setFormData({...formData, address_line2: text})}
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City *"
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
                editable={!selectedPlace}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State *"
                value={formData.state}
                onChangeText={(text) => setFormData({...formData, state: text})}
                editable={!selectedPlace}
              />
            </View>
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Postal Code *"
                value={formData.postal_code}
                onChangeText={(text) => setFormData({...formData, postal_code: text})}
                keyboardType="number-pad"
                editable={!selectedPlace}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Country"
                value={formData.country}
                onChangeText={(text) => setFormData({...formData, country: text})}
                editable={!selectedPlace}
              />
            </View>
          </View>

          {/* Selected Place Preview */}
          {selectedPlace && (
            <View style={styles.selectedPlaceContainer}>
              <Text style={styles.selectedPlaceTitle}>Selected Address:</Text>
              <Text style={styles.selectedPlaceText}>{selectedPlace.address}</Text>
            </View>
          )}

          {/* Set as Default */}
          {!existingAddress?.is_default && (
            <View style={styles.defaultSection}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFormData({...formData, is_default: !formData.is_default})}
              >
                <View style={[
                  styles.checkbox,
                  formData.is_default && styles.checkboxChecked
                ]}>
                  {formData.is_default && (
                    <MaterialIcons name="check" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Set as default address</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : (existingAddress ? 'Update Address' : 'Save Address')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1c140c',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007bff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  // Google Places Styles
  googleContainer: {
    flex: 0,
    marginBottom: 12,
  },
  googleInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  googleListView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    marginTop: 4,
  },
  googleDescription: {
    fontSize: 14,
    color: '#1c140c',
  },
  selectedPlaceContainer: {
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  selectedPlaceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  selectedPlaceText: {
    fontSize: 14,
    color: '#1c140c',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  defaultSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1c140c',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  saveButton: {
    backgroundColor: '#007bff',
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

export default AddEditAddressScreen;
