import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase/config';
import { PropertyListing } from '../../types';
import { MOCK_PROPERTIES } from '../../utils/mockData';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

export default function PropertyDetailScreen() {
    const { id } = useLocalSearchParams();
    const [property, setProperty] = useState<PropertyListing | null>(null);
    const [loading, setLoading] = useState(true);

    const player = useVideoPlayer(property?.videoUrl || null, player => {
        player.loop = true;
        player.play();
    });

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                // First check mock data for immediate response if navigating from feed
                const mockMatch = MOCK_PROPERTIES.find(p => p.id === id);
                if (mockMatch) {
                    setProperty(mockMatch);
                    setLoading(false);
                    return;
                }

                const docRef = doc(db, 'properties', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProperty(docSnap.data() as PropertyListing);
                }
            } catch (error) {
                console.error("Error fetching property:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProperty();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    if (!property) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-xl">Property not found</Text>
            </View>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View style={{ width: WINDOW_WIDTH, height: WINDOW_WIDTH * 1.5, backgroundColor: 'black' }}>
                {property.videoUrl ? (
                    <VideoView
                        style={{ flex: 1 }}
                        player={player}
                        allowsFullscreen={false}
                        allowsPictureInPicture={false}
                        contentFit="cover"
                        nativeControls={false}
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-white">No video available</Text>
                    </View>
                )}

                <TouchableOpacity
                    className="absolute top-12 left-4 bg-black/50 p-2 rounded-full"
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="px-6 py-4">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-3xl font-black text-primary">{formatPrice(property.price)}</Text>
                    <View className="bg-primary/10 px-4 py-1.5 rounded-full">
                        <Text className="text-primary font-black uppercase text-[10px] tracking-widest">
                            For {property.operation}
                        </Text>
                    </View>
                </View>

                <Text className="text-2xl font-black text-gray-900 mb-1">{property.title}</Text>

                <View className="flex-row items-center mb-6">
                    <Ionicons name="location" size={16} color="#6B7280" />
                    <Text className="text-gray-500 ml-1 font-medium">{property.neighborhood}, {property.city}</Text>
                </View>

                {/* Specs Grid */}
                <View className="flex-row flex-wrap justify-between border-y border-gray-100 py-8 mb-8">
                    <View className="w-1/4 items-center">
                        <Ionicons name="bed-outline" size={24} color="#8B5CF6" />
                        <Text className="font-black text-lg mt-1">{property.bedrooms}</Text>
                        <Text className="text-gray-400 text-[10px] uppercase font-black">Beds</Text>
                    </View>
                    <View className="w-1/4 items-center">
                        <Ionicons name="water-outline" size={24} color="#8B5CF6" />
                        <Text className="font-black text-lg mt-1">{property.bathrooms}</Text>
                        <Text className="text-gray-400 text-[10px] uppercase font-black">Baths</Text>
                    </View>
                    <View className="w-1/4 items-center">
                        <Ionicons name="expand-outline" size={24} color="#8B5CF6" />
                        <Text className="font-black text-lg mt-1">{property.squareMeters}</Text>
                        <Text className="text-gray-400 text-[10px] uppercase font-black">m²</Text>
                    </View>
                    <View className="w-1/4 items-center">
                        <Ionicons name="car-outline" size={24} color="#8B5CF6" />
                        <Text className="font-black text-lg mt-1">2</Text>
                        <Text className="text-gray-400 text-[10px] uppercase font-black">Parking</Text>
                    </View>
                </View>

                {/* Characteristics Checklist */}
                <Text className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Features</Text>
                <View className="flex-row flex-wrap gap-3 mb-10">
                    {property.features.map((feature, idx) => (
                        <View key={idx} className="flex-row items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                            <Text className="ml-2 text-gray-700 font-bold">{feature}</Text>
                        </View>
                    ))}
                    {property.features.length === 0 && (
                        <Text className="text-gray-400 italic">No specific features listed.</Text>
                    )}
                </View>

                <Text className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Description</Text>
                <Text className="text-gray-600 leading-7 text-base mb-10">{property.description}</Text>

                {/* Photos Gallery Section */}
                {property.imageUrls.length > 0 && (
                    <View className="mb-10">
                        <Text className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Photos Gallery</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                            {property.imageUrls.map((url, index) => (
                                <View key={index} className="mr-4 w-72 h-48 rounded-3xl overflow-hidden shadow-sm">
                                    <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Agent Card */}
                <View className="bg-gray-900 p-8 rounded-[40px] mb-10 shadow-2xl">
                    <View className="flex-row items-center mb-8">
                        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center border-2 border-white/20">
                            <Text className="text-2xl font-black text-white">A</Text>
                        </View>
                        <View className="ml-4">
                            <Text className="text-white font-black text-xl">Premium Agent</Text>
                            <Text className="text-primary font-bold uppercase text-[10px] tracking-widest">Certified Partner</Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity className="flex-1 bg-white py-4 rounded-2xl items-center">
                            <Text className="text-gray-900 font-black uppercase text-xs">Call Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-green-500 py-4 rounded-2xl items-center flex-row justify-center"
                            onPress={() => { }}
                        >
                            <Ionicons name="logo-whatsapp" size={18} color="white" />
                            <Text className="text-white font-black uppercase text-xs ml-2">WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sticky spacing */}
                <View className="h-20" />
            </View>
        </ScrollView>
    );
}
