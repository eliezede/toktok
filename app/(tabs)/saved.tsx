import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { PropertyListing } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
    const { user, profile, isGuest, guestFavorites } = useAuth();
    const [savedProperties, setSavedProperties] = useState<PropertyListing[]>([]);
    const [likedProperties, setLikedProperties] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(false);
    const [showLikedModal, setShowLikedModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
    const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');

    const activeFavorites = useMemo(() => {
        if (user) return profile?.savedProperties || [];
        return guestFavorites;
    }, [user, profile?.savedProperties, guestFavorites]);

    const activeLikes = useMemo(() => profile?.likedProperties || [], [profile?.likedProperties]);

    useEffect(() => {
        fetchSavedProperties();
    }, [activeFavorites]);

    const fetchSavedProperties = async () => {
        if (activeFavorites.length === 0) {
            setSavedProperties([]);
            return;
        }
        setLoading(true);
        try {
            const properties = await Promise.all(
                activeFavorites.map((id: string) => PropertyQueryService.getListingById(id))
            );
            setSavedProperties(properties.filter((p: PropertyListing | null) => p !== null) as PropertyListing[]);
        } catch (error) {
            console.error("Error fetching saved properties:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLikedProperties = async () => {
        if (activeLikes.length === 0) {
            setLikedProperties([]);
            return;
        }
        try {
            const properties = await Promise.all(
                activeLikes.map((id: string) => PropertyQueryService.getListingById(id))
            );
            setLikedProperties(properties.filter((p: PropertyListing | null) => p !== null) as PropertyListing[]);
        } catch (error) {
            console.error("Error fetching liked properties:", error);
        }
    };

    const handleOpenLikes = () => {
        fetchLikedProperties();
        setShowLikedModal(true);
    };

    const filteredAndSortedProperties = useMemo(() => {
        let result = [...savedProperties];

        if (filterType !== 'all') {
            result = result.filter(p => p.listingType === filterType);
        }

        if (sortBy === 'newest') {
            result.sort((a, b) => {
                const dateA = typeof a.createdAt === 'object' ? (a.createdAt as any).seconds : (a.createdAt || 0);
                const dateB = typeof b.createdAt === 'object' ? (b.createdAt as any).seconds : (b.createdAt || 0);
                return dateB - dateA;
            });
        } else if (sortBy === 'price_low') {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_high') {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        return result;
    }, [savedProperties, filterType, sortBy]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price);
    };

    if (!user && !isGuest) {
        return (
            <View className="flex-1 items-center justify-center p-8 bg-[#0e0e0e]">
                <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="bookmark" size={48} color="#ff9066" />
                </View>
                <Text className="text-3xl font-bold text-white mb-2">Imóveis salvos</Text>
                <Text className="text-white/50 text-center text-base leading-6">
                    Acompanhe os imóveis de seu maior interesse. Faça login para sincronizar seus itens salvos em todos os seus dispositivos.
                </Text>
                <TouchableOpacity
                    className="mt-10 bg-primary w-full py-5 rounded-2xl shadow-xl shadow-primary/30"
                    onPress={() => router.push('/auth/login')}
                >
                    <Text className="text-white font-bold text-center text-lg uppercase tracking-widest">Fazer Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderPropertyItem = (property: PropertyListing) => (
        <TouchableOpacity
            key={property.id}
            className="bg-white/5 rounded-[32px] mb-6 overflow-hidden border border-white/10 flex-row h-44"
            onPress={() => {
                if (showLikedModal) setShowLikedModal(false);
                router.push(`/property/${property.id}`);
            }}
            activeOpacity={0.9}
        >
            <View className="w-2/5 bg-white/5">
                <Image
                    source={{ uri: property.thumbnailUrl || (property.imageUrls && property.imageUrls[0]) || property.videoUrl }}
                    style={{ flex: 1 }}
                    contentFit="cover"
                />
                <View className="absolute inset-0 items-center justify-center">
                    <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.4)" />
                </View>
                <View className="absolute top-2 left-2 flex-row gap-1">
                    <View className="bg-black/60 px-2 py-0.5 rounded-full">
                        <Text className="text-primary text-[8px] font-bold uppercase tracking-widest">
                            {property.listingType === 'rent' ? 'Aluguel' : 'Venda'}
                        </Text>
                    </View>
                </View>
            </View>
            <View className="p-4 flex-1 justify-center">
                {property.listingStatus === 'reserved' && (
                    <View style={{ backgroundColor: '#FFD700' }} className="self-start px-2 py-0.5 rounded-md mb-1">
                        <Text className="text-black text-[8px] font-bold uppercase tracking-widest">Reservado</Text>
                    </View>
                )}
                <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-bold text-lg text-primary">{formatPrice(property.price)}</Text>
                    <TouchableOpacity>
                        <Ionicons
                            name={profile?.likedProperties?.includes(property.id) ? "heart" : "heart-outline"}
                            size={20}
                            color="#ff9066"
                        />
                    </TouchableOpacity>
                </View>
                <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>{property.listingTitle}</Text>
                <Text className="text-white/40 font-medium text-[10px] mb-3" numberOfLines={1}>{property.neighborhood}, {property.city}</Text>
                <View className="flex-row gap-3">
                    <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-lg">
                        <Ionicons name="bed-outline" size={12} color="#ff9066" />
                        <Text className="text-[9px] text-white font-bold ml-1">{property.bedrooms}</Text>
                    </View>
                    <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-lg">
                        <Ionicons name="water-outline" size={12} color="#ff9066" />
                        <Text className="text-[9px] text-white font-bold ml-1">{property.bathrooms}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            <View className="flex-1 px-6 pt-6">
                <View className="mb-6 flex-row justify-between items-start">
                    <View>
                        <Text className="text-4xl font-bold text-white tracking-tighter">Salvos</Text>
                        <Text className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">Sua Seleção de Interesse</Text>
                    </View>
                    <View className="items-end gap-3 flex-row">
                        <TouchableOpacity
                            onPress={handleOpenLikes}
                            className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                        >
                            <Ionicons name="heart" size={24} color="#ff9066" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowFilterModal(true)}
                            className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                        >
                            <Ionicons name="options-outline" size={24} color="#ff9066" />
                        </TouchableOpacity>
                    </View>
                </View>

                {isGuest && !user && savedProperties.length > 0 && (
                    <TouchableOpacity
                        onPress={() => router.push('/auth/login')}
                        className="bg-primary/10 border border-primary/20 p-4 rounded-2xl mb-6 flex-row items-center justify-between"
                    >
                        <View className="flex-1 pr-4">
                            <Text className="text-white font-bold text-sm">Modo Convidado</Text>
                            <Text className="text-white/50 text-xs">Crie uma conta para salvar permanentemente.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ff9066" />
                    </TouchableOpacity>
                )}

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#ff9066" />
                    </View>
                ) : (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {filteredAndSortedProperties.map(property => renderPropertyItem(property))}
                        {filteredAndSortedProperties.length === 0 && (
                            <View className="py-20 items-center justify-center">
                                <Ionicons name="bookmark-outline" size={64} color="rgba(255,255,255,0.1)" />
                                <Text className="text-white/30 mt-4 font-bold text-lg text-center uppercase tracking-widest">Nenhum imóvel encontrado</Text>
                                <Text className="text-white/20 text-center mt-2">Ajuste seus filtros ou comece a salvar imóveis.</Text>
                            </View>
                        )}
                        <View className="h-20" />
                    </ScrollView>
                )}
            </View>

            {/* Filter & Sort Modal */}
            {showFilterModal && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowFilterModal(false)}
                        style={{ flex: 0.3 }}
                    />
                    <View className="flex-1 bg-[#0e0e0e] rounded-t-[40px] border-t border-white/10 p-8">
                        <View className="w-12 h-1.5 bg-white/10 self-center rounded-full mb-8" />

                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-bold text-white">Filtros e Ordem</Text>
                            <TouchableOpacity
                                onPress={() => setShowFilterModal(false)}
                                className="w-10 h-10 bg-white/5 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-white/40 font-bold uppercase text-xs tracking-widest mb-4">Tipo de Imóvel</Text>
                        <View className="flex-row flex-wrap gap-3 mb-10">
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'rent', label: 'Aluguel' },
                                { id: 'sale', label: 'Venda' }
                            ].map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    onPress={() => setFilterType(type.id as any)}
                                    className={`px-6 py-3 rounded-2xl border ${filterType === type.id ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}
                                >
                                    <Text className={`font-bold text-sm ${filterType === type.id ? 'text-white' : 'text-white/40'}`}>{type.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-white/40 font-bold uppercase text-xs tracking-widest mb-4">Ordenar por</Text>
                        <View className="gap-3 mb-10">
                            {[
                                { id: 'newest', label: 'Mais novos primeiro' },
                                { id: 'price_low', label: 'Menor preço' },
                                { id: 'price_high', label: 'Maior preço' }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => setSortBy(option.id as any)}
                                    className={`px-6 py-4 rounded-2xl border flex-row justify-between items-center ${sortBy === option.id ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/10'}`}
                                >
                                    <Text className={`font-bold text-sm ${sortBy === option.id ? 'text-primary' : 'text-white/60'}`}>{option.label}</Text>
                                    {sortBy === option.id && <Ionicons name="checkmark-circle" size={20} color="#ff9066" />}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowFilterModal(false)}
                            className="bg-primary w-full py-5 rounded-2xl mt-auto shadow-xl shadow-primary/30"
                        >
                            <Text className="text-white font-bold text-center text-lg uppercase tracking-widest">Aplicar Filtros</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Liked Properties Modal (Simulating Bottom Sheet) */}
            {showLikedModal && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000 }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowLikedModal(false)}
                        style={{ flex: 0.2 }}
                    />
                    <View className="flex-1 bg-[#0e0e0e] rounded-t-[40px] border-t border-white/10 p-6">
                        <View className="w-12 h-1 bg-white/10 self-center rounded-full mb-6" />
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-2xl font-bold text-white">Vídeos Curtidos</Text>
                                <Text className="text-white/40 text-xs mt-1">Seu histórico de likes</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowLikedModal(false)}
                                className="w-10 h-10 bg-white/5 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {likedProperties.length > 0 ? (
                                likedProperties.map(property => renderPropertyItem(property))
                            ) : (
                                <View className="py-20 items-center justify-center">
                                    <Ionicons name="heart-outline" size={64} color="rgba(255,255,255,0.1)" />
                                    <Text className="text-white/30 mt-4 font-bold text-lg text-center uppercase tracking-widest">Nenhuma curtida</Text>
                                    <Text className="text-white/20 text-center mt-2">Os vídeos que você curtir aparecerão aqui.</Text>
                                </View>
                            )}
                            <View className="h-20" />
                        </ScrollView>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
