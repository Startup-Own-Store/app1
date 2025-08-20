// // FirebaseConfig.ts
// import { initializeApp, getApps, getApp } from 'firebase/app';
// import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: 'AIzaSyB2LE7u_0Kd-yNn9DoBCFkqo1zpyNfbT70',
//   authDomain: 'ownstore-1234.firebaseapp.com',
//   projectId: 'ownstore-1234',
//   storageBucket: 'ownstore-1234.appspot.com',
//   messagingSenderId: '1054963152708',
//   appId: '1:1054963152708:android:9300f223d716baa2a28911', // Updated with correct App ID from google-services.json
// };

// // Initialize Firebase only once
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // Firebase services
// const auth = getAuth(app);
// const db = getFirestore(app);

// // Configure Google Auth Provider
// const googleProvider = new GoogleAuthProvider();
// googleProvider.addScope('profile');
// googleProvider.addScope('email');

// export { app, auth, db, googleProvider };










// FirebaseConfig.ts

// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDobH4u_0Kd-yNn9DoBCFkqo1zpyNfbT70",
//   authDomain: "ownstore-1234.firebaseapp.com",
//   projectId: "ownstore-1234",
//   storageBucket: "ownstore-1234.appspot.com",
//   messagingSenderId: "1054963152708",
//   appId: "1:1054963152708:android:9300f223d716baa2a28911",
// };

// // Initialize Firebase app (only once)
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // Auth
// const auth = getAuth(app);

// // Firestore
// const db = getFirestore(app);

// // Google Auth Provider
// const googleProvider = new GoogleAuthProvider();
// googleProvider.addScope("profile");
// googleProvider.addScope("email");

// export { app, auth, db, googleProvider };









// import { initializeApp, getApps, getApp } from "firebase/app";
// import { 
//   initializeAuth, 
//   // @ts-ignore
//   getReactNativePersistence, 
//   GoogleAuthProvider 
// } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getFirestore } from "firebase/firestore";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDobH4u_0Kd-yNn9DoBCFkqo1zpyNfbT70",
//   authDomain: "ownstore-1234.firebaseapp.com",
//   projectId: "ownstore-1234",
//   storageBucket: "ownstore-1234.appspot.com",
//   messagingSenderId: "1054963152708",
//   appId: "1:1054963152708:android:9300f223d716baa2a28911",
// };

// // Initialize Firebase app (only once)
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // Initialize Auth with React Native persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });

// // Firestore
// const db = getFirestore(app);

// // Google Auth Provider
// const googleProvider = new GoogleAuthProvider();
// googleProvider.addScope("profile");
// googleProvider.addScope("email");

// export { app, auth, db, googleProvider };