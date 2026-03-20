import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { PropertyActionService } from '@/services/property/propertyActionService';
import { PropertyListing } from '@/types';

export default function AdminListingsScreen() {
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch all active listings for moderation
            const data = await PropertyQueryService.getListings(50);
            setListings(data);
        } catch (error) {
            console.error("Error fetching listings for moderation:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        Alert.alert(
            'Arquivar Anúncio?',
            'O anúncio será removido do feed público.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Arquivar', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await PropertyActionService.archiveListing(id);
                            fetchData();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível arquivar o anúncio.');
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Moderação</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView 
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff9066" />}
            >
                {isLoading ? (
                    <View style={{ marginTop: 100, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#ff9066" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', marginTop: 16 }}>Revisando posts...</Text>
                    </View>
                ) : listings.length > 0 ? (
                    <View style={{ gap: 16 }}>
                        {listings.map((p) => (
                            <View key={p.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: 16, borderRadius: 28, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', flexDirection: 'row' }}>
                                <Image 
                                    source={{ uri: p.thumbnailUrl || (p.imageUrls && p.imageUrls[0]) || p.videoUrl }} 
                                    style={{ width: 80, height: 80, borderRadius: 20 }} 
                                    contentFit="cover"
                                />
                                <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
                                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 }} numberOfLines={1}>{p.listingTitle}</Text>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, marginTop: 4 }}>{p.neighborhood}, {p.city}</Text>
                                    <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
                                        <TouchableOpacity 
                                            onPress={() => router.push(`/property/${p.id}`)}
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold' }}>Ver</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => handleReject(p.id)}
                                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}
                                        >
                                            <Text style={{ color: '#ef4444', fontSize: 12, fontFamily: 'PlusJakartaSans-Bold' }}>Arquivar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={{ marginTop: 100, alignItems: 'center', paddingHorizontal: 40 }}>
                        <Ionicons name="documents-outline" size={80} color="rgba(255, 255, 255, 0.05)" />
                        <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center', marginTop: 24 }}>Sem anúncios para rever</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
