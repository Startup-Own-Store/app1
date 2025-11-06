# Address Editing Feature - HirePerson

## Overview
Successfully implemented editable address functionality in HirePerson.tsx with both Google Maps location selection and manual address field entry, based on VendorAddressMapScreen.tsx implementation.

## ✅ Completed Implementation

### 1. New Component: AddEditAddress.tsx
**Location:** `app/UserScreens/AddEditAddress.tsx`

**Features:**
- ✅ Address type selection (Home, Work, Other)
- ✅ Interactive Google Maps integration
  - Tap to select location
  - Current location detection
  - Reverse geocoding (coordinates → address)
  - Custom marker with location pin
- ✅ Manual address form fields:
  - Address Line (required)
  - City (required)
  - State
  - Postal Code
  - Country
- ✅ Toggle map visibility
- ✅ Real-time coordinate display
- ✅ Responsive design
- ✅ Validation before save

**Key Functions:**
```typescript
- getUserLocation() - Gets user's current GPS location
- reverseGeocode() - Converts lat/lng to address
- handleMapPress() - Updates location when map is tapped
- handleSaveAddress() - Validates and saves address
```

### 2. Updated HirePerson.tsx

**New State Variables:**
```typescript
const [userAddresses, setUserAddresses] = useState(defaultAddresses);
const [showAddressEditor, setShowAddressEditor] = useState(false);
const [editingAddress, setEditingAddress] = useState<any>(null);
```

**New Functions:**
```typescript
handleAddNewAddress() - Opens address editor for new address
handleEditAddress(address) - Opens address editor with existing address
handleSaveAddress(newAddress) - Saves/updates address in state
handleCancelAddressEditor() - Closes address editor
```

**UI Changes:**
- ✅ Added "Edit" button next to each address in address selection modal
- ✅ "Add a new address" button now functional
- ✅ Address editor opens in full-screen modal
- ✅ Addresses stored with complete details (lat, lng, fields)

### 3. Address Data Structure

```typescript
interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  address: string; // Full formatted address
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
}
```

## 🗺️ Google Maps Integration

### Features from VendorAddressMapScreen:
1. **Location Permissions**
   - Requests foreground location access
   - Falls back to default location (New Delhi) if denied

2. **Map Interaction**
   - Tap anywhere to select location
   - Draggable map
   - Custom styled map (grayscale theme)
   - User location indicator

3. **Reverse Geocoding**
   - Uses `expo-location` API
   - Converts coordinates to readable address
   - Auto-fills form fields

4. **Current Location Button**
   - Floating button on map
   - Centers map on user's location
   - Updates address fields

## 📱 User Flow

### Adding New Address:
1. User taps service in HirePerson
2. Modal opens with address selection
3. User taps "Add a new address"
4. AddEditAddress screen opens
5. User selects address type (Home/Work/Other)
6. User can:
   - Show map and tap location
   - Use current location button
   - Manually enter address fields
7. User fills required fields
8. Taps "Save Address"
9. Returns to service request modal with new address selected

### Editing Existing Address:
1. User taps "Change" in service request modal
2. Address list appears
3. User taps edit icon next to address
4. AddEditAddress opens with pre-filled data
5. User modifies location or fields
6. Saves changes
7. Updated address appears in list

## 🎨 UI Components

### Address Type Selector
```tsx
<View style={styles.typeContainer}>
  {['Home', 'Work', 'Other'].map((type) => (
    <TouchableOpacity
      style={[styles.typeButton, addressType === type && styles.typeButtonActive]}
      onPress={() => setAddressType(type)}
    >
      <MaterialIcons name={icon} />
      <Text>{type}</Text>
    </TouchableOpacity>
  ))}
</View>
```

### Map Section
```tsx
<MapView
  provider={PROVIDER_GOOGLE}
  region={region}
  onPress={handleMapPress}
  showsUserLocation={true}
>
  <Marker coordinate={{latitude, longitude}} />
</MapView>
```

### Form Fields
```tsx
<TextInput
  placeholder="House No., Building Name, Street"
  value={addressLine1}
  onChangeText={setAddressLine1}
/>
```

## 🔧 Technical Details

### Dependencies Required:
```json
{
  "react-native-maps": "^1.x.x",
  "expo-location": "^16.x.x",
  "react-native-vector-icons": "^10.x.x"
}
```

### Permissions (app.json):
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to use your location."
        }
      ]
    ]
  }
}
```

### Google Maps API:
- Uses `PROVIDER_GOOGLE` for consistent experience
- Custom map styling for better UX
- Requires Google Maps API key in app configuration

## 📊 Data Flow

```
User Action → Open Address Editor
    ↓
Request Location Permission
    ↓
Get Current Location (GPS)
    ↓
Reverse Geocode (Lat/Lng → Address)
    ↓
Auto-fill Form Fields
    ↓
User Can:
  - Tap map to change location
  - Edit fields manually
  - Toggle map visibility
    ↓
Validate Required Fields
    ↓
Save Address
    ↓
Update userAddresses State
    ↓
Select New Address
    ↓
Use in Hire Request
```

## 🚀 Future Enhancements

1. **Database Integration**
   - Create `user_addresses` table in Supabase
   - Store addresses permanently
   - Sync across devices

2. **Address Search**
   - Google Places Autocomplete
   - Search for addresses
   - Quick selection from suggestions

3. **Address Validation**
   - Verify postal codes
   - Check address format
   - Suggest corrections

4. **Multiple Addresses**
   - Set default address
   - Delete addresses
   - Reorder addresses

5. **Map Enhancements**
   - Street view
   - Satellite view
   - Traffic layer
   - Nearby landmarks

6. **Offline Support**
   - Cache last known location
   - Store addresses locally
   - Sync when online

## 📝 Code Examples

### Opening Address Editor:
```typescript
const handleAddNewAddress = () => {
  setEditingAddress(null);
  setAddressModalVisible(false);
  setShowAddressEditor(true);
};
```

### Saving Address:
```typescript
const handleSaveAddress = (newAddress: any) => {
  if (editingAddress) {
    // Update existing
    setUserAddresses(prev => 
      prev.map(addr => addr.id === newAddress.id ? newAddress : addr)
    );
  } else {
    // Add new
    setUserAddresses(prev => [...prev, newAddress]);
  }
  setSelectedAddress(newAddress);
  setShowAddressEditor(false);
};
```

### Reverse Geocoding:
```typescript
const reverseGeocode = async (latitude: number, longitude: number) => {
  const geocode = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });
  
  if (geocode.length > 0) {
    const address = geocode[0];
    setAddressLine1(`${address.street} ${address.name}`.trim());
    setCity(address.city || '');
    setState(address.region || '');
    setPostalCode(address.postalCode || '');
  }
};
```

## ⚠️ Known Issues

### TypeScript Warnings:
- `MaterialIcons` type incompatibility with React Native Vector Icons
- This is a known issue with `@types/react-native-vector-icons`
- Does not affect runtime functionality
- Can be safely ignored

## ✨ Summary

The address editing feature is now fully functional with:
- ✅ Google Maps integration with tap-to-select
- ✅ Current location detection
- ✅ Reverse geocoding
- ✅ Manual address entry
- ✅ Edit existing addresses
- ✅ Add new addresses
- ✅ Address type selection (Home/Work/Other)
- ✅ Form validation
- ✅ Responsive UI
- ✅ Integration with HirePerson hire requests

Users can now select locations on a map OR manually enter address details, providing maximum flexibility for accurate location specification in service requests.
