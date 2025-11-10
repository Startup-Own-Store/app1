import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = {
	...(Constants.manifest?.extra ?? {}),
	...(Constants.expoConfig?.extra ?? {}),
};

const supabaseUrl = typeof extra.supabaseUrl === 'string' ? extra.supabaseUrl.trim() : '';
const supabaseAnonKey = typeof extra.supabaseAnonKey === 'string' ? extra.supabaseAnonKey.trim() : '';

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn('Supabase credentials missing from Expo config. Check app.config.js extra values.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;