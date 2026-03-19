import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CustomModal } from '@/components/ui/CustomModal';

export default function PromoteScreen() {
    // Custom Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        onConfirm?: () => void;
    }>({
        title: '',
        message: '',
        type: 'info'
    });

    const showModal = (title: string, message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', onConfirm?: () => void) => {
        setModalConfig({ title, message, type, onConfirm });
        setModalVisible(true);
    };

    const handlePurchase = (plan: string) => {
        showModal(
            'Processando',
            `Estamos preparando seu Boost ${plan}. A integração com Stripe será concluída na próxima fase.`,
            'info',
            () => router.back()
        );
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 pt-16 px-6">
                <View className="flex-row items-center mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-gray-100 p-2 rounded-full">
                        <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Boost Listing</Text>
                </View>

                <Text className="text-3xl font-black text-gray-900 mb-2">Get More Views</Text>
                <Text className="text-gray-500 mb-8 leading-6">Promoted listings appear more frequently in the For You feed of users looking in your area.</Text>

                <View className="space-y-4 mb-12">
                    <TouchableOpacity
                        className="border-2 border-gray-200 rounded-2xl p-6 flex-row items-center justify-between mb-4"
                        onPress={() => handlePurchase('Basic')}
                    >
                        <View>
                            <Text className="font-bold text-xl text-gray-900 mb-1">24 Hour Boost</Text>
                            <Text className="text-gray-500">~500 extra views</Text>
                        </View>
                        <Text className="font-black text-2xl text-primary">$9.99</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="border-2 border-primary bg-primary/5 rounded-2xl p-6 flex-row items-center justify-between mb-4 relative overflow-hidden"
                        onPress={() => handlePurchase('Pro')}
                    >
                        <View className="absolute top-0 right-0 bg-primary px-3 py-1 rounded-bl-xl">
                            <Text className="text-white text-xs font-bold">POPULAR</Text>
                        </View>
                        <View>
                            <Text className="font-bold text-xl text-gray-900 mb-1">3 Day Boost</Text>
                            <Text className="text-gray-500">~2,000 extra views</Text>
                        </View>
                        <Text className="font-black text-2xl text-primary">$19.99</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="border-2 border-gray-200 rounded-2xl p-6 flex-row items-center justify-between"
                        onPress={() => handlePurchase('Premium')}
                    >
                        <View>
                            <Text className="font-bold text-xl text-gray-900 mb-1">7 Day Boost</Text>
                            <Text className="text-gray-500">~5,000 extra views</Text>
                        </View>
                        <Text className="font-black text-2xl text-primary">$39.99</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                {...modalConfig}
            />
        </View>
    );
}
