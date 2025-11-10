import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const navigation = useNavigation();
  const [targetRoute, setTargetRoute] = useState<'Welcome' | 'MainTabs'>('Welcome');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      try {
        const [storedName, storedSession, onboardedFlag] = await Promise.all([
          AsyncStorage.getItem('userName'),
          AsyncStorage.getItem('userSession'),
          AsyncStorage.getItem('guestOnboarded'),
        ]);

        if (!active) {
          return;
        }

        let hasSession = false;

        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            hasSession = parsed && typeof parsed === 'object' && typeof parsed.id === 'string';
          } catch (parseError) {
            console.warn('Unable to parse stored session.', parseError);
          }
        }

        if (storedName || hasSession || onboardedFlag === 'true') {
          setTargetRoute('MainTabs');
        }
      } catch (error) {
        console.warn('Failed to determine splash route.', error);
      } finally {
        if (active) {
          setReady(true);
        }
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const timer = setTimeout(() => {
      navigation.dispatch(StackActions.replace(targetRoute));
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation, ready, targetRoute]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/loader.json')}
        autoPlay
        loop={false}
        style={{ width: 220, height: 220 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
