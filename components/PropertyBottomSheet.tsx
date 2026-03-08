import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PropertyListing } from '../types';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface PropertyBottomSheetProps {
    property: PropertyListing | null;
    onClose: () => void;
}

type TabType = 'Resumo' | 'Fotos' | 'Planta' | 'Mapa' | 'Agente';

const PropertyBottomSheet = React.forwardRef<BottomSheetModal, PropertyBottomSheetProps>(
    ({ property, onClose }, ref) => {
        const [activeTab, setActiveTab] = useState<TabType>('Resumo');

        // variables
        const snapPoints = useMemo(() => ['50%', '90%'], []);

        const renderTabContent = () => {
            if (!property) return null;

            switch (activeTab) {
                case 'Resumo':
                    return (
                        <View className="p-6">
                            <Text className="text-3xl font-black text-gray-900 mb-2">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(property.price)}
                            </Text>
                            <Text className="text-xl font-bold text-gray-800 mb-4">{property.title}</Text>

                            <View className="flex-row items-center mb-6">
                                <Ionicons name="location" size={16} color="#6B7280" />
                                <Text className="text-gray-500 ml-2 font-medium">{property.neighborhood}, {property.city}</Text>
                            </View>

                            <View className="flex-row justify-between bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
                                <View className="items-center">
                                    <Ionicons name="bed-outline" size={24} color="#8B5CF6" />
                                    <Text className="font-black text-lg mt-1">{property.bedrooms}</Text>
                                    <Text className="text-gray-400 text-[10px] uppercase font-bold">Quartos</Text>
                                </View>
                                <View className="items-center">
                                    <Ionicons name="water-outline" size={24} color="#8B5CF6" />
                                    <Text className="font-black text-lg mt-1">{property.bathrooms}</Text>
                                    <Text className="text-gray-400 text-[10px] uppercase font-bold">Banhos</Text>
                                </View>
                                <View className="items-center">
                                    <Ionicons name="expand-outline" size={24} color="#8B5CF6" />
                                    <Text className="font-black text-lg mt-1">{property.squareMeters}</Text>
                                    <Text className="text-gray-400 text-[10px] uppercase font-bold">m²</Text>
                                </View>
                            </View>

                            <Text className="text-gray-600 leading-6 text-base mb-10">
                                {property.description}
                            </Text>

                            <TouchableOpacity
                                className="bg-primary py-5 rounded-2xl shadow-xl shadow-primary/30 items-center"
                                onPress={() => {
                                    onClose();
                                    router.push(`/property/${property.id}`);
                                }}
                            >
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Ver ficha completa</Text>
                            </TouchableOpacity>
                        </View>
                    );
                case 'Fotos':
                    return (
                        <View className="p-6">
                            <Text className="text-xl font-black mb-4">Galeria de Fotos</Text>
                            <View className="flex-row flex-wrap gap-4">
                                {property.imageUrls.map((url, index) => (
                                    <View key={index} className="w-[47%] h-32 bg-gray-100 rounded-2xl overflow-hidden">
                                        <Image source={{ uri: url }} className="w-full h-full" resizeMode="cover" />
                                    </View>
                                ))}
                                {property.imageUrls.length === 0 && (
                                    <View className="w-full h-40 bg-gray-50 rounded-3xl items-center justify-center border-2 border-dashed border-gray-200">
                                        <Ionicons name="images-outline" size={32} color="#D1D5DB" />
                                        <Text className="text-gray-400 mt-2 font-bold">Nenhuma foto disponível</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                default:
                    return (
                        <View className="p-20 items-center justify-center">
                            <Ionicons name="construct-outline" size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-4 font-black text-center uppercase tracking-widest">Em Desenvolvimento</Text>
                        </View>
                    );
            }
        };

        const renderTabs = () => (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="border-b border-gray-100 px-4 py-2"
                contentContainerStyle={{ paddingRight: 20 }}
            >
                {(['Resumo', 'Fotos', 'Planta', 'Mapa', 'Agente'] as TabType[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className={`mr-6 py-2 border-b-2 ${activeTab === tab ? 'border-primary' : 'border-transparent'}`}
                    >
                        <Text className={`font-black uppercase text-xs tracking-widest ${activeTab === tab ? 'text-primary' : 'text-gray-400'}`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );

        return (
            <BottomSheetModal
                ref={ref}
                index={0}
                snapPoints={snapPoints}
                onDismiss={onClose}
                backgroundStyle={{ borderRadius: 40 }}
                handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
            >
                <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {renderTabs()}
                    {renderTabContent()}
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    }
);

export default PropertyBottomSheet;
