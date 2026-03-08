import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { PropertyListing } from '../types';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

interface FeedItemProps {
    item: PropertyListing;
    isActive: boolean;
    onFichaPress?: () => void;
}

export default function FeedItem({ item, isActive, onFichaPress }: FeedItemProps) {
    const { profile } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const player = useVideoPlayer(item.videoUrl, player => {
        player.loop = true;
    });

    useEffect(() => {
        if (isActive) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, player]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    };

    return (
        <View style={styles.container}>
            <VideoView
                style={styles.video}
                player={player}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
                contentFit="cover"
                nativeControls={false}
            />

            {/* Bottom Gradient for better text readability */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.bottomGradient}
            />

            {/* Right side interaction buttons */}
            <View style={styles.rightOverlay}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setIsLiked(!isLiked)}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={28} color={isLiked ? "#FF2D55" : "white"} />
                    </View>
                    <Text style={styles.actionText}>{isLiked ? '1.2K' : '1.2K'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="chatbubble" size={26} color="white" />
                    </View>
                    <Text style={styles.actionText}>45</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => setIsSaved(!isSaved)}>
                    <View style={styles.iconCircle}>
                        <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={26} color={isSaved ? "#FFCC00" : "white"} />
                    </View>
                    <Text style={styles.actionText}>{isSaved ? 'Saved' : 'Save'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="paper-plane" size={26} color="white" />
                    </View>
                    <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom left info overlay */}
            <View style={styles.bottomOverlay}>
                <View style={styles.agentInfo}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>A</Text>
                    </View>
                    <View>
                        <View style={styles.agentRow}>
                            <Text style={styles.agentName}>Premium Agent</Text>
                            <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsFollowing(!isFollowing)}
                        >
                            <Text style={styles.followActionText}>{isFollowing ? 'Following' : 'Follow Agency'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
                <Text style={styles.titleText}>{item.title}</Text>

                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={14} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.locationText}>{item.neighborhood}, {item.city}</Text>
                </View>

                {/* Tab-like 'Ficha' trigger in the bottom area */}
                <TouchableOpacity
                    style={styles.fichaButton}
                    onPress={onFichaPress}
                    activeOpacity={0.8}
                >
                    <Text style={styles.fichaButtonText}>Ficha</Text>
                    <Ionicons name="chevron-up" size={18} color="white" />
                </TouchableOpacity>

                <View style={styles.tagsContainer}>
                    <View style={styles.tag}>
                        <Ionicons name="bed" size={12} color="white" />
                        <Text style={styles.tagText}>{item.bedrooms}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Ionicons name="water" size={12} color="white" />
                        <Text style={styles.tagText}>{item.bathrooms}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Ionicons name="expand" size={12} color="white" />
                        <Text style={styles.tagText}>{item.squareMeters} m²</Text>
                    </View>
                    <View style={styles.propertyTag}>
                        <Text style={styles.propertyTagText}>{item.propertyType}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: WINDOW_HEIGHT - 80,
        width: WINDOW_WIDTH,
        backgroundColor: '#000',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 350,
    },
    rightOverlay: {
        position: 'absolute',
        right: 12,
        bottom: 60,
        alignItems: 'center',
        gap: 20,
        zIndex: 10,
    },
    actionButton: {
        alignItems: 'center',
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '900',
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    bottomOverlay: {
        position: 'absolute',
        left: 20,
        bottom: 30,
        right: 80,
        zIndex: 10,
    },
    agentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    avatarInitial: {
        color: 'white',
        fontWeight: 'black',
        fontSize: 18,
    },
    agentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    agentName: {
        color: 'white',
        fontWeight: 'black',
        fontSize: 16,
    },
    followActionText: {
        color: '#8B5CF6',
        fontWeight: 'black',
        fontSize: 12,
        marginTop: 1,
    },
    priceText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 4,
        letterSpacing: -1,
    },
    titleText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
        opacity: 0.95,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginLeft: 4,
        fontWeight: '500',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tagText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '900',
        marginLeft: 6,
    },
    propertyTag: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    propertyTagText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'black',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    fichaButton: {
        backgroundColor: 'rgba(139, 92, 246, 0.9)', // Primary with opacity
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        alignSelf: 'flex-start',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    fichaButtonText: {
        color: 'white',
        fontWeight: '900',
        fontSize: 16,
        marginRight: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
