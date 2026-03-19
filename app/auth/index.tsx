import { router } from 'expo-router';
import { Text, TouchableOpacity, View, ImageBackground, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthLandingScreen() {
    const insets = useSafeAreaInsets();

    console.log("[AuthLandingScreen] Rendering...");

    return (
        <View style={styles.container}>
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' }}
                style={styles.imageBackground}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'rgba(14, 14, 14, 0.8)', '#0e0e0e']}
                    style={styles.gradient}
                >
                    <View style={[styles.content, { paddingBottom: insets.bottom + 48 }]}>
                        <View style={styles.indicator} />
                        
                        <Text style={styles.title}>
                            Descubra Imóveis de Forma Imersiva
                        </Text>
                        
                        <Text style={styles.subtitle}>
                            A primeira plataforma de imobiliário focada em vídeo. Veja cada detalhe antes de visitar.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => router.push('/auth/signup')}
                            >
                                <Text style={styles.buttonText}>Criar Conta</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={() => router.push('/auth/login')}
                            >
                                <Text style={styles.buttonText}>Entrar</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.pagination}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e0e0e',
    },
    imageBackground: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        paddingHorizontal: 32,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    indicator: {
        backgroundColor: 'rgba(255, 144, 102, 0.2)',
        width: 64,
        height: 4,
        borderRadius: 2,
        marginBottom: 24,
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontFamily: 'PlusJakartaSans-Bold',
        marginBottom: 16,
        lineHeight: 40,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Regular',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
    },
    primaryButton: {
        width: '100%',
        backgroundColor: '#ff9066',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#ff9066',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    secondaryButton: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 18,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#ff9066',
    },
});

