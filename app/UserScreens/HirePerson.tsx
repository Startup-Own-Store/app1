import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Dimensions,
  BackHandler,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
const MaterialIcons: any = (require('react-native-vector-icons/MaterialIcons').default ?? require('react-native-vector-icons/MaterialIcons'));
import AddEditAddress from './AddEditAddress';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrCreateGuestUserId } from '../utils/guestUser';
import { getApiUrl, getProductionApiUrl } from '../utils/firebaseSupabaseSync';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../App';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- DATA (Unchanged) ---
const featuredPros = [
  {
    id: 'p1',
    name: 'Ranjith Kumar',
    job: 'Electrician',
    rating: 4.9,
    icon: 'person',
  },
  {
    id: 'p2',
    name: 'Priya Sharma',
    job: 'Plumber',
    rating: 4.8,
    icon: 'person',
  },
  {
    id: 'p3',
    name: 'Anand Singh',
    job: 'Carpenter',
    rating: 4.9,
    icon: 'person',
  },
];
const topServices = [
  { id: '1', name: 'Electrician', icon: 'electrical-services' },
  { id: '2', name: 'Plumber', icon: 'plumbing' },
  { id: '3', name: 'Maid', icon: 'cleaning-services' },
  { id: '4', name: 'Consultancy', icon: 'psychology' },
  { id: '5', name: 'Other Needs', icon: 'work-outline' },
];
const consultancies = [
  { id: 'c1', name: 'Doctor', icon: 'medical-services' },
  { id: 'c2', name: 'Tutor', icon: 'school' },
];
const otherServices = [
  { id: '1', name: 'Cook', icon: 'soup-kitchen' },
  { id: '2', name: 'Carpenter', icon: 'carpenter' },
  { id: '3', name: 'Painter', icon: 'format-paint' },
  { id: '4', name: 'Gardener', icon: 'local-florist' },
  { id: '5', name: 'Babysitter', icon: 'child-care' },
  { id: '6', name: 'Pet Sitter', icon: 'pets' },
  { id: '7', name: 'Mechanic', icon: 'car-repair' },
  { id: '8', name: 'Driver', icon: 'directions-car' },
  { id: '9', name: 'AC Tech', icon: 'ac-unit' },
  { id: '10', name: 'Security', icon: 'security' },
  { id: '11', name: 'Pest', icon: 'pest-control' },
];
const defaultAddresses = [
  { id: 'addr1', type: 'Home', address: '456 Oak Avenue, Springfield', address_line1: '456 Oak Avenue', city: 'Springfield', state: '', postal_code: '', latitude: 28.6139, longitude: 77.2090 },
  { id: 'addr2', type: 'Work', address: '789 Pine Street, Metropolis', address_line1: '789 Pine Street', city: 'Metropolis', state: '', postal_code: '', latitude: 28.6139, longitude: 77.2090 },
];

