import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRoute, useNavigation, StackActions } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { nextRoute } = route.params as { nextRoute: 'Welcome' | 'MainTabs' | null };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.dispatch(StackActions.replace(nextRoute || 'Welcome'));
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, nextRoute]);

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
