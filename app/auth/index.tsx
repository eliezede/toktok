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
        <View style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
            <ImageBackground 
                source={{ uri: slide.image }}
                style={{ flex: 1 }}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(14, 14, 14, 0.8)', '#0e0e0e']}
                    style={{ flex: 1, paddingHorizontal: 32 }}
                >
                    <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: insets.bottom + 48 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                            {SLIDES.map((_, index) => (
                                <View 
                                    key={index}
                                    style={{ 
                                        height: 4, 
                                        borderRadius: 2, 
                                        marginRight: 8,
                                        width: index === currentSlide ? 48 : 24,
                                        backgroundColor: index === currentSlide ? '#ff9066' : 'rgba(255,255,255,0.2)'
                                    }} 
                                />
                            ))}
                        </View>
                        
                        <Text style={{ color: 'white', fontSize: 32, fontFamily: 'PlusJakartaSans-Bold', marginBottom: 16, lineHeight: 40 }}>
                            {slide.title}
                        </Text>
                        
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 18, fontFamily: 'PlusJakartaSans-Regular', marginBottom: 48 }}>
                            {slide.description}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 }}>Pular</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{ 
                                    backgroundColor: '#ff9066', 
                                    paddingHorizontal: 40, 
                                    paddingVertical: 16, 
                                    borderRadius: 16, 
                                    alignItems: 'center',
                                    shadowColor: '#ff9066',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5
                                }}
                                onPress={handleNext}
                            >
                                <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 18 }}>
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
