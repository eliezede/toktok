import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface PostStepImportProps {
    importUrl: string;
    setImportUrl: (url: string) => void;
    onImport: () => void;
    onManualEntry: () => void;
    onSocialLogin: (platform: 'instagram' | 'tiktok') => void;
    hasSocialSession: boolean;
    isImporting: boolean;
    isValidUrl: (url: string) => boolean;
}

export const PostStepImport = ({
    importUrl,
    setImportUrl,
    onImport,
    onManualEntry,
    onSocialLogin,
    hasSocialSession,
    isImporting,
    isValidUrl
}: PostStepImportProps) => {
    const valid = isValidUrl(importUrl);

    return (
        <View style={{ paddingVertical: 8 }}>
            <Text style={{ fontSize: 22, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: 0 }}>Anuncie com Facilidade</Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', marginTop: 4, marginBottom: 20, fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, lineHeight: 20 }}>Cole um link de qualquer portal imobiliário e nós preenchemos os detalhes.</Text>

            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Link do Imóvel</Text>
                <BlurView intensity={20} tint="dark" style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderStyle: 'solid', borderWidth: 2, borderColor: valid ? '#ff9066' : 'rgba(255, 255, 255, 0.1)', height: 56, paddingHorizontal: 16, overflow: 'hidden' }}>
                    <Ionicons name="link" size={20} color={valid ? "#ff9066" : "rgba(255, 255, 255, 0.3)"} style={{ marginRight: 12 }} />
                    <TextInput
                        style={{ flex: 1, color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 }}
                        placeholder="https://..."
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        value={importUrl}
                        onChangeText={setImportUrl}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </BlurView>
                
                <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 11, fontFamily: 'PlusJakartaSans-Medium' }}>
                        {hasSocialSession ? '✓ Instagram Conectado' : 'Link privado?'}
                    </Text>
                    <TouchableOpacity 
                        onPress={() => onSocialLogin('instagram')}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <Text style={{ color: '#ff9066', fontSize: 11, fontFamily: 'PlusJakartaSans-Bold', marginRight: 4 }}>
                            {hasSocialSession ? 'RECONECTAR' : 'SINCRONIZAR INSTAGRAM'}
                        </Text>
                        <Ionicons name="chevron-forward" size={12} color="#ff9066" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={{ width: '100%', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginBottom: 20, backgroundColor: !valid || isImporting ? 'rgba(255, 255, 255, 0.1)' : '#ff9066' }}
                onPress={onImport}
                disabled={!valid || isImporting}
            >
                {isImporting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: !valid || isImporting ? 'rgba(255, 255, 255, 0.3)' : 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1.5 }}>{isImporting ? 'IMPORTANDO...' : 'CONTINUAR COM LINK'}</Text>
                )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
                <Text style={{ marginHorizontal: 16, color: 'rgba(255, 255, 255, 0.2)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2 }}>OU</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
            </View>

            <TouchableOpacity
                style={{ width: '100%', paddingVertical: 14, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center' }}
                onPress={onManualEntry}
            >
                <Ionicons name="add-circle" size={24} color="#ff9066" />
                <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, marginTop: 8 }}>Cadastro Manual</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 11, marginTop: 2, fontFamily: 'PlusJakartaSans-Medium' }}>Eu vou preencher tudo</Text>
            </TouchableOpacity>
        </View>
    );
};
