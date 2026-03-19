import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { LeadService, Lead } from '@/services/leadService';

export default function LeadsScreen() {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchLeads();
        }
    }, [user]);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const data = await LeadService.getLeadsForAgent(user!.uid);
            setLeads(data);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLeads();
        setRefreshing(false);
    };

    const getLeadIcon = (type: string) => {
        switch (type) {
            case 'whatsapp_click': return { name: 'logo-whatsapp', color: '#25D366' };
            case 'favorite': return { name: 'heart', color: '#ef4444' };
            case 'view': return { name: 'eye', color: '#3B82F6' };
            default: return { name: 'notifications', color: '#ff9066' };
        }
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'Agora mesmo';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, "d 'de' MMMM, HH:mm", { locale: ptBR });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Leads & Interessados</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView 
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff9066" />}
            >
                {isLoading ? (
                    <View style={{ marginTop: 100, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#ff9066" />
                        <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>Buscando oportunidades...</Text>
                    </View>
                ) : leads.length > 0 ? (
                    <View style={{ gap: 16 }}>
                        {leads.map((lead) => {
                            const icon = getLeadIcon(lead.type);
                            return (
                                <View key={lead.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 20, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ position: 'relative' }}>
                                        {lead.buyerImage ? (
                                            <Image source={{ uri: lead.buyerImage }} style={{ width: 50, height: 50, borderRadius: 15 }} contentFit="cover" />
                                        ) : (
                                            <View style={{ width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255, 144, 102, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ color: '#ff9066', fontFamily: 'PlusJakartaSans-Bold', fontSize: 20 }}>{lead.buyerName?.charAt(0) || 'V'}</Text>
                                            </View>
                                        )}
                                        <View style={{ position: 'absolute', bottom: -4, right: -4, backgroundColor: icon.color, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0e0e0e' }}>
                                            <Ionicons name={icon.name as any} size={10} color="white" />
                                        </View>
                                    </View>
                                    
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 }}>{lead.buyerName || 'Interessado'}</Text>
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, marginTop: 2 }}>{formatTimestamp(lead.createdAt)}</Text>
                                        <Text style={{ color: 'rgba(255, 144, 102, 0.8)', fontSize: 13, marginTop: 4, fontFamily: 'PlusJakartaSans-Medium' }}>
                                            {lead.type === 'whatsapp_click' ? 'Clicou para contactar via WhatsApp' : 'Salvou seu imóvel'}
                                        </Text>
                                    </View>
                                    
                                    <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.1)" />
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={{ marginTop: 100, alignItems: 'center', paddingHorizontal: 40 }}>
                        <View style={{ width: 80, height: 80, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Ionicons name="flash-off-outline" size={40} color="rgba(255, 255, 255, 0.1)" />
                        </View>
                        <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center' }}>Nenhum Lead Novo</Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
                            Compartilhe seus anúncios para atrair mais interessados para seus imóveis.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
