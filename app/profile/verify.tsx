import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { CustomModal } from '@/components/ui/CustomModal';

export default function VerifyScreen() {
    const { user, profile } = useAuth();
    const [creci, setCreci] = useState('');
    const [creciState, setCreciState] = useState('SP');
    const [cnpj, setCnpj] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Custom Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        onConfirm?: () => void;
    }>({ title: '', message: '', type: 'info' });

    const showModal = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', onConfirm?: () => void) => {
        setModalConfig({ title, message, type, onConfirm });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!user) return;
        
        if (profile?.role === 'agent' && !creci.trim()) {
            showModal("Campo Obrigatório", "Por favor, insira o seu CRECI para continuar.", "warning");
            return;
        }

        if (profile?.role === 'agency' && (!cnpj.trim() || !creci.trim())) {
            showModal("Campos Obrigatórios", "Para Imobiliárias, o CNPJ e o CRECI-J são obrigatórios.", "warning");
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData: any = {
                creci: creci,
                creciState: creciState,
                verificationStatus: 'pending' as const,
                verificationSubmittedAt: new Date().toISOString()
            };

            if (profile?.role === 'agency') {
                updateData.cnpj = cnpj;
                updateData.creciCompany = creci; // Assuming the same input for now or could add separate
            }

            await UserService.updateProfile(user.uid, updateData);
            showModal(
                "Solicitação Enviada", 
                "Recebemos seus dados! Nossa equipe irá validar seu CRECI em até 48h. Você será notificado assim que for verificado.", 
                "success", 
                () => router.back()
            );
        } catch (error) {
            console.error("Error submitting verification:", error);
            showModal("Erro", "Não foi possível enviar sua solicitação agora. Tente novamente mais tarde.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Verificação Profissional</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {/* Intro Section */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(175, 37, 244, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <Ionicons name="checkmark-circle" size={40} color="#ff9066" />
                    </View>
                    <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center', marginBottom: 12 }}>
                        Torne-se um Agente Verificado
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 22, fontFamily: 'PlusJakartaSans-Medium' }}>
                        A verificação aumenta a sua credibilidade e destaca seus imóveis para milhares de compradores interessados.
                    </Text>
                </View>

                {/* Form */}
                <View style={{ gap: 24 }}>
                    {profile?.role === 'agency' && (
                        <View>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>CNPJ da Empresa</Text>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                <TextInput 
                                    style={{ padding: 18, color: 'white', fontFamily: 'PlusJakartaSans-Medium', fontSize: 16 }}
                                    value={cnpj}
                                    onChangeText={setCnpj}
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    placeholder="00.000.000/0000-00"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <View style={{ flex: 2 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                                {profile?.role === 'agency' ? 'CRECI Jurídico (J)' : 'Número do CRECI'}
                            </Text>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                <TextInput 
                                    style={{ padding: 18, color: 'white', fontFamily: 'PlusJakartaSans-Medium', fontSize: 16 }}
                                    value={creci}
                                    onChangeText={setCreci}
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    placeholder={profile?.role === 'agency' ? "123456-J" : "123456"}
                                    autoCapitalize="characters"
                                />
                            </View>
                        </View>
                        {profile?.role === 'agent' && (
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Estado (UF)</Text>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                    <TextInput 
                                        style={{ padding: 18, color: 'white', fontFamily: 'PlusJakartaSans-Medium', fontSize: 16 }}
                                        value={creciState}
                                        onChangeText={setCreciState}
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        placeholder="SP"
                                        autoCapitalize="characters"
                                        maxLength={2}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Placeholder for Document Upload */}
                    <TouchableOpacity 
                        style={{ padding: 24, borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.01)' }}
                        onPress={() => showModal("Documento", "A funcionalidade de upload de foto do documento será liberada na próxima atualização.", "info")}
                    >
                        <Ionicons name="cloud-upload-outline" size={32} color="rgba(255,255,255,0.3)" />
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'PlusJakartaSans-Bold', textAlign: 'center' }}>
                            Upload da Cédula do CRECI (Opcional por enquanto)
                        </Text>
                    </TouchableOpacity>

                    {/* Benefits List */}
                    <View style={{ marginTop: 20, gap: 16 }}>
                        {[
                            { icon: 'shield-checkmark', text: 'Badge de Verificado no perfil e anúncios' },
                            { icon: 'trending-up', text: 'Prioridade nos resultados de busca' },
                            { icon: 'stats-chart', text: 'Acesso a insights avançados de mercado' }
                        ].map((item, idx) => (
                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ backgroundColor: 'rgba(175, 37, 244, 0.1)', padding: 8, borderRadius: 10 }}>
                                    <Ionicons name={item.icon as any} size={16} color="#ff9066" />
                                </View>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 14 }}>{item.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#ff9066', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 24, opacity: isSubmitting ? 0.7 : 1 }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 }}>Enviar para Análise</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </SafeAreaView>
    );
}
