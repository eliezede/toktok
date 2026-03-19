import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { PropertyListing, UserProfile } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/userService';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { CustomModal } from '@/components/ui/CustomModal';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

export default function PropertyDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user, profile, isGuest, guestFavorites, syncGuestFavorites } = useAuth();
    const [property, setProperty] = useState<PropertyListing | null>(null);
    const [agentProfile, setAgentProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPlayIcon, setShowPlayIcon] = useState(false);

    const {
        sheetVisible,
        setSheetVisible,
        modalVisible,
        setModalVisible,
        modalConfig,
        openManagement,
        getManagementActions,
        showModal
    } = usePropertyManagement(() => fetchData());

    const isOwner = user?.uid === property?.createdBy;

    const isSaved = useMemo(() => {
        if (user) return profile?.savedProperties?.includes(id) || false;
        return guestFavorites.includes(id);
    }, [profile?.savedProperties, guestFavorites, user, id]);

    const handleSave = async () => {
        if (!user && !isGuest) {
            showModal({
                title: 'Autenticação',
                message: 'Por favor, faça login ou entre como convidado para salvar imóveis em sua lista de favoritos.',
                type: 'info',
                onConfirm: () => router.push('/auth/login')
            });
            return;
        }

        try {
            if (user) {
                await UserService.toggleSaveProperty(user.uid, id, isSaved);
                if (!isSaved) { // Only log if it's a new save
                    const { LeadService } = require('../../services/leadService');
                    await LeadService.logLead({
                        propertyId: id,
                        agentId: property?.createdBy,
                        buyerId: user.uid,
                        buyerName: profile?.fullName || 'Usuário',
                        buyerImage: profile?.profileImage || '',
                        type: 'favorite'
                    });
                }
            } else {
                // Guest mode save
                const { GuestService } = require('../../services/guestService');
                await GuestService.toggleFavorite(id);
                await syncGuestFavorites();
            }
        } catch (error) {
            showModal({
                title: 'Erro',
                message: 'Não foi possível atualizar a sua lista de favoritos.',
                type: 'error'
            });
        }
    };

    const player = useVideoPlayer(property?.videoUrl || null, player => {
        if (!player) return;
        player.loop = true;
        player.play();
    });

    const togglePlayback = () => {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
        setIsPlaying(!isPlaying);
        setShowPlayIcon(true);
        setTimeout(() => setShowPlayIcon(false), 800);
    };

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        const data = await PropertyQueryService.getListingById(id);
        setProperty(data);

        if (data && data.createdBy) {
            try {
                const agentDoc = await getDoc(doc(db, 'users', data.createdBy));
                if (agentDoc.exists()) {
                    setAgentProfile({ id: agentDoc.id, ...agentDoc.data() } as UserProfile);
                    
                    // Log View Lead (Silent)
                    if (user?.uid !== data.createdBy) {
                        const { LeadService } = require('../../services/leadService');
                        LeadService.logLead({
                            propertyId: id,
                            agentId: data.createdBy,
                            buyerId: user?.uid || 'guest',
                            type: 'view'
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching agent profile:", error);
            }
        }

        setLoading(false);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: property?.currency || 'BRL',
            maximumFractionDigits: 0
        }).format(price);
    };

    const handleShare = async () => {
        if (!property) return;
        try {
            const shareUrl = `https://toktok.app/property/${property.id}`;
            await require('react-native').Share.share({
                message: `Confira este imóvel no TokTok: ${property.listingTitle}\n${shareUrl}`,
                url: shareUrl,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0e0e' }}>
                <ActivityIndicator size="large" color="#ff9066" />
                <Text style={{ marginTop: 16, color: 'rgba(255,255,255,0.4)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 2, fontSize: 10 }}>A carregar luxo...</Text>
            </View>
        );
    }

    if (!property) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0e0e', padding: 40 }}>
                <Ionicons name="alert-circle-outline" size={64} color="#ff9066" />
                <Text style={{ marginTop: 16, fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center' }}>IMÓVEL NÃO ENCONTRADO</Text>
                <Text style={{ marginTop: 8, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 32, fontFamily: 'Manrope-Medium' }}>Este imóvel pode ter sido removido ou não está mais ativo.</Text>
                <TouchableOpacity
                    style={{ backgroundColor: '#ff9066', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 }}
                    onPress={() => router.back()}
                >
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold' }}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <View style={{ width: WINDOW_WIDTH, height: WINDOW_WIDTH * 1.5, backgroundColor: 'black' }}>
                {property.videoUrl ? (
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={togglePlayback}
                        className="flex-1"
                    >
                        <VideoView
                            style={{ flex: 1 }}
                            player={player}
                            allowsFullscreen={false}
                            allowsPictureInPicture={false}
                            contentFit="cover"
                            nativeControls={false}
                        />
                        {showPlayIcon && (
                            <View className="absolute inset-0 items-center justify-center bg-black/20">
                                <View className="bg-black/40 w-20 h-20 rounded-full items-center justify-center border border-white/20">
                                    <Ionicons name={isPlaying ? "play" : "pause"} size={40} color="white" />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Ionicons name="videocam-off-outline" size={48} color="white" />
                        <Text className="text-white mt-2 font-jakarta">Vídeo indisponível</Text>
                    </View>
                )}

                <SafeAreaView className="absolute top-0 left-0 right-0">
                    <View className="flex-row justify-between items-center px-4 mt-4">
                        <TouchableOpacity
                            className="bg-black/40 p-2 rounded-full border border-white/10"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color="#ff9066" />
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                className="bg-black/40 p-2 rounded-full border border-white/10"
                                onPress={handleShare}
                            >
                                <Ionicons name="paper-plane-outline" size={24} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-black/40 p-2 rounded-full border border-white/10"
                                onPress={handleSave}
                            >
                                <Ionicons
                                    name={isSaved ? "bookmark" : "bookmark-outline"}
                                    size={24}
                                    color={isSaved ? "#ff9066" : "white"}
                                />
                            </TouchableOpacity>

                            {isOwner && (
                                <TouchableOpacity
                                    className="bg-black/40 p-2 rounded-full border border-white/10"
                                    onPress={() => property && openManagement(property)}
                                >
                                    <Ionicons name="ellipsis-vertical" size={24} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Status Pill */}
                    {property.listingStatus && property.listingStatus !== 'active' && property.listingStatus !== 'archived' && (
                        <View className="absolute top-20 right-6 z-50">
                            <View className={`px-5 py-2.5 rounded-2xl shadow-xl ${property.listingStatus === 'sold' || property.listingStatus === 'rented' ? 'bg-[#FF2D55]' : 'bg-[#FFCC00]'}`}>
                                <Text className="text-white font-jakarta-extra-bold uppercase text-xs tracking-widest shadow-lg">
                                    {property.listingStatus === 'sold' ? 'VENDIDO' : 
                                     property.listingStatus === 'rented' ? 'ALUGADO' : 'RESERVADO'}
                                </Text>
                            </View>
                        </View>
                    )}
                </SafeAreaView>
                
                <LinearGradient
                    colors={['transparent', 'rgba(14, 14, 14, 0.8)', '#0e0e0e']}
                    className="absolute bottom-0 left-0 right-0 h-48"
                />
            </View>

            <View className="px-6 py-6">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <View>
                        <Text style={{ color: '#ff9066', fontSize: 36, fontFamily: 'PlusJakartaSans-ExtraBold' }}>{formatPrice(property.price)}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="location" size={16} color="#ff9066" />
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, marginLeft: 4 }}>{property.neighborhood}, {property.city}</Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: 'rgba(255, 144, 102, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 144, 102, 0.2)' }}>
                        <Text style={{ color: '#ff9066', fontSize: 10, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {property.listingType === 'rent' ? 'Aluguel' : 'Venda'}
                        </Text>
                    </View>
                </View>

                <View style={{ height: 1.5, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 24 }} />
                
                <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', color: 'white', lineHeight: 32, marginBottom: 24 }}>{property.listingTitle}</Text>

                {/* Technical Specs Card */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 32, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 40 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans-Bold', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 24 }}>Ficha Técnica</Text>
                    
                    <View className="flex-row justify-between">
                        <View className="flex-1 items-center bg-white/5 py-4 rounded-3xl border border-white/10">
                                <Ionicons name="bed-outline" size={24} color="#ff9066" />
                                <Text className="text-white font-bold text-xl mt-2">{property.bedrooms}</Text>
                                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">Quartos</Text>
                            </View>
                            <View className="flex-1 items-center bg-white/5 py-4 rounded-3xl border border-white/10">
                                <Ionicons name="water-outline" size={24} color="#ff9066" />
                                <Text className="text-white font-bold text-xl mt-2">{property.bathrooms}</Text>
                                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">Banhos</Text>
                            </View>
                            <View className="flex-1 items-center bg-white/5 py-4 rounded-3xl border border-white/10">
                                <Ionicons name="expand-outline" size={24} color="#ff9066" />
                                <Text className="text-white font-bold text-xl mt-2">{property.areaValue}</Text>
                                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">{property.areaUnit || 'm²'}</Text>
                            </View>
          </View>
                </View>

                {/* Characteristics */}
                <Text className="text-xl font-jakarta-bold text-white mb-4">Comodidades</Text>
                <View className="flex-row flex-wrap gap-2 mb-10">
                    {property.features?.map((feature, idx) => (
                        <View key={idx} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            <Text className="text-white/80 font-jakarta-medium text-sm">{feature}</Text>
                        </View>
                    ))}
                </View>

                <Text className="text-xl font-jakarta-bold text-white mb-4">Descrição</Text>
                <Text className="text-white/60 leading-7 font-jakarta text-base mb-10">{property.descriptionLong}</Text>

                {/* Photos Gallery */}
                {property.imageUrls && property.imageUrls.length > 0 && (
                    <View className="mb-10">
                        <Text style={{ fontSize: 18, color: 'white', fontFamily: 'PlusJakartaSans-Bold', marginBottom: 16 }}>Galeria de Fotos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                            {property.imageUrls.map((url, index) => (
                                <View key={index} className="mr-3 w-80 h-56 rounded-3xl overflow-hidden border border-white/5">
                                    <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Planta */}
                {property.floorPlanUrl && (
                    <View className="mb-10">
                        <Text style={{ fontSize: 18, color: 'white', fontFamily: 'PlusJakartaSans-Bold', marginBottom: 16 }}>Planta do Imóvel</Text>
                        <View className="bg-white/5 p-4 rounded-3xl border border-white/5 items-center">
                            <Image 
                                source={{ uri: property.floorPlanUrl }} 
                                style={{ width: '100%', aspectRatio: 1.5, borderRadius: 20 }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                )}

                {/* Mapa Section */}
                <View className="mb-12">
                    <Text style={{ fontSize: 18, color: 'white', fontFamily: 'PlusJakartaSans-Bold', marginBottom: 16 }}>Localização</Text>
                    <View className="bg-white/5 h-48 rounded-3xl border border-white/5 overflow-hidden">
                        {/* Placeholder for Map since we might not have a full map component easily here without more setup */}
                        <Image 
                            source={{ uri: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/pin-s+ff9066(${property.longitude || -9.1393},${property.latitude || 38.7223})/${property.longitude || -9.1393},${property.latitude || 38.7223},14,0/600x300?access_token=pk.eyJ1IjoiZWxpZXzezeuIiwizhIjoiY203N3R0eDk4MGJhajJxczRkb2w4bXB6ZyJ9.RMT7Y2YhY2YhY2YhY2YhYg` }} 
                            className="w-full h-full"
                        />
                        <View className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md">
                            <Text className="text-white text-xs font-jakarta-bold">{property.neighborhood}</Text>
                        </View>
                    </View>
                </View>

                {/* Agent Card */}
                <LinearGradient
                    colors={['rgba(255, 144, 102, 0.08)', 'rgba(14, 14, 14, 0.6)']}
                    className="p-6 rounded-[40px] mb-10 border border-white/5"
                >
                    <TouchableOpacity 
                        className="flex-row items-center mb-6"
                        onPress={() => agentProfile && router.push({ pathname: '/profile/[id]', params: { id: agentProfile.id } } as any)}
                    >
                        <View className="relative">
                            {agentProfile?.profileImage ? (
                                <Image 
                                    source={{ uri: agentProfile.profileImage }} 
                                    style={{ width: 56, height: 56, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 144, 102, 0.3)' }}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={{ width: 56, height: 56, backgroundColor: '#ff9066', borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>
                                        {agentProfile?.fullName?.[0] || 'A'}
                                    </Text>
                                </View>
                            )}
                            <View className="absolute -bottom-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border-2 border-[#0e0e0e]">
                                <Ionicons name="checkmark" size={10} color="white" />
                            </View>
                        </View>
                        <View className="ml-4">
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 }}>{agentProfile?.fullName || 'Agente Premium'}</Text>
                            <Text style={{ color: '#ff9066', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                                {agentProfile?.creciNumber ? `CRECI: ${agentProfile.creciNumber}` : (agentProfile?.role === 'agency' ? 'Imobiliária' : 'Consultor Verificado')}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-white/10 py-4 rounded-2xl items-center border border-white/5"
                            onPress={() => agentProfile?.phone && Linking.openURL(`tel:${agentProfile.phone}`)}
                        >
                            <Text className="text-white font-jakarta-bold text-sm">Ligar Agora</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-[#25D366] py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-[#25D366]/20"
                            onPress={async () => {
                                if (agentProfile?.whatsapp) {
                                    // Log Lead
                                    const { LeadService } = require('../../services/leadService');
                                    await LeadService.logLead({
                                        propertyId: id,
                                        agentId: property.createdBy,
                                        buyerId: user?.uid || 'guest',
                                        buyerName: profile?.fullName || 'Visitante',
                                        buyerImage: profile?.profileImage || '',
                                        type: 'whatsapp_click'
                                    });
                                    Linking.openURL(`https://wa.me/${agentProfile.whatsapp}`);
                                }
                            }}
                        >
                            <Ionicons name="logo-whatsapp" size={18} color="white" />
                            <Text className="text-white font-jakarta-bold text-sm ml-2">WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <View className="h-10" />
            </View>

            {/* Management UI */}
            {property && (
                <>
                    <ActionSheet
                        visible={sheetVisible}
                        onClose={() => setSheetVisible(false)}
                        title="Gerenciar Imóvel"
                        message="Escolha uma ação para esta publicação"
                        actions={getManagementActions(property)}
                    />
                    <CustomModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        {...modalConfig}
                    />
                </>
            )}
        </ScrollView>
    );
}
