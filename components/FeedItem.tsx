import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { UserService } from '../services/userService';
import { NotificationService } from '../services/notificationService';
import { PropertyListing, UserProfile } from '../types';
import { Share } from 'react-native';
import { KineticTag } from './kinetic/KineticTag';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

interface FeedItemProps {
    item: PropertyListing;
    isActive: boolean;
    onFichaPress?: () => void;
}

export default function FeedItem({ item, isActive, onFichaPress }: FeedItemProps) {
    const { user, profile } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets() || { bottom: 0, top: 0, left: 0, right: 0 };
    const [isLiked, setIsLiked] = useState(false);
    const [itemData, setItemData] = useState<PropertyListing>(item);
    const [agentProfile, setAgentProfile] = useState<UserProfile | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Sync itemData with real-time updates from Firestore
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'properties', item.id), (doc) => {
            if (doc.exists()) {
                setItemData({ id: doc.id, ...doc.data() } as PropertyListing);
            }
        });
        return () => unsub();
    }, [item.id]);

    // Sync isLiked with user profile
    useEffect(() => {
        if (profile?.likedProperties) {
            setIsLiked(profile.likedProperties.includes(item.id));
        } else {
            setIsLiked(false);
        }
    }, [profile?.likedProperties, item.id]);

    // Fetch agent profile
    useEffect(() => {
        const fetchAgent = async () => {
            if (item.createdBy) {
                const profile = await UserService.getUserProfile(item.createdBy);
                setAgentProfile(profile);
            }
        };
        fetchAgent();
    }, [item.createdBy]);

    // Derived state from profile
    const isSaved = useMemo(() =>
        profile?.savedProperties?.includes(item.id) || false
        , [profile?.savedProperties, item.id]);

    const isFollowing = useMemo(() =>
        profile?.followedAgents?.includes(item.createdBy) || false
        , [profile?.followedAgents, item.createdBy]);

    const [videoStatus, setVideoStatus] = useState<any>(null);
    const [hlsUrl, setHlsUrl] = useState<string | null>(null);

    // Monitor video status
    useEffect(() => {
        if (!item.videoId) return;
        const unsub = onSnapshot(doc(db, 'videos', item.videoId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setVideoStatus(data);
                if (data.status === 'ready' && data.playbackUrl) {
                    setHlsUrl(data.playbackUrl);
                }
            }
        });
        return () => unsub();
    }, [item.videoId]);

    const videoSource = hlsUrl || item.videoUrl;
    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
    });

    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        if (isActive) {
            player.play();
            setIsPlaying(true);
        } else {
            player.pause();
            setIsPlaying(false);
        }
    }, [isActive, player]);

    const togglePlayPause = () => {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleLike = async () => {
        if (!user) {
            Alert.alert("Autenticação Necessária", "Faça login para curtir imóveis.");
            return;
        }
        const newLikeState = !isLiked;
        setIsLiked(newLikeState);
        try {
            await UserService.toggleLikeProperty(user.uid, item.id, item.createdBy, newLikeState);
            if (newLikeState && profile) {
                await NotificationService.notifyLike(user.uid, profile.fullName, item.createdBy, item.id);
            }
        } catch (error) {
            setIsLiked(!newLikeState);
        }
    };

    const handleSave = async () => {
        if (!user) {
            Alert.alert("Autenticação Necessária", "Faça login para salvar imóveis.");
            return;
        }
        try {
            await UserService.toggleSaveProperty(user.uid, item.id, isSaved);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível atualizar os favoritos.");
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Confira este imóvel no TokTok: ${item.listingTitle} em ${item.city}. Acesse agora!`,
                url: `https://toktok.app/property/${item.id}`,
            });
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível compartilhar este imóvel.');
        }
    };

    const handleFollow = async () => {
        if (!user) {
            Alert.alert("Autenticação Necessária", "Faça login para seguir agentes.");
            return;
        }
        try {
            await UserService.toggleFollowAgent(user.uid, item.createdBy, isFollowing);
            if (!isFollowing && profile) {
                await NotificationService.notifyFollow(user.uid, profile.fullName, item.createdBy);
            }
        } catch (error: any) {
            Alert.alert("Erro", "Não foi possível atualizar o status de seguindo.");
        }
    };

    const handleChat = () => {
        if (!user) {
            Alert.alert("Autenticação Necessária", "Faça login para conversar com o agente.");
            return;
        }
        // Navigate to chat or open WhatsApp
        if (item.contactWhatsApp) {
            const url = `whatsapp://send?phone=${item.contactWhatsApp}&text=Olá, vi o anúncio "${item.listingTitle}" no TokTok e gostaria de mais informações.`;
            // Open URL logic
            Alert.alert("Chat", "Iniciando conversa...");
        } else {
            router.push(`/chat/${item.createdBy}`);
        }
    };

    const handleSchedule = () => {
        if (!user) {
            Alert.alert("Autenticação Necessária", "Faça login para agendar uma visita.");
            return;
        }
        Alert.alert("Agendar Visita", "Funcionalidade de agendamento em breve!");
    };

    const formatPrice = (price: number) => {
        try {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(price || 0);
        } catch (e) {
            return `R$ ${price?.toLocaleString() || '0'}`;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback onPress={togglePlayPause}>
                <View style={styles.videoContainer}>
                    <VideoView
                        style={styles.video}
                        player={player}
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                        contentFit="cover"
                        nativeControls={false}
                    />
                    {!isPlaying && (
                        <View style={styles.pauseOverlay}>
                            <Ionicons name="play" size={60} color="rgba(255,255,255,0.4)" />
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>

            {/* Scrim Overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0)', isExpanded ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.85)']}
                style={[styles.bottomGradient, isExpanded && { height: WINDOW_HEIGHT }]}
            />

            {/* Right Actions Column */}
            <View style={[styles.rightOverlay, { bottom: insets.bottom + 40 }]}>
                <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? "#ff9066" : "white"} />
                    <Text style={styles.actionText}>{itemData.likeCount || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert("Comentários", "Em breve!")}>
                    <Ionicons name="chatbubble-outline" size={26} color="white" />
                    <Text style={styles.actionText}>{item.commentCount || 0}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                    <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={26} color={isSaved ? "#ff9066" : "white"} />
                    <Text style={styles.actionText}>{isSaved ? 'Salvo' : 'Salvar'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                    <Ionicons name="paper-plane-outline" size={26} color="white" />
                    <Text style={styles.actionText}>Enviar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
                    <Ionicons name="chatbubbles-outline" size={26} color="white" />
                    <Text style={styles.actionText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleSchedule}>
                    <Ionicons name="calendar-outline" size={26} color="white" />
                    <Text style={styles.actionText}>Visita</Text>
                </TouchableOpacity>

                {onFichaPress && (
                    <TouchableOpacity style={styles.actionButton} onPress={onFichaPress}>
                        <Ionicons name="document-text-outline" size={26} color="white" />
                        <Text style={styles.actionText}>Ficha</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Bottom Left Property Info */}
            <View style={[styles.bottomOverlay, { bottom: insets.bottom + 20 }]}>
                <View style={styles.infoContent}>
                    {/* Status Tag */}
                    {item.listingStatus && item.listingStatus !== 'active' && (
                        <KineticTag 
                            label={item.listingStatus} 
                            variant={item.listingStatus as any} 
                            style={{ marginBottom: 8 }} 
                        />
                    )}

                    <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
                    <Text style={styles.titleText}>{item.listingTitle}</Text>

                    <View style={styles.locationContainer}>
                        <Ionicons name="location" size={12} color="#ababab" />
                        <Text style={styles.locationText}>{item.neighborhood}, {item.city}</Text>
                    </View>

                    <View style={styles.specsContainer}>
                        <View style={styles.specItem}>
                            <Ionicons name="bed-outline" size={14} color="#ff9066" />
                            <Text style={styles.specValue}>{item.bedrooms || 0}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Ionicons name="water-outline" size={14} color="#ff9066" />
                            <Text style={styles.specValue}>{item.bathrooms || 0}</Text>
                        </View>
                        <View style={styles.specItem}>
                            <Ionicons name="expand-outline" size={14} color="#ff9066" />
                            <Text style={styles.specValue}>{item.areaValue || 0}</Text>
                            <Text style={styles.specUnit}>M²</Text>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={styles.descriptionContainer}>
                        {isExpanded ? (
                            <View>
                                <ScrollView 
                                    style={{ maxHeight: 160 }}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    <Text style={styles.descriptionText}>
                                        {item.descriptionLong}
                                    </Text>
                                </ScrollView>
                                <TouchableOpacity 
                                    onPress={() => setIsExpanded(false)}
                                    style={{ marginTop: 8 }}
                                >
                                    <Text style={styles.seeMoreText}>VER MENOS</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity 
                                onPress={() => setIsExpanded(true)}
                                activeOpacity={0.7}
                            >
                                <Text 
                                    style={styles.descriptionText}
                                    numberOfLines={2}
                                >
                                    {item.descriptionLong}
                                </Text>
                                {item.descriptionLong && item.descriptionLong.length > 80 && (
                                    <Text style={styles.seeMoreText}>... ver mais</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Agent Section */}
                    <View style={styles.agentSection}>
                        <TouchableOpacity 
                            style={styles.avatarWrapper}
                            onPress={() => router.push(`/profile/${agentProfile?.id || item.createdBy}`)}
                        >
                            {agentProfile?.profileImage ? (
                                <Image source={{ uri: agentProfile.profileImage }} style={styles.avatar} contentFit="cover" />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarInitial}>{(agentProfile?.fullName || 'A').charAt(0).toUpperCase()}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={styles.agentName} numberOfLines={1}>
                                    {(agentProfile?.role === 'agency' ? agentProfile.agencyName : agentProfile?.fullName) || 'Agente'}
                                </Text>
                                <TouchableOpacity onPress={handleFollow}>
                                    <Text style={styles.followBtnText}>{isFollowing ? 'SEGUINDO' : 'SEGUIR'}</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.creciText}>
                                {agentProfile?.role === 'agency' 
                                    ? (agentProfile.creciCompany ? `CRECI-J: ${agentProfile.creciCompany}` : '') 
                                    : (agentProfile?.creciNumber ? `CRECI: ${agentProfile.creciNumber}` : '')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: WINDOW_HEIGHT,
        width: WINDOW_WIDTH,
        backgroundColor: '#0e0e0e',
    },
    videoContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0e0e0e',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    pauseOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: WINDOW_HEIGHT * 0.4,
    },
    rightOverlay: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
    },
    actionButton: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    actionText: {
        color: 'white',
        fontSize: 11,
        fontFamily: 'Manrope-Bold',
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    bottomOverlay: {
        position: 'absolute',
        left: 16,
        right: 80,
    },
    infoContent: {
        gap: 4,
    },
    priceText: {
        color: 'white',
        fontSize: 32,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        letterSpacing: -1,
    },
    titleText: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'Manrope-Bold',
        opacity: 0.8,
        letterSpacing: -0.5,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    locationText: {
        color: '#ababab',
        fontSize: 13,
        fontFamily: 'Manrope-Medium',
    },
    specsContainer: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 8,
    },
    specItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    specValue: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    specUnit: {
        color: 'white',
        fontSize: 10,
        fontFamily: 'PlusJakartaSans-Bold',
        marginLeft: -2,
    },
    descriptionContainer: {
        marginTop: 12,
        paddingRight: 10,
    },
    descriptionText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        lineHeight: 19,
        fontFamily: 'Manrope-Medium',
    },
    seeMoreText: {
        color: '#ff9066',
        fontSize: 11,
        fontFamily: 'Manrope-Bold',
        marginTop: 4,
    },
    agentSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        gap: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: 10,
        borderRadius: 20,
    },
    avatarWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#262626',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 18,
    },
    agentName: {
        color: 'white',
        fontSize: 15,
        fontFamily: 'Manrope-Bold',
    },
    followBtnText: {
        color: '#ff9066',
        fontSize: 10,
        fontFamily: 'Manrope-Bold',
        letterSpacing: 0.5,
    },
    creciText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontFamily: 'Manrope-Medium',
        marginTop: 2,
    }
});
