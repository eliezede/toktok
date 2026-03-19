import { auth } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { StorageService } from '@/services/storageService';
import { UserService } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
// Firebase auth functions
import { signOut as firebaseSignOut } from 'firebase/auth';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StatusBar, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Import Sheets
import EditProfileSheet from '@/components/profile/EditProfileSheet';
import NotificationsSheet from '@/components/profile/NotificationsSheet';
import InsightsSheet from '@/components/profile/InsightsSheet';
import PrivacySheet from '@/components/profile/PrivacySheet';
import HelpSheet from '@/components/profile/HelpSheet';
import GuestProfile from '@/components/profile/GuestProfile';
import { CustomModal } from '@/components/ui/CustomModal';
import { ActionSheet } from '@/components/ui/ActionSheet';

export default function ProfileScreen() {
    const { profile, user, isLoading, isGuest } = useAuth();
    const [myListingsCount, setMyListingsCount] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Custom UI State
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
    
    const [sheetVisible, setSheetVisible] = useState(false);

    const showModal = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
        setModalConfig({ title, message, type });
        setModalVisible(true);
    };

    // Sheet Refs
    const editSheetRef = useRef<BottomSheetModal>(null);
    const notificationsSheetRef = useRef<BottomSheetModal>(null);
    const insightsSheetRef = useRef<BottomSheetModal>(null);
    const privacySheetRef = useRef<BottomSheetModal>(null);
    const helpSheetRef = useRef<BottomSheetModal>(null);

    // Callbacks to open sheets
    const handleOpenEdit = useCallback(() => editSheetRef.current?.present(), []);
    const handleOpenNotifications = useCallback(() => notificationsSheetRef.current?.present(), []);
    const handleOpenInsights = useCallback(() => insightsSheetRef.current?.present(), []);
    const handleOpenPrivacy = useCallback(() => privacySheetRef.current?.present(), []);
    const handleOpenHelp = useCallback(() => helpSheetRef.current?.present(), []);

    useEffect(() => {
        if (user) {
            fetchMyListingsCount();
        }
    }, [user]);

    const fetchMyListingsCount = async () => {
        if (!user) return;
        const listings = await PropertyQueryService.getListingsByAgent(user.uid);
        setMyListingsCount(listings.length);
    };

    const handleLogout = async () => {
        try {
            await firebaseSignOut(auth);
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    const handleProfilePhotoPress = () => {
        setSheetVisible(true);
    };

    const photoActions = [
        {
            label: 'Tirar Foto',
            icon: 'camera-outline',
            onPress: () => {
                setSheetVisible(false);
                handleTakePhoto();
            }
        },
        {
            label: 'Escolher da Galeria',
            icon: 'image-outline',
            onPress: () => {
                setSheetVisible(false);
                handlePickImage();
            }
        }
    ];

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            showModal("Permissão Necessária", "Precisamos de acesso à sua câmera para que você possa tirar uma foto de perfil.", "warning");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        if (!user) return;
        setIsUploading(true);
        try {
            const downloadUrl = await StorageService.uploadProfileImage(user.uid, uri);
            await UserService.updateProfileImage(user.uid, downloadUrl);
            showModal("Sucesso", "Sua foto de perfil foi atualizada com sucesso!", "success");
        } catch (error) {
            console.error("Upload error:", error);
            showModal("Erro", "Não foi possível carregar a imagem selecionada.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0e0e0e', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#ff9066" />
            </View>
        );
    }

    if (isGuest || !user) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
                <StatusBar barStyle="light-content" />
                <GuestProfile />
            </SafeAreaView>
        );
    }

    // Existing fallback for missing profile despite being logged in
    if (!profile) {
        return (
            <View style={{ flex: 1, backgroundColor: '#0e0e0e', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <View style={{ width: 96, height: 96, backgroundColor: 'rgba(255, 144, 102, 0.1)', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Ionicons name="person-circle" size={64} color="#ff9066" />
                </View>
                <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center' }}>Sessão Expirada</Text>
                <TouchableOpacity
                    style={{ marginTop: 40, backgroundColor: '#ff9066', width: '100%', borderRadius: 20, shadowColor: '#ff9066', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 }}
                    onPress={handleLogout}
                >
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', textAlign: 'center', fontSize: 18, textTransform: 'uppercase', letterSpacing: 1.5, paddingVertical: 18 }}>Acessar Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isPro = profile.role === 'agent' || profile.role === 'agency';

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
                <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
                    <TouchableOpacity 
                        onPress={handleProfilePhotoPress}
                        disabled={isUploading}
                        style={{ position: 'relative' }}
                    >
                        <View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: '#ff9066', marginBottom: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
                            {isUploading ? (
                                <ActivityIndicator color="white" />
                            ) : profile.profileImage ? (
                                <Image 
                                    source={{ uri: profile.profileImage }} 
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                />
                            ) : (
                                <Text style={{ fontSize: 48, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>
                                    {profile.fullName.charAt(0).toUpperCase()}
                                </Text>
                            )}
                        </View>
                        {!isUploading && (
                            <View style={{ position: 'absolute', bottom: 20, right: 0, backgroundColor: '#ff9066', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#0e0e0e' }}>
                                <Ionicons name="camera" size={16} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>{profile.fullName}</Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'PlusJakartaSans-Medium', marginTop: 4 }}>{profile.email}</Text>

                    <View style={{ flexDirection: 'row', marginTop: 32, width: '100%', justifyContent: 'space-around' }}>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>{myListingsCount}</Text>
                            <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1 }}>Posts</Text>
                        </View>
                        <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>{profile.followerCount || 0}</Text>
                            <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1 }}>Seguidores</Text>
                        </View>
                        <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>{profile.followingCount || 0}</Text>
                            <Text style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1 }}>Seguindo</Text>
                        </View>
                    </View>
                    <Text style={{ color: '#ff9066', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16 }}>
                        {profile.role === 'buyer' ? 'Perfil Comprador' : (profile.role === 'agent' ? 'Corretor Premium' : 'Imobiliária Parceira')}
                    </Text>
                </View>

                {!isPro && (
                    <View style={{ marginBottom: 40 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Preferências de Compra</Text>
                        
                        <View style={{ gap: 16 }}>
                            {/* Interests */}
                            <BlurView intensity={20} tint="dark" style={{ padding: 24, borderRadius: 32, borderColor: 'rgba(255, 255, 255, 0.1)', borderStyle: 'solid', borderWidth: 1 }}>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Seus Interesses</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {profile.interests && profile.interests.length > 0 ? profile.interests.map((interest, idx) => (
                                        <View key={idx} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255, 144, 102, 0.1)', borderRadius: 12, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 144, 102, 0.2)' }}>
                                            <Text style={{ color: '#ff9066', fontSize: 12, fontFamily: 'PlusJakartaSans-Medium' }}>{interest}</Text>
                                        </View>
                                    )) : (
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: 13, fontFamily: 'PlusJakartaSans-Medium', fontStyle: 'italic' }}>Nenhum interesse definido. Edite seu perfil para adicionar.</Text>
                                    )}
                                </View>
                            </BlurView>

                            {/* Budget */}
                            {profile.budgetRange && (
                                <BlurView intensity={20} tint="dark" style={{ padding: 24, borderRadius: 32, borderColor: 'rgba(255, 255, 255, 0.1)', borderStyle: 'solid', borderWidth: 1 }}>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Sua Faixa de Preço</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 44, height: 44, backgroundColor: 'rgba(255, 144, 102, 0.1)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                            <Ionicons name="wallet-outline" size={22} color="#ff9066" />
                                        </View>
                                        <View>
                                            <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>
                                                {formatPrice(profile.budgetRange.min)} — {formatPrice(profile.budgetRange.max)}
                                            </Text>
                                            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 10, fontFamily: 'PlusJakartaSans-Medium' }}>Orçamento Planejado</Text>
                                        </View>
                                    </View>
                                </BlurView>
                            )}
                        </View>
                    </View>
                )}

                {isPro && (
                    <View style={{ marginBottom: 40 }}>
                        {!profile.isVerified && (
                            <TouchableOpacity 
                                onPress={() => router.push('/profile/verify')}
                                style={{ marginBottom: 32 }}
                            >
                                <LinearGradient
                                    colors={['rgba(255, 144, 102, 0.15)', 'rgba(255, 120, 70, 0.05)']}
                                    style={{ padding: 24, borderRadius: 32, borderColor: 'rgba(255, 144, 102, 0.3)', borderStyle: 'solid', borderWidth: 1 }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255, 144, 102, 0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                            <Ionicons name="shield-checkmark" size={24} color="#ff9066" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: 'white', marginBottom: 4 }}>
                                                Obtenha sua Verificação
                                            </Text>
                                            <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'PlusJakartaSans-Medium' }}>
                                                Destaque-se no mercado e passe mais confiança aos seus clientes.
                                            </Text>
                                        </View>
                                        <Ionicons name="arrow-forward" size={20} color="#ff9066" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Dashboard do Agente</Text>

                        <View style={{ gap: 12 }}>
                        <TouchableOpacity onPress={() => router.push('/profile/userListings')}>
                            <BlurView intensity={20} tint="dark" style={{ padding: 20, borderRadius: 24, borderColor: 'rgba(255, 255, 255, 0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderStyle: 'solid', borderWidth: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 40, height: 40, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <Ionicons name="list" size={20} color="#10B981" />
                                    </View>
                                    <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Meus Anúncios</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.2)" />
                            </BlurView>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleOpenInsights}>
                            <BlurView intensity={20} tint="dark" style={{ padding: 20, borderRadius: 24, borderColor: 'rgba(255, 255, 255, 0.1)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderStyle: 'solid', borderWidth: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: 40, height: 40, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <Ionicons name="stats-chart" size={20} color="#3B82F6" />
                                    </View>
                                    <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Insights de Audiência</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.2)" />
                            </BlurView>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.push('/pro')}>
                            <BlurView intensity={30} tint="dark" style={{ padding: 24, borderRadius: 32, borderColor: 'rgba(255, 144, 102, 0.3)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderStyle: 'solid', borderWidth: 1, backgroundColor: 'rgba(255, 144, 102, 0.05)' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <LinearGradient
                                        colors={['#ff9066', '#ff743b']}
                                        style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}
                                    >
                                        <Ionicons name="flash" size={22} color="white" />
                                    </LinearGradient>
                                    <View>
                                        <Text style={{ fontSize: 18, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Pro Tools</Text>
                                        <Text style={{ color: 'rgba(255, 144, 102, 0.8)', fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>Maximize seu alcance</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#ff9066" />
                            </BlurView>
                        </TouchableOpacity>
                    </View>
                </View>
                )}

                <View style={{ marginBottom: 40 }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Preferências</Text>
                    <BlurView intensity={20} tint="dark" style={{ borderRadius: 32, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', borderStyle: 'solid', borderWidth: 1 }}>
                        {[
                            { icon: 'settings-outline', label: 'Editar Perfil', action: handleOpenEdit },
                            { icon: 'notifications-outline', label: 'Notificações', action: handleOpenNotifications },
                            { icon: 'shield-outline', label: 'Privacidade', action: handleOpenPrivacy },
                            { icon: 'help-circle-outline', label: 'Ajuda', action: handleOpenHelp },
                        ].map((item, idx) => (
                            <TouchableOpacity 
                                key={idx} 
                                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: idx !== 3 ? 1 : 0, borderBottomColor: 'rgba(255, 255, 255, 0.05)' }}
                                onPress={item.action}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name={item.icon as any} size={20} color="rgba(255, 255, 255, 0.6)" />
                                    <Text style={{ marginLeft: 16, fontSize: 16, fontFamily: 'PlusJakartaSans-Medium', color: 'white' }}>{item.label}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="rgba(255, 255, 255, 0.2)" />
                            </TouchableOpacity>
                        ))}
                    </BlurView>
                </View>

                <TouchableOpacity
                    style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', paddingVertical: 20, borderRadius: 20, alignItems: 'center', marginBottom: 60, borderStyle: 'solid', borderWidth: 1, backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                    onPress={handleLogout}
                >
                    <Text style={{ color: '#EF4444', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>Encerrar Sessão</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Bottom Sheets */}
            <EditProfileSheet 
                ref={editSheetRef} 
                user={user} 
                profile={profile} 
                onClose={() => editSheetRef.current?.dismiss()} 
            />
            <NotificationsSheet 
                ref={notificationsSheetRef} 
                user={user} 
                profile={profile} 
                onClose={() => notificationsSheetRef.current?.dismiss()} 
            />
            <InsightsSheet 
                ref={insightsSheetRef} 
                onClose={() => insightsSheetRef.current?.dismiss()} 
            />
            <PrivacySheet 
                ref={privacySheetRef} 
                onClose={() => privacySheetRef.current?.dismiss()} 
            />
            <HelpSheet 
                ref={helpSheetRef} 
                onClose={() => helpSheetRef.current?.dismiss()} 
            />

            {/* Custom UI Elements */}
            <ActionSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                title="Foto de Perfil"
                message="Como você gostaria de escolher sua foto?"
                actions={photoActions as any}
            />
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </SafeAreaView>
    );
}
