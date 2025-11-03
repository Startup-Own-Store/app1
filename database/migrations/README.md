# Database Migrations

This folder contains SQL migration files for the Supabase database.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to the **SQL Editor** section
3. Click **New Query**
4. Copy and paste the contents of `create_user_profiles_table_fixed.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd e:\FreeLancing\app1

# Run the migration
supabase db push
```

## Migrations in this folder

### create_user_profiles_table_fixed.sql (⭐ USE THIS ONE)

**This is the corrected version with proper RLS policies.**

Creates the `user_profiles` table for storing authenticated user information.

### create_user_profiles_table.sql

Original version (has RLS policy issues - use the fixed version instead).

**Features:**
- Stores user profile data (name, email, phone, avatar)
- Linked to Supabase Auth users via `user_id`
- Row Level Security (RLS) enabled
- Automatic profile creation on user signup via trigger
- Automatic `updated_at` timestamp updates

**Table Structure:**
- `id`: UUID primary key
- `user_id`: UUID reference to auth.users (unique)
- `name`: User's full name
- `email`: User's email address
- `phone`: Optional phone number
- `avatar_url`: Optional profile picture URL
- `created_at`: Timestamp of profile creation
- `updated_at`: Timestamp of last update

## Verification

After running the migration, verify it was successful:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see the `user_profiles` table
3. Check the **Policies** tab to ensure RLS policies are active

## Notes

- The migration includes a trigger that automatically creates a user profile when a new user signs up
- Users can only view, update, and delete their own profiles (enforced by RLS policies)
- The `updated_at` field is automatically updated on every profile modification
