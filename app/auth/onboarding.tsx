import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

const SLIDES = [
    {
        title: 'Descubra Imóveis de Forma Imersiva',
        description: 'A primeira plataforma de imobiliário focada em vídeo. Veja cada detalhe antes de visitar.',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    },
    {
        title: 'Destaque-se como Agente de Elite',
        description: 'Crie conteúdos únicos e alcance mais clientes com ferramentas profissionais de vídeo.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    },
    {
        title: 'Conecte-se e Feche Negócios',
        description: 'Comunicação direta e rápida entre consultores e clientes. O futuro do imobiliário é aqui.',
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    }
];

export default function OnboardingScreen() {
    const insets = useSafeAreaInsets();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            router.push('/auth/signup');
        }
    };

    const slide = SLIDES[currentSlide];

    return (
        <View className="flex-1 bg-background-dark">
            <ImageBackground 
                source={{ uri: slide.image }}
                className="flex-1"
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(28, 16, 34, 0.8)', '#1c1022']}
                    className="flex-1 px-8"
                >
                    <View className="flex-1 justify-end pb-12">
                        <View className="flex-row mb-6">
                            {SLIDES.map((_, index) => (
                                <View 
                                    key={index}
                                    className={`h-1 rounded-full mr-2 ${index === currentSlide ? 'w-12 bg-primary' : 'w-6 bg-white/20'}`} 
                                />
                            ))}
                        </View>
                        
                        <Text className="text-white text-4xl font-jakarta-bold mb-4 leading-tight">
                            {slide.title}
                        </Text>
                        
                        <Text className="text-white/60 text-lg font-jakarta mb-12">
                            {slide.description}
                        </Text>

                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text className="text-white/40 font-jakarta-semibold text-lg">Pular</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="bg-primary px-10 py-4 rounded-2xl items-center shadow-lg shadow-primary/30"
                                onPress={handleNext}
                            >
                                <Text className="text-white font-jakarta-bold text-lg">
                                    {currentSlide === SLIDES.length - 1 ? 'Começar' : 'Próximo'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}
