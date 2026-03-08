import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProDashboardScreen() {
    const { profile } = useAuth();

    return (
        <ScrollView className="flex-1 bg-gray-50 pt-16 px-6">
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="bg-white p-2 rounded-full shadow-sm">
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Pro Tools</Text>
                <View className="w-10" />
            </View>

            <View className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-gray-500 font-medium mb-1">Current Plan</Text>
                        <Text className="text-2xl font-black text-primary capitalize">{profile?.accountPlan || 'Free'}</Text>
                    </View>
                    <TouchableOpacity className="bg-primary/10 px-4 py-2 rounded-full">
                        <Text className="text-primary font-bold">Upgrade</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Active Listings</Text>
                    <Text className="font-bold text-gray-900">3 / 5</Text>
                </View>
                <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View className="w-3/5 h-full bg-primary rounded-full" />
                </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-4">Analytics (Last 30 Days)</Text>

            <View className="flex-row flex-wrap justify-between mb-8">
                <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                        <Ionicons name="eye" size={20} color="#3B82F6" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900">12.4K</Text>
                    <Text className="text-gray-500 text-sm mt-1">Listing Views</Text>
                </View>

                <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <View className="bg-pink-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                        <Ionicons name="heart" size={20} color="#EC4899" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900">842</Text>
                    <Text className="text-gray-500 text-sm mt-1">Total Saves</Text>
                </View>

                <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <View className="bg-green-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                        <Ionicons name="call" size={20} color="#10B981" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900">45</Text>
                    <Text className="text-gray-500 text-sm mt-1">Lead Contacts</Text>
                </View>

                <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <View className="bg-purple-50 w-10 h-10 rounded-full items-center justify-center mb-3">
                        <Ionicons name="person-add" size={20} color="#8B5CF6" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900">128</Text>
                    <Text className="text-gray-500 text-sm mt-1">New Followers</Text>
                </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-4">Promote Listings</Text>
            <TouchableOpacity
                className="bg-indigo-900 p-6 rounded-2xl flex-row items-center justify-between mb-12 shadow-md"
                onPress={() => router.push('/pro/promote')}
            >
                <View className="flex-1 mr-4">
                    <Text className="text-white font-bold text-lg mb-1">Boost Your Visibility</Text>
                    <Text className="text-indigo-200 text-sm">Get to the top of the 'For You' feed and generate more leads instantly.</Text>
                </View>
                <View className="bg-white/20 p-3 rounded-full">
                    <Ionicons name="rocket" size={24} color="white" />
                </View>
            </TouchableOpacity>

        </ScrollView>
    );
}
