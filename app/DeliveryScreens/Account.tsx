import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const AccountScreen = ({ onBack }: { onBack: () => void }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Account</Text>
          <View style={styles.headerIcons} />
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileImage}>👤</Text>
            </View>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@email.com</Text>
            <Text style={styles.profilePhone}>+1 (555) 123-4567</Text>
          </View>
          
          {/* Earnings Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>$342.50</Text>
                <Text style={styles.summaryLabel}>Total Earned</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>28</Text>
                <Text style={styles.summaryLabel}>Deliveries</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>4.8⭐</Text>
                <Text style={styles.summaryLabel}>Rating</Text>
              </View>
            </View>
          </View>
          
          {/* Vehicle Info Card */}
          <View style={styles.vehicleSection}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.vehicleCard}>
              <Text style={styles.vehicleIcon}>🚗</Text>
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleModel}>Honda Civic 2020</Text>
                <Text style={styles.vehiclePlate}>License: ABC-1234</Text>
                <Text style={styles.vehicleStatus}>✅ Verified</Text>
              </View>
            </View>
          </View>
          
          {/* Recent Activity */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📦</Text>
              <View style={styles.activityDetails}>
                <Text style={styles.activityText}>Delivered to Sarah M.</Text>
                <Text style={styles.activityTime}>2 hours ago • $12.50</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityIcon}>📦</Text>
              <View style={styles.activityDetails}>
                <Text style={styles.activityText}>Delivered to Mike R.</Text>
                <Text style={styles.activityTime}>4 hours ago • $8.75</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>Earnings History</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>Notifications</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={styles.menuText}>Help & Support</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, styles.logoutItem]}>
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomSpacing} />
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 28,
    color: '#1b140d',
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    elevation: 3,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3ede7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b140d',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#8b725b',
  },
  profilePhone: {
    fontSize: 14,
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
  summarySection: {
    margin: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b140d',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8b725b',
    marginTop: 4,
  },
  vehicleSection: {
    margin: 16,
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b140d',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#8b725b',
    marginTop: 2,
  },
  vehicleStatus: {
    fontSize: 14,
    color: '#4caf50',
    marginTop: 2,
  },
  activitySection: {
    margin: 16,
  },
  activityItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#1b140d',
  },
  activityTime: {
    fontSize: 14,
    color: '#8b725b',
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1b140d',
  },
  menuArrow: {
    fontSize: 18,
    color: '#8b725b',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#e74c3c',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default AccountScreen;