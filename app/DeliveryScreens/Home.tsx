import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  ScrollView,
} from 'react-native';

const DeliveryHomeScreen = () => {
  const [isAvailable, setIsAvailable] = React.useState(true);

  const toggleAvailability = () => setIsAvailable(!isAvailable);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
          <TouchableOpacity>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityTextContainer}>
              <Text style={styles.availabilityTitle}>
                {isAvailable ? 'You are Online' : 'You are Offline'}
              </Text>
              <Text style={styles.availabilitySubtitle}>
                {isAvailable ? 'Available for orders' : 'Not receiving orders'}
              </Text>
            </View>
            <Switch
              onValueChange={toggleAvailability}
              value={isAvailable}
            />
          </View>

          <View style={styles.dashboardContainer}>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardValue}>$125.50</Text>
              <Text style={styles.dashboardLabel}>Today's Earnings</Text>
            </View>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardValue}>8</Text>
              <Text style={styles.dashboardLabel}>Completed</Text>
            </View>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardValue}>4h 30m</Text>
              <Text style={styles.dashboardLabel}>Online Time</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Current Order</Text>

          {isAvailable ? (
            <View style={styles.orderItemContainer}>
              <View style={styles.orderHeader}>
                <View style={styles.orderIconContainer}>
                  <Text style={styles.orderIcon}>🏪</Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.customerName}>Liam Carter</Text>
                  <Text style={styles.orderAddress}>The Italian Place, 123 Pizza Lane</Text>
                </View>
              </View>
              <View style={styles.orderValueRow}>
                <Text style={styles.orderValueLabel}>Items: <Text style={styles.orderValue}>3</Text></Text>
                <Text style={styles.orderValueLabel}>Distance: <Text style={styles.orderValue}>3.2 km</Text></Text>
                <Text style={styles.orderValueLabel}>Earnings: <Text style={styles.orderValue}>$3.50</Text></Text>
              </View>
              <View style={styles.orderActions}>
                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonIcon}>📞</Text>
                  <Text style={styles.orderButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.orderButton}>
                  <Text style={styles.orderButtonIcon}>🧭</Text>
                  <Text style={styles.orderButtonText}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.orderButton, styles.completeButton]}>
                  <Text style={styles.orderButtonIcon}>✅</Text>
                  <Text style={[styles.orderButtonText, styles.completeButtonText]}>Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <Text style={styles.emptyOrdersText}>You are offline.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcfaf8',
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b140d',
  },
  settingsIcon: {
    fontSize: 28,
  },
  availabilityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  availabilityTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b140d',
  },
  availabilitySubtitle: {
    fontSize: 14,
    color: '#8b725b',
    marginTop: 4,
  },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  dashboardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b140d',
  },
  dashboardLabel: {
    fontSize: 12,
    color: '#8b725b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b140d',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  orderItemContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3ede7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  orderIcon: {
    fontSize: 24,
  },
  orderDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b140d',
  },
  orderAddress: {
    fontSize: 14,
    color: '#8b725b',
  },
  orderValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  orderValueLabel: {
    fontSize: 14,
    color: '#8b725b',
  },
  orderValue: {
    fontWeight: 'bold',
    color: '#1b140d',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f3ede7',
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  orderButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  orderButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#1b140d',
  },
  completeButtonText: {
    color: '#ffffff',
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 16,
  },
  emptyOrdersText: {
    fontSize: 16,
    color: '#8b725b',
    textAlign: 'center',
  },
});

export default DeliveryHomeScreen;