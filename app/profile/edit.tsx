import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { CustomModal } from '@/components/ui/CustomModal';

export default function EditProfileScreen() {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Custom Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        onConfirm?: () => void;
    }>({
        title: '',
        message: '',
        type: 'info'
    });

    const showModal = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', onConfirm?: () => void) => {
        setModalConfig({ title, message, type, onConfirm });
        setModalVisible(true);
    };

    // Initialize state with current profile data
    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setBio(profile.bio || '');
            setWhatsapp(profile.whatsapp || '');
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user) return;
        
        setIsSaving(true);
        try {
            await UserService.updateProfile(user.uid, {
                fullName,
                bio,
                whatsapp
            });
            showModal("Sucesso", "Seu perfil foi atualizado com sucesso!", "success", () => router.back());
        } catch (error) {
            console.error("Error saving profile:", error);
            showModal("Erro", "Não foi possível salvar as alterações em seu perfil.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1022' }}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Editar Perfil</Text>
                <TouchableOpacity 
                    onPress={handleSave} 
                    disabled={isSaving}
                    style={{ opacity: isSaving ? 0.3 : 1 }}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="#af25f4" />
                    ) : (
                        <Text style={{ color: '#af25f4', fontFamily: 'PlusJakartaSans-Bold' }}>Salvar</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {/* Photo Info */}
                <View style={{ marginBottom: 32, alignItems: 'center' }}>
                    <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        {profile?.profileImage ? (
                            <View style={{ flex: 1 }}>
                                {/* Using simple View here as Image might need expo-image IMPORT which is not in this file context yet, 
                                    but for consistency with ProfileScreen, we should use similar logic if we want to show it.
                                    Actually, user just asked to connect fields to DB.
                                */}
                                <View style={{ flex: 1, backgroundColor: '#af25f4', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 40, fontFamily: 'PlusJakartaSans-Bold' }}>
                                        {fullName.charAt(0).toUpperCase() || '?'}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons name="person" size={40} color="white" />
                            </View>
                        )}
                    </View>
                    <Text style={{ marginTop: 12, color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center' }}>
                        Para alterar a foto, utilize o ícone de câmera na tela principal do perfil.
                    </Text>
                </View>

                {/* Form Fields */}
                <View style={{ gap: 24 }}>
                    <View>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Nome Completo</Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <TextInput 
                                style={{ padding: 18, color: 'white', fontFamily: 'PlusJakartaSans-Medium', fontSize: 16 }}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="Seu nome"
                            />
                        </View>
                    </View>

                    <View>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Número do CRECI</Text>
                        <TouchableOpacity 
                            onPress={() => router.push('/profile/verify')}
                            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderStyle: 'solid', borderWidth: 1, borderColor: profile?.creci ? 'rgba(175, 37, 244, 0.2)' : 'rgba(255,255,255,0.05)', overflow: 'hidden', padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Text style={{ color: profile?.creci ? 'white' : 'rgba(255,255,255,0.2)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 16 }}>
                                {profile?.creci || 'Não informado (Toque para verificar)'}
                            </Text>
                            {profile?.isVerified ? (
                                <Ionicons name="checkmark-circle" size={20} color="#af25f4" />
                            ) : (
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
                            )}
                        </TouchableOpacity>
                        {!profile?.isVerified && (
                            <Text style={{ marginTop: 8, color: '#af25f4', fontSize: 11, paddingHorizontal: 4, fontFamily: 'PlusJakartaSans-Bold' }}>
                                Precisa ser validado pela nossa equipe.
                            </Text>
                        )}
                    </View>

                    <View>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Bio / Apresentação</Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <TextInput 
                                style={{ padding: 18, color: 'white', fontFamily: 'PlusJakartaSans-Medium', fontSize: 16, minHeight: 120, textAlignVertical: 'top' }}
                                multiline
                                numberOfLines={4}
                                value={bio}
                                onChangeText={setBio}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="Conte um pouco sobre sua experiência no mercado imobiliário..."
                            />
                        </View>
                    </View>

                    <View>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12, fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>WhatsApp de Contato</Text>
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                            <TextInput 
                                style={{ padding: 18, color: 'white', fontFamily: 'PlusJakartaSans-Medium', fontSize: 16 }}
                                value={whatsapp}
                                onChangeText={setWhatsapp}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="+351 912 345 678"
                                keyboardType="phone-pad"
                            />
                        </View>
                        <Text style={{ marginTop: 8, color: 'rgba(255,255,255,0.2)', fontSize: 11, paddingHorizontal: 4 }}>
                            Este número será usado para os clientes entrarem em contato via WhatsApp.
                        </Text>
                    </View>
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
