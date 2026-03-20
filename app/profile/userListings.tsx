import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { PropertyListing } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { CustomModal } from '@/components/ui/CustomModal';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

export default function UserListingsScreen() {
    const { user } = useAuth();
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        sheetVisible,
        setSheetVisible,
        modalVisible,
        setModalVisible,
        modalConfig,
        selectedProperty,
        openManagement,
        getManagementActions
    } = usePropertyManagement(() => fetchListings());

    useEffect(() => {
        if (user) {
            fetchListings();
        }
    }, [user]);

    const fetchListings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await PropertyQueryService.getListingsByAgent(user.uid);
            setListings(data);
        } catch (error) {
            console.error("Error fetching user listings:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0
        }).format(price);
    };

    const renderItem = ({ item }: { item: PropertyListing }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => router.push(`/property/${item.id}`)}
        >
            <View style={styles.imageContainer}>
                {item.imageUrls && item.imageUrls.length > 0 ? (
                    <Image source={{ uri: item.imageUrls[0] }} style={styles.image} contentFit="cover" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="home" size={24} color="rgba(255,255,255,0.1)" />
                    </View>
                )}
                <View style={styles.statusBadgeOverlay}>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: item.listingStatus === 'sold' ? '#FF2D55' : item.listingStatus === 'reserved' ? '#FFCC00' : '#34C759' }
                    ]}>
                        <Text style={styles.statusBadgeText}>{item.listingStatus?.toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardInfo}>
                <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
                <Text style={styles.titleText} numberOfLines={1}>{item.listingTitle}</Text>
                <View style={styles.locationContainer}>
                    <Ionicons name="location" size={10} color="#ff9066" />
                    <Text style={styles.locationText}>{item.neighborhood}, {item.city}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.dateInfo}>
                        <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.menuButton} 
                onPress={() => openManagement(item)}
            >
                <Ionicons name="ellipsis-vertical" size={20} color="white" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff9066" />
                <Text style={styles.loadingText}>A CARREGAR SEUS ANÚNCIOS...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0e0e0e' }]} />
            <LinearGradient
                colors={['rgba(255, 144, 102, 0.05)', 'transparent']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
            />
            
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerAction}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>MEUS ANÚNCIOS</Text>
                        <Text style={styles.headerSubtitle}>{listings.length} PROPRIEDADES ATIVAS</Text>
                    </View>
                    
                    <TouchableOpacity onPress={fetchListings} style={styles.headerAction}>
                        <Ionicons name="refresh" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBox}>
                                <Ionicons name="home-outline" size={48} color="rgba(255,255,255,0.1)" />
                            </View>
                            <Text style={styles.emptyTitle}>SEM ANÚNCIOS AINDA</Text>
                            <Text style={styles.emptySubtitle}>Comece a vender suas propriedades hoje mesmo.</Text>
                            <TouchableOpacity
                                style={styles.createButton}
                                onPress={() => router.push('/(tabs)/post')}
                            >
                                <LinearGradient
                                    colors={['#ff9066', '#ff7043']}
                                    style={styles.createButtonGradient}
                                >
                                    <Text style={styles.createButtonText}>CRIAR MEU PRIMEIRO POST</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </SafeAreaView>

            {/* Management UI */}
            <ActionSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                title="Gerenciar Imóvel"
                message="Escolha uma ação para esta publicação"
                actions={selectedProperty ? getManagementActions(selectedProperty) : []}
            />
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0e0e0e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        letterSpacing: 2,
        fontSize: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
    },
    headerAction: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 14,
        letterSpacing: 2,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 9,
        marginTop: 4,
        letterSpacing: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 28,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        height: 120,
    },
    imageContainer: {
        width: 100,
        height: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.02)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadgeOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusBadgeText: {
        color: 'white',
        fontSize: 8,
        fontFamily: 'PlusJakartaSans-ExtraBold',
    },
    cardInfo: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    priceText: {
        color: '#ff9066',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 18,
        letterSpacing: -0.5,
    },
    titleText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
        marginTop: 2,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    locationText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 11,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    dateInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 9,
    },
    menuButton: {
        padding: 16,
        justifyContent: 'center',
    },
    emptyContainer: {
        paddingTop: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconBox: {
        width: 80,
        height: 80,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.02)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 18,
        letterSpacing: 1,
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    createButton: {
        marginTop: 32,
        width: '100%',
        maxWidth: 260,
    },
    createButtonGradient: {
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        letterSpacing: 1,
        fontSize: 12,
    }
});
