import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface PostStepPhotosProps {
    photos: string[];
    onPickPhotos: () => void;
    onPost: () => void;
    onBack: () => void;
    loading: boolean;
}

export const PostStepPhotos = ({
    photos,
    onPickPhotos,
    onPost,
    onBack,
    loading
}: PostStepPhotosProps) => {
    return (
        <View>
            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: 0, marginBottom: 8 }}>Passo 5: Fotos</Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, marginBottom: 16 }}>Adicione até 10 fotos para completar o anúncio.</Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {photos.map((uri, i) => (
                    <View key={i} style={{ width: '31.33%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                    </View>
                ))}
                {photos.length < 10 && (
                    <TouchableOpacity
                        style={{ width: '31.33%', aspectRatio: 1, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                        onPress={onPickPhotos}
                    >
                        <Ionicons name="add" size={24} color="rgba(255, 255, 255, 0.2)" />
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                style={{ width: '100%', paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginBottom: 16, backgroundColor: loading ? 'rgba(255, 255, 255, 0.1)' : '#10B981' }}
                onPress={onPost}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1.5 }}>Publicar Agora</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={{ width: '100%', paddingVertical: 12, alignItems: 'center' }} onPress={onBack} disabled={loading}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.3)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};
