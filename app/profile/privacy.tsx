import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1022' }}>
            <StatusBar barStyle="light-content" />
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Privacidade</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                <Text style={{ color: '#af25f4', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, marginBottom: 16 }}>Termos e Condições</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 24, fontFamily: 'PlusJakartaSans-Regular', marginBottom: 24 }}>
                    Sua privacidade é nossa prioridade. Todos os seus dados de contato e localização são usados apenas para facilitar a negociação de imóveis dentro da plataforma TokTok.
                </Text>

                <View style={{ gap: 12 }}>
                    <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold' }}>Configurações de Dados</Text>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold' }}>Excluir Conta</Text>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
