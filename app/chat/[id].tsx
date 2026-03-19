import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

export default function ChatDetailScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const [message, setMessage] = useState('');

    return (
        <View className="flex-1 bg-background-dark">
            {/* Header */}
            <View style={{ paddingTop: insets.top }} className="bg-background-dark border-b border-white/5">
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity 
                        className="flex-row items-center flex-1"
                        onPress={() => router.push({ pathname: '/profile/[id]', params: { id: id as string } } as any)}
                    >
                        <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
                            <Ionicons name="person" size={20} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-jakarta-bold">João Silva</Text>
                            <Text className="text-green-500 text-xs font-jakarta">Online</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="call-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="bg-white/5 self-start p-4 rounded-2xl rounded-tl-none mb-4 max-w-[80%]">
                    <Text className="text-white font-jakarta">Olá! Tenho interesse no imóvel em Cascais. Está disponível para visita amanhã?</Text>
                    <Text className="text-white/30 text-[10px] mt-2 font-jakarta">10:30</Text>
                </View>

                <View className="bg-primary self-end p-4 rounded-2xl rounded-tr-none mb-4 max-w-[80%]">
                    <Text className="text-white font-jakarta">Olá, João! Sim, está disponível. Pelas 15h seria uma boa hora para si?</Text>
                    <Text className="text-white/60 text-[10px] mt-2 font-jakarta text-right">10:35</Text>
                </View>
            </ScrollView>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                <View style={{ paddingBottom: Math.max(insets.bottom, 20) }} className="px-6 py-4 bg-background-dark border-t border-white/5">
                    <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                        <TouchableOpacity className="mr-3">
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                        <TextInput 
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Escreva uma mensagem..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            className="flex-1 text-white font-jakarta h-10"
                            multiline
                        />
                        <TouchableOpacity className="ml-3 bg-primary p-2 rounded-full">
                            <Ionicons name="send" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
