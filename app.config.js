export default {
  expo: {
    name: "STEMM-Lab-Mobile-App",
    slug: "STEMM-Lab-Mobile-App",
    version: "1.0.0",
    orientation: "portrait",

    plugins: ["react-native-google-mobile-ads"],

    android: {
      package: "com.tonnyuuu340.stemmlabmobileapp"
    },

    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,

      eas: {
        projectId: "93b3d250-5852-4cb0-9c4d-48d2bc429d78"
      }
    }
  }
};