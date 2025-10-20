import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ubadjmwfiujrrsqcliyt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYWRqbXdmaXVqcnJzcWNsaXl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MDc1MjcsImV4cCI6MjA3MDk4MzUyN30.NhuZSMKrMJwZLiyOzVs-D5s_-rsh3kBGKamJILorBFY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;