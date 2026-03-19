import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, SafeAreaView, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { UserService } from '@/services/userService';
import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { UserProfile, PropertyListing } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user: currentUser, profile: currentProfile } = useAuth();
    const router = useRouter();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');
    const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
    
    const isMainUser = currentUser?.uid === id;
    const isFollowing = currentProfile?.followedAgents?.includes(id) || false;

    useEffect(() => {
        if (id) {
            fetchProfileData();
        }
    }, [id]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            const profileData = await UserService.getUserProfile(id);
            setProfile(profileData);
            
            if (profileData?.role === 'agent' || profileData?.role === 'agency') {
                const agentListings = await PropertyQueryService.getListingsByAgent(id as string);
                setListings(agentListings);
            }
        } catch (error) {
            console.error("Error fetching public profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAndSortedListings = useMemo(() => {
        let result = [...listings];
        
        if (filterType !== 'all') {
            result = result.filter(p => p.listingType === filterType);
        }

        result.sort((a, b) => {
            if (sortBy === 'price_low') return a.price - b.price;
            if (sortBy === 'price_high') return b.price - a.price;
            
            const getTime = (val: any) => {
                if (!val) return 0;
                if (typeof val === 'object' && 'seconds' in val) return val.seconds;
                if (typeof val === 'number') return val;
                return 0;
            };

            return getTime(b.createdAt) - getTime(a.createdAt);
        });

        return result;
    }, [listings, filterType, sortBy]);

    const handleFollow = async () => {
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        try {
            await UserService.toggleFollowAgent(currentUser.uid, id, isFollowing);
        } catch (error) {
            console.error("Error following in public profile:", error);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#1c1022', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#af25f4" />
            </View>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1022', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 }}>Perfil não encontrado</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#af25f4' }}>Voltar</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0
        }).format(price);
    };

    const renderPropertyItem = (property: PropertyListing) => (
        <TouchableOpacity
            key={property.id}
            className="bg-white/5 rounded-[32px] mb-6 overflow-hidden border border-white/10 flex-row h-44"
            onPress={() => router.push(`/property/${property.id}`)}
            activeOpacity={0.9}
        >
            <View className="w-2/5 bg-white/5">
                <Image
                    source={{ uri: property.thumbnailUrl || property.videoUrl || (property.imageUrls && property.imageUrls[0]) }}
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
                            name={currentProfile?.likedProperties?.includes(property.id) ? "heart" : "heart-outline"}
                            size={20}
                            color="#af25f4"
                        />
                    </TouchableOpacity>
                </View>
                <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>{property.listingTitle}</Text>
                <Text className="text-white/40 font-medium text-[10px] mb-3" numberOfLines={1}>{property.neighborhood}, {property.city}</Text>
                <View className="flex-row gap-3">
                    <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-lg">
                        <Ionicons name="bed-outline" size={12} color="#af25f4" />
                        <Text className="text-[9px] text-white font-bold ml-1">{property.bedrooms}</Text>
                    </View>
                    <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-lg">
                        <Ionicons name="water-outline" size={12} color="#af25f4" />
                        <Text className="text-[9px] text-white font-bold ml-1">{property.bathrooms}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderBuyerProfile = () => (
        <ScrollView className="flex-1 bg-background-dark" showsVerticalScrollIndicator={false}>
            {/* Buyer Info Section */}
            <View className="items-center p-6 gap-4">
                <View className="relative">
                    <View className="w-32 h-32 rounded-full border-4 border-primary/30 items-center justify-center bg-background-dark overflow-hidden">
                        {profile.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        ) : (
                            <View className="w-full h-full bg-primary/20 items-center justify-center">
                                <Text className="text-4xl font-jakarta-bold text-white">{profile.fullName.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </View>
                    {isMainUser && (
                        <TouchableOpacity className="absolute bottom-0 right-0 bg-primary p-2 rounded-full shadow-lg">
                            <Ionicons name="pencil" size={16} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
                <View className="items-center">
                    <Text className="text-2xl font-jakarta-bold text-white">{profile.fullName}</Text>
                    <Text className="text-primary/70 font-jakarta-medium">{profile.city || 'Localização não definida'}</Text>
                    {profile.bio && (
                        <Text className="mt-2 text-sm text-white/50 text-center max-w-[280px] font-jakarta">
                            {profile.bio}
                        </Text>
                    )}
                </View>
            </View>

            {/* Interest/Stats Cards */}
            <View className="px-4 gap-4">
                <View className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <Text className="text-[10px] font-jakarta-bold text-white/30 uppercase tracking-widest mb-3">Interesses</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {profile.interests && profile.interests.length > 0 ? profile.interests.map((interest, idx) => (
                            <View key={idx} className="px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                                <Text className="text-primary text-xs font-jakarta-medium">{interest}</Text>
                            </View>
                        )) : (
                            <Text className="text-white/20 text-xs italic">Nenhum interesse definido</Text>
                        )}
                    </View>
                </View>

                {profile.budgetRange && (
                    <View className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <Text className="text-[10px] font-jakarta-bold text-white/30 uppercase tracking-widest mb-2">Faixa de Preço</Text>
                        <View className="flex-row items-center gap-3">
                            <Ionicons name="wallet-outline" size={20} color="#af25f4" />
                            <Text className="text-lg font-jakarta-bold text-white">
                                {formatPrice(profile.budgetRange.min)} — {formatPrice(profile.budgetRange.max)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Nav Links - only if main user */}
            {isMainUser && (
                <View className="mt-6 px-4 gap-2 pb-10">
                    {[
                        { icon: 'person-outline', label: 'Editar Perfil', action: () => router.push('/profile/edit' as any) },
                        { icon: 'notifications-outline', label: 'Notificações', action: () => {} },
                        { icon: 'help-circle-outline', label: 'Central de Ajuda', action: () => {} },
                        { icon: 'log-out-outline', label: 'Sair', action: () => {}, color: '#ef4444' }
                    ].map((item, idx) => (
                        <TouchableOpacity 
                            key={idx} 
                            onPress={item.action}
                            className="flex-row items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10"
                        >
                            <View className="flex-row items-center gap-3">
                                <Ionicons name={item.icon as any} size={20} color={item.color || 'rgba(255,255,255,0.4)'} />
                                <Text className={`font-jakarta-semibold ${item.color ? '' : 'text-white'}`} style={item.color ? { color: item.color } : {}}>{item.label}</Text>
                            </View>
                            {!item.color && <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );

    const renderAgentProfile = () => (
        <ScrollView className="flex-1 bg-background-dark" showsVerticalScrollIndicator={false}>
            {/* Header Backdrop */}
            <View style={{ height: 180, width: '100%', position: 'absolute', top: 0 }}>
                <LinearGradient colors={['rgba(175, 37, 244, 0.2)', 'transparent']} style={{ flex: 1 }} />
            </View>

            <View className="p-4 gap-5" style={{ paddingTop: 120 }}>
                {/* Header Info */}
                <View className="flex-row gap-5">
                    <View className="w-24 h-24 rounded-full border-2 border-primary shadow-xl shadow-primary/30 overflow-hidden bg-background-dark">
                        {profile.profileImage ? (
                            <Image source={{ uri: profile.profileImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        ) : (
                            <View className="w-full h-full bg-primary/20 items-center justify-center">
                                <Text className="text-3xl font-jakarta-bold text-white">
                                    {(profile.agencyName || profile.fullName).charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View className="flex-1 justify-center">
                        <View className="flex-row items-center gap-2 mb-0.5">
                            <Text className="text-2xl font-jakarta-bold text-white" numberOfLines={1}>
                                {profile.role === 'agency' ? profile.agencyName : profile.fullName}
                            </Text>
                            {profile.isVerified && <Ionicons name="checkmark-circle" size={20} color="#af25f4" />}
                        </View>
                        
                        <View className="flex-row items-center gap-2 mb-1">
                            {profile.role === 'agent' && profile.creciNumber && (
                                <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                    <Text className="text-[9px] font-jakarta-bold text-primary uppercase tracking-widest">
                                        CRECI: {profile.creciNumber}-{profile.creciState || 'SP'}
                                    </Text>
                                </View>
                            )}
                            {profile.role === 'agency' && profile.creciCompany && (
                                <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                    <Text className="text-[9px] font-jakarta-bold text-primary uppercase tracking-widest">
                                        CRECI-J: {profile.creciCompany}
                                    </Text>
                                </View>
                            )}
                            {profile.experienceYears && (
                                <View className="bg-white/5 px-2 py-0.5 rounded-md">
                                    <Text className="text-[9px] font-jakarta-bold text-white/40 uppercase tracking-widest">
                                        {profile.experienceYears} anos exp.
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center gap-1 opacity-60">
                            <Ionicons name="location" size={12} color="white" />
                            <Text className="text-xs font-jakarta-medium text-white">{profile.city || 'Brasil'}</Text>
                        </View>
                        
                        {/* Metrics Row */}
                        <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-white/5">
                            <View>
                                <Text className="text-sm font-jakarta-bold text-white">{profile.followerCount || 0}</Text>
                                <Text className="text-[9px] text-white/40 uppercase font-jakarta-bold">Seguidores</Text>
                            </View>
                            <View className="w-[1px] h-4 bg-white/10" />
                            <View>
                                <Text className="text-sm font-jakarta-bold text-white">{listings.length}</Text>
                                <Text className="text-[9px] text-white/40 uppercase font-jakarta-bold">Ativos</Text>
                            </View>
                            {profile.role === 'agency' && profile.teamSize && (
                                <>
                                    <View className="w-[1px] h-4 bg-white/10" />
                                    <View>
                                        <Text className="text-sm font-jakarta-bold text-white">{profile.teamSize}</Text>
                                        <Text className="text-[9px] text-white/40 uppercase font-jakarta-bold">Corretores</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </View>

                {/* Profile Badges / Info */}
                {profile.role === 'agency' && profile.foundedYear && (
                    <View className="flex-row items-center bg-white/5 p-3 rounded-2xl gap-3">
                        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
                            <Ionicons name="business" size={20} color="#af25f4" />
                        </View>
                        <View>
                            <Text className="text-white font-jakarta-bold text-sm">Desde {profile.foundedYear}</Text>
                            <Text className="text-white/40 text-[10px] uppercase font-jakarta-bold">História no Mercado</Text>
                        </View>
                    </View>
                )}

                {/* Bio */}
                <View className="gap-2">
                    <Text className="text-sm text-white/60 leading-5 font-jakarta">
                        {profile.bio || (profile.role === 'agency' ? "Imobiliária comprometida com a transparência e agilidade." : "Especialista em imóveis. Entre em contato para uma consultoria personalizada.")}
                    </Text>
                </View>

                {/* Social Media Links */}
                {profile.socialMedia && (profile.socialMedia.instagram || profile.socialMedia.website) && (
                    <View className="flex-row gap-3">
                        {profile.socialMedia.instagram && (
                            <TouchableOpacity 
                                onPress={() => Linking.openURL(`https://instagram.com/${profile.socialMedia?.instagram?.replace('@', '')}`)}
                                className="flex-row items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10"
                            >
                                <Ionicons name="logo-instagram" size={16} color="white" style={{ opacity: 0.6 }} />
                                <Text className="text-white/60 text-xs ml-2 font-jakarta-medium">@{profile.socialMedia.instagram.replace('@', '')}</Text>
                            </TouchableOpacity>
                        )}
                        {profile.socialMedia.website && (
                            <TouchableOpacity 
                                onPress={() => Linking.openURL(profile.socialMedia?.website?.startsWith('http') ? profile.socialMedia.website : `https://${profile.socialMedia?.website}`)}
                                className="flex-row items-center bg-white/5 px-4 py-2 rounded-xl border border-white/10"
                            >
                                <Ionicons name="globe-outline" size={16} color="white" style={{ opacity: 0.6 }} />
                                <Text className="text-white/60 text-xs ml-2 font-jakarta-medium">Website</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Actions Row */}
                {!isMainUser && (
                    <View className="flex-row gap-2 items-center">
                        <TouchableOpacity 
                            onPress={handleFollow}
                            className="flex-[2] h-11 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/20"
                        >
                            <Text className="text-white text-sm font-jakarta-bold">{isFollowing ? 'Seguindo' : 'Seguir'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 h-11 bg-primary/20 border border-primary/20 rounded-xl items-center justify-center">
                            <Text className="text-white font-jakarta-bold text-xs">Mensagem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => profile.whatsapp && Linking.openURL(`https://wa.me/${profile.whatsapp}`)}
                            className="w-11 h-11 bg-[#25D366] rounded-xl items-center justify-center"
                        >
                            <Ionicons name="chatbubble-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Property Section Header */}
            <View className="mt-8 px-4 border-t border-white/5 pt-8">
                <View className="flex-row justify-between items-end mb-6">
                    <View>
                        <Text className="text-2xl font-jakarta-bold text-white">Portfólio</Text>
                        <Text className="text-[10px] font-jakarta-bold text-white/30 uppercase tracking-widest mt-1">Imóveis Ativos</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => setShowFilterModal(true)}
                        className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                    >
                        <Ionicons name="options-outline" size={24} color={filterType !== 'all' || sortBy !== 'newest' ? "#af25f4" : "white"} />
                    </TouchableOpacity>
                </View>

                {/* Property List */}
                <View className="py-2">
                    {filteredAndSortedListings.length > 0 ? (
                        <View>
                            {filteredAndSortedListings.map((item) => renderPropertyItem(item))}
                        </View>
                    ) : (
                        <View className="py-20 items-center justify-center">
                            <Ionicons name="business-outline" size={48} color="rgba(255,255,255,0.1)" />
                            <Text className="text-white/20 font-jakarta mt-2">Nenhum imóvel encontrado</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#1c1022' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Custom Header with Back Button */}
            <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 100 }}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {profile.role === 'agent' || profile.role === 'agency' ? renderAgentProfile() : renderBuyerProfile()}

            {/* Filter & Sort Modal */}
            {showFilterModal && (
                <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000 }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setShowFilterModal(false)}
                        style={{ flex: 0.3 }}
                    />
                    <View className="flex-1 bg-[#1c1022] rounded-t-[40px] border-t border-white/10 p-8">
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
                                    {sortBy === option.id && <Ionicons name="checkmark-circle" size={20} color="#af25f4" />}
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
        </View>
    );
}
