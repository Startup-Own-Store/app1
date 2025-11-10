import auth from '@react-native-firebase/auth';

class FirebaseClient {
  async signInWithPhoneNumber(phoneNumber, retries = 2) {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      return { confirmation, error: null };
    } catch (error) {
      console.error('Firebase signInWithPhoneNumber error:', error);

      // Retry on network errors
      if (error.code === 'auth/network-request-failed' && retries > 0) {
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.signInWithPhoneNumber(phoneNumber, retries - 1);
      }

      return { confirmation: null, error };
    }
  }

  async confirmCode(confirmation, code) {
    try {
      const result = await confirmation.confirm(code);
      return { 
        user: result.user, 
        error: null 
      };
    } catch (error) {
      console.error('Firebase confirmCode error:', error);
      return { user: null, error };
    }
  }



  getCurrentUser() {
    return auth().currentUser;
  }

  async signOut() {
    try {
      await auth().signOut();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  onAuthStateChanged(callback) {
    return auth().onAuthStateChanged(callback);
  }

  async getUserRole(firebaseUid) {
    // Since sync happens via Express server, just return default role
    // The actual role will be handled by your main app logic
    return 'user';
  }
}

export default new FirebaseClient();