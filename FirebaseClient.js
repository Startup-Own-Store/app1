import auth from '@react-native-firebase/auth';
import supabase from './SupabaseClient';

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

      // Sync user to Supabase
      const supabaseResult = await this.createOrUpdateSupabaseUser(result.user);

      return { 
        user: result.user, 
        supabaseUser: supabaseResult.user,
        userRole: supabaseResult.role,
        error: null 
      };
    } catch (error) {
      console.error('Firebase confirmCode error:', error);
      return { user: null, supabaseUser: null, userRole: null, error };
    }
  }

  async createOrUpdateSupabaseUser(firebaseUser) {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ 
            last_sign_in: new Date().toISOString(),
            phone_number: firebaseUser.phoneNumber 
          })
          .eq('firebase_uid', firebaseUser.uid)
          .select()
          .single();

        if (updateError) throw updateError;
        return { user: updatedUser, role: updatedUser.role };
      } else {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            firebase_uid: firebaseUser.uid,
            phone_number: firebaseUser.phoneNumber,
            role: 'user',
            created_at: new Date().toISOString(),
            last_sign_in: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return { user: newUser, role: newUser.role };
      }
    } catch (error) {
      console.error('Error creating/updating Supabase user:', error);
      return { user: null, role: 'user' };
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
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) throw error;
      return user?.role || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
  }
}

export default new FirebaseClient();