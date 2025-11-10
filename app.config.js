import 'dotenv/config';

export default {
  expo: {
    name: "OwnStore",
    displayName: "OwnStore",
    slug: "ownstore",
    scheme: "ownstore",
    owner: "ajay252",
    android: {
      package: "com.ajay.ownstoredemo",
      googleServicesFile: "android/app/google-services.json",
      versionCode: 1,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_CLOUD_API_KEY
        }
      }
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_CLOUD_API_KEY
      }
    },
    extra: {
      eas: {
        projectId: "21a51883-465a-43d6-ae71-5328d4ef8818"
      },
      prodApiUrl: process.env.EXPO_PUBLIC_PROD_API_URL,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    },
    plugins: [
      "expo-web-browser",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUseUsageDescription:
            "Allow OwnStore to use your location."
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth"
    ]
  }
};
