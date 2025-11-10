import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  PRIMARY: '#00796B',
  BACKGROUND: '#FFFFFF',
  SURFACE: '#FFFFFF',
  SURFACE_ALT: '#F8F9FA',
  TEXT_PRIMARY: '#212529',
  TEXT_SECONDARY: '#6C757D',
  BORDER: '#DEE2E6',
};

const Notifications = () => {
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ✅ Spacer to push content below translucent status bar */}
      <View style={{ height: StatusBar.currentHeight }} />

      <SafeAreaView
        style={styles.safeArea}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <Text style={styles.header}>Notifications</Text>

          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No Notifications Yet</Text>
            <Text style={styles.emptySubtitle}>
              You will receive updates and alerts here.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 24,
  },
  emptyBox: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Notifications;