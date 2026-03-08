import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { auth } from '../../firebase/config';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Please enter your email and password.');
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <View className="flex-1 px-8 pt-24 pb-12">
                    <TouchableOpacity onPress={() => router.back()} className="mb-12 w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100">
                        <Ionicons name="arrow-back" size={20} color="#8B5CF6" />
                    </TouchableOpacity>

                    <Text className="text-5xl font-black text-gray-900 mb-2">Login</Text>
                    <Text className="text-gray-400 text-lg mb-12">Welcome back to the future of real estate.</Text>

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
                                placeholder="Your password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                        <TouchableOpacity className="mt-3 self-end mr-1">
                            <Text className="text-primary font-bold">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className={`w-full py-5 rounded-3xl items-center mb-8 shadow-xl ${loading ? 'bg-gray-400' : 'bg-primary shadow-primary/30'}`}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text className="text-white font-black text-lg tracking-wider uppercase">
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center mb-8">
                        <View className="flex-1 h-px bg-gray-100" />
                        <Text className="mx-6 text-gray-400 font-black text-xs uppercase tracking-widest">or continue with</Text>
                        <View className="flex-1 h-px bg-gray-100" />
                    </View>

                    <GoogleSignInButton text="Sign in with Google" />

                    <View className="flex-row justify-center mt-auto pt-12">
                        <Text className="text-gray-400 font-medium">New to TokTok? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                            <Text className="text-primary font-black">Register Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
