import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { auth, db } from '../../firebase/config';
import { UserRole } from '../../types';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>('buyer');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !fullName) {
            Alert.alert('Missing Info', 'Please fill in all the required fields.');
            return;
        }

        setLoading(true);
        try {
            // Create user auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save profile metadata in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                fullName,
                email: user.email,
                role,
                accountPlan: 'Free',
                isVerified: false,
                createdAt: Date.now(),
                // Initial setup for arrays to make future updates easier
                savedProperties: [],
                followedAgents: [],
            });

            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Signup Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const RoleOption = ({ type, label, description, icon }: { type: UserRole, label: string, description: string, icon: any }) => (
        <TouchableOpacity
            onPress={() => setRole(type)}
            className={`flex-row items-center p-6 rounded-3xl border-2 mb-4 transition-all ${role === type ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}
        >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${role === type ? 'bg-white/20' : 'bg-primary/10'}`}>
                <Ionicons name={icon} size={24} color={role === type ? 'white' : '#8B5CF6'} />
            </View>
            <View className="flex-1">
                <Text className={`font-black uppercase text-xs tracking-widest mb-1 ${role === type ? 'text-white/80' : 'text-primary'}`}>{label}</Text>
                <Text className={`font-bold text-lg ${role === type ? 'text-white' : 'text-gray-900'}`}>{description}</Text>
            </View>
            {role === type && (
                <View className="bg-white/20 p-2 rounded-full">
                    <Ionicons name="checkmark" size={16} color="white" />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
            <ScrollView className="flex-1 px-8 pt-20 pb-12" showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => router.back()} className="mb-10 w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
                    <Ionicons name="arrow-back" size={20} color="#8B5CF6" />
                </TouchableOpacity>

                <Text className="text-5xl font-black text-gray-900 mb-2">Join Us</Text>
                <Text className="text-gray-400 text-lg mb-12">Start your premium real estate journey today.</Text>

                <Text className="text-gray-900 font-bold mb-4 ml-1 uppercase text-xs tracking-widest opacity-50">Select Account Type</Text>
                <RoleOption type="buyer" label="Buyer" description="Discover Dream Homes" icon="home-outline" />
                <RoleOption type="agent" label="Agent" description="Post Luxury Tours" icon="videocam-outline" />
                <RoleOption type="agency" label="Agency" description="Manage High Volumes" icon="business-outline" />

                <Text className="text-gray-900 font-bold mb-4 ml-1 uppercase text-xs tracking-widest opacity-50 mt-6">Profile Details</Text>

                <View className="mb-6">
                    <Text className="text-gray-900 font-bold mb-2 ml-1">Full Name</Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-3xl px-6 h-16">
                        <Ionicons name="person-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-gray-900 text-base"
                            placeholder="John Doe"
                            placeholderTextColor="#9CA3AF"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-gray-900 font-bold mb-2 ml-1">Email Address</Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-3xl px-6 h-16">
                        <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-gray-900 text-base"
                            placeholder="name@example.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                <View className="mb-10">
                    <Text className="text-gray-900 font-bold mb-2 ml-1">Password</Text>
                    <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-3xl px-6 h-16">
                        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                        <TextInput
                            className="flex-1 text-gray-900 text-base"
                            placeholder="Min 6 characters"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className={`w-full py-5 rounded-3xl items-center mb-8 shadow-xl ${loading ? 'bg-gray-400' : 'bg-primary shadow-primary/30'}`}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    <Text className="text-white font-black text-lg tracking-wider uppercase">
                        {loading ? 'Creating account...' : 'Create Account'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row items-center mb-8">
                    <View className="flex-1 h-px bg-gray-100" />
                    <Text className="mx-6 text-gray-400 font-black text-xs uppercase tracking-widest">or continue with</Text>
                    <View className="flex-1 h-px bg-gray-100" />
                </View>

                <GoogleSignInButton text="Sign up with Google" roleOnSignup={role} />

                <View className="flex-row justify-center mt-12 mb-20">
                    <Text className="text-gray-400 font-medium">Already have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/auth/login')}>
                        <Text className="text-primary font-black">Login Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
