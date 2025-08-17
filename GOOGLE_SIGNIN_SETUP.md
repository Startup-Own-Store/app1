# Google Sign-In Setup for OwnStore

This document outlines the configuration for Google Sign-In in the OwnStore React Native application.

## Configuration Files Updated

### 1. Login.tsx
- Replaced `expo-auth-session` with `@react-native-google-signin/google-signin`
- Updated Google Sign-In implementation to use proper Firebase integration
- Added proper error handling and user feedback

### 2. app.json
- Added Google Services configuration
- Specified the correct package name and bundle identifier

### 3. AndroidManifest.xml
- Added necessary permissions for Google Sign-In
- Added Google Sign-In configuration meta-data

### 4. google_sign_in_config.xml
- Created configuration file with the correct web client ID

### 5. FirebaseConfig.ts
- Updated with correct Firebase configuration
- Added Google Auth Provider configuration
- Fixed API key and app ID

### 6. build.gradle
- Added Google Sign-In dependencies
- Ensured Google Services plugin is applied

### 7. proguard-rules.pro
- Added ProGuard rules to prevent obfuscation of Google Sign-In classes

## Google Services Configuration

The application uses the following Google Services configuration:
- **Project ID**: ownstore-1234
- **Web Client ID**: 1054963152708-f18tik1hb0upf6d0ijhh2p7kki9fitac.apps.googleusercontent.com
- **Package Name**: com.ajay.ownstoredemo

## Dependencies

The following dependencies are required:
- `@react-native-google-signin/google-signin`: ^15.0.0
- `firebase`: ^12.1.0
- Google Play Services Auth: 20.7.0
- Google Play Services Base: 18.3.0

## Testing

To test Google Sign-In:
1. Ensure the device has Google Play Services installed
2. Build and run the application on a physical device (not emulator)
3. Tap the "Sign in with Google" button
4. Complete the Google Sign-In flow

## Troubleshooting

### Common Issues:
1. **"Play Services not available"**: Ensure Google Play Services is up to date
2. **"Sign-In cancelled"**: User cancelled the sign-in process
3. **"Network error"**: Check internet connection and Firebase configuration

### Debug Steps:
1. Verify `google-services.json` is in the correct location
2. Check that the package name matches in all configuration files
3. Ensure the SHA-1 fingerprint is correct in Firebase Console
4. Verify the client ID matches between Firebase and the app

## Security Notes

- Never commit API keys to version control
- Use different client IDs for debug and release builds
- Implement proper error handling for production use
- Consider implementing additional security measures like phone number verification
