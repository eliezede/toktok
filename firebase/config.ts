import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

console.log("FirebaseConfig: Starting initialization");

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log("FirebaseConfig: Config keys present:", !!firebaseConfig.apiKey, !!firebaseConfig.projectId);
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
console.log("FirebaseConfig: App initialized");

const getPreferredAuth = () => {
    if (Platform.OS === 'web') return getAuth(app);
    try {
        return initializeAuth(app, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
    } catch (error) {
        console.warn("FirebaseConfig: Native persistence failed, falling back to memory.", error);
        return getAuth(app);
    }
};

export const auth = getPreferredAuth();
console.log("FirebaseConfig: Auth initialized");

export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
