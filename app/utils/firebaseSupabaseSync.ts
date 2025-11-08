import auth from '@react-native-firebase/auth';
import { Platform } from 'react-native';

// Update this URL based on your environment
export const getApiUrl = () => {
  if (__DEV__) {
    // Development mode - use your computer's IP address
    // This works for both Android emulator and physical devices
    return 'http://10.40.39.26:3000';
  }
  // Production URL
  return 'https://ownstore-api.onrender.com';
};

const API_URL = getApiUrl();

interface SyncResult {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Syncs Firebase user to Supabase via Express backend
 * This function gets the current Firebase user's ID token and metadata,
 * then sends it to the Express server to store in Supabase database.
 */
export const syncFirebaseUserToSupabase = async (
  role: string = 'user'
): Promise<SyncResult> => {
  try {
    const firebaseUser = auth().currentUser;

    if (!firebaseUser) {
      console.warn('No Firebase user found');
      return { success: false, error: 'No Firebase user found' };
    }

    // Get Firebase ID token (this is a JWT that proves the user's identity)
    const idToken = await firebaseUser.getIdToken();

    // Prepare metadata to send to the server
    const metadata = {
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      phoneNumber: firebaseUser.phoneNumber,
      photoURL: firebaseUser.photoURL,
      providers: firebaseUser.providerData.map(p => p.providerId),
    };

    console.log('Syncing Firebase user to Supabase...', {
      uid: firebaseUser.uid,
      phone: firebaseUser.phoneNumber,
      apiUrl: API_URL, // Added to debug which URL is being used
    });

    // Call Express API endpoint
    console.log('🌐 Making POST request to:', `${API_URL}/app/api/sync-firebase-user`);
    console.log('📦 Request payload:', {
      idToken: idToken.substring(0, 20) + '...',
      metadata,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_URL}/app/api/sync-firebase-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken,
        metadata,
        role, // Include role in the request
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    const result = await response.json();
    console.log('📋 Response data:', result);

    if (!response.ok) {
      console.error('Sync failed:', result);
      return { 
        success: false, 
        error: result.error || result.details || 'Sync failed' 
      };
    }

    console.log('User synced successfully to Supabase:', result);
    return { success: true, user: result.user };

  } catch (error: any) {
    console.error('❌ Sync error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    let errorMessage = error.message || 'Unknown error occurred';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - server not reachable';
    } else if (error.message?.includes('Network request failed')) {
      errorMessage = 'Network error - cannot reach server at ' + API_URL;
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

/**
 * Gets the current Firebase user's ID token
 * Useful for making authenticated requests to your backend
 */
export const getFirebaseIdToken = async (): Promise<string | null> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      console.warn('No Firebase user logged in');
      return null;
    }
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

/**
 * Gets the current Firebase user's UID
 */
export const getFirebaseUid = (): string | null => {
  const user = auth().currentUser;
  return user?.uid || null;
};
