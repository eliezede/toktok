import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { UserProfile } from '../types';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isGuest: boolean;
    setAsGuest: (isGuest: boolean) => void;
    guestFavorites: string[];
    syncGuestFavorites: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    isLoading: true,
    isGuest: false,
    setAsGuest: () => {},
    guestFavorites: [],
    syncGuestFavorites: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const GUEST_KEY = 'toktok_guest_mode';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const [guestFavorites, setGuestFavorites] = useState<string[]>([]);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    const GUEST_FAVORITES_KEY = 'toktok_guest_favorites';

    useEffect(() => {
        let authUnsub: (() => void) | null = null;
        let profileUnsub: (() => void) | null = null;

        const initializeAuth = async () => {
            // 1. Set up Firebase Auth Listener FIRST (Critical)
            authUnsub = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
                const authLogId = Math.random().toString(36).substring(7);
                console.log(`[Auth] State changed (${authLogId}):`, !!firebaseUser);
                
                setUser(firebaseUser);
                
                if (firebaseUser) {
                    setIsGuest(false);
                    setIsLoading(true);
                    
                    profileUnsub = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
                        if (docSnap.exists()) {
                            setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
                        }
                        setIsLoading(false);
                        setInitialCheckDone(true);
                    }, (error) => {
                        console.error("Profile sync error:", error);
                        setIsLoading(false);
                        setInitialCheckDone(true);
                    });
                } else {
                    setProfile(null);
                    setIsLoading(false);
                    setInitialCheckDone(true);
                }
            });

            // 2. Check Guest Mode (Non-critical, wrap in try-catch)
            try {
                const [guestValue, favs] = await Promise.all([
                    AsyncStorage.getItem(GUEST_KEY).catch(() => null),
                    AsyncStorage.getItem(GUEST_FAVORITES_KEY).catch(() => null)
                ]);
                
                if (guestValue === 'true') setIsGuest(true);
                if (favs) setGuestFavorites(JSON.parse(favs));
            } catch (error) {
                console.warn("[Auth] AsyncStorage is unavailable. Guest mode settings won't persist.", error);
            }
        };

        initializeAuth();

        return () => {
            if (authUnsub) authUnsub();
            if (profileUnsub) profileUnsub();
        };
    }, []);

    const setAsGuest = async (value: boolean) => {
        try {
            console.log(`[Auth] Setting guest mode to: ${value}`);
            setIsLoading(false);
            setIsGuest(value);
            if (value) {
                await AsyncStorage.setItem(GUEST_KEY, 'true');
            } else {
                await AsyncStorage.removeItem(GUEST_KEY);
            }
            console.log('[Auth] Guest mode set successfully');
        } catch (error) {
            console.error('[Auth] Error setting guest mode:', error);
            Alert.alert('Erro', 'Não foi possível ativar o modo convidado.');
        }
    };

    const syncGuestFavorites = async () => {
        const favs = await AsyncStorage.getItem(GUEST_FAVORITES_KEY);
        if (favs) {
            setGuestFavorites(JSON.parse(favs));
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, isGuest, setAsGuest, guestFavorites, syncGuestFavorites }}>
            {children}
        </AuthContext.Provider>
    );
}
