import { Ionicons } from '@expo/vector-icons';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { UserRole } from '../types';

interface GoogleSignInButtonProps {
    text?: string;
    roleOnSignup?: UserRole; // If signing up, what role to give them
}

export default function GoogleSignInButton({ text = "Continue with Google", roleOnSignup = 'buyer' }: GoogleSignInButtonProps) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Configure Google Sign in
        // In a real production app, webClientId comes from your Firebase console -> Authentication -> Sign-in method -> Google -> Web SDK configuration
        // GoogleSignin.configure({
        //     webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'dummy-client-id-for-dev.apps.googleusercontent.com',
        //     offlineAccess: true,
        // });
    }, []);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            // --- NATIVE GOOGLE SIGN IN (DISABLED FOR EXPO GO) ---
            // await GoogleSignin.hasPlayServices();
            // const userInfo = await GoogleSignin.signIn();

            // // Wait for token
            // const { idToken } = await GoogleSignin.getTokens();

            // if (!idToken) {
            //     throw new Error('No ID token found');
            // }

            // // Create a Google credential with the token
            // const googleCredential = GoogleAuthProvider.credential(idToken);

            // // Sign-in the user with the credential
            // const userCredential = await signInWithCredential(auth, googleCredential);
            // const user = userCredential.user;

            // // Check if user document exists in Firestore
            // const userDocRef = doc(db, 'users', user.uid);
            // const userDocSnap = await getDoc(userDocRef);

            // if (!userDocSnap.exists()) {
            //     // If it doesn't exist, this is a new signup via Google
            //     await setDoc(userDocRef, {
            //         id: user.uid,
            //         fullName: user.displayName || 'TokTok User',
            //         email: user.email,
            //         role: roleOnSignup,
            //         accountPlan: 'Free',
            //         isVerified: false,
            //         createdAt: Date.now(),
            //         savedProperties: [],
            //         followedAgents: [],
            //     });
            // }

            // router.replace('/(tabs)');

            Alert.alert(
                'Expo Go Mode',
                'Native Google Sign-In is disabled. Please use Email/Password to test the app in Expo Go.',
                [{ text: 'OK' }]
            );

        } catch (error: any) {
            console.error(error);
            if (error?.code !== 'ASYNC_OP_IN_PROGRESS' && error?.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert('Google Sign-In Error', error.message || 'An error occurred during Google Sign-In.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableOpacity
            className="w-full bg-white border border-gray-300 py-4 rounded-full flex-row items-center justify-center shadow-sm"
            onPress={handleGoogleSignIn}
            disabled={loading}
        >
            <View className="mr-3">
                <Ionicons name="logo-google" size={24} color="#DB4437" />
            </View>
            <Text className="text-gray-800 font-bold text-lg">{loading ? 'Please wait...' : text}</Text>
        </TouchableOpacity>
    );
}
