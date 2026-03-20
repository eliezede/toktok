import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { NotificationService } from '../services/notificationService';
import { UserService } from '../services/userService';
import { PropertyListing, UserProfile } from '../types';
import { KineticTag } from './kinetic/KineticTag';

const { height: DEVICE_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');
const WINDOW_HEIGHT = Platform.OS === 'web' && DEVICE_HEIGHT > 768 ? Math.min(DEVICE_HEIGHT * 0.95, 900) : DEVICE_HEIGHT;

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
        if (Platform.OS === 'web') {
            player.muted = true; // Required for web autoplay
        }
    });

    // Muted state for web UI
    const [isMuted, setIsMuted] = useState(Platform.OS === 'web');
    useEffect(() => {
        if (player) player.muted = isMuted;
    }, [isMuted, player]);

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

    // Shared values for gestures and UI
    const isScrubbing = useSharedValue(false);
    const isCleanMode = useSharedValue(false);
    const scrubProgress = useSharedValue(0);
    const uiOpacity = useSharedValue(1);
    const videoDuration = useSharedValue(0);

    useEffect(() => {
        if (player) {
            const interval = setInterval(() => {
                if (player.duration > 0 && videoDuration.value === 0) {
                    videoDuration.value = player.duration;
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [player]);

    // Reset state on scroll
    useEffect(() => {
        if (!isActive) {
            setIsExpanded(false);
            if (isCleanMode.value) {
                isCleanMode.value = false;
                uiOpacity.value = withTiming(1);
            }
        }
    }, [isActive]);

    const seekPlayer = (time: number) => {
        player.currentTime = time;
    };

    const setPlayingState = (playing: boolean) => {
        setIsPlaying(playing);
    };

    // Gestures
    const tapGesture = Gesture.Tap()
        .onEnd((e) => {
            // Avoid triggering play/pause if tapping near buttons or info section
            const isSidebar = e.x > WINDOW_WIDTH - 80;
            const isBottomInfo = e.y > WINDOW_HEIGHT - 250;
            if (!isSidebar && !isBottomInfo) {
                runOnJS(togglePlayPause)();
            }
        });

    const panScrub = Gesture.Pan()
        .activeOffsetX([-10, 10]) // Only trigger for horizontal movements
        .onStart((e) => {
            if (isCleanMode.value || videoDuration.value <= 0) return;
            // Scrub area targeted at insets.bottom + 30 (user's manual adjustment)
            const barPos = WINDOW_HEIGHT - (insets.bottom + 30);
            const scrubAreaHeight = 50;
            if (e.y > barPos - 40 && e.y < barPos + 20) {
                isScrubbing.value = true;
            }
        })
        .onUpdate((e) => {
            if (!isScrubbing.value) return;
            const progress = Math.min(Math.max(e.x / WINDOW_WIDTH, 0), 1);
            scrubProgress.value = progress;
            // Only seek if duration is known and use duration from shared value
            if (videoDuration.value > 0) {
                runOnJS(seekPlayer)(progress * videoDuration.value);
            }
        })
        .onEnd(() => {
            isScrubbing.value = false;
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            if (e.scale > 1.2 && !isCleanMode.value) {
                isCleanMode.value = true;
                uiOpacity.value = withTiming(0);
            }
        });

    const composedGestures = Gesture.Simultaneous(pinchGesture, panScrub, tapGesture);

    const animatedUiStyle = useAnimatedStyle(() => ({
        opacity: uiOpacity.value,
        pointerEvents: uiOpacity.value < 0.1 ? 'none' : 'auto',
    }));

    const scrubBarStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isScrubbing.value ? 1 : 0),
        width: `${scrubProgress.value * 100}%`,
    }));

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
            <GestureDetector gesture={composedGestures}>
                <View style={StyleSheet.absoluteFill}>
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

                        {/* Video Scrub Bar */}
                        <View style={[styles.scrubBarContainer, { bottom: insets.bottom + 30 }]}>
                            <Animated.View style={[styles.scrubBar, scrubBarStyle]} />
                        </View>
                    </View>

                    {/* UI Overlays */}
                    <Animated.View style={[StyleSheet.absoluteFill, animatedUiStyle]} pointerEvents="box-none">
                        {/* Scrim Overlay */}
                        <LinearGradient
                            colors={['rgba(0,0,0,0)', isExpanded ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.85)']}
                            pointerEvents="none"
                            style={[styles.bottomGradient, isExpanded && { height: WINDOW_HEIGHT }]}
                        />

                        {/* Right Actions Column */}
                        <View style={[styles.rightOverlay, { bottom: insets.bottom + 80 }]}>
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

                            {Platform.OS === 'web' && (
                                <TouchableOpacity 
                                    style={[styles.actionButton, { marginTop: 15 }]} 
                                    onPress={() => setIsMuted(!isMuted)}
                                >
                                    <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={26} color="#ff9066" />
                                    <Text style={[styles.actionText, { color: '#ff9066' }]}>{isMuted ? 'Mudo' : 'Som'}</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Bottom Left Property Info */}
                        <View style={[styles.bottomOverlay, { bottom: insets.bottom + 40 }]}>
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
                                            <TouchableOpacity 
                                                onPress={() => router.push(`/profile/${agentProfile?.id || item.createdBy}`)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.agentName} numberOfLines={1}>
                                                    {(agentProfile?.role === 'agency' ? agentProfile.agencyName : agentProfile?.fullName) || 'Agente'}
                                                </Text>
                                            </TouchableOpacity>
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
                    </Animated.View>
                </View>
            </GestureDetector>

            {/* Restore UI Button (shown only in clean mode) */}
            <Animated.View
                style={[
                    styles.restoreButton,
                    { bottom: insets.bottom + 55 },
                    useAnimatedStyle(() => ({
                        opacity: withTiming(uiOpacity.value < 0.1 ? 1 : 0),
                        transform: [{ scale: withSpring(uiOpacity.value < 0.1 ? 1 : 0) }]
                    }))
                ]}
            >
                <TouchableOpacity
                    onPress={() => {
                        uiOpacity.value = withTiming(1);
                        isCleanMode.value = false;
                    }}
                    style={styles.restoreIconCircle}
                >
                    <Ionicons name="contract" size={24} color="white" />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: WINDOW_HEIGHT,
        width: WINDOW_WIDTH,
        backgroundColor: '#0e0e0e',
        // @ts-ignore - web only property
        scrollSnapAlign: 'start',
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
    scrubBarContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 4,
        zIndex: 2000,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    scrubBar: {
        height: '100%',
        backgroundColor: '#ff9066',
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
        left: 8,
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
        paddingVertical: 10,
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
    },
    restoreButton: {
        position: 'absolute',
        right: 20,
        zIndex: 1000,
    },
    restoreIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
});
