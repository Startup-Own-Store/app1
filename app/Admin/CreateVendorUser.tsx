// // app/AdminScreens/CreateVendorUser.tsx
// import React, { useState } from 'react';
// import {
//   View, Text, TextInput, TouchableOpacity, StyleSheet,
//   Alert, SafeAreaView, Platform, StatusBar,
// } from 'react-native';
// import supabase from '../../SupabaseClient';

// const CreateVendorUserScreen = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleCreateUser = async () => {
//     if (!email || !password) {
//       return Alert.alert('Error', 'Please fill in both email and password fields.');
//     }
//     setLoading(true);

//     try {
//       const { data, error } = await supabase.functions.invoke('create-user', {
//         body: { email, password, role: 'vendor' }, // Role is hardcoded here
//       });

//       if (error) {
//         Alert.alert('Creation Failed', error.message);
//       } else {
//         Alert.alert('Success!', `New vendor user (${email}) created successfully.`);
//         setEmail('');
//         setPassword('');
//       }
//     } catch (err: any) {
//       Alert.alert('An Unexpected Error Occurred', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <Text style={styles.title}>Create New Vendor</Text>
//         <TextInput style={styles.input} placeholder="Vendor's Email Address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
//         <TextInput style={styles.input} placeholder="Set a Temporary Password" value={password} onChangeText={setPassword} secureTextEntry />
//         <TouchableOpacity style={[styles.button, { opacity: loading ? 0.7 : 1 }]} onPress={handleCreateUser} disabled={loading}>
//           <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Vendor User'}</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// // --- Styles ---
// const styles = StyleSheet.create({
//   safeArea: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
//   container: { flex: 1, justifyContent: 'center', padding: 20 },
//   title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
//   input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
//   button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, marginTop: 10 },
//   buttonText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
// });

// export default CreateVendorUserScreen;


// app/AdminScreens/CreateVendorUser.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, SafeAreaView, Platform, StatusBar, ScrollView,
} from 'react-native';
import supabase from '../../SupabaseClient';

const CreateVendorUserScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ✅ ADDED: State for new optional fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Email and password are required.');
    }
    setLoading(true);

    try {
      // ✅ CHANGED: Call your new 'quick-handler' function
      const { data, error } = await supabase.functions.invoke('quick-handler', {
        // ✅ CHANGED: Send all the data the function expects
        body: {
          email,
          password,
          full_name: fullName,
          phone,
          role: 'vendor', // The function schema expects this
        },
      });

      if (error) {
        Alert.alert('Creation Failed', error.message);
      } else {
        // The success message comes from your function now
        Alert.alert('Success!', data.message);
        // Clear the form
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
      }
    } catch (err: any) {
      Alert.alert('An Unexpected Error Occurred', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create New Vendor</Text>

        <Text style={styles.label}>Email Address (Required)</Text>
        <TextInput style={styles.input} placeholder="vendor@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        
        <Text style={styles.label}>Temporary Password (Required)</Text>
        <TextInput style={styles.input} placeholder="Min. 8 characters" value={password} onChangeText={setPassword} secureTextEntry />
        
        {/* ✅ ADDED: New input fields */}
        <Text style={styles.label}>Full Name (Optional)</Text>
        <TextInput style={styles.input} placeholder="John Doe" value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Phone Number (Optional)</Text>
        <TextInput style={styles.input} placeholder="+91..." value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        
        <TouchableOpacity style={[styles.button, { opacity: loading ? 0.7 : 1 }]} onPress={handleCreateUser} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Vendor User'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  container: { justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  label: { fontSize: 14, color: '#666', marginBottom: 5, marginLeft: 5 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, marginTop: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
});

export default CreateVendorUserScreen;