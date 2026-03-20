import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, FlatList, SafeAreaView, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PropertyQueryService } from '../../services/property/propertyQueryService';
import { UserService } from '../../services/userService';
import { PropertyListing, UserProfile } from '../../types';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function InboxScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [agents, setAgents] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [propertyList, agentList] = await Promise.all([
                    PropertyQueryService.getListings(6),
                    UserService.getFeaturedAgents(5)
                ]);
                setListings(propertyList);
                setAgents(agentList);
            } catch (error) {
                console.error("Error loading inbox data:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const categories = [
        {
            id: 'conversas',
            title: 'Conversas com Anunciantes',
            subtext: 'Fale com corretores sobre os imóveis que você gostou.',
            icon: 'chatbubbles-outline',
            color: '#8B5CF6'
        },
        {
            id: 'alertas',
            title: 'Alertas de Novos Imóveis',
            subtext: 'Veja as novas oportunidades que combinam com suas buscas.',
            icon: 'notifications-outline',
            color: '#10B981'
        },
        {
            id: 'suporte',
            title: 'Suporte e Avisos TokTok',
            subtext: 'Atualizações da sua conta e avisos de segurança.',
            icon: 'shield-checkmark-outline',
            color: '#3B82F6'
        }
    ];

    const renderListingItem = ({ item }: { item: PropertyListing }) => (
        <TouchableOpacity
            style={styles.suggestionCard}
            onPress={() => router.push(`/property/${item.id}`)}
        >
            <Image
                source={{ uri: item.thumbnailUrl || (item.imageUrls && item.imageUrls[0]) || item.videoUrl }}
                style={styles.suggestionImage}
                contentFit="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.suggestionGradient}
            />
            <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.4)" />
            </View>
            <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionPrice} numberOfLines={1}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.price || 0)}
                </Text>
                <Text style={styles.suggestionTitle} numberOfLines={1}>{item.city}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderAgentItem = ({ item }: { item: UserProfile }) => (
        <TouchableOpacity 
            style={styles.agentCard}
            onPress={() => router.push(`/profile/${item.id}`)}
        >
            <View style={styles.avatarWrapper}>
                {item.profileImage ? (
                    <Image source={{ uri: item.profileImage }} style={styles.agentAvatar} contentFit="cover" />
                ) : (
                    <View style={[styles.agentAvatar, { backgroundColor: '#ff9066', justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{item.fullName.charAt(0)}</Text>
                    </View>
                )}
                {item.isVerified && (
                    <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                )}
            </View>
            <Text style={styles.agentName} numberOfLines={1}>{item.fullName}</Text>
            <Text style={styles.agentCreci} numberOfLines={1}>{item.creciNumber || 'Corretor'}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            <View className="flex-1 px-6 pt-6">
                <View className="mb-6 flex-row justify-between items-start">
                    <View>
                        <Text className="text-4xl font-bold text-white tracking-tighter">Inbox</Text>
                        <Text className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-1">Mensagens e Notificações</Text>
                    </View>
                    <TouchableOpacity 
                        className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
                    >
                        <Ionicons name="settings-outline" size={24} color="#ff9066" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
                    {/* 1. Central de Comunicação */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Central de Comunicação</Text>
                        {categories.map((cat) => (
                            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                                <View style={[styles.iconContainer, { backgroundColor: cat.color + '20' }]}>
                                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                                </View>
                                <View style={styles.categoryText}>
                                    <Text style={styles.categoryTitle}>{cat.title}</Text>
                                    <Text style={styles.categorySubtext}>{cat.subtext}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 2. Sugestões de Imóveis */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitleInline}>Sugestões de Imóveis</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAll}>Ver mais</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            horizontal
                            data={listings}
                            renderItem={renderListingItem}
                            keyExtractor={item => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 10 }}
                        />
                    </View>

                    {/* 3. Imobiliárias e Corretores em Destaque */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitleInline}>Imobiliárias e Corretores em Destaque</Text>
                        </View>
                        <FlatList
                            horizontal
                            data={agents}
                            renderItem={renderAgentItem}
                            keyExtractor={item => item.id}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 24, paddingRight: 10 }}
                        />
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Bold',
        color: 'white',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitleInline: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Bold',
        color: 'white',
    },
    seeAll: {
        color: '#ff9066',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        flex: 1,
        marginLeft: 16,
    },
    categoryTitle: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-SemiBold',
        color: 'white',
    },
    categorySubtext: {
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Regular',
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    suggestionCard: {
        width: 150,
        height: 240,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    suggestionImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    suggestionGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    suggestionInfo: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    suggestionPrice: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    suggestionTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Regular',
    },
    agentCard: {
        width: 110,
        alignItems: 'center',
        marginRight: 16,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 8,
    },
    agentAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(255, 144, 102, 0.3)',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#3B82F6',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    agentName: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-SemiBold',
        textAlign: 'center',
    },
    agentCreci: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontFamily: 'PlusJakartaSans-Regular',
        textAlign: 'center',
        marginTop: 2,
    },
});
