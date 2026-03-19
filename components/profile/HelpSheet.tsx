import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, forwardRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Linking } from 'react-native';

interface HelpSheetProps {
    onClose: () => void;
}

const HelpSheet = forwardRef<BottomSheetModal, HelpSheetProps>(
    ({ onClose }, ref) => {
        const snapPoints = useMemo(() => ['60%', '85%'], []);

        const handleSupport = () => {
            Linking.openURL('mailto:suporte@toktok.com');
        };

        return (
            <BottomSheetModal
                ref={ref}
                index={0}
                snapPoints={snapPoints}
                onDismiss={onClose}
                backgroundStyle={{ backgroundColor: '#131313', borderRadius: 40 }}
                handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Ajuda e Suporte</Text>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.heroTitle}>Como podemos ajudar?</Text>
                    
                    <View style={styles.grid}>
                        <TouchableOpacity style={styles.card}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Ionicons name="chatbubbles-outline" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.cardTitle}>FAQ</Text>
                            <Text style={styles.cardDesc}>Dúvidas frequentes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card} onPress={handleSupport}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 144, 102, 0.1)' }]}>
                                <Ionicons name="mail-outline" size={24} color="#ff9066" />
                            </View>
                            <Text style={styles.cardTitle}>Suporte</Text>
                            <Text style={styles.cardDesc}>Falar com a equipe</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.versionText}>TokTok v1.0.0</Text>
                    </View>
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans-Bold',
        color: 'white',
    },
    container: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },
    heroTitle: {
        color: 'white',
        fontSize: 32,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        marginBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        gap: 16,
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    cardDesc: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Medium',
        marginTop: 4,
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
    },
    versionText: {
        color: 'rgba(255,255,255,0.15)',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 12,
    },
});

export default HelpSheet;
