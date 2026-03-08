import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { MOCK_PROPERTIES } from '../../utils/mockData';

const { width } = Dimensions.get('window');

export default function FavoritesScreen() {
    const { user } = useAuth();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    };

    if (!user) {
        return (
            <View className="flex-1 items-center justify-center p-8 bg-white">
                <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="heart" size={48} color="#8B5CF6" />
                </View>
                <Text className="text-3xl font-black text-gray-900 mb-2">My Sanctuary</Text>
                <Text className="text-gray-500 text-center text-base leading-6">
                    Keep track of the properties you love. Log in to synchronize your favorites across all devices.
                </Text>
                <TouchableOpacity
                    className="mt-10 bg-primary w-full py-5 rounded-2xl shadow-xl shadow-primary/30"
                    onPress={() => router.push('/auth/login')}
                >
                    <Text className="text-white font-black text-center text-lg uppercase tracking-widest">Login to Sync</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Temporary mock data for saved properties
    const savedProperties = MOCK_PROPERTIES.slice(0, 2);

    return (
        <View className="flex-1 bg-white pt-20">
            <View className="px-6 mb-8 flex-row justify-between items-end">
                <View>
                    <Text className="text-4xl font-black text-gray-900 tracking-tighter">Saved</Text>
                    <Text className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Your Curated Collection</Text>
                </View>
                <Text className="text-primary font-black text-xs uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full">{savedProperties.length} Units</Text>
            </View>

            <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                {savedProperties.map(property => (
                    <TouchableOpacity
                        key={property.id}
                        className="bg-white rounded-[32px] mb-6 overflow-hidden border border-gray-100 flex-row h-40 shadow-sm"
                        onPress={() => router.push(`/property/${property.id}`)}
                        activeOpacity={0.9}
                    >
                        <View className="w-1/3 bg-gray-100">
                            {property.imageUrls && property.imageUrls.length > 0 ? (
                                <Image source={property.imageUrls[0]} style={{ flex: 1 }} contentFit="cover" />
                            ) : (
                                <View className="flex-1 items-center justify-center">
                                    <Ionicons name="home" size={28} color="#D1D5DB" />
                                </View>
                            )}
                            <View className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
                                <Text className="text-primary text-[8px] font-black uppercase tracking-widest">{property.operation}</Text>
                            </View>
                        </View>
                        <View className="p-5 flex-1 justify-center">
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="font-black text-xl text-primary">{formatPrice(property.price)}</Text>
                                <TouchableOpacity>
                                    <Ionicons name="heart" size={24} color="#8B5CF6" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-gray-900 font-black text-base mb-1" numberOfLines={1}>{property.title}</Text>
                            <Text className="text-gray-400 font-bold text-xs mb-3" numberOfLines={1}>{property.neighborhood}, {property.city}</Text>
                            <View className="flex-row gap-4">
                                <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                    <Ionicons name="bed-outline" size={14} color="#8B5CF6" />
                                    <Text className="text-[10px] text-gray-900 font-black ml-1.5">{property.bedrooms}</Text>
                                </View>
                                <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                    <Ionicons name="water-outline" size={14} color="#8B5CF6" />
                                    <Text className="text-[10px] text-gray-900 font-black ml-1.5">{property.bathrooms}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
