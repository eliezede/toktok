import FilterSheet from '@/components/sheets/FilterSheet';
import { CustomModal } from '@/components/ui/CustomModal';
import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { PropertyListing } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const GAP = 14;
const ITEM_WIDTH = (width - 48 - GAP) / 2; // 2 columns with padding and gap

export default function ExploreScreen() {
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [appliedFilters, setAppliedFilters] = useState<any>(null);

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

    const filterSheetRef = useRef<BottomSheetModal>(null);
    const handleOpenFilters = useCallback(() => filterSheetRef.current?.present(), []);

    useEffect(() => {
        fetchListings(appliedFilters?.hideSold, appliedFilters?.hideReserved);
    }, [appliedFilters]);

    const fetchListings = async (hideSold: boolean = false, hideReserved: boolean = false) => {
        setLoading(true);
        const data = await PropertyQueryService.getListings(50, hideSold, hideReserved);
        setListings(data);
        setLoading(false);
    };

    const filters = ['Todos', 'Apartamento', 'Casa', 'Cobertura', 'Comercial', 'Studio', 'Fazenda', 'Terreno'];

    const formatPrice = (price: number) => {
        try {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price);
        } catch (e) {
            return `R$ ${price?.toLocaleString() || '0'}`;
        }
    };

    const filteredProperties = listings.filter(p => {
        const type = p.propertyType?.toLowerCase() || '';
        const title = p.listingTitle?.toLowerCase() || '';
        const city = p.city?.toLowerCase() || '';
        const neighborhood = p.neighborhood?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        const filterMap: Record<string, string> = {
            'Todos': 'all',
            'Apartamento': 'apartment',
            'Casa': 'house',
            'Cobertura': 'penthouse',
            'Comercial': 'commercial',
            'Studio': 'studio',
            'Fazenda': 'farm',
            'Terreno': 'land'
        };

        const targetType = filterMap[activeFilter];

        // Basic Text Search
        const matchesQuery = title.includes(query) || city.includes(query) || neighborhood.includes(query);
        
        // Tab Filter
        const matchesTab = targetType === 'all' || type === targetType;

        // Sheet Filters
        if (!appliedFilters) return matchesQuery && matchesTab;

        const matchesPurpose = appliedFilters.purpose === 'Todos' || 
            (appliedFilters.purpose === 'Venda' && p.listingType === 'sale') ||
            (appliedFilters.purpose === 'Aluguel' && p.listingType === 'rent') ||
            (appliedFilters.purpose === 'Temporada' && p.listingType === 'seasonal');

        const matchesRooms = appliedFilters.bedrooms === 'Qualquer' || 
            p.bedrooms >= parseInt(appliedFilters.bedrooms);

        const matchesSuites = appliedFilters.suites === 'Qualquer' || 
            (p.suites || 0) >= parseInt(appliedFilters.suites);

        const matchesBaths = appliedFilters.bathrooms === 'Qualquer' || 
            p.bathrooms >= parseInt(appliedFilters.bathrooms);

        const matchesFurnished = !appliedFilters.furnished || p.furnished;
        const matchesPet = !appliedFilters.petFriendly || p.petFriendly;
        const matchesFinancing = !appliedFilters.acceptsFinancing || p.acceptsFinancing;
        const matchesExchange = !appliedFilters.acceptsExchange || p.acceptsExchange;

        const matchesParking = appliedFilters.parkingSpaces === 'Qualquer' || 
            (p.parkingSpaces || 0) >= parseInt(appliedFilters.parkingSpaces);

        // Area Filter Logic
        let matchesArea = true;
        if (appliedFilters.areaRange !== 'Todas') {
            if (appliedFilters.areaRange === 'Até 50m²') matchesArea = p.areaValue <= 50;
            else if (appliedFilters.areaRange === '50 - 100m²') matchesArea = p.areaValue >= 50 && p.areaValue <= 100;
            else if (appliedFilters.areaRange === '100 - 200m²') matchesArea = p.areaValue >= 100 && p.areaValue <= 200;
            else if (appliedFilters.areaRange === 'Acima de 200m²') matchesArea = p.areaValue >= 200;
        }

        // Amenities Filter Logic
        const matchesAmenities = appliedFilters.amenities.length === 0 || 
            appliedFilters.amenities.every((a: string) => p.amenities?.includes(a));

        // Price Filter Logic
        let matchesPrice = true;
        if (appliedFilters.priceRange !== 'Todas') {
            if (appliedFilters.priceRange === 'Até R$ 500k') matchesPrice = p.price <= 500000;
            else if (appliedFilters.priceRange === 'R$ 500k - 1M') matchesPrice = p.price >= 500000 && p.price <= 1000000;
            else if (appliedFilters.priceRange === 'R$ 1M - 2M') matchesPrice = p.price >= 1000000 && p.price <= 2000000;
            else if (appliedFilters.priceRange === 'Acima de 2M') matchesPrice = p.price >= 2000000;
        }

        return matchesQuery && matchesTab && matchesPurpose && matchesRooms && matchesSuites && matchesBaths && 
               matchesFurnished && matchesPet && matchesPrice && matchesFinancing && matchesExchange && 
               matchesParking && matchesArea && matchesAmenities;
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            <View style={{ flex: 1 }}>
                <View className="px-6 pt-6">
                    <View className="mb-6 flex-row justify-between items-start">
                        <View>
                            <Text className="text-4xl font-bold text-white tracking-tighter">Explorar</Text>
                            <Text className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">Encontre seu próximo lar</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={handleOpenFilters}
                            className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                        >
                            <Ionicons name="options-outline" size={24} color="#ff9066" />
                        </TouchableOpacity>
                    </View>

                    <BlurView intensity={20} tint="dark" className="flex-row items-center rounded-3xl border border-white/10 px-4 h-16 mb-6 overflow-hidden">
                        <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.3)" />
                        <TextInput
                            style={{ flex: 1, marginLeft: 12, fontSize: 16, color: 'white' }}
                            placeholder="Cidades, bairros, condomínios..."
                            placeholderTextColor="rgba(255, 255, 255, 0.2)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity 
                            onPress={() => {
                                showModal("Alerta Criado", `Enviaremos e-mails quando novos imóveis para "${searchQuery || 'Todos'}" forem publicados.`, "success");
                            }}
                            className="bg-primary/10 p-2 rounded-xl"
                        >
                            <Ionicons name="notifications" size={20} color="#ff9066" />
                        </TouchableOpacity>
                    </BlurView>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        {filters.map(filter => (
                            <TouchableOpacity
                                key={filter}
                                style={{
                                    paddingHorizontal: 24,
                                    paddingVertical: 12,
                                    borderRadius: 16,
                                    marginRight: 10,
                                    borderStyle: 'solid',
                                    borderWidth: 1,
                                    borderColor: activeFilter === filter ? '#ff9066' : 'rgba(255, 255, 255, 0.05)',
                                    backgroundColor: activeFilter === filter ? 'rgba(255, 144, 102, 0.1)' : 'transparent'
                                }}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: activeFilter === filter ? '#ff9066' : 'rgba(255, 255, 255, 0.4)' }}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {loading ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator size="large" color="#ff9066" />
                        <Text style={{ marginTop: 16, color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Garimpando Oportunidades...</Text>
                    </View>
                ) : (
                    <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
                        <View style={{ marginTop: 12, marginBottom: 20 }}>
                            <Text style={{ fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(255, 255, 255, 0.2)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Recomendados para você</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: '#ff9066', fontFamily: 'PlusJakartaSans-Bold', fontSize: 12 }}>{filteredProperties.length} Resultados encontrados</Text>
                                <TouchableOpacity 
                                    style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.6 }}
                                    onPress={() => { }}
                                >
                                    <Ionicons name="map-outline" size={18} color="white" />
                                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', fontSize: 9, marginLeft: 6, letterSpacing: 1 }}>Mapa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 120 }}>
                            {filteredProperties.map(property => (
                                <TouchableOpacity
                                    key={property.id}
                                    style={{ width: ITEM_WIDTH, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 24, marginBottom: 24, overflow: 'hidden', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
                                    onPress={() => router.push(`/property/${property.id}`)}
                                    activeOpacity={0.9}
                                >
                                    <View style={{ height: ITEM_WIDTH * 1.6, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                                        <Image
                                            source={{ uri: property.thumbnailUrl || property.videoUrl }}
                                            style={{ flex: 1 }}
                                            contentFit="cover"
                                        />
                                        <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' }}>
                                            <Ionicons name="play-circle-outline" size={32} color="rgba(255, 255, 255, 0.4)" />
                                        </View>
                                        <View style={{ position: 'absolute', top: 12, left: 12, gap: 4 }}>
                                            <BlurView intensity={30} tint="dark" style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' }}>
                                                <Text style={{ color: '#ff9066', fontSize: 9, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1 }}>{property.listingType === 'rent' ? 'Aluguel' : property.listingType === 'seasonal' ? 'Temporada' : 'Venda'}</Text>
                                            </BlurView>
                                            {property.listingStatus === 'reserved' && (
                                                <View style={{ backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' }}>
                                                    <Text style={{ color: 'black', fontSize: 9, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1 }}>Reservado</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View style={{ padding: 16 }}>
                                        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: 'white' }}>{formatPrice(property.price)}</Text>
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 11, marginBottom: 12 }} numberOfLines={1}>{property.neighborhood}, {property.city}</Text>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="bed-outline" size={12} color="rgba(255, 255, 255, 0.3)" />
                                                <Text style={{ color: 'white', fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', marginLeft: 4 }}>{property.bedrooms}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="car-outline" size={12} color="rgba(255, 255, 255, 0.3)" />
                                                <Text style={{ color: 'white', fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', marginLeft: 4 }}>{property.parkingSpaces || 0}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="expand-outline" size={12} color="rgba(255, 255, 255, 0.3)" />
                                                <Text style={{ color: 'white', fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', marginLeft: 4 }}>{property.areaValue}m²</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {filteredProperties.length === 0 && (
                                <View style={{ width: '100%', paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                        <Ionicons name="search-outline" size={40} color="rgba(255, 255, 255, 0.2)" />
                                    </View>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 }}>Nenhum imóvel encontrado</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                )}



                <FilterSheet
                    ref={filterSheetRef}
                    onApply={setAppliedFilters}
                    onClose={() => filterSheetRef.current?.dismiss()}
                />
            </View>

            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </SafeAreaView>
    );
}
