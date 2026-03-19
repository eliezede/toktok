import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { auth, db } from '../../firebase/config';
import { UserRole } from '../../types';
import { CustomModal } from '@/components/ui/CustomModal';

export default function SignupScreen() {
    const params = useLocalSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<UserRole>((params.role as UserRole) || 'buyer');
    const [loading, setLoading] = useState(false);

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

    // If role was passed in, we skip role selection
    const isRolePreSelected = !!params.role;

    const handleSignup = async () => {
        if (!email || !password || !fullName) {
            showModal('Informações faltando', 'Por favor, preencha todos os campos obrigatórios para criar sua conta.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                fullName,
                email: user.email,
                role,
                accountPlan: 'Free',
                isVerified: false,
                createdAt: Date.now(),
                savedProperties: [],
                followedAgents: [],
            });

            console.log('[Signup] Account and profile created, waiting for root layout redirect...');
            // router.replace('/(tabs)'); // Removed to prevent race condition
        } catch (error: any) {
            showModal('Erro no Cadastro', error.message || 'Não foi possível completar o seu cadastro no momento.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const RoleOption = ({ type, label, description, icon }: { type: UserRole, label: string, description: string, icon: any }) => (
        <TouchableOpacity
            onPress={() => setRole(type)}
            className={`flex-row items-center p-4 rounded-2xl border-2 mb-3 ${role === type ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}
        >
            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${role === type ? 'bg-white/20' : 'bg-primary/10'}`}>
                <Ionicons name={icon} size={20} color={role === type ? 'white' : '#ff9066'} />
            </View>
            <View className="flex-1">
                <Text className={`font-black uppercase text-[10px] tracking-tight mb-0.5 ${role === type ? 'text-white/80' : 'text-primary'}`}>{label}</Text>
                <Text className={`font-bold text-base ${role === type ? 'text-white' : 'text-white'}`}>{description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#0e0e0e]">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-8 pt-12">
                    <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>

                    <Text className="text-4xl font-black text-white mb-2">Junte-se a nós</Text>
                    <Text className="text-gray-400 text-base mb-8">Comece sua jornada imobiliária hoje.</Text>

                    <View className="mb-6">
                        <Text className="text-gray-400 font-bold mb-3 uppercase text-[10px] tracking-widest opacity-50">Tipo de Conta</Text>
                        <RoleOption type="buyer" label="Comprador" description="Descubra a Casa dos Sonhos" icon="home-outline" />
                        <RoleOption type="agent" label="Agente" description="Publique Tours de Luxo" icon="videocam-outline" />
                        <RoleOption type="agency" label="Imobiliária" description="Gestão Profissional" icon="business-outline" />
                    </View>

                    <View className="space-y-4">
                        <View className="bg-white/5 border border-white/10 rounded-2xl px-6 h-14 justify-center">
                            <TextInput
                                className="text-white text-base"
                                placeholder={role === 'agency' ? "Nome da Imobiliária" : "Nome Completo"}
                                placeholderTextColor="#666"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View className="bg-white/5 border border-white/10 rounded-2xl px-6 h-14 justify-center mt-2">
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
                                placeholder="Senha (min. 6 caracteres)"
                                placeholderTextColor="#666"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`w-full py-4 rounded-full items-center mt-8 shadow-xl ${loading ? 'bg-gray-600' : 'bg-primary'}`}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        <Text className="text-white font-black text-lg uppercase tracking-wider">
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-400 text-sm">Já tem uma conta? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text className="text-primary font-bold text-sm">Faça Login</Text>
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
