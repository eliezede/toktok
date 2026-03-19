import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProDashboardScreen() {
    const { profile } = useAuth();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Ferramentas Pro</Text>
                    <View style={{ width: 48 }} />
                </View>

                {/* Leads Central Focus */}
                <TouchableOpacity 
                    onPress={() => router.push('/pro/leads')}
                    style={{ width: '100%', marginBottom: 32 }}
                >
                    <LinearGradient
                        colors={['rgba(255, 144, 102, 0.25)', 'rgba(255, 144, 102, 0.1)']}
                        style={{ padding: 32, borderRadius: 40, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 144, 102, 0.4)', alignItems: 'center' }}
                    >
                        <View style={{ backgroundColor: '#ff9066', width: 64, height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#ff9066', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 }}>
                            <Ionicons name="flash" size={32} color="white" />
                        </View>
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-ExtraBold', textAlign: 'center' }}>
                            {profile?.accountPlan === 'Pro' || profile?.accountPlan === 'Agency Pro' ? '45 Novos Leads Hoje' : 'Ver Meus Leads'}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, fontFamily: 'PlusJakartaSans-Medium', marginTop: 8, textAlign: 'center' }}>
                            {profile?.accountPlan === 'Pro' || profile?.accountPlan === 'Agency Pro' ? 'Toque para gerenciar seus interessados' : 'Ative o Pro para ver quem te ligou'}
                        </Text>
                        
                        <View style={{ marginTop: 24, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16 }}>
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 13 }}>Gerenciar Interessados</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Subscription Status Card */}
                <BlurView intensity={10} tint="dark" style={{ padding: 24, borderRadius: 32, marginBottom: 32, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                        <View>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Plano Atual</Text>
                             <Text style={{ color: '#ff9066', fontSize: 28, fontFamily: 'PlusJakartaSans-ExtraBold', textTransform: 'capitalize' }}>{profile?.accountPlan || 'Free'}</Text>
                        </View>
                        <TouchableOpacity style={{ backgroundColor: '#ff9066', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}>
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 14 }}>Upgrade</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 14 }}>Anúncios Ativos</Text>
                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 14 }}>3 / 5</Text>
                    </View>
                    <View style={{ width: '100%', height: 8, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{ width: '60%', height: '100%', backgroundColor: '#ff9066', borderRadius: 4 }} />
                    </View>
                </BlurView>

                <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Visão Geral (30 dias)</Text>
                
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 }}>
                    <BlurView intensity={5} tint="dark" style={{ width: '48%', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="eye-outline" size={20} color="#3b82f6" />
                        </View>
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-ExtraBold' }}>12.4K</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Visualizações</Text>
                    </BlurView>

                    <BlurView intensity={5} tint="dark" style={{ width: '48%', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <View style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="heart-outline" size={20} color="#ec4899" />
                        </View>
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-ExtraBold' }}>842</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Salvos</Text>
                    </BlurView>

                    <BlurView intensity={5} tint="dark" style={{ width: '48%', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="call-outline" size={20} color="#10b981" />
                        </View>
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-ExtraBold' }}>45</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Contatos</Text>
                    </BlurView>

                    <BlurView intensity={5} tint="dark" style={{ width: '48%', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <View style={{ backgroundColor: 'rgba(255, 144, 102, 0.1)', width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <Ionicons name="person-add-outline" size={20} color="#ff9066" />
                        </View>
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-ExtraBold' }}>128</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Seguidores</Text>
                    </BlurView>
                </View>

                <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Impulsionar Anúncios</Text>
                
                <TouchableOpacity
                    style={{ borderRadius: 32, overflow: 'hidden', marginBottom: 80 }}
                    onPress={() => router.push('/pro/promote')}
                >
                    <LinearGradient
                        colors={['#ff9066', '#ff743b']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ padding: 24, flexDirection: 'row', alignItems: 'center' }}
                    >
                        <View style={{ flex: 1, marginRight: 20 }}>
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, marginBottom: 4 }}>Aumente sua Visibilidade</Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontFamily: 'PlusJakartaSans-Medium' }}>Fique no topo do feed e gere mais leads instantaneamente.</Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="rocket-outline" size={28} color="white" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
