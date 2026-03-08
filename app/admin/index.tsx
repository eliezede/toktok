import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AdminDashboardScreen() {
    const { profile } = useAuth();

    // In a real app, this should check a robust isSuperAdmin claim from the token.
    if (profile?.role !== 'agency') {
        return (
            <View className="flex-1 items-center justify-center p-6 bg-gray-50">
                <Ionicons name="shield-half-outline" size={64} color="#EF4444" />
                <Text className="text-xl font-bold mt-4 text-center">Unauthorized</Text>
                <Text className="text-gray-500 mt-2 text-center">You need administrator privileges to view this area.</Text>
                <TouchableOpacity className="mt-6 bg-gray-900 px-6 py-3 rounded-full" onPress={() => router.replace('/(tabs)')}>
                    <Text className="text-white font-bold">Return Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50 pt-16 px-6">
            <View className="flex-row items-center justify-between mb-8">
                <TouchableOpacity onPress={() => router.back()} className="bg-white p-2 rounded-full shadow-sm">
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Admin Control</Text>
                <View className="w-10" />
            </View>

            <View className="flex-row flex-wrap justify-between mb-8">
                <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <Text className="text-gray-500 mb-2">Total Users</Text>
                    <Text className="text-2xl font-black text-gray-900 mb-1">1,245</Text>
                    <Text className="text-green-500 text-xs font-bold">+12 today</Text>
                </View>

                <View className="w-[48%] bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <Text className="text-gray-500 mb-2">Active Listings</Text>
                    <Text className="text-2xl font-black text-gray-900 mb-1">8,432</Text>
                    <Text className="text-green-500 text-xs font-bold">+45 today</Text>
                </View>

                <View className="w-full bg-white p-4 rounded-2xl shadow-sm border border-red-100 mb-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-gray-500 mb-1">Reported Content</Text>
                            <Text className="text-2xl font-black text-red-500">12 Pending</Text>
                        </View>
                        <Ionicons name="warning" size={32} color="#EF4444" opacity={0.2} />
                    </View>
                </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-4">Management Modules</Text>

            <TouchableOpacity
                className="bg-white p-6 rounded-2xl flex-row items-center justify-between mb-4 shadow-sm border border-gray-100"
                onPress={() => router.push('/admin/users')}
            >
                <View className="flex-row items-center">
                    <View className="bg-blue-50 w-12 h-12 rounded-full items-center justify-center mr-4">
                        <Ionicons name="people" size={24} color="#3B82F6" />
                    </View>
                    <View>
                        <Text className="font-bold text-lg text-gray-900">Manage Users</Text>
                        <Text className="text-gray-500 text-sm">Ban, verify, or change roles</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-white p-6 rounded-2xl flex-row items-center justify-between mb-4 shadow-sm border border-gray-100"
                onPress={() => router.push('/admin/listings')}
            >
                <View className="flex-row items-center">
                    <View className="bg-purple-50 w-12 h-12 rounded-full items-center justify-center mr-4">
                        <Ionicons name="home" size={24} color="#8B5CF6" />
                    </View>
                    <View>
                        <Text className="font-bold text-lg text-gray-900">Moderate Listings</Text>
                        <Text className="text-gray-500 text-sm">Review newly posted content</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

        </ScrollView>
    );
}
