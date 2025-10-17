import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Platform,
  StatusBar,
  FlatList,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// --- DATA ---
const topServices = [
    { id: '1', name: 'Electrician', icon: 'electrical-services' },
    { id: '2', name: 'Plumber', icon: 'plumbing' },
    { id: '3', name: 'Driver', icon: 'directions-car' },
    { id: '4', name: 'Maid', icon: 'cleaning-services' },
];

const allServices = [
    { id: '1', name: 'Cook', icon: 'soup-kitchen' },
    { id: '2', name: 'Carpenter', icon: 'carpenter' },
    { id: '3', name: 'Painter', icon: 'format-paint' },
    { id: '4', name: 'Gardener', icon: 'local-florist' },
    { id: '5', name: 'Babysitter', icon: 'child-care' },
    { id: '6', name: 'Pet Sitter', icon: 'pets' },
    { id: '7', name: 'Mechanic', icon: 'car-repair' },
    { id: '8', name: 'Tutor', icon: 'school' },
];

const userAddresses = [
    { id: 'addr1', type: 'Home', address: '456 Oak Avenue, Springfield' },
    { id: 'addr2', type: 'Work', address: '789 Pine Street, Metropolis' },
];


// --- MAIN COMPONENT ---
const HireHelpScreen = () => {
    const [serviceModalVisible, setServiceModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(userAddresses[0]);
    const [jobDescription, setJobDescription] = useState('');

    const openServiceModal = (serviceName: string) => {
        setSelectedService(serviceName);
        setServiceModalVisible(true);
    };
    
    const handleSelectAddress = (address: any) => {
        setSelectedAddress(address);
        setAddressModalVisible(false);
    }

    // --- RENDER FUNCTIONS ---
    const renderTopService = ({ item }: { item: typeof topServices[0] }) => (
        <TouchableOpacity style={styles.topServiceCard} onPress={() => openServiceModal(item.name)}>
            <MaterialIcons name={item.icon} size={36} color="#fff" />
            <Text style={styles.topServiceText}>{item.name}</Text>
        </TouchableOpacity>
    );
    
    const renderListItem = ({ item }: { item: any }) => {
        switch(item.type) {
            case 'header':
                return <Text style={styles.sectionTitle}>{item.title}</Text>;
            case 'topServices':
                return (
                     <FlatList
                        horizontal
                        data={topServices}
                        renderItem={renderTopService}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
                    />
                );
            case 'personalWorkForm':
                return (
                    <View style={styles.personalWorkContainer}>
                        <Text style={styles.personalWorkTitle}>Need Something Else?</Text>
                        <Text style={styles.personalWorkSubtitle}>Describe the personal work you need done.</Text>
                        
                        <TextInput
                            style={styles.formInput}
                            placeholder="What do you need help with?"
                            placeholderTextColor="#8a7260"
                        />
                        <TouchableOpacity style={styles.locationInput} onPress={() => setAddressModalVisible(true)}>
                            <MaterialIcons name="my-location" size={20} color="#ec8627" />
                            <Text style={styles.locationText}>Set Location on Map</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.submitButtonLarge} onPress={() => openServiceModal('Personal Work')}>
                            <Text style={styles.submitButtonText}>Request Help</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'allServicesGrid':
                 return (
                    <FlatList
                        data={allServices}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.serviceGridItem} onPress={() => openServiceModal(item.name)}>
                                <MaterialIcons name={item.icon} size={32} color="#181411" />
                                <Text style={styles.serviceGridText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        numColumns={3} // Changed to 3 columns for bigger items
                        scrollEnabled={false}
                    />
                 );
            default:
                return null;
        }
    };
    
    const mainListData = [
        { type: 'header', id: 'header1', title: 'Top Services' },
        { type: 'topServices', id: 'topServicesList' },
        { type: 'personalWorkForm', id: 'personalWork' },
        { type: 'header', id: 'header2', title: 'All Services' },
        { type: 'allServicesGrid', id: 'allServices' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* --- SERVICE REQUEST MODAL --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={serviceModalVisible}
                onRequestClose={() => setServiceModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                         <TouchableOpacity style={styles.closeButton} onPress={() => setServiceModalVisible(false)}>
                            <MaterialIcons name="close" size={24} color="#181411" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Hire {selectedService === 'Personal Work' ? 'for' : 'an'} {selectedService}</Text>
                        
                        <View style={styles.modalLocationContainer}>
                            <MaterialIcons name="location-on" size={24} color="#ec8627" />
                            <View style={{flex: 1}}>
                                <Text style={styles.modalLocationType}>{selectedAddress.type}</Text>
                                <Text style={styles.modalLocationAddress} numberOfLines={1}>{selectedAddress.address}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                                <Text style={styles.changeButtonText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.modalInput} placeholder="Enter your full name" placeholderTextColor="#8a7260" />

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.modalInput} placeholder="Enter your phone number" placeholderTextColor="#8a7260" keyboardType="phone-pad" />
                        
                        <Text style={styles.label}>Explain your job (Optional)</Text>
                        <TextInput
                            style={styles.modalTextArea}
                            placeholder="e.g. Need to fix a leaking tap in the kitchen."
                            placeholderTextColor="#8a7260"
                            multiline
                            value={jobDescription}
                            onChangeText={setJobDescription}
                        />

                        <TouchableOpacity style={styles.submitButton}>
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* --- ADDRESS SELECTION MODAL --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addressModalVisible}
                onRequestClose={() => setAddressModalVisible(false)}
            >
                <View style={[styles.modalOverlay, {justifyContent: 'flex-end'}]}>
                    <View style={[styles.modalContent, {width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0}]}>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setAddressModalVisible(false)}>
                            <MaterialIcons name="close" size={24} color="#181411" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select an Address</Text>
                        
                        {userAddresses.map(addr => (
                            <TouchableOpacity key={addr.id} style={styles.addressItem} onPress={() => handleSelectAddress(addr)}>
                                <MaterialIcons name={addr.type === 'Home' ? 'home' : 'work'} size={24} color="#181411"/>
                                <View style={{flex: 1}}>
                                    <Text style={styles.addressType}>{addr.type}</Text>
                                    <Text style={styles.addressText}>{addr.address}</Text>
                                </View>
                                <View style={[styles.radioOuter, selectedAddress.id === addr.id && styles.radioOuterSelected]}>
                                    {selectedAddress.id === addr.id && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.addNewAddressButton}>
                            <MaterialIcons name="add" size={24} color="#ec8627" />
                            <Text style={styles.addNewAddressText}>Add a new address</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

            {/* --- MAIN SCREEN --- */}
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity>
                        <MaterialIcons name="arrow-back" size={24} color="#181411" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hire Help</Text>
                    <View style={{ width: 24 }} />
                </View>

                <FlatList
                    data={mainListData}
                    renderItem={renderListItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.mainListContent}
                />
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f2f0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#181411',
    },
    mainListContent: {
        paddingBottom: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#181411',
        marginTop: 24,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    // Top Services
    topServiceCard: {
        width: 120,
        height: 160,
        borderRadius: 20,
        marginRight: 16,
        padding: 16,
        justifyContent: 'space-between',
        backgroundColor: '#ec8627',
        shadowColor: "#ec8627",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    topServiceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    // Personal Work Form
    personalWorkContainer: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: '#f5f2f0',
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    personalWorkTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#181411',
        textAlign: 'center',
    },
    personalWorkSubtitle: {
        fontSize: 14,
        color: '#8a7260',
        textAlign: 'center',
        marginTop: -8,
    },
    formInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#181411',
    },
    locationInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        height: 56,
        gap: 8,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ec8627',
    },
    submitButtonLarge: {
        backgroundColor: '#ec8627',
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
     // All Services Grid
     serviceGridItem: {
        flex: 1/3, // Changed to 3 columns
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    serviceGridText: {
        fontSize: 14, // Made text slightly larger
        fontWeight: '600',
        color: '#181411',
        textAlign: 'center',
    },
    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fcfaf8',
        borderRadius: 20,
        padding: 24,
        gap: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#181411',
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#8a7260',
        textAlign: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#181411',
        marginBottom: -8,
    },
    modalInput: {
        backgroundColor: '#f5f2f0',
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#181411',
    },
    modalTextArea: {
        backgroundColor: '#f5f2f0',
        borderRadius: 12,
        height: 120,
        padding: 16,
        fontSize: 16,
        color: '#181411',
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#ec8627',
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181411',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    // New Modal Location Styles
    modalLocationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f2f0',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    modalLocationType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#181411',
    },
    modalLocationAddress: {
        fontSize: 14,
        color: '#8a7260',
    },
    changeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ec8627',
    },
    // New Address Selection Modal Styles
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f2f0',
        gap: 16,
    },
    addressType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#181411',
    },
    addressText: {
        fontSize: 14,
        color: '#8a7260',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e8dbce',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#ec8627',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ec8627',
    },
    addNewAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 16,
    },
    addNewAddressText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ec8627',
    },
});

export default HireHelpScreen;

