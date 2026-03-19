import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { auth } from '../../firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '../../types';
import { CustomModal } from '@/components/ui/CustomModal';

export default function LoginScreen() {
    const { setAsGuest } = useAuth();
    const params = useLocalSearchParams();
    const initialRole = (params.role as UserRole) || 'buyer';
    const [role, setRole] = useState<UserRole>(initialRole);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    // Custom Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
    }>({
        title: '',
        message: '',
        type: 'info'
    });

    const showModal = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
        setModalConfig({ title, message, type });
        setModalVisible(true);
    };

    const handleLogin = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !password) {
            showModal('Informações faltando', 'Por favor, insira seu e-mail e senha para entrar.', 'warning');
            return;
        }

        setLoading(true);
        try {
            console.log('[Login] Attempting sign in...');
            await signInWithEmailAndPassword(auth, trimmedEmail, password);
            console.log('[Login] Sign in successful, waiting for root layout redirect...');
            // router.replace('/(tabs)'); // Removed to prevent race condition
        } catch (error: any) {
            let errorMessage = 'Ocorreu um erro ao entrar. Tente novamente.';
            if (error.code === 'auth/invalid-credential') {
                errorMessage = 'E-mail ou senha incorretos.';
            }
            showModal('Erro no Login', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getRoleText = () => {
        if (role === 'agent') return 'Agente';
        if (role === 'agency') return 'Imobiliária';
        return 'Comprador';
    };

    const FeatureRow = ({ icon, title, description, iconBg }: { icon: any, title: string, description: string, iconBg: string }) => (
        <View className="flex-row items-center mb-5">
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${iconBg}`}>
                <Ionicons name={icon} size={24} color="white" />
            </View>
            <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-0.5">{title}</Text>
                <Text className="text-gray-400 text-sm leading-4">{description}</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#0e0e0e]">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                className="flex-1"
            >
                <View className="flex-1 px-8">
                    <View className="pt-8 pb-1">
                        <TouchableOpacity 
                            onPress={() => router.back()} 
                            className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-6">
                        <Text className="text-white text-3xl font-black leading-tight">
                            Entre ou crie sua conta
                        </Text>
                        <Text className="text-primary font-bold text-lg mt-0.5 italic">
                            como {getRoleText()}
                        </Text>
                    </View>

                    {!showEmailForm && (
                        <View className="mb-8">
                            <FeatureRow 
                                icon="heart" 
                                title="Salvar favoritos" 
                                description="Salve seus favoritos e avisaremos se o preço cair" 
                                iconBg="bg-pink-500/20"
                            />
                            <FeatureRow 
                                icon="notifications" 
                                title="Criar alertas" 
                                description="Receba atualizações personalizadas sobre sua busca" 
                                iconBg="bg-teal-500/20"
                            />
                            <FeatureRow 
                                icon="archive" 
                                title="Rejeitar anúncios" 
                                description="Se não estiver interessado, rejeite e não mostraremos novamente" 
                                iconBg="bg-blue-500/20"
                            />
                        </View>
                    )}

                    {showEmailForm ? (
                        <View className="space-y-4">
                            <View className="bg-white/5 border border-white/10 rounded-2xl px-6 h-14 justify-center">
                                <TextInput
                                    className="text-white text-base"
                                    placeholder="E-mail"
                                    placeholderTextColor="#666"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                            <View className="bg-white/5 border border-white/10 rounded-2xl px-6 h-14 justify-center mt-2">
                                <TextInput
                                    className="text-white text-base"
                                    placeholder="Senha"
                                    placeholderTextColor="#666"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                            <TouchableOpacity
                                className={`w-full py-4 rounded-full items-center mt-4 ${loading ? 'bg-gray-600' : 'bg-primary'}`}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                <Text className="text-white font-bold text-lg">
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setShowEmailForm(false)}
                                className="items-center py-2"
                            >
                                <Text className="text-gray-400 text-sm">Usar outras opções</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="space-y-2">
                            <GoogleSignInButton text="Continuar com Google" roleOnSignup={role} />
                            
                            <TouchableOpacity className="w-full bg-[#0e0e0e] border border-white/10 py-3.5 rounded-full flex-row items-center justify-center mt-1">
                                <Ionicons name="logo-apple" size={22} color="white" />
                                <Text className="text-white font-bold text-lg ml-3">Continuar com Apple</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="w-full bg-[#0e0e0e] border border-white/10 py-3.5 rounded-full flex-row items-center justify-center mt-1">
                                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
                                <Text className="text-white font-bold text-lg ml-3">Continuar com Facebook</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                className="w-full bg-[#0e0e0e] border border-white/10 py-3.5 rounded-full flex-row items-center justify-center mt-1"
                                onPress={() => setShowEmailForm(true)}
                            >
                                <Ionicons name="mail" size={22} color="white" />
                                <Text className="text-white font-bold text-lg ml-3">Continuar com e-mail</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View className="mt-6 items-center">
                        <TouchableOpacity 
                            onPress={() => router.push({ pathname: '/auth/signup', params: { role } })}
                        >
                            <Text className="text-gray-400 text-base">Não tem uma conta? <Text className="text-primary font-bold">Criar Conta</Text></Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-auto pb-10">
                        <TouchableOpacity 
                            className="items-center"
                            onPress={async () => {
                                await setAsGuest(true);
                                router.replace('/(tabs)');
                            }}
                        >
                            <Text className="text-primary font-bold text-lg">Agora não, obrigado</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </View>
    );
}
