import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { AnalyticsService, AnalyticsSummary } from '@/services/analyticsService';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

export default function InsightsScreen() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await AnalyticsService.getAgentDashboardData(user!.uid);
            setData(result);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0e0e0e', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#ff9066" />
                <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>Calculando desempenho...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Performance</Text>
                <TouchableOpacity onPress={fetchData}>
                    <Ionicons name="refresh" size={24} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                {/* Main Score Card */}
                <LinearGradient
                    colors={['rgba(255, 144, 102, 0.2)', 'rgba(14, 14, 14, 0.6)']}
                    style={{ padding: 32, borderRadius: 40, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 144, 102, 0.2)', marginBottom: 32, alignItems: 'center' }}
                >
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Média de Engajamento</Text>
                    <Text style={{ color: 'white', fontSize: 48, fontFamily: 'PlusJakartaSans-ExtraBold' }}>{data?.engagementRate.toFixed(1)}%</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                        <Ionicons name="trending-up" size={14} color="#10b981" />
                        <Text style={{ color: '#10b981', fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, marginLeft: 4 }}>+12% vs mês anterior</Text>
                    </View>
                </LinearGradient>

                <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Métricas Detalhadas</Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 32 }}>
                    <View style={{ width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 20, borderRadius: 28, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <Ionicons name="eye-outline" size={20} color="#3b82f6" style={{ marginBottom: 12 }} />
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-Bold' }}>{data?.totalViews}</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Visualizações</Text>
                    </View>

                    <View style={{ width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 20, borderRadius: 28, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <Ionicons name="flash-outline" size={20} color="#ff9066" style={{ marginBottom: 12 }} />
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-Bold' }}>{data?.totalLeads}</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Total Leads</Text>
                    </View>

                    <View style={{ width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 20, borderRadius: 28, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <Ionicons name="logo-whatsapp" size={20} color="#25D366" style={{ marginBottom: 12 }} />
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-Bold' }}>{data?.whatsappClicks}</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Cliques Whats</Text>
                    </View>

                    <View style={{ width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 20, borderRadius: 28, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 16 }}>
                        <Ionicons name="heart-outline" size={20} color="#ec4899" style={{ marginBottom: 12 }} />
                        <Text style={{ color: 'white', fontSize: 24, fontFamily: 'PlusJakartaSans-Bold' }}>{data?.favorites}</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>Favoritados</Text>
                    </View>
                </View>

                {/* Vertical Bar Chart (Custom) */}
                <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 24, borderRadius: 32, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <Text style={{ color: 'white', fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', marginBottom: 24 }}>Atividade Recente (Leads)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150 }}>
                        {data?.leadsByDay.map((day, idx) => {
                            const maxLeads = Math.max(...data.leadsByDay.map(d => d.count), 1);
                            const height = (day.count / maxLeads) * 100;
                            return (
                                <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                                    <View style={{ 
                                        width: 12, 
                                        height: `${height}%`, 
                                        backgroundColor: '#ff9066', 
                                        borderRadius: 6,
                                        minHeight: 4 
                                    }}>
                                        <LinearGradient
                                            colors={['#ff9066', '#ff7043']}
                                            style={{ flex: 1, borderRadius: 6 }}
                                        />
                                    </View>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 9, marginTop: 8, fontFamily: 'PlusJakartaSans-Bold' }}>
                                        {day.date.split('-')[2]}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <TouchableOpacity 
                    style={{ marginTop: 32, backgroundColor: 'rgba(255, 144, 102, 0.1)', padding: 20, borderRadius: 24, alignItems: 'center', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 144, 102, 0.2)' }}
                    onPress={() => router.push('/pro/promote')}
                >
                    <Text style={{ color: '#ff9066', fontFamily: 'PlusJakartaSans-Bold', fontSize: 14 }}>Impulsionar meus anúncios</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
