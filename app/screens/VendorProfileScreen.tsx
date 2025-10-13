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
import supabase from '../../SupabaseClient';

interface VendorProfile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  address_verified: boolean;
  profile_completed: boolean;
}

const VendorProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });

  // Add state for coordinates
  const [coordinates, setCoordinates] = useState<{latitude?: number; longitude?: number}>({});

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  // Add useEffect to handle incoming location data from map screen
  useEffect(() => {
    console.log('🔄 Checking for location data in route params...');
    const params = route.params as any;
    
    if (params?.selectedLocation) {
      console.log('🎯 Location data received:', params.selectedLocation);
      
      // Update form data with the received location
      setFormData(prev => ({
        ...prev,
        address_line1: params.selectedLocation.address_line1 || prev.address_line1,
        city: params.selectedLocation.city || prev.city,
        state: params.selectedLocation.state || prev.state,
        postal_code: params.selectedLocation.postal_code || prev.postal_code,
        country: params.selectedLocation.country || prev.country,
      }));

      // Store coordinates
      setCoordinates({
        latitude: params.selectedLocation.latitude,
        longitude: params.selectedLocation.longitude
      });

      console.log('✅ Coordinates set:', {
        latitude: params.selectedLocation.latitude,
        longitude: params.selectedLocation.longitude
      });
    }
  }, [route.params]);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const { data, error } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      
      // Pre-fill form with existing data
      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          postal_code: data.postal_code || '',
          country: data.country || 'India',
        });

        // Also set existing coordinates if they exist
        if (data.latitude && data.longitude) {
          setCoordinates({
            latitude: data.latitude,
            longitude: data.longitude
          });
        }
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    console.log('💾 Starting save process...');
    console.log('📍 Current coordinates:', coordinates);
    console.log('📝 Form data:', formData);

    // Validate required fields including coordinates
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address_line1.trim() || 
        !formData.city.trim() || !formData.state.trim() || !formData.postal_code.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check if coordinates are available
    if (!coordinates.latitude || !coordinates.longitude) {
      Alert.alert('Location Required', 'Please select your restaurant location on the map by clicking "Pick Location on Map"');
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
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        country: formData.country,
        latitude: coordinates.latitude, // Add latitude
        longitude: coordinates.longitude, // Add longitude
        address_verified: true,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };

      console.log('📤 Saving to database with data:', updateData);

      const { error } = await supabase
        .from('vendor_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Profile saved successfully with coordinates');
      Alert.alert('Success', 'Profile updated successfully!');
      
      // Navigate to vendor home after successful save
      navigation.navigate('VendorHome' as never);
      
    } catch (error) {
      console.error('Error saving vendor profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSkipForNow = () => {
    Alert.alert(
      'Skip Profile Setup',
      'Are you sure? You can complete your profile later from settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => navigation.navigate('VendorHome' as never)
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Add function to check location status
  const checkLocationStatus = () => {
    const params = route.params as any;
    const hasLocation = !!(params?.selectedLocation);
    const hasCoordinates = !!(coordinates.latitude && coordinates.longitude);
    
    console.log('📍 Location Status:', {
      hasLocationParams: hasLocation,
      hasCoordinates: hasCoordinates,
      coordinates: coordinates
    });
    
    Alert.alert(
      'Location Status', 
      `Map Location: ${hasLocation ? 'Received ✅' : 'Not Received ❌'}\nCoordinates: ${hasCoordinates ? 'Set ✅' : 'Not Set ❌'}\nLat: ${coordinates.latitude || 'N/A'}\nLng: ${coordinates.longitude || 'N/A'}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec8627" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Welcome Message */}
          <View style={styles.welcomeCard}>
            <MaterialIcons name="store" size={48} color="#ec8627" />
            <Text style={styles.welcomeTitle}>Welcome to Vendor Dashboard!</Text>
            <Text style={styles.welcomeText}>
              Please complete your restaurant profile to start receiving orders.
            </Text>
          </View>

          {/* Restaurant Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurant Information</Text>
            
            <Text style={styles.label}>Restaurant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter restaurant name"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
            
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor="#666"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
              editable={!profile?.email}
            />
            
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#666"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
              keyboardType="phone-pad"
            />
          </View>

          {/* Restaurant Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Restaurant Address</Text>
            
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => navigation.navigate('VendorAddressMap' as never)}
            >
              <MaterialIcons name="map" size={20} color="#ec8627" />
              <Text style={styles.mapButtonText}>
                {coordinates.latitude ? '📍 Location Selected - Tap to Change' : 'Pick Location on Map'}
              </Text>
            </TouchableOpacity>

            {/* Display coordinates if available */}
            {coordinates.latitude && coordinates.longitude && (
              <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>
                  📍 Location: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </Text>
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={checkLocationStatus}
                >
                  <Text style={styles.debugButtonText}>Check Location</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.label}>Address Line 1 (Street, Building) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter street address"
              placeholderTextColor="#666"
              value={formData.address_line1}
              onChangeText={(text) => setFormData({...formData, address_line1: text})}
            />
            
            <Text style={styles.label}>Address Line 2 (Area, Landmark)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter area or landmark"
              placeholderTextColor="#666"
              value={formData.address_line2}
              onChangeText={(text) => setFormData({...formData, address_line2: text})}
            />
            
            <View style={styles.row}>
              <View style={styles.halfContainer}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city"
                  placeholderTextColor="#666"
                  value={formData.city}
                  onChangeText={(text) => setFormData({...formData, city: text})}
                />
              </View>
              <View style={styles.halfContainer}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter state"
                  placeholderTextColor="#666"
                  value={formData.state}
                  onChangeText={(text) => setFormData({...formData, state: text})}
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfContainer}>
                <Text style={styles.label}>Postal Code *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter postal code"
                  placeholderTextColor="#666"
                  value={formData.postal_code}
                  onChangeText={(text) => setFormData({...formData, postal_code: text})}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.halfContainer}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter country"
                  placeholderTextColor="#666"
                  value={formData.country}
                  onChangeText={(text) => setFormData({...formData, country: text})}
                />
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={20} color="#ec8627" />
            <Text style={styles.infoText}>
              Your address will be used for order deliveries and customer navigation. Make sure to select your location on the map.
            </Text>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={handleSkipForNow}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Complete Profile'}
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
    color: '#000000',
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ec8627',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
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
    marginBottom: 16,
    color: '#000000',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#000000',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ec8627',
    borderStyle: 'dashed',
  },
  mapButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  coordinatesContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#065f46',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  debugButton: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfContainer: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#ec8627',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#000000',
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
    color: '#000000',
  },
});

export default VendorProfileScreen;