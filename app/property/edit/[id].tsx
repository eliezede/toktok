import { useAuth } from '@/hooks/useAuth';
import { PropertyType, PropertyListing, ListingType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, StatusBar, StyleSheet } from 'react-native';
import { db, storage } from '../../../firebase/config';
import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { PropertyActionService } from '@/services/property/propertyActionService';
import { LinearGradient } from 'expo-linear-gradient';
import { usePropertyManagement } from '@/hooks/usePropertyManagement';
import { CustomModal } from '@/components/ui/CustomModal';
import { FormInput, SelectChip, FilterChip } from '@/components/property/PropertyFormElements';
import { formatCurrency, unformatCurrency } from '@/utils/currency';

const AMENITY_OPTIONS = [
    'Piscina', 'Academia', 'Churrasqueira', 'Salão de Festas', 'Playground', 
    'Sauna', 'Quadra', 'Varanda', 'Portaria 24h', 'Ar Condicionado', 'Elevador'
];


export default function EditPropertyScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 4;
    const {
        modalVisible,
        setModalVisible,
        modalConfig,
        showModal
    } = usePropertyManagement();

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [listingType, setListingType] = useState<ListingType>('sale');
    const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [suites, setSuites] = useState('');
    const [parkingSpaces, setParkingSpaces] = useState('');
    const [squareMeters, setSquareMeters] = useState('');
    const [furnished, setFurnished] = useState(false);
    const [petFriendly, setPetFriendly] = useState(false);
    const [acceptsFinancing, setAcceptsFinancing] = useState(false);
    const [acceptsExchange, setAcceptsExchange] = useState(false);
    const [floor, setFloor] = useState('');
    const [yearBuilt, setYearBuilt] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [amenities, setAmenities] = useState<string[]>([]);
    const [status, setStatus] = useState<PropertyListing['listingStatus']>('active');

    // Media
    const [photos, setPhotos] = useState<string[]>([]);
    const [newPhotos, setNewPhotos] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            fetchProperty();
        }
    }, [id]);

    const fetchProperty = async () => {
        try {
            const docSnap = await getDoc(doc(db, 'properties', id as string));
            if (docSnap.exists()) {
                const data = docSnap.data() as PropertyListing;
                setTitle(data.listingTitle);
                setDescription(data.descriptionLong);
                setPrice(formatCurrency(data.price));
                setListingType(data.listingType);
                setPropertyType(data.propertyType);
                setBedrooms(data.bedrooms.toString());
                setSuites(data.suites?.toString() || '');
                setBathrooms(data.bathrooms.toString());
                setParkingSpaces(data.parkingSpaces?.toString() || '');
                setSquareMeters(data.areaValue.toString());
                setFurnished(data.furnished || false);
                setPetFriendly(data.petFriendly || false);
                setAcceptsFinancing(data.acceptsFinancing || false);
                setAcceptsExchange(data.acceptsExchange || false);
                setFloor(data.floor || '');
                setYearBuilt(data.yearBuilt?.toString() || '');
                setCity(data.city);
                setNeighborhood(data.neighborhood);
                setAddress(data.addressLine1);
                setPostalCode(data.postalCode || '');
                setAmenities(data.amenities || []);
                setPhotos(data.imageUrls || []);
                setStatus(data.listingStatus);
                setPrice(formatCurrency(data.price));
            } else {
                showModal({
                    title: 'Erro',
                    message: 'Imóvel não encontrado.',
                    type: 'error',
                    onConfirm: () => router.back()
                });
            }
        } catch (error) {
            console.error('Error fetching property:', error);
        } finally {
            setLoading(false);
        }
    };

    const pickPhotos = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: 10 - photos.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map(a => a.uri);
            setNewPhotos([...newPhotos, ...uris]);
        }
    };

    const removePhoto = (index: number, isNew: boolean) => {
        if (isNew) {
            const updated = [...newPhotos];
            updated.splice(index, 1);
            setNewPhotos(updated);
        } else {
            const updated = [...photos];
            updated.splice(index, 1);
            setPhotos(updated);
        }
    };

    const uploadMediaAsync = async (uri: string, path: string): Promise<string> => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    const handleSave = async () => {
        if (!title || !price || !city) {
            showModal({
                title: 'Informações Faltando',
                message: 'Por favor, preencha todos os campos obrigatórios para continuar.',
                type: 'warning'
            });
            return;
        }

        setSaving(true);
        try {
            // Upload only NEW photos
            const uploadedNewPhotos = await Promise.all(
                newPhotos.map((uri, idx) => uploadMediaAsync(uri, `properties/${id}/photo_edit_${Date.now()}_${idx}.jpg`))
            );

            const allPhotos = [...photos, ...uploadedNewPhotos];

            const updatedData: Partial<PropertyListing> = {
                listingTitle: title,
                descriptionLong: description,
                descriptionShort: description.slice(0, 100),
                price: parseFloat(unformatCurrency(price)) || 0,
                listingType: listingType,
                propertyType,
                bedrooms: parseInt(bedrooms) || 0,
                suites: parseInt(suites) || 0,
                bathrooms: parseInt(bathrooms) || 0,
                parkingSpaces: parseInt(parkingSpaces) || 0,
                areaValue: parseInt(squareMeters) || 0,
                furnished,
                petFriendly,
                acceptsFinancing,
                acceptsExchange,
                floor,
                yearBuilt: parseInt(yearBuilt) || 0,
                city,
                neighborhood,
                addressLine1: address,
                postalCode,
                amenities,
                imageUrls: allPhotos,
                listingStatus: status
            };

            await PropertyActionService.updateListing(id as string, updatedData);
            showModal({
                title: 'Sucesso!',
                message: 'Parabéns! O seu anúncio foi atualizado com sucesso.',
                type: 'success',
                onConfirm: () => router.back()
            });
        } catch (error: any) {
            showModal({
                title: 'Erro ao Salvar',
                message: error.message || 'Ocorreu um problema ao tentar salvar as alterações.',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0e0e' }}>
                <ActivityIndicator size="large" color="#ff9066" />
            </View>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View>
                        <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 32 }}>Info Básica</Text>
                        <View style={{ marginBottom: 32 }}>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 }}>Status e Oferta</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                <SelectChip selected={status === 'active'} onSelect={() => setStatus('active')} label="Ativo" />
                                <SelectChip selected={status === 'reserved'} onSelect={() => setStatus('reserved')} label="Reservado" />
                                <SelectChip selected={status === 'sold'} onSelect={() => setStatus('sold')} label="Vendido" />
                            </ScrollView>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                <SelectChip selected={listingType === 'sale'} onSelect={() => setListingType('sale')} label="Venda" />
                                <SelectChip selected={listingType === 'rent'} onSelect={() => setListingType('rent')} label="Aluguel" />
                                <SelectChip selected={listingType === 'seasonal'} onSelect={() => setListingType('seasonal')} label="Temporada" />
                            </View>
                        </View>
                        <FormInput label="Título" placeholder="Ex: Apartamento em Copacabana" value={title} onChangeText={setTitle} icon="text-outline" />
                        <FormInput label="Descrição" placeholder="Detalhes do imóvel..." value={description} onChangeText={setDescription} multiline numberOfLines={4} icon="reader-outline" />
                        <FormInput 
                            label="Preço (R$)" 
                            placeholder="0,00" 
                            value={price} 
                            onChangeText={(text) => setPrice(formatCurrency(text))} 
                            keyboardType="numeric" 
                            icon="cash-outline" 
                        />
                        
                        <TouchableOpacity style={{ backgroundColor: '#ff9066', paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 24 }} onPress={() => setStep(2)}>
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>Próximo</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 2:
                return (
                    <View>
                        <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 32 }}>Especificações</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 32 }}>
                            <SelectChip selected={propertyType === 'apartment'} onSelect={() => setPropertyType('apartment')} label="Apto" />
                            <SelectChip selected={propertyType === 'house'} onSelect={() => setPropertyType('house')} label="Casa" />
                            <SelectChip selected={propertyType === 'villa'} onSelect={() => setPropertyType('villa')} label="Cobert" />
                            <SelectChip selected={propertyType === 'land'} onSelect={() => setPropertyType('land')} label="Terr" />
                            <SelectChip selected={propertyType === 'commercial'} onSelect={() => setPropertyType('commercial')} label="Comerc" />
                            <SelectChip selected={propertyType === 'penthouse'} onSelect={() => setPropertyType('penthouse')} label="Penth" />
                            <SelectChip selected={propertyType === 'farm'} onSelect={() => setPropertyType('farm')} label="Faz" />
                            <SelectChip selected={propertyType === 'studio'} onSelect={() => setPropertyType('studio')} label="Studio" />
                        </ScrollView>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View style={{ flex: 1 }}><FormInput label="Quartos" placeholder="2" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" icon="bed-outline" /></View>
                            <View style={{ flex: 1 }}><FormInput label="Suítes" placeholder="0" value={suites} onChangeText={setSuites} keyboardType="numeric" icon="star-outline" /></View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View style={{ flex: 1 }}><FormInput label="Banheiros" placeholder="1" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" icon="water-outline" /></View>
                            <View style={{ flex: 1 }}><FormInput label="Vagas" placeholder="1" value={parkingSpaces} onChangeText={setParkingSpaces} keyboardType="numeric" icon="car-outline" /></View>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                            <View style={{ flex: 1 }}><FormInput label="Andar" placeholder="10" value={floor} onChangeText={setFloor} keyboardType="numeric" icon="layers-outline" /></View>
                            <View style={{ flex: 1 }}><FormInput label="Ano" placeholder="2020" value={yearBuilt} onChangeText={setYearBuilt} keyboardType="numeric" icon="calendar-outline" /></View>
                        </View>
                        <FormInput label="Área (m²)" placeholder="85" value={squareMeters} onChangeText={setSquareMeters} keyboardType="numeric" icon="expand-outline" />
                        
                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 16, marginBottom: 12, marginLeft: 4 }}>Diferenciais e Negociação</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            <SelectChip selected={furnished} onSelect={() => setFurnished(!furnished)} label="Mobiliado" />
                            <SelectChip selected={petFriendly} onSelect={() => setPetFriendly(!petFriendly)} label="Pet Friendly" />
                            <SelectChip selected={acceptsFinancing} onSelect={() => setAcceptsFinancing(!acceptsFinancing)} label="Aceita Financiamento" />
                            <SelectChip selected={acceptsExchange} onSelect={() => setAcceptsExchange(!acceptsExchange)} label="Aceita Permuta" />
                        </View>

                        <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 24, marginBottom: 12, marginLeft: 4 }}>Comodidades / Amenidades</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                            {AMENITY_OPTIONS.map(option => (
                                <FilterChip 
                                    key={option}
                                    label={option}
                                    selected={amenities.includes(option)}
                                    onSelect={() => {
                                        if (amenities.includes(option)) {
                                            setAmenities(amenities.filter(i => i !== option));
                                        } else {
                                            setAmenities([...amenities, option]);
                                        }
                                    }}
                                />
                            ))}
                        </View>

                        
                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 40 }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingVertical: 18, borderRadius: 20, alignItems: 'center' }} onPress={() => setStep(1)}><Text style={{ color: 'white' }}>Voltar</Text></TouchableOpacity>
                            <TouchableOpacity style={{ flex: 2, backgroundColor: '#ff9066', paddingVertical: 18, borderRadius: 20, alignItems: 'center' }} onPress={() => setStep(3)}><Text style={{ color: 'white' }}>Próximo</Text></TouchableOpacity>
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View>
                        <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 32 }}>Localização</Text>
                        <FormInput label="Cidade" placeholder="Cidade" value={city} onChangeText={setCity} icon="business-outline" />
                        <FormInput label="Bairro" placeholder="Bairro" value={neighborhood} onChangeText={setNeighborhood} icon="map-outline" />
                        <FormInput label="Endereço" placeholder="Rua, número..." value={address} onChangeText={setAddress} icon="pin-outline" />
                        <FormInput label="CEP" placeholder="00000-000" value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" icon="mail-outline" />

                        
                        <View style={{ flexDirection: 'row', gap: 16, marginTop: 40 }}>
                            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingVertical: 18, borderRadius: 20, alignItems: 'center' }} onPress={() => setStep(2)}><Text style={{ color: 'white' }}>Voltar</Text></TouchableOpacity>
                            <TouchableOpacity style={{ flex: 2, backgroundColor: '#ff9066', paddingVertical: 18, borderRadius: 20, alignItems: 'center' }} onPress={() => setStep(4)}><Text style={{ color: 'white' }}>Próximo</Text></TouchableOpacity>
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View>
                        <Text style={{ fontSize: 24, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 32 }}>Fotos</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
                            {photos.map((uri, i) => (
                                <View key={`old-${i}`} style={{ width: '31%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden' }}>
                                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                                    <TouchableOpacity style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 }} onPress={() => removePhoto(i, false)}>
                                        <Ionicons name="close-circle" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {newPhotos.map((uri, i) => (
                                <View key={`new-${i}`} style={{ width: '31%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#ff9066' }}>
                                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                                    <TouchableOpacity style={{ position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 }} onPress={() => removePhoto(i, true)}>
                                        <Ionicons name="close-circle" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {(photos.length + newPhotos.length) < 10 && (
                                <TouchableOpacity style={{ width: '31%', aspectRatio: 1, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }} onPress={pickPhotos}>
                                    <Ionicons name="add" size={32} color="rgba(255,255,255,0.2)" />
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        <TouchableOpacity 
                            onPress={handleSave} 
                            disabled={saving}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#ff9066', '#ff7043']}
                                style={{ paddingVertical: 20, borderRadius: 24, alignItems: 'center' }}
                            >
                                {saving ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 }}>Salvar Alterações</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <LinearGradient
                colors={['rgba(255, 144, 102, 0.05)', 'transparent']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle="light-content" />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={{ paddingHorizontal: 24, paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'PlusJakartaSans-ExtraBold', color: 'white', fontSize: 12, letterSpacing: 2 }}>EDITAR IMÓVEL</Text>
                            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', color: '#ff9066', fontSize: 9, letterSpacing: 1, marginTop: 4 }}>PASSO {step} DE {totalSteps}</Text>
                        </View>
                        <View style={{ width: 44 }} />
                    </View>
                    <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 32 }} contentContainerStyle={{ paddingBottom: 100 }}>
                        {renderStep()}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Premium Modals */}
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Additional styles if needed
});
