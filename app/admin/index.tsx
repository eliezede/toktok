import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboardScreen() {
    const { profile } = useAuth();

    // In a real app, this should check a robust isSuperAdmin claim from the token.
    if (profile?.role !== 'agency') {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <BlurView intensity={20} tint="dark" style={{ padding: 40, borderRadius: 32, alignItems: 'center', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Ionicons name="shield-half-outline" size={64} color="#ff9066" />
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', marginTop: 24, textAlign: 'center' }}>Não Autorizado</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 16, fontFamily: 'PlusJakartaSans-Medium', marginTop: 12, textAlign: 'center' }}>Você precisa de privilégios de administrador para acessar esta área.</Text>
                        <TouchableOpacity 
                            style={{ marginTop: 32, backgroundColor: '#ff9066', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20 }} 
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 }}>Voltar para o Início</Text>
                        </TouchableOpacity>
                    </BlurView>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Painel Administrativo</Text>
                    <View style={{ width: 48 }} />
                </View>

                {/* Stats Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 }}>
                    <BlurView intensity={10} tint="dark" style={{ width: '48%', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Usuários</Text>
                        <Text style={{ color: 'white', fontSize: 28, fontFamily: 'PlusJakartaSans-ExtraBold' }}>1,245</Text>
                        <Text style={{ color: '#10b981', fontSize: 10, fontFamily: 'PlusJakartaSans-Bold', marginTop: 4 }}>+12 hoje</Text>
                    </BlurView>

                    <BlurView intensity={10} tint="dark" style={{ width: '48%', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Anúncios</Text>
                        <Text style={{ color: 'white', fontSize: 28, fontFamily: 'PlusJakartaSans-ExtraBold' }}>8,432</Text>
                        <Text style={{ color: '#10b981', fontSize: 10, fontFamily: 'PlusJakartaSans-Bold', marginTop: 4 }}>+45 hoje</Text>
                    </BlurView>

                    <TouchableOpacity style={{ width: '100%' }}>
                        <LinearGradient
                            colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: '100%', padding: 24, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <View>
                                <Text style={{ color: 'rgba(239, 68, 68, 0.8)', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Conteúdo Denunciado</Text>
                                <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-ExtraBold' }}>12 Pendentes</Text>
                            </View>
                            <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 16 }}>
                                <Ionicons name="warning-outline" size={24} color="#ef4444" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Módulos de Gestão</Text>

                <TouchableOpacity
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
                    onPress={() => router.push('/admin/users')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>
                            <Ionicons name="people-outline" size={24} color="#3b82f6" />
                        </View>
                        <View>
                            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: 'white' }}>Gestão de Usuários</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', marginTop: 2 }}>Banir, verificar ou alterar cargos</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.2)" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
                    onPress={() => router.push('/admin/listings')}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'rgba(255, 144, 102, 0.1)', width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>
                            <Ionicons name="home-outline" size={24} color="#ff9066" />
                        </View>
                        <View>
                            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: 'white' }}>Moderação de Anúncios</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', marginTop: 2 }}>Revisar novos conteúdos postados</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.2)" />
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
