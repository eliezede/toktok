import { useAuth } from '@/hooks/useAuth';
import { PropertyType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar, ActivityIndicator } from 'react-native';
import ImportReviewScreen from '../../components/ImportReviewScreen';
import { db, storage, auth } from '../../firebase/config';
import { ListingImportService } from '../../services/listingImport/listingImportService';
import { SocialAuthService, SocialPlatform } from '../../services/listingImport/socialAuthService';
import SocialLoginModal from '../../components/post/SocialLoginModal';
import { ListingDraft, PropertyListing } from '../../types';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { CustomModal } from '@/components/ui/CustomModal';
import { FormInput, SelectChip } from '@/components/property/PropertyFormElements';
import { PostStepImport } from '@/components/post/PostStepImport';
import { PostStepVideo } from '@/components/post/PostStepVideo';
import { PostStepBasicInfo } from '@/components/post/PostStepBasicInfo';
import { PostStepSpecs } from '@/components/post/PostStepSpecs';
import { PostStepLocation } from '@/components/post/PostStepLocation';
import { PostStepPhotos } from '@/components/post/PostStepPhotos';
import { PropertyActionService } from '@/services/property/propertyActionService';


export default function PostScreen() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const totalSteps = 5;
    const {
        modalVisible,
        setModalVisible,
        modalConfig,
        showModal
    } = usePropertyManagement();

    // Import State
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [draft, setDraft] = useState<ListingDraft | null>(null);
    const [showReview, setShowReview] = useState(false);

    // Social Auth State
    const [socialModalVisible, setSocialModalVisible] = useState(false);
    const [socialPlatform, setSocialPlatform] = useState<SocialPlatform>('instagram');
    const [hasInstagramSession, setHasInstagramSession] = useState(false);

    useEffect(() => {
        const checkSessions = async () => {
            const hasInsta = await SocialAuthService.hasSession('instagram');
            setHasInstagramSession(hasInsta);
        };
        checkSessions();
    }, []);

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [operation, setOperation] = useState<'sale' | 'rent' | 'seasonal'>('sale');
    const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
    const [bedrooms, setBedrooms] = useState('');
    const [suites, setSuites] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [parkingSpaces, setParkingSpaces] = useState('');
    const [squareMeters, setSquareMeters] = useState('');
    const [condoFee, setCondoFee] = useState('');
    const [iptu, setIptu] = useState('');
    const [floor, setFloor] = useState('');
    const [yearBuilt, setYearBuilt] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [amenities, setAmenities] = useState<string[]>([]);

    // Media
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [photos, setPhotos] = useState<string[]>([]);
    
    // Extra Flags
    const [furnished, setFurnished] = useState(false);
    const [petFriendly, setPetFriendly] = useState(false);
    const [acceptsFinancing, setAcceptsFinancing] = useState(false);
    const [acceptsExchange, setAcceptsExchange] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPrice('');
        setOperation('sale');
        setPropertyType('apartment');
        setBedrooms('');
        setSuites('');
        setBathrooms('');
        setSquareMeters('');
        setCondoFee('');
        setIptu('');
        setCity('');
        setNeighborhood('');
        setAddress('');
        setPostalCode('');
        setAmenities([]);
        setVideoUri(null);
        setPhotos([]);
        setFurnished(false);
        setPetFriendly(false);
        setAcceptsFinancing(false);
        setAcceptsExchange(false);
        setFloor('');
        setYearBuilt('');
        setParkingSpaces('');
    };

    const isValidUrl = (url: string) => {
        try {
            return url.length > 5 && url.includes('.');
        } catch (_) {
            return false;
        }
    };

    const handleImport = async (manualHtml?: string) => {
        if (!isValidUrl(importUrl)) return;
        setLoading(true);
        setIsImporting(true);
        if (!manualHtml) resetForm(); // Only reset if it's a fresh import, not a retry with HTML
        
        try {
            const response = await ListingImportService.importFromUrl(importUrl, manualHtml);
            if (response.success) {
                const newDraft = ListingImportService.buildDraftFromResponse(response);
                ListingImportService.normalizeDraftInPlace(newDraft);
                
                // Check if specialized login is needed
                const needsLogin = response.data?.metadata.importWarnings.some(w => w.includes('bloqueou') || w.includes('login'));
                const isSocial = response.data?.metadata.sourcePlatform !== 'generic';
                
                if (needsLogin && isSocial && !hasInstagramSession) {
                    console.log("[PostScreen] Link requires login, showing SocialLoginModal transition.");
                    setSocialPlatform(response.data?.metadata.sourcePlatform as SocialPlatform);
                    showModal({
                        title: 'Login Necessário',
                        message: 'Este link parece ser privado ou está bloqueado. Deseja fazer login no Instagram para tentar importar?',
                        type: 'info',
                        onConfirm: () => {
                            setModalVisible(false);
                            // Add a small delay to avoid modal conflict on some devices
                            setTimeout(() => {
                                setSocialModalVisible(true);
                            }, 400);
                        }
                    });
                    return;
                }

                setDraft(newDraft);
                setShowReview(true);
            } else {
                showModal({
                    title: 'Falha na Importação',
                    message: response.error?.message || 'Não foi possível importar o anúncio do link fornecido.',
                    type: 'error'
                });
            }
        } catch (error: any) {
            showModal({
                title: 'Erro no Processo',
                message: error.message || 'Ocorreu um erro inesperado durante a importação.',
                type: 'error'
            });
        } finally {
            setLoading(false);
            setIsImporting(false);
        }
    };

    const handleReviewComplete = (updatedFields: Partial<PropertyListing>) => {
        // Prefill states from reviewed fields
        if (updatedFields.listingTitle) setTitle(updatedFields.listingTitle);
        if (updatedFields.descriptionLong) setDescription(updatedFields.descriptionLong);
        if (updatedFields.price !== undefined) setPrice(updatedFields.price.toString());
        if (updatedFields.listingType) setOperation(updatedFields.listingType as 'sale' | 'rent');
        if (updatedFields.propertyType) setPropertyType(updatedFields.propertyType);
        if (updatedFields.bedrooms !== undefined) setBedrooms(updatedFields.bedrooms.toString());
        if (updatedFields.suites !== undefined) setSuites(updatedFields.suites.toString());
        if (updatedFields.bathrooms !== undefined) setBathrooms(updatedFields.bathrooms.toString());
        if (updatedFields.areaValue !== undefined) setSquareMeters(updatedFields.areaValue.toString());
        if (updatedFields.condoFee !== undefined) setCondoFee(updatedFields.condoFee.toString());
        if (updatedFields.iptu !== undefined) setIptu(updatedFields.iptu.toString());
        if (updatedFields.city) setCity(updatedFields.city);
        if (updatedFields.neighborhood) setNeighborhood(updatedFields.neighborhood);
        if (updatedFields.addressLine1) setAddress(updatedFields.addressLine1);

        // Photos if imported
        if (updatedFields.imageUrls && updatedFields.imageUrls.length > 0) {
            setPhotos(updatedFields.imageUrls);
        }

        // Video if imported
        if (updatedFields.videoUrl) {
            setVideoUri(updatedFields.videoUrl);
        }

        setShowReview(false);
        // If we have a video, skip the video pick step (1) and go to step 2
        setStep(updatedFields.videoUrl ? 2 : 1);
    };

    const pickVideo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: true,
            aspect: [9, 16],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setVideoUri(result.assets[0].uri);
            if (step === 1) setStep(2);
        }
    };

    const pickPhotos = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map(a => a.uri);
            setPhotos([...photos, ...uris].slice(0, 10));
        }
    };


    const handlePost = async () => {
        const userId = auth.currentUser?.uid;
        if (!title || !price || !city || !videoUri || !userId) {
            showModal({
                title: 'Info Faltando',
                message: 'Por favor, complete todos os campos e adicione o vídeo para publicar.',
                type: 'warning'
            });
            return;
        }

        setLoading(true);
        try {
            const propertyData: any = {
                listingTitle: title,
                descriptionLong: description,
                descriptionShort: description.slice(0, 100),
                price: parseFloat(price.replace(/[^0-9.]/g, '')),
                currency: 'BRL',
                listingType: operation,
                propertyType,
                bedrooms: parseInt(bedrooms) || 0,
                suites: parseInt(suites) || 0,
                bathrooms: parseInt(bathrooms) || 0,
                parkingSpaces: parseInt(parkingSpaces) || 0,
                areaValue: parseInt(squareMeters) || 0,
                areaUnit: 'sqm',
                condoFee: parseFloat(condoFee.replace(/[^0-9.]/g, '')) || 0,
                iptu: parseFloat(iptu.replace(/[^0-9.]/g, '')) || 0,
                floor,
                yearBuilt: parseInt(yearBuilt) || 0,
                city,
                neighborhood,
                addressLine1: address,
                postalCode,
                country: 'Brasil',
                contactPhone: profile?.phone || '',
                contactWhatsApp: profile?.whatsapp || profile?.phone || '',
                features: [],
                amenities,
                furnished,
                petFriendly,
                acceptsFinancing,
                acceptsExchange,
                isPromoted: false,
            };

            await PropertyActionService.createListing(userId, propertyData, videoUri, photos);

            showModal({
                title: 'Publicado!',
                message: 'O seu imóvel já está ativo e visível para todos no TokTok!',
                type: 'success',
                onConfirm: () => {
                    setModalVisible(false);
                    router.replace('/(tabs)');
                }
            });

        } catch (error: any) {
            console.error("[PostScreen] Error during post:", error);
            showModal({
                title: 'Erro ao Publicar',
                message: error.message || 'Não foi possível completar a publicação do imóvel.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (profile?.role === 'buyer') {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#0e0e0e' }}>
                <View style={{ width: 96, height: 96, backgroundColor: 'rgba(255, 144, 102, 0.1)', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Ionicons name="lock-closed" size={48} color="#ff9066" />
                </View>
                <Text style={{ fontSize: 28, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center' }}>Exclusivo para Pros</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', marginTop: 16, fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, lineHeight: 24 }}>
                    Apenas Agentes e Imobiliárias verificadas podem anunciar imóveis no TokTok.
                </Text>
                <TouchableOpacity
                    style={{ marginTop: 40, backgroundColor: '#ff9066', width: '100%', borderRadius: 20, shadowColor: '#ff9066', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 }}
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', textAlign: 'center', fontSize: 18, textTransform: 'uppercase', letterSpacing: 1.5, paddingVertical: 18 }}>Tornar-se Pro</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <PostStepImport
                        importUrl={importUrl}
                        setImportUrl={setImportUrl}
                        onImport={handleImport}
                        onManualEntry={() => setStep(1)}
                        onSocialLogin={(platform) => {
                            setSocialPlatform(platform);
                            setSocialModalVisible(true);
                        }}
                        hasSocialSession={hasInstagramSession}
                        isImporting={isImporting}
                        isValidUrl={isValidUrl}
                    />
                );
            case 1:
                return (
                    <PostStepVideo
                        videoUri={videoUri}
                        onPickVideo={pickVideo}
                        onContinue={() => setStep(2)}
                    />
                );
            case 2:
                return (
                    <PostStepBasicInfo
                        operation={operation}
                        setOperation={setOperation}
                        title={title}
                        setTitle={setTitle}
                        description={description}
                        setDescription={setDescription}
                        price={price}
                        setPrice={setPrice}
                        condoFee={condoFee}
                        setCondoFee={setCondoFee}
                        iptu={iptu}
                        setIptu={setIptu}
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                    />
                );
            case 3:
                return (
                    <PostStepSpecs
                        propertyType={propertyType}
                        setPropertyType={setPropertyType}
                        bedrooms={bedrooms}
                        setBedrooms={setBedrooms}
                        suites={suites}
                        setSuites={setSuites}
                        bathrooms={bathrooms}
                        setBathrooms={setBathrooms}
                        squareMeters={squareMeters}
                        setSquareMeters={setSquareMeters}
                        furnished={furnished}
                        setFurnished={setFurnished}
                        petFriendly={petFriendly}
                        setPetFriendly={setPetFriendly}
                        parkingSpaces={parkingSpaces}
                        setParkingSpaces={setParkingSpaces}
                        acceptsFinancing={acceptsFinancing}
                        setAcceptsFinancing={setAcceptsFinancing}
                        acceptsExchange={acceptsExchange}
                        setAcceptsExchange={setAcceptsExchange}
                        floor={floor}
                        setFloor={setFloor}
                        yearBuilt={yearBuilt}
                        setYearBuilt={setYearBuilt}
                        amenities={amenities}
                        setAmenities={setAmenities}
                        onBack={() => setStep(2)}
                        onNext={() => setStep(4)}
                    />
                );
            case 4:
                return (
                    <PostStepLocation
                        city={city}
                        setCity={setCity}
                        neighborhood={neighborhood}
                        setNeighborhood={setNeighborhood}
                        address={address}
                        setAddress={setAddress}
                        postalCode={postalCode}
                        setPostalCode={setPostalCode}
                        onBack={() => setStep(3)}
                        onNext={() => setStep(5)}
                    />
                );
            case 5:
                return (
                    <PostStepPhotos
                        photos={photos}
                        onPickPhotos={pickPhotos}
                        onPost={handlePost}
                        onBack={() => setStep(4)}
                        loading={loading}
                    />
                );
            default:
                return null;
        }
    };

    if (showReview && draft) {
        return (
            <ImportReviewScreen
                draft={draft}
                onContinue={handleReviewComplete}
                onCancel={() => setShowReview(false)}
                onReImport={() => {
                    setShowReview(false);
                    setImportUrl('');
                }}
            />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <TouchableOpacity onPress={step > 0 ? () => setStep(step - 1) : () => router.back()}>
                            <Ionicons name={step > 0 ? "arrow-back" : "close"} size={24} color="white" />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', color: '#ff9066', textTransform: 'uppercase', fontSize: 9, letterSpacing: 2 }}>
                                {step === 0 ? "Novo Anúncio" : "Criar Anúncio"}
                            </Text>
                            {step > 0 && (
                                <Text style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: 1 }}>Passo {step} de {totalSteps}</Text>
                            )}
                        </View>
                        <View style={{ width: 24 }} />
                    </View>

                    {step > 0 && (
                        <View style={{ height: 3, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2, overflow: 'hidden' }}>
                            <View
                                style={{ width: `${(step / totalSteps) * 100}%`, height: '100%', backgroundColor: '#ff9066' }}
                            />
                        </View>
                    )}
                </View>

                <ScrollView
                    style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                >
                    {renderStep()}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Premium Modals */}
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
            <SocialLoginModal
                visible={socialModalVisible}
                platform={socialPlatform}
                targetUrl={importUrl}
                onClose={() => setSocialModalVisible(false)}
                onSuccess={(manualHtml) => {
                    console.log("[PostScreen] Social login successful, retrying import with extracted HTML.");
                    setSocialModalVisible(false);
                    setHasInstagramSession(true);
                    // Delay retry to let modal close completely
                    setTimeout(() => {
                        handleImport(manualHtml);
                    }, 600);
                }}
            />
        </SafeAreaView>
    );
}