// --- MAIN COMPONENT ---
const HirePerson = () => {
  const navigation = useNavigation<CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Hire'>,
    NativeStackNavigationProp<RootStackParamList>
  >>();
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [isConsultancy, setIsConsultancy] = useState(false);
  const [isOtherNeeds, setIsOtherNeeds] = useState(false);
  const [userAddresses, setUserAddresses] = useState(defaultAddresses);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddresses[0]);
  const [jobDescription, setJobDescription] = useState('');
  const [selectedImages, setSelectedImages] = useState<{ uri: string; name?: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddressEditor, setShowAddressEditor] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogVariant, setDialogVariant] = useState<'success' | 'error' | 'info'>('info');
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const dialogActionRef = useRef<(() => void) | null>(null);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        BackHandler.exitApp();
        return true;
      };

  const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);
  return () => subscription.remove();
    }, [])
  );

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('userSession');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          const baseSession = parsed && typeof parsed === 'object' ? parsed : {};
          if (baseSession?.id) {
            setUserId(baseSession.id);
          }
          if (baseSession?.name) {
            setFullName(baseSession.name);
          }
          if (baseSession?.phone) {
            setPhoneNumber(baseSession.phone);
          }
        }
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) {
          setFullName((prev) => prev || storedName);
        }
      } catch (sessionError) {
        console.error('Failed to hydrate session', sessionError);
      }
    };

    hydrateSession();
  }, []);

  const openServiceModal = (serviceName: string, isConsult: boolean = false, isOther: boolean = false) => {
    setSelectedService(serviceName);
    setIsConsultancy(isConsult);
    setIsOtherNeeds(isOther);
    setServiceModalVisible(true);
    setSelectedImages([]);
    setJobDescription('');
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    setAddressModalVisible(false);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setAddressModalVisible(false);
    setShowAddressEditor(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressModalVisible(false);
    setShowAddressEditor(true);
  };

  const handleSaveAddress = (newAddress: any) => {
    if (editingAddress) {
      // Update existing address
      setUserAddresses(prev => 
        prev.map(addr => addr.id === newAddress.id ? newAddress : addr)
      );
    } else {
      // Add new address
      setUserAddresses(prev => [...prev, newAddress]);
    }
    setSelectedAddress(newAddress);
    setShowAddressEditor(false);
    setEditingAddress(null);
  };

  const handleCancelAddressEditor = () => {
    setShowAddressEditor(false);
    setEditingAddress(null);
  };

  const showDialog = (
    title: string,
    message: string,
    variant: 'success' | 'error' | 'info',
    onConfirm?: () => void
  ) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVariant(variant);
    dialogActionRef.current = onConfirm ?? null;
    setDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
    const action = dialogActionRef.current;
    dialogActionRef.current = null;
    if (action) {
      action();
    }
  };

  // --- FIXED IMAGE PICKER FUNCTION ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      const newImage: { uri: string; name?: string } = { uri: result.assets[0].uri };
      if (result.assets[0].fileName) {
        newImage.name = result.assets[0].fileName;
      }
      setSelectedImages(prev => [...prev, newImage]);
    } else {
      showDialog('Canceled', 'No image selected', 'info');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT HIRE REQUEST ---
  const handleSubmitRequest = async () => {
    // Validation
    if (!fullName.trim() || !phoneNumber.trim()) {
      showDialog('Missing information', 'Please fill in your name and phone number', 'error');
      return;
    }

    if (isOtherNeeds && !jobDescription.trim()) {
      showDialog('More details needed', 'Please describe what you need', 'error');
      return;
    }

    setLoading(true);

    try {
      const effectiveUserId = await getOrCreateGuestUserId({
        currentId: userId,
        name: fullName.trim(),
        phone: phoneNumber.trim(),
      });
      setUserId(effectiveUserId);

      const imageUrls = selectedImages.map(img => img.uri);

      const apiCandidates = Array.from(
        new Set([getApiUrl(), getProductionApiUrl()])
      );

      let response: Response | undefined;
      let payload: any = null;
      let lastNetworkError: Error | null = null;

      for (let index = 0; index < apiCandidates.length; index += 1) {
        const baseUrl = apiCandidates[index];
        const isLastAttempt = index === apiCandidates.length - 1;

        try {
          response = await fetch(`${baseUrl}/app/api/submit-hire-request`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: effectiveUserId,
              serviceName: selectedService,
              serviceCategory: selectedService,
              isConsultancy,
              isCustomRequest: isOtherNeeds,
              fullName: fullName.trim(),
              phoneNumber: phoneNumber.trim(),
              addressType: selectedAddress?.type ?? null,
              addressLine: selectedAddress?.address ?? null,
              jobDescription: jobDescription.trim() || null,
              imageUrls,
            }),
          });

          payload = await response.json().catch(() => null);

          if (!response.ok && !isLastAttempt && response.status >= 500) {
            console.warn(`Hire request submission failed via ${baseUrl}: ${response.status}. Retrying with fallback endpoint.`);
            continue;
          }

          break;
        } catch (networkError: any) {
          const reason = networkError?.message || 'Network request failed';
          console.warn(`Hire request network error via ${baseUrl}: ${reason}`);
          lastNetworkError = new Error(reason);
          if (isLastAttempt) {
            response = undefined;
          }
        }
      }

      if (!response) {
        const reason = lastNetworkError?.message || 'Unable to reach OwnStore servers. Please check your internet connection or update the API URL.';
        showDialog('Connection error', reason, 'error');
        return;
      }

      if (!response.ok) {
        const message =
          payload?.error ||
          payload?.details ||
          payload?.message ||
          `Failed to submit request (status ${response.status}). Please try again.`;
        if (response.status === 429) {
          console.warn('Hire request cooldown active:', payload);
          const parsedSeconds = (() => {
            const details = payload?.details || '';
            const minutesMatch = /wait\s+(\d+)m\s*(\d+)?s?/i.exec(details);
            if (minutesMatch) {
              const minutes = Number.parseInt(minutesMatch[1] ?? '0', 10) || 0;
              const seconds = Number.parseInt(minutesMatch[2] ?? '0', 10) || 0;
              return minutes * 60 + seconds;
            }
            const secondsMatch = /wait\s+(\d+)\s*seconds?/i.exec(details);
            if (secondsMatch) {
              return Number.parseInt(secondsMatch[1] ?? '0', 10) || 0;
            }
            return 0;
          })();

          if (parsedSeconds > 0) {
            setCooldowns(prev => ({ ...prev, [selectedService]: parsedSeconds }));
          }

          showDialog('Please wait', payload?.details || message, 'info');
        } else {
          console.error('Error submitting request:', payload);
          showDialog('Error', message, 'error');
        }
        return;
      }

      try {
        const storedSession = await AsyncStorage.getItem('userSession');
        const parsedSession = storedSession ? JSON.parse(storedSession) : {};
        const baseSession =
          parsedSession && typeof parsedSession === 'object' ? parsedSession : {};
        const nextSession = {
          ...baseSession,
          id: baseSession.id || effectiveUserId,
          name: fullName.trim(),
          phone: phoneNumber.trim(),
          updatedAt: new Date().toISOString(),
        };
        nextSession.id = effectiveUserId;

        await AsyncStorage.multiSet([
          ['userName', fullName.trim()],
          ['userSession', JSON.stringify(nextSession)],
        ]);
        await AsyncStorage.setItem('guestOnboarded', 'true');
      } catch (sessionUpdateError) {
        console.warn('Failed to update cached session', sessionUpdateError);
      }

      setCooldowns(prev => {
        if (prev[selectedService] === undefined) {
          return prev;
        }
        const next = { ...prev };
        delete next[selectedService];
        return next;
      });

      // Success
      showDialog(
        'Success!',
        'Your service request has been submitted. We will connect you with a professional soon.',
        'success',
        () => {
          setServiceModalVisible(false);
          setJobDescription('');
          setSelectedImages([]);
        }
      );
    } catch (error) {
      console.error('Exception submitting request:', error);
      showDialog('Error', 'An unexpected error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FUNCTIONS ---
  useEffect(() => {
    if (Object.keys(cooldowns).length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCooldowns(prev => {
        const next: Record<string, number> = {};
        let hasChanges = false;

        Object.entries(prev).forEach(([service, seconds]) => {
          if (seconds > 1) {
            next[service] = seconds - 1;
            hasChanges = true;
          } else {
            hasChanges = true;
          }
        });

        return hasChanges ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldowns]);

  const formatCooldown = useCallback((seconds: number) => {
    const minutesPart = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;
    return `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`;
  }, []);

  const renderTopService = ({ item }: { item: typeof topServices[0] }) => {
    const remaining = cooldowns[item.name];

    return (
      <TouchableOpacity
        style={[
          styles.topServiceCard,
          { width: Math.min(120, SCREEN_WIDTH * 0.28), height: Math.min(130, SCREEN_HEIGHT * 0.18) }
        ]}
        onPress={() => {
          if (item.name === 'Consultancies') {
            openServiceModal('Consultancy Services', true);
          } else if (item.name === 'Other Needs') {
            openServiceModal('Custom Needs', false, true);
          } else {
            openServiceModal(item.name);
          }
        }}
      >
        <View style={[
          styles.topServiceIconContainer,
          { width: Math.min(55, SCREEN_WIDTH * 0.14), height: Math.min(55, SCREEN_HEIGHT * 0.08) }
        ]}>
          <MaterialIcons name={item.icon} size={Math.min(28, SCREEN_WIDTH * 0.07)} color="#fff" />
        </View>
        {typeof remaining === 'number' && remaining > 0 ? (
          <Text style={[styles.cooldownTimer, { fontSize: Math.min(13, SCREEN_WIDTH * 0.032), marginTop: Math.min(6, SCREEN_HEIGHT * 0.008) }]}>
            {formatCooldown(remaining)}
          </Text>
        ) : null}
        <Text style={styles.topServiceText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderConsultancyItem = ({ item }: { item: typeof consultancies[0] }) => (
    <TouchableOpacity
      style={styles.serviceGridItem}
      onPress={() => openServiceModal(item.name, true)}
    >
      <View style={[
        styles.serviceGridIconContainer,
        { width: Math.min(65, SCREEN_WIDTH * 0.16), height: Math.min(65, SCREEN_HEIGHT * 0.09) }
      ]}>
        <MaterialIcons name={item.icon} size={Math.min(28, SCREEN_WIDTH * 0.07)} color={COLORS.PRIMARY} />
      </View>
      <Text style={styles.serviceGridText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderOtherServiceItem = ({ item }: { item: typeof otherServices[0] }) => (
    <TouchableOpacity
      style={styles.serviceGridItem}
      onPress={() => openServiceModal(item.name)}
    >
      <View style={[
        styles.serviceGridIconContainer,
        { width: Math.min(65, SCREEN_WIDTH * 0.16), height: Math.min(65, SCREEN_HEIGHT * 0.09) }
      ]}>
        <MaterialIcons name={item.icon} size={Math.min(28, SCREEN_WIDTH * 0.07)} color={COLORS.PRIMARY} />
      </View>
      <Text style={styles.serviceGridText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedPro = ({ item }: { item: typeof featuredPros[0] }) => (
    <View style={[
      styles.proCard,
      { width: Math.min(170, SCREEN_WIDTH * 0.4), padding: Math.min(18, SCREEN_WIDTH * 0.045) }
    ]}>
      <View style={[
        styles.proIconContainer,
        { width: Math.min(55, SCREEN_WIDTH * 0.14), height: Math.min(55, SCREEN_HEIGHT * 0.08) }
      ]}>
        <MaterialIcons name={item.icon} size={Math.min(32, SCREEN_WIDTH * 0.08)} color={COLORS.PRIMARY} />
      </View>
      <View style={styles.proInfo}>
        <Text style={styles.proName}>{item.name}</Text>
        <Text style={styles.proJob}>{item.job}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialIcons name="star" size={Math.min(16, SCREEN_WIDTH * 0.04)} color={COLORS.STAR_COLOR} />
        <Text style={styles.proRating}>{item.rating}</Text>
      </View>
    </View>
  );

  const renderListItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'search':
        return (
          <View style={[
            styles.searchContainer,
            { height: Math.min(55, SCREEN_HEIGHT * 0.07), marginHorizontal: Math.min(18, SCREEN_WIDTH * 0.045) }
          ]}>
            <MaterialIcons
              name="search"
              size={Math.min(24, SCREEN_WIDTH * 0.06)}
              color={COLORS.TEXT_SECONDARY}
              style={{ marginLeft: Math.min(14, SCREEN_WIDTH * 0.035) }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for any service..."
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        );

      case 'customJobBox':
        return (
          <TouchableOpacity style={[
            styles.customJobBox,
            { marginHorizontal: Math.min(18, SCREEN_WIDTH * 0.045), padding: Math.min(18, SCREEN_WIDTH * 0.045) }
          ]} onPress={() => openServiceModal('Custom Job Request', false, true)}>
            <MaterialIcons name="edit" size={Math.min(26, SCREEN_WIDTH * 0.065)} color={COLORS.PRIMARY} />
            <TextInput
              style={[
                styles.customJobInput,
                { minHeight: Math.min(90, SCREEN_HEIGHT * 0.12), padding: Math.min(14, SCREEN_WIDTH * 0.035) }
              ]}
              placeholder="Describe the job you need done (e.g., 'Fix my broken window' or anything else!)"
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              multiline
              value={jobDescription}
              onChangeText={setJobDescription}
              editable={false}
            />
            <TouchableOpacity style={[
              styles.editJobButton,
              { paddingVertical: Math.min(14, SCREEN_HEIGHT * 0.02) }
            ]}>
              <Text style={styles.editJobButtonText}>Request Custom Job</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        );

      case 'ctaBanner':
        return (
          <TouchableOpacity style={[
            styles.ctaBanner,
            { marginHorizontal: Math.min(18, SCREEN_WIDTH * 0.045), marginTop: Math.min(26, SCREEN_HEIGHT * 0.035), padding: Math.min(26, SCREEN_WIDTH * 0.065) }
          ]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.ctaBannerTitle}>Get 20% Off</Text>
              <Text style={styles.ctaBannerSubtitle}>
                On your first 'Plumbing' request
              </Text>
            </View>
            <MaterialIcons
              name="plumbing"
              size={Math.min(48, SCREEN_WIDTH * 0.12)}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>
        );

      case 'header':
        return <Text style={[
          styles.sectionTitle,
          { fontSize: Math.min(24, SCREEN_WIDTH * 0.06), marginTop: Math.min(26, SCREEN_HEIGHT * 0.035), marginBottom: Math.min(18, SCREEN_HEIGHT * 0.025), paddingHorizontal: Math.min(18, SCREEN_WIDTH * 0.045) }
        ]}>{item.title}</Text>;

      case 'topServices':
        return (
          <FlatList
            horizontal
            data={topServices}
            renderItem={renderTopService}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Math.min(14, SCREEN_WIDTH * 0.035),
              paddingVertical: Math.min(7, SCREEN_HEIGHT * 0.01),
            }}
          />
        );

      case 'consultanciesGrid':
        return (
          <FlatList
            data={consultancies}
            renderItem={renderConsultancyItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: Math.min(10, SCREEN_WIDTH * 0.025) }}
          />
        );

      case 'otherServicesGrid':
        return (
          <FlatList
            data={otherServices}
            renderItem={renderOtherServiceItem}
            keyExtractor={(item) => item.id}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: Math.min(10, SCREEN_WIDTH * 0.025) }}
          />
        );

      case 'featuredPros':
        return (
          <FlatList
            horizontal
            data={featuredPros}
            renderItem={renderFeaturedPro}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Math.min(14, SCREEN_WIDTH * 0.035),
              paddingVertical: Math.min(7, SCREEN_HEIGHT * 0.01),
            }}
          />
        );

      case 'howItWorks':
        return (
          <View style={[
            styles.howItWorksContainer,
            { marginHorizontal: Math.min(18, SCREEN_WIDTH * 0.045), marginTop: Math.min(10, SCREEN_HEIGHT * 0.015), gap: Math.min(14, SCREEN_HEIGHT * 0.02) }
          ]}>
            <View style={[
              styles.howItWorksStep,
              { padding: Math.min(18, SCREEN_WIDTH * 0.045) }
            ]}>
              <View style={[
                styles.stepIconContainer,
                { width: Math.min(55, SCREEN_WIDTH * 0.14), height: Math.min(55, SCREEN_HEIGHT * 0.08), marginRight: Math.min(18, SCREEN_WIDTH * 0.045) }
              ]}>
                <MaterialIcons name="search" size={Math.min(32, SCREEN_WIDTH * 0.08)} color={COLORS.PRIMARY} />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>1. Find Your Service</Text>
                <Text style={styles.stepSubtitle}>
                  Browse categories or search for what you need.
                </Text>
              </View>
            </View>
            <View style={[
              styles.howItWorksStep,
              { padding: Math.min(18, SCREEN_WIDTH * 0.045) }
            ]}>
              <View style={[
                styles.stepIconContainer,
                { width: Math.min(55, SCREEN_WIDTH * 0.14), height: Math.min(55, SCREEN_HEIGHT * 0.08), marginRight: Math.min(18, SCREEN_WIDTH * 0.045) }
              ]}>
                <MaterialIcons
                  name="book-online"
                  size={Math.min(32, SCREEN_WIDTH * 0.08)}
                  color={COLORS.PRIMARY}
                />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>2. Book & Confirm</Text>
                <Text style={styles.stepSubtitle}>
                  Select a time and get instant confirmation.
                </Text>
              </View>
            </View>
            <View style={[
              styles.howItWorksStep,
              { padding: Math.min(18, SCREEN_WIDTH * 0.045) }
            ]}>
              <View style={[
                styles.stepIconContainer,
                { width: Math.min(55, SCREEN_WIDTH * 0.14), height: Math.min(55, SCREEN_HEIGHT * 0.08), marginRight: Math.min(18, SCREEN_WIDTH * 0.045) }
              ]}>
                <MaterialIcons
                  name="done-all"
                  size={Math.min(32, SCREEN_WIDTH * 0.08)}
                  color={COLORS.PRIMARY}
                />
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>3. Get It Done</Text>
                <Text style={styles.stepSubtitle}>
                  A verified pro arrives and completes the job.
                </Text>
              </View>
            </View>
          </View>
        );

      case 'safetyBanner':
        return (
          <View style={[
            styles.safetyBanner,
            { marginHorizontal: Math.min(18, SCREEN_WIDTH * 0.045), marginTop: Math.min(26, SCREEN_HEIGHT * 0.035), padding: Math.min(26, SCREEN_WIDTH * 0.065), gap: Math.min(16, SCREEN_HEIGHT * 0.02) }
          ]}>
            <MaterialIcons
              name="verified-user"
              size={Math.min(38, SCREEN_WIDTH * 0.095)}
              color={COLORS.PRIMARY}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.safetyBannerTextTitle}>
                Your Safety, Our Priority
              </Text>
              <Text style={styles.safetyBannerTextSubtitle}>
                All professionals are background-verified and trained.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // --- MAIN LIST DATA (Unchanged) ---
  const mainListData = [
    { type: 'search', id: 'search' },
    { type: 'ctaBanner', id: 'cta' },
    { type: 'header', id: 'header1', title: 'Top Services' },
    { type: 'topServices', id: 'topServicesList' },
    { type: 'header', id: 'header_consult', title: 'Consultancies' },
    { type: 'consultanciesGrid', id: 'consultancies' },
    { type: 'customJobBox', id: 'customJob' },
    { type: 'header', id: 'header_other', title: 'Other Services' },
    { type: 'otherServicesGrid', id: 'otherServices' },
    { type: 'header', id: 'header_how', title: 'How It Works' },
    { type: 'howItWorks', id: 'howItWorks' },
    { type: 'header', id: 'header_pros', title: 'Featured Professionals' },
    { type: 'featuredPros', id: 'featuredProsList' },
    { type: 'safetyBanner', id: 'safety' },
  ];

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View style={{ height: StatusBar.currentHeight, backgroundColor: 'transparent' }} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      {/* Address Editor Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showAddressEditor}
        onRequestClose={handleCancelAddressEditor}
      >
        <AddEditAddress
          onSave={handleSaveAddress}
          onCancel={handleCancelAddressEditor}
          existingAddress={editingAddress}
        />
      </Modal>

      {/* --- UPDATED SERVICE REQUEST MODAL (Responsive, Full Height for Visibility) --- */}
      <Modal
        animationType="slide" // Changed to slide for better mobile feel
        transparent={true}
        visible={serviceModalVisible}
        onRequestClose={() => setServiceModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[
            styles.modalContent,
            { 
              width: '95%', // Wider for small screens
              maxHeight: SCREEN_HEIGHT * 0.95, // Almost full height to ensure submit is visible
              borderRadius: Math.min(20, SCREEN_WIDTH * 0.05),
              padding: Math.min(28, SCREEN_WIDTH * 0.07),
              gap: Math.min(18, SCREEN_HEIGHT * 0.025),
            }
          ]}>
            <ScrollView 
              contentContainerStyle={{ gap: Math.min(16, SCREEN_HEIGHT * 0.02) }} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { top: Math.min(16, SCREEN_HEIGHT * 0.02), right: Math.min(16, SCREEN_WIDTH * 0.04) }
                ]}
                onPress={() => setServiceModalVisible(false)}
              >
                <MaterialIcons name="close" size={Math.min(24, SCREEN_WIDTH * 0.06)} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
              <Text style={[
                styles.modalTitle,
                { fontSize: Math.min(24, SCREEN_WIDTH * 0.06), paddingHorizontal: Math.min(18, SCREEN_WIDTH * 0.045) }
              ]}>
                Hire {selectedService === 'Custom Needs' || selectedService === 'Custom Job Request' ? 'for' : isConsultancy ? 'a' : 'an'} {selectedService}
              </Text>

              <View style={[
                styles.modalLocationContainer,
                { padding: Math.min(18, SCREEN_WIDTH * 0.045), borderRadius: Math.min(14, SCREEN_WIDTH * 0.035), gap: Math.min(12, SCREEN_HEIGHT * 0.015) }
              ]}>
                <MaterialIcons name="location-on" size={Math.min(24, SCREEN_WIDTH * 0.06)} color={COLORS.PRIMARY} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLocationType}>{selectedAddress.type}</Text>
                  <Text style={styles.modalLocationAddress} numberOfLines={1}>
                    {selectedAddress.address}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>

              <Text style={[
                styles.label,
                { fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
              ]}>Full Name</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { height: Math.min(60, SCREEN_HEIGHT * 0.08), paddingHorizontal: Math.min(18, SCREEN_WIDTH * 0.045), fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={[
                styles.label,
                { fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
              ]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  { height: Math.min(60, SCREEN_HEIGHT * 0.08), paddingHorizontal: Math.min(18, SCREEN_WIDTH * 0.045), fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
                ]}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              {isOtherNeeds ? (
                <>
                  <Text style={[
                    styles.label,
                    { fontSize: Math.min(17, SCREEN_WIDTH * 0.0425), fontWeight: 'bold' }
                  ]}>
                    Describe What You Need (Required)
                  </Text>
                  <TextInput
                    style={[
                      styles.modalTextArea,
                      { height: Math.min(150, SCREEN_HEIGHT * 0.2), padding: Math.min(18, SCREEN_WIDTH * 0.045), fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
                    ]}
                    placeholder="e.g., Need help with custom task like event planning, legal advice, or anything else not listed. Be as detailed as possible!"
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    multiline
                    value={jobDescription}
                    onChangeText={setJobDescription}
                    textAlignVertical="top"
                  />
                  <Text style={[
                    styles.helperText,
                    { fontSize: Math.min(14, SCREEN_WIDTH * 0.035) }
                  ]}>
                    We'll match you with the best pro for your unique request.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[
                    styles.label,
                    { fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
                  ]}>Explain your job (Optional)</Text>
                  <TextInput
                    style={[
                      styles.modalTextArea,
                      { height: Math.min(130, SCREEN_HEIGHT * 0.17), padding: Math.min(18, SCREEN_WIDTH * 0.045), fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
                    ]}
                    placeholder="e.g. Need to fix a leaking tap in the kitchen."
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    multiline
                    value={jobDescription}
                    onChangeText={setJobDescription}
                  />
                </>
              )}

              {/* Image Upload Section */}
              <Text style={[
                styles.label,
                { fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
              ]}>Add Photos (Optional - For detailed explanation)</Text>
              <TouchableOpacity style={[
                styles.addImageButton,
                { paddingVertical: Math.min(14, SCREEN_HEIGHT * 0.018), gap: Math.min(7, SCREEN_HEIGHT * 0.009), borderRadius: Math.min(10, SCREEN_WIDTH * 0.025) }
              ]} onPress={pickImage}>
                <MaterialIcons name="add-photo-alternate" size={Math.min(22, SCREEN_WIDTH * 0.055)} color={COLORS.SURFACE} />
                <Text style={[
                  styles.addImageButtonText,
                  { fontSize: Math.min(15, SCREEN_WIDTH * 0.0375) }
                ]}>Add Image from Gallery</Text>
              </TouchableOpacity>

              {selectedImages.length > 0 && (
                <View style={styles.imagesContainer}>
                  <Text style={[
                    styles.label,
                    { marginBottom: Math.min(7, SCREEN_HEIGHT * 0.009), fontSize: Math.min(15, SCREEN_WIDTH * 0.0375) }
                  ]}>Selected Images ({selectedImages.length})</Text>
                  <FlatList
                    data={selectedImages}
                    horizontal
                    renderItem={({ item, index }) => (
                      <View style={[
                        styles.imageThumbnailContainer,
                        { marginRight: Math.min(10, SCREEN_WIDTH * 0.025) }
                      ]}>
                        <Image source={{ uri: item.uri }} style={[
                          styles.imageThumbnail,
                          { width: Math.min(75, SCREEN_WIDTH * 0.1875), height: Math.min(75, SCREEN_HEIGHT * 0.1) }
                        ]} />
                        <TouchableOpacity
                          style={[
                            styles.removeImageButton,
                            { top: -Math.min(6, SCREEN_HEIGHT * 0.008), right: -Math.min(6, SCREEN_WIDTH * 0.015), width: Math.min(22, SCREEN_WIDTH * 0.055), height: Math.min(22, SCREEN_HEIGHT * 0.028) }
                          ]}
                          onPress={() => removeImage(index)}
                        >
                          <MaterialIcons name="close" size={Math.min(18, SCREEN_WIDTH * 0.045)} color={COLORS.SURFACE} />
                        </TouchableOpacity>
                      </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              )}

              {isConsultancy && (
                <View style={[
                  styles.consultancyNote,
                  { padding: Math.min(14, SCREEN_WIDTH * 0.035), borderRadius: Math.min(10, SCREEN_WIDTH * 0.025), gap: Math.min(7, SCREEN_HEIGHT * 0.009), marginVertical: Math.min(7, SCREEN_HEIGHT * 0.009) }
                ]}>
                  <MaterialIcons name="info" size={Math.min(18, SCREEN_WIDTH * 0.045)} color={COLORS.PRIMARY} />
                  <Text style={[
                    styles.consultancyNoteText,
                    { fontSize: Math.min(14, SCREEN_WIDTH * 0.035), lineHeight: Math.min(18, SCREEN_HEIGHT * 0.023) }
                  ]}>
                    Consultancies include virtual or in-person sessions. Select time after submission.
                  </Text>
                </View>
              )}

              {/* Submit Button - Pinned to bottom for visibility */}
              <View style={{ marginTop: Math.min(10, SCREEN_HEIGHT * 0.013) }}>
                <TouchableOpacity 
                  style={[
                    styles.submitButton,
                    { height: Math.min(56, SCREEN_HEIGHT * 0.075), borderRadius: Math.min(28, SCREEN_WIDTH * 0.07), opacity: loading ? 0.5 : 1 }
                  ]}
                  onPress={handleSubmitRequest}
                  disabled={loading}
                >
                  <Text style={[
                    styles.submitButtonText,
                    { fontSize: Math.min(17, SCREEN_WIDTH * 0.0425) }
                  ]}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Address Selection Modal (Responsive) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'flex-end' }]}>
          <View
            style={[
              styles.modalContent,
              {
                width: '100%',
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                maxHeight: SCREEN_HEIGHT * 0.6, // Responsive height
                padding: Math.min(24, SCREEN_WIDTH * 0.06),
                gap: Math.min(14, SCREEN_HEIGHT * 0.018),
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.closeButton,
                { top: Math.min(16, SCREEN_HEIGHT * 0.02), right: Math.min(16, SCREEN_WIDTH * 0.04) }
              ]}
              onPress={() => setAddressModalVisible(false)}
            >
              <MaterialIcons name="close" size={Math.min(22, SCREEN_WIDTH * 0.055)} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <Text style={[
              styles.modalTitle,
              { fontSize: Math.min(22, SCREEN_WIDTH * 0.055) }
            ]}>Select an Address</Text>

            {userAddresses.map((addr) => (
              <View key={addr.id} style={styles.addressItemWrapper}>
                <TouchableOpacity
                  style={[
                    styles.addressItem,
                    { paddingVertical: Math.min(18, SCREEN_HEIGHT * 0.023), gap: Math.min(14, SCREEN_HEIGHT * 0.018) }
                  ]}
                  onPress={() => handleSelectAddress(addr)}
                >
                  <MaterialIcons
                    name={addr.type === 'Home' ? 'home' : addr.type === 'Work' ? 'work' : 'location-on'}
                    size={Math.min(22, SCREEN_WIDTH * 0.055)}
                    color={COLORS.TEXT_PRIMARY}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.addressType,
                      { fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
                    ]}>{addr.type}</Text>
                    <Text style={[
                      styles.addressText,
                      { fontSize: Math.min(14, SCREEN_WIDTH * 0.035) }
                    ]}>{addr.address}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editAddressButton}
                    onPress={() => handleEditAddress(addr)}
                  >
                    <MaterialIcons name="edit" size={18} color={COLORS.PRIMARY} />
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedAddress.id === addr.id && styles.radioOuterSelected,
                      { width: Math.min(20, SCREEN_WIDTH * 0.05), height: Math.min(20, SCREEN_HEIGHT * 0.026) }
                    ]}
                  >
                    {selectedAddress.id === addr.id && (
                      <View style={[
                        styles.radioInner,
                        { width: Math.min(10, SCREEN_WIDTH * 0.025), height: Math.min(10, SCREEN_HEIGHT * 0.013) }
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity 
              style={[
                styles.addNewAddressButton,
                { paddingVertical: Math.min(18, SCREEN_HEIGHT * 0.023), gap: Math.min(14, SCREEN_HEIGHT * 0.018) }
              ]}
              onPress={handleAddNewAddress}
            >
              <MaterialIcons name="add" size={Math.min(22, SCREEN_WIDTH * 0.055)} color={COLORS.PRIMARY} />
              <Text style={[
                styles.addNewAddressText,
                { fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
              ]}>Add a new address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header (Responsive) */}
      <View style={[styles.container]}>
        <View style={[
          styles.header,
          { paddingHorizontal: Math.min(18, SCREEN_WIDTH * 0.045), paddingVertical: Math.min(14, SCREEN_HEIGHT * 0.018) }
        ]}>
          <TouchableOpacity
            style={styles.locationHeader}
            onPress={() => setAddressModalVisible(true)}
          >
            <Text style={[
              styles.locationHeaderTitle,
              { fontSize: Math.min(12, SCREEN_WIDTH * 0.03) }
            ]}>SERVICE ADDRESS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[
                styles.locationHeaderAddress,
                { fontSize: Math.min(16, SCREEN_WIDTH * 0.04) }
              ]} numberOfLines={1}>
                {selectedAddress.type}: {selectedAddress.address}
              </Text>
              <MaterialIcons name="expand-more" size={Math.min(20, SCREEN_WIDTH * 0.05)} color={COLORS.PRIMARY} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[
              styles.notificationButton,
              { width: Math.min(44, SCREEN_WIDTH * 0.11), height: Math.min(44, SCREEN_HEIGHT * 0.057) }
            ]}>
              <MaterialIcons name="notifications-none" size={Math.min(26, SCREEN_WIDTH * 0.065)} color={COLORS.TEXT_PRIMARY} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main content list */}
        <FlatList
          data={mainListData}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.mainListContent,
            { paddingBottom: Math.min(28, SCREEN_HEIGHT * 0.036) }
          ]}
          ListHeaderComponent={<View style={{ height: Math.min(14, SCREEN_HEIGHT * 0.018) }} />}
        />
      </View>
    </SafeAreaView>
        <Modal
          visible={dialogVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseDialog}
        >
          <View style={styles.dialogOverlay}>
            <View
              style={[
                styles.dialogCard,
                dialogVariant === 'success'
                  ? styles.dialogSuccess
                  : dialogVariant === 'error'
                  ? styles.dialogError
                  : styles.dialogInfo,
              ]}
            >
              <Text style={styles.dialogTitle}>{dialogTitle}</Text>
              <Text style={styles.dialogMessage}>{dialogMessage}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                style={styles.dialogButton}
                onPress={handleCloseDialog}
              >
                <Text style={styles.dialogButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </>
  );
};

// --- COLORS (Unchanged) ---
const COLORS = {
  PRIMARY: '#00796B',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#FFFFFF',
  SURFACE_ALT: '#F8F9FA',
  TEXT_PRIMARY: '#212529',
  TEXT_SECONDARY: '#6C757D',
  BORDER: '#DEE2E6',
  STAR_COLOR: '#FFC107',
};

// --- RESPONSIVE STYLES (Scaled with Screen Dimensions) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SURFACE_ALT,
    paddingTop: (StatusBar.currentHeight ?? 0) * 0.3,
    marginTop: 0, 
  },
  locationHeader: {
    flex: 1,
    marginRight: Math.min(14, SCREEN_WIDTH * 0.035),
  },
  locationHeaderTitle: {
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationHeaderAddress: {
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  notificationButton: {
    borderRadius: Math.min(22, SCREEN_WIDTH * 0.055),
    backgroundColor: COLORS.SURFACE_ALT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_ALT,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: Math.min(28, SCREEN_WIDTH * 0.07),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: Math.min(14, SCREEN_WIDTH * 0.035),
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    color: COLORS.TEXT_PRIMARY,
  },
  customJobBox: {
    backgroundColor: COLORS.SURFACE_ALT,
    borderRadius: Math.min(14, SCREEN_WIDTH * 0.035),
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: Math.min(10, SCREEN_HEIGHT * 0.013),
  },
  customJobInput: {
    fontSize: Math.min(16, SCREEN_WIDTH * 0.04),
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.SURFACE,
    borderRadius: Math.min(10, SCREEN_WIDTH * 0.025),
    textAlignVertical: 'top',
  },
  editJobButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: Math.min(10, SCREEN_WIDTH * 0.025),
    alignItems: 'center',
  },
  editJobButtonText: {
    fontWeight: 'bold',
    color: COLORS.SURFACE,
  },
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: Math.min(22, SCREEN_WIDTH * 0.055),
    overflow: 'hidden',
  },
  ctaBannerTitle: {
    fontWeight: 'bold',
    color: COLORS.SURFACE,
  },
  ctaBannerSubtitle: {
    color: COLORS.SURFACE,
    opacity: 0.9,
  },
  mainListContent: {
    flexGrow: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  topServiceCard: {
    borderRadius: Math.min(22, SCREEN_WIDTH * 0.055),
    marginRight: Math.min(14, SCREEN_WIDTH * 0.035),
    padding: Math.min(14, SCREEN_WIDTH * 0.035),
    justifyContent: 'space-between',
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Math.min(3, SCREEN_HEIGHT * 0.004) },
    shadowOpacity: 0.08,
    shadowRadius: Math.min(10, SCREEN_WIDTH * 0.025),
    elevation: 5,
  },
  topServiceIconContainer: {
    borderRadius: Math.min(18, SCREEN_WIDTH * 0.045),
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topServiceText: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  cooldownTimer: {
    fontWeight: '700',
    color: COLORS.PRIMARY,
    textAlign: 'center',
  },
  serviceGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Math.min(18, SCREEN_HEIGHT * 0.023),
    gap: Math.min(7, SCREEN_HEIGHT * 0.009),
  },
  serviceGridIconContainer: {
    borderRadius: Math.min(32, SCREEN_WIDTH * 0.08),
    backgroundColor: COLORS.SURFACE_ALT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceGridText: {
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  // Image Styles
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
  },
  addImageButtonText: {
    fontWeight: '600',
    color: COLORS.SURFACE,
  },
  imagesContainer: {
    marginTop: Math.min(7, SCREEN_HEIGHT * 0.009),
  },
  imageThumbnailContainer: {
    position: 'relative',
  },
  imageThumbnail: {
    borderRadius: Math.min(7, SCREEN_WIDTH * 0.0175),
  },
  removeImageButton: {
    position: 'absolute',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: Math.min(11, SCREEN_WIDTH * 0.0275),
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: COLORS.BACKGROUND,
  },
  modalTitle: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  modalInput: {
    backgroundColor: COLORS.SURFACE_ALT,
    borderRadius: Math.min(14, SCREEN_WIDTH * 0.035),
    color: COLORS.TEXT_PRIMARY,
  },
  modalTextArea: {
    backgroundColor: COLORS.SURFACE_ALT,
    borderRadius: Math.min(14, SCREEN_WIDTH * 0.035),
    color: COLORS.TEXT_PRIMARY,
    textAlignVertical: 'top',
  },
  helperText: {
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: Math.min(20, SCREEN_HEIGHT * 0.026),
  },
  consultancyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Math.min(7, SCREEN_HEIGHT * 0.009),
    backgroundColor: COLORS.SURFACE_ALT,
    borderRadius: Math.min(10, SCREEN_WIDTH * 0.025),
  },
  consultancyNoteText: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontWeight: 'bold',
    color: COLORS.SURFACE,
  },
  closeButton: {
    position: 'absolute',
    zIndex: 1,
  },
  modalLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_ALT,
    borderRadius: Math.min(14, SCREEN_WIDTH * 0.035),
  },
  modalLocationType: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  modalLocationAddress: {
    color: COLORS.TEXT_SECONDARY,
  },
  changeButtonText: {
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  addressItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.SURFACE_ALT,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editAddressButton: {
    padding: 8,
    marginRight: 8,
  },
  addressType: {
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  addressText: {
    color: COLORS.TEXT_SECONDARY,
  },
  radioOuter: {
    borderRadius: Math.min(10, SCREEN_WIDTH * 0.025),
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.PRIMARY,
  },
  radioInner: {
    borderRadius: Math.min(5, SCREEN_WIDTH * 0.0125),
    backgroundColor: COLORS.PRIMARY,
  },
  addNewAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addNewAddressText: {
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  // Pro Styles
  proCard: {
    borderRadius: Math.min(22, SCREEN_WIDTH * 0.055),
    marginRight: Math.min(14, SCREEN_WIDTH * 0.035),
    backgroundColor: COLORS.SURFACE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Math.min(3, SCREEN_HEIGHT * 0.004) },
    shadowOpacity: 0.08,
    shadowRadius: Math.min(10, SCREEN_WIDTH * 0.025),
    elevation: 5,
    gap: Math.min(12, SCREEN_HEIGHT * 0.015),
  },
  proIconContainer: {
    borderRadius: Math.min(28, SCREEN_WIDTH * 0.07),
    backgroundColor: COLORS.SURFACE_ALT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proInfo: {
    flex: 1,
  },
  proName: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  proJob: {
    color: COLORS.TEXT_SECONDARY,
  },
  proRating: {
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  // How It Works
  howItWorksContainer: {
  },
  howItWorksStep: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: Math.min(14, SCREEN_WIDTH * 0.035),
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  stepIconContainer: {
    borderRadius: Math.min(28, SCREEN_WIDTH * 0.07),
    backgroundColor: COLORS.SURFACE_ALT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  stepSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: Math.min(3, SCREEN_HEIGHT * 0.004),
  },
  // Safety Banner
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE_ALT,
    borderRadius: Math.min(22, SCREEN_WIDTH * 0.055),
  },
  safetyBannerTextTitle: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: Math.min(5, SCREEN_HEIGHT * 0.0065),
  },
  safetyBannerTextSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    lineHeight: Math.min(20, SCREEN_HEIGHT * 0.026),
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    borderRadius: Math.min(20, SCREEN_WIDTH * 0.05),
    padding: Math.min(24, SCREEN_WIDTH * 0.06),
    backgroundColor: COLORS.SURFACE,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  dialogSuccess: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.PRIMARY,
  },
  dialogError: {
    borderLeftWidth: 6,
    borderLeftColor: '#c0392b',
  },
  dialogInfo: {
    borderLeftWidth: 6,
    borderLeftColor: '#ec8627',
  },
  dialogTitle: {
    fontSize: Math.min(20, SCREEN_WIDTH * 0.05),
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: Math.min(10, SCREEN_HEIGHT * 0.013),
  },
  dialogMessage: {
    fontSize: Math.min(15, SCREEN_WIDTH * 0.038),
    color: COLORS.TEXT_SECONDARY,
    marginBottom: Math.min(20, SCREEN_HEIGHT * 0.026),
    lineHeight: Math.min(21, SCREEN_HEIGHT * 0.027),
  },
  dialogButton: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: Math.min(24, SCREEN_WIDTH * 0.06),
    paddingVertical: Math.min(10, SCREEN_HEIGHT * 0.013),
    borderRadius: 999,
  },
  dialogButtonText: {
    color: COLORS.SURFACE,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

export default HirePerson;