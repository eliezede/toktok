import { useAuth } from '@/hooks/useAuth';
import { PropertyType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db, storage } from '../../firebase/config';

export default function PostScreen() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [operation, setOperation] = useState<'sale' | 'rent'>('sale');
    const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [squareMeters, setSquareMeters] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [address, setAddress] = useState('');

    // Media
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [photos, setPhotos] = useState<string[]>([]);

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

    const uploadMediaAsync = async (uri: string, path: string): Promise<string> => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
    };

    const handlePost = async () => {
        if (!title || !price || !city || !videoUri || !profile) {
            Alert.alert('Missing Information', 'Please complete all required fields.');
            return;
        }

        setLoading(true);
        try {
            const propertyId = `prop_${Date.now()}`;

            // Upload video
            const videoUrl = await uploadMediaAsync(videoUri, `properties/${propertyId}/video.mp4`);

            // Upload photos if any
            const photoUrls = await Promise.all(
                photos.map((uri, idx) => uploadMediaAsync(uri, `properties/${propertyId}/photo_${idx}.jpg`))
            );

            // Save to Firestore
            await setDoc(doc(db, 'properties', propertyId), {
                id: propertyId,
                title,
                description,
                price: parseFloat(price.replace(/[^0-9.]/g, '')),
                operation,
                propertyType,
                bedrooms: parseInt(bedrooms) || 0,
                bathrooms: parseInt(bathrooms) || 0,
                squareMeters: parseInt(squareMeters) || 0,
                city,
                neighborhood,
                address,
                contactPhone: profile.phone || '',
                contactWhatsApp: profile.whatsapp || profile.phone || '',
                videoUrl,
                imageUrls: photoUrls,
                features: [],
                createdBy: profile.id,
                createdAt: Date.now(),
                status: 'active',
                isPromoted: false,
            });

            Alert.alert('Success', 'Your property is now live on TokTok!');
            router.replace('/(tabs)');

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (profile?.role === 'buyer') {
        return (
            <View className="flex-1 items-center justify-center p-8 bg-white">
                <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="lock-closed" size={48} color="#8B5CF6" />
                </View>
                <Text className="text-2xl font-black text-center text-gray-900 mb-2">Exclusive for Pros</Text>
                <Text className="text-gray-500 text-center text-base leading-6">
                    Only verified Agents and Agencies can list properties on TokTok.
                </Text>
                <TouchableOpacity
                    className="mt-8 bg-primary w-full py-4 rounded-2xl shadow-lg shadow-primary/30"
                    onPress={() => router.push('/(tabs)/profile')}
                >
                    <Text className="text-white font-black text-center text-lg">Become a Pro Agent</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const FormInput = ({ label, placeholder, value, onChangeText, keyboardType = 'default', multiline = false, numberOfLines = 1, icon }: any) => (
        <View className="mb-5">
            <Text className="text-gray-900 font-bold mb-2 ml-1">{label}</Text>
            <View className={`flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 ${multiline ? 'pt-3 pb-3' : 'h-14'}`}>
                {icon && <Ionicons name={icon} size={20} color="#6B7280" style={{ marginRight: 12 }} />}
                <TextInput
                    className="flex-1 text-gray-900 text-base"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            </View>
        </View>
    );

    const SelectChip = ({ selected, onSelect, label }: any) => (
        <TouchableOpacity
            onPress={onSelect}
            className={`px-6 py-3 rounded-full mr-2 border-2 ${selected ? 'bg-primary border-primary' : 'bg-white border-gray-100'}`}
        >
            <Text className={`font-black uppercase text-xs tracking-widest ${selected ? 'text-white' : 'text-gray-500'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <View>
                        <Text className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Step 1: The Video</Text>
                        <Text className="text-gray-500 mb-8 leading-5">Every TokTok listing starts with a video tour. Upload a 9:16 vertical video.</Text>

                        <TouchableOpacity
                            className="w-full aspect-[9/16] bg-gray-50 rounded-3xl items-center justify-center border-2 border-dashed border-gray-200 mb-8 overflow-hidden"
                            onPress={pickVideo}
                        >
                            {videoUri ? (
                                <View className="w-full h-full items-center justify-center bg-gray-900">
                                    <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                                    <Text className="text-white font-black text-xl mt-4">Video Selected</Text>
                                    <View className="mt-6 bg-white/20 px-6 py-2 rounded-full">
                                        <Text className="text-white font-bold uppercase text-[10px] tracking-widest">Tap to change</Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center px-12">
                                    <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-6 shadow-lg shadow-primary/50">
                                        <Ionicons name="videocam" size={36} color="white" />
                                    </View>
                                    <Text className="text-xl font-black text-gray-900 text-center mb-2">Upload Video Tour</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {videoUri && (
                            <TouchableOpacity className="bg-primary py-5 rounded-2xl items-center" onPress={() => setStep(2)}>
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Continue</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                );
            case 2:
                return (
                    <View>
                        <Text className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Step 2: Basic Info</Text>
                        <View className="mb-6">
                            <Text className="text-gray-900 font-bold mb-3 uppercase text-xs tracking-widest">Operation Type</Text>
                            <View className="flex-row">
                                <SelectChip selected={operation === 'sale'} onSelect={() => setOperation('sale')} label="Selling" />
                                <SelectChip selected={operation === 'rent'} onSelect={() => setOperation('rent')} label="Rent" />
                            </View>
                        </View>
                        <FormInput label="Listing Title" placeholder="e.g. Luxury Condo in Brickell" value={title} onChangeText={setTitle} icon="text" />
                        <FormInput label="Description" placeholder="Description of the property" value={description} onChangeText={setDescription} multiline numberOfLines={4} icon="reader" />
                        <FormInput label="Price ($)" placeholder="500,000" value={price} onChangeText={setPrice} keyboardType="numeric" icon="cash" />

                        <View className="flex-row gap-4 mt-8">
                            <TouchableOpacity className="flex-1 bg-gray-100 py-5 rounded-2xl items-center" onPress={() => setStep(1)}>
                                <Text className="text-gray-500 font-black uppercase text-xs tracking-widest">Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-[2] bg-primary py-5 rounded-2xl items-center" onPress={() => setStep(3)}>
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Next Step</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 3:
                return (
                    <View>
                        <Text className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Step 3: Specifications</Text>
                        <Text className="text-gray-900 font-bold mb-3 uppercase text-xs tracking-widest">Property Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
                            <SelectChip selected={propertyType === 'apartment'} onSelect={() => setPropertyType('apartment')} label="Apartment" />
                            <SelectChip selected={propertyType === 'home'} onSelect={() => setPropertyType('home')} label="House" />
                            <SelectChip selected={propertyType === 'villa'} onSelect={() => setPropertyType('villa')} label="Villa" />
                            <SelectChip selected={propertyType === 'land'} onSelect={() => setPropertyType('land')} label="Land" />
                        </ScrollView>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <FormInput label="Bedrooms" placeholder="2" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" icon="bed" />
                            </View>
                            <View className="flex-1">
                                <FormInput label="Bathrooms" placeholder="1" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" icon="water" />
                            </View>
                        </View>
                        <FormInput label="Area (m²)" placeholder="85" value={squareMeters} onChangeText={setSquareMeters} keyboardType="numeric" icon="expand" />

                        <View className="flex-row gap-4 mt-8">
                            <TouchableOpacity className="flex-1 bg-gray-100 py-5 rounded-2xl items-center" onPress={() => setStep(2)}>
                                <Text className="text-gray-500 font-black uppercase text-xs tracking-widest">Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-[2] bg-primary py-5 rounded-2xl items-center" onPress={() => setStep(4)}>
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Location</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 4:
                return (
                    <View>
                        <Text className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Step 4: Location</Text>
                        <FormInput label="City" placeholder="Miami" value={city} onChangeText={setCity} icon="business" />
                        <FormInput label="Neighborhood" placeholder="Brickell" value={neighborhood} onChangeText={setNeighborhood} icon="map" />
                        <FormInput label="Full Address" placeholder="123 Ocean Drive" value={address} onChangeText={setAddress} icon="pin" />

                        <View className="flex-row gap-4 mt-8">
                            <TouchableOpacity className="flex-1 bg-gray-100 py-5 rounded-2xl items-center" onPress={() => setStep(3)}>
                                <Text className="text-gray-500 font-black uppercase text-xs tracking-widest">Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-[2] bg-primary py-5 rounded-2xl items-center" onPress={() => setStep(5)}>
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Almost There</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 5:
                return (
                    <View>
                        <Text className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase">Step 5: Preview & Photos</Text>
                        <Text className="text-gray-500 mb-8 leading-5">Add up to 10 photos and your floor plan to complete the listing.</Text>

                        <View className="flex-row flex-wrap gap-2 mb-8">
                            {photos.map((uri, i) => (
                                <View key={i} className="w-[31%] aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                                    <Image source={{ uri }} className="w-full h-full" />
                                </View>
                            ))}
                            {photos.length < 10 && (
                                <TouchableOpacity
                                    className="w-[31%] aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center"
                                    onPress={pickPhotos}
                                >
                                    <Ionicons name="add" size={32} color="#D1D5DB" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            className={`w-full py-5 rounded-2xl items-center mb-6 shadow-xl ${loading ? 'bg-gray-400' : 'bg-green-500 shadow-green-500/30'}`}
                            onPress={handlePost}
                            disabled={loading}
                        >
                            {loading ? (
                                <Text className="text-white font-black text-lg">UPLOADING...</Text>
                            ) : (
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Publish Listing</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity className="w-full py-4 items-center" onPress={() => setStep(4)} disabled={loading}>
                            <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest">Go Back</Text>
                        </TouchableOpacity>
                    </View>
                );
        }
    };

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-row items-center px-6 pt-10 pb-4">
                    <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex-row">
                        <View
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                            className="h-full bg-primary"
                        />
                    </View>
                    <Text className="ml-4 font-black text-gray-900 uppercase text-xs tracking-widest">{step}/{totalSteps}</Text>
                </View>

                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {renderStep()}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
