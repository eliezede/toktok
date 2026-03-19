import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { UserService } from '@/services/userService';
import { UserProfile } from '@/types';

export default function AdminUsersScreen() {
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const users = await UserService.getPendingVerifications();
            setPendingUsers(users);
        } catch (error) {
            console.error("Error fetching pending verifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        Alert.alert(
            action === 'approve' ? 'Aprovar Verificação?' : 'Rejeitar Verificação?',
            `Deseja realmente ${action === 'approve' ? 'aprovar' : 'rejeitar'} este agente?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Confirmar', 
                    style: action === 'reject' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            if (action === 'approve') {
                                await UserService.approveVerification(userId);
                            } else {
                                await UserService.rejectVerification(userId, 'Documentação incompleta ou inválida.');
                            }
                            fetchData();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível processar a ação.');
                        }
                    }
                }
            ]
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1022' }}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Verificações</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView 
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#af25f4" />}
            >
                {isLoading ? (
                    <View style={{ marginTop: 100, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#af25f4" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', marginTop: 16 }}>Buscando solicitações...</Text>
                    </View>
                ) : pendingUsers.length > 0 ? (
                    <View style={{ gap: 20 }}>
                        {pendingUsers.map((u) => (
                            <View key={u.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 24, borderRadius: 32, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                                    <View style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: 'rgba(175, 37, 244, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        {u.profileImage ? (
                                            <Image source={{ uri: u.profileImage }} style={{ width: '100%', height: '100%', borderRadius: 20 }} />
                                        ) : (
                                            <Text style={{ fontSize: 24, color: '#af25f4', fontFamily: 'PlusJakartaSans-Bold' }}>{u.fullName?.charAt(0)}</Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 }}>{u.fullName}</Text>
                                        <Text style={{ color: '#af25f4', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', marginTop: 2 }}>CRECI: {u.creci}</Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity 
                                        onPress={() => handleAction(u.id!, 'reject')}
                                        style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                    >
                                        <Text style={{ color: '#ef4444', fontFamily: 'PlusJakartaSans-Bold' }}>Rejeitar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleAction(u.id!, 'approve')}
                                        style={{ flex: 1, backgroundColor: '#af25f4', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
                                    >
                                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold' }}>Aprovar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={{ marginTop: 100, alignItems: 'center', paddingHorizontal: 40 }}>
                        <Ionicons name="checkmark-done-circle-outline" size={80} color="rgba(255, 255, 255, 0.05)" />
                        <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center', marginTop: 24 }}>Tudo em dia!</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', marginTop: 12 }}>Nenhuma solicitação de verificação pendente no momento.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
