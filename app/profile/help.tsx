import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View, Linking } from 'react-native';

export default function HelpScreen() {
    const handleSupport = () => {
        Linking.openURL('mailto:suporte@toktok.com');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#1c1022' }}>
            <StatusBar barStyle="light-content" />
            <View style={{ paddingHorizontal: 24, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderRadius: 16, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white' }}>Ajuda</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
                <Text style={{ color: 'white', fontSize: 32, fontFamily: 'PlusJakartaSans-ExtraBold', marginBottom: 32 }}>Como podemos ajudar?</Text>
                
                <View style={{ gap: 16 }}>
                    <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 24 }}>
                        <Text style={{ color: '#af25f4', fontFamily: 'PlusJakartaSans-Bold', marginBottom: 8 }}>Perguntas Frequentes</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Veja as dúvidas mais comuns dos nossos usuários.</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleSupport}
                        style={{ backgroundColor: 'rgba(175, 37, 244, 0.1)', padding: 24, borderRadius: 24, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgba(175, 37, 244, 0.2)' }}
                    >
                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', marginBottom: 8 }}>Falar com Suporte</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Abra um ticket ou fale diretamente com a nossa equipe.</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: 60, alignItems: 'center' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 12 }}>TokTok v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
