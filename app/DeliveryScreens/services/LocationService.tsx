// services/locationService.ts
import * as Location from 'expo-location';
import supabase from '../../../SupabaseClient';


class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private isTracking = false;
  private updateInterval: NodeJS.Timeout | null = null;

  async startLocationTracking() {
    try {
      console.log('📍 Starting location tracking service...');
      
      // Stop any existing tracking
      this.stopLocationTracking();

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Get initial location immediately
      await this.updateCurrentLocation();

      // Start continuous tracking with watchPositionAsync
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Every 10 seconds
          distanceInterval: 10, // Every 10 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        },
        (error) => {
          console.error('📍 Location watch error:', error);
          // Try to restart tracking on error
          this.restartTracking();
        }
      );

      // Backup: Also set up an interval to force updates every 15 seconds
      this.updateInterval = setInterval(async () => {
        await this.updateCurrentLocation();
      }, 15000);

      this.isTracking = true;
      console.log('📍 Location tracking service ACTIVE - Continuous 10-second updates');
      
    } catch (error) {
      console.error('📍 Error starting location tracking:', error);
      throw error;
    }
  }

  private async restartTracking() {
    console.log('📍 Restarting location tracking...');
    try {
      this.stopLocationTracking();
      await this.startLocationTracking();
    } catch (error) {
      console.error('📍 Failed to restart location tracking:', error);
    }
  }

  private async updateCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await this.handleLocationUpdate(location);
    } catch (error) {
      console.error('📍 Error getting current location:', error);
    }
  }

  private async handleLocationUpdate(location: Location.LocationObject) {
    try {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(),
      };

      await this.updateLocationInDatabase(locationData);
    } catch (error) {
      console.error('📍 Error handling location update:', error);
    }
  }

  private async updateLocationInDatabase(location: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('📍 No user found, skipping location update');
        return;
      }

      // Convert to Indian 12-hour format
      const now = new Date();
      const indianTime = this.formatIndianTime(now);

      const { error } = await supabase
        .from('delivery_profiles')
        .update({
          latitude: location.latitude,
          longitude: location.longitude,
          current_location_updated_at: now.toISOString(), // Keep ISO for database
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('📍 Error updating location in database:', error);
      } else {
        console.log('📍 Location updated:', {
          lat: location.latitude.toFixed(6),
          lng: location.longitude.toFixed(6),
          time: indianTime // Indian format in logs
        });
      }
    } catch (error) {
      console.error('📍 Error in updateLocationInDatabase:', error);
    }
  }

  // Format time in Indian 12-hour format (e.g., "5:46:05 PM")
  private formatIndianTime(date: Date): string {
    return date.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  stopLocationTracking() {
    console.log('📍 Stopping location tracking service...');
    
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isTracking = false;
    console.log('📍 Location tracking service STOPPED');
  }

  isTrackingActive(): boolean {
    return this.isTracking;
  }

  // Method to manually trigger a location update
  async manualLocationUpdate() {
    if (this.isTracking) {
      await this.updateCurrentLocation();
    }
  }
}

// Export a singleton instance
export const locationService = new LocationService();