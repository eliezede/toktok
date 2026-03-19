import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface PostStepVideoProps {
    videoUri: string | null;
    onPickVideo: () => void;
    onContinue: () => void;
}

export const PostStepVideo = ({
    videoUri,
    onPickVideo,
    onContinue
}: PostStepVideoProps) => {
    return (
        <View>
            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: 0, marginBottom: 8 }}>Passo 1: O Vídeo</Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'PlusJakartaSans-Medium', fontSize: 13, marginBottom: 16 }}>Tudo no TokTok começa com um vídeo. Suba um vídeo vertical (9:16) do imóvel.</Text>

            <TouchableOpacity
                style={{ width: '100%', aspectRatio: 1.2, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 20, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                onPress={onPickVideo}
            >
                {videoUri ? (
                    <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                        <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                        <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, marginTop: 12 }}>Vídeo Selecionado</Text>
                        <BlurView intensity={30} tint="light" style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16 }}>
                            <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', fontSize: 9, letterSpacing: 1 }}>Toque para trocar</Text>
                        </BlurView>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center', paddingHorizontal: 32 }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#ff9066', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#ff9066', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12 }}>
                            <Ionicons name="videocam" size={28} color="white" />
                        </View>
                        <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textAlign: 'center' }}>Subir Vídeo Tour</Text>
                    </View>
                )}
            </TouchableOpacity>

            {videoUri && (
                <TouchableOpacity style={{ backgroundColor: '#ff9066', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }} onPress={onContinue}>
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.5 }}>Continuar</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
