import { createClient } from '@supabase/supabase-js';
import auth from '@react-native-firebase/auth';

const supabase = createClient(
  'https://ubadjmwfiujrrsqcliyt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYWRqbXdmaXVqcnJzcWNsaXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MDc1MjcsImV4cCI6MjA3MDk4MzUyN30.NhuZSMKrMJwZLiyOzVs-D5s_-rsh3kBGKamJILorBFY',
  {
    accessToken: async () => {
      const user = auth().currentUser;
      return user ? await user.getIdToken() : null;
    },
  }
);

export default supabase;