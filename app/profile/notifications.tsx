import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, Switch, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/userService';
import { CustomModal } from '@/components/ui/CustomModal';

export default function NotificationsScreen() {
    const { user, profile } = useAuth();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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

    // Sync state with profile
    useEffect(() => {
        if (profile?.notifications) {
            setPushEnabled(profile.notifications.push);
            setEmailEnabled(profile.notifications.email);
        }
    }, [profile]);

    const handleTogglePush = async (value: boolean) => {
        setPushEnabled(value);
        if (!user) return;
        
        try {
            await UserService.updateProfile(user.uid, {
                notifications: {
                    push: value,
                    email: emailEnabled
                }
            });
        } catch (error) {
            console.error("Error updating push settings:", error);
            // Revert state on error
            setPushEnabled(!value);
            showModal("Erro", "Não foi possível atualizar as configurações de notificações push.", "error");
        }
    };

    const handleToggleEmail = async (value: boolean) => {
        setEmailEnabled(value);
        if (!user) return;
        
        try {
            await UserService.updateProfile(user.uid, {
                notifications: {
                    push: pushEnabled,
                    email: value
                }
            });
        } catch (error) {
            console.error("Error updating email settings:", error);
            // Revert state on error
            setEmailEnabled(!value);
            showModal("Erro", "Não foi possível atualizar as configurações de e-mail marketing.", "error");
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
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Notificações</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                <View style={{ gap: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 }}>Push Notifications</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Alertas imediatos de novos leads e mensagens</Text>
                        </View>
                        <Switch 
                            value={pushEnabled} 
                            onValueChange={handleTogglePush}
                            trackColor={{ false: "#3e3e3e", true: "rgba(175, 37, 244, 0.5)" }}
                            thumbColor={pushEnabled ? "#ff9066" : "#f4f3f4"}
                        />
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
                        <View style={{ flex: 1, marginRight: 16 }}>
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 }}>E-mail Marketing</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Novidades sobre o mercado e dicas semanais</Text>
                        </View>
                        <Switch 
                            value={emailEnabled} 
                            onValueChange={handleToggleEmail}
                            trackColor={{ false: "#3e3e3e", true: "rgba(175, 37, 244, 0.5)" }}
                            thumbColor={emailEnabled ? "#ff9066" : "#f4f3f4"}
                        />
                    </View>
                </View>

                <View style={{ marginTop: 60, alignItems: 'center', opacity: 0.2 }}>
                    <Ionicons name="notifications-outline" size={80} color="white" />
                    <Text style={{ color: 'white', marginTop: 20, fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>
                        Configurações Sincronizadas
                    </Text>
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
