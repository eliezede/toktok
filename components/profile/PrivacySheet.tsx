import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, forwardRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

interface PrivacySheetProps {
    onClose: () => void;
}

const PrivacySheet = forwardRef<BottomSheetModal, PrivacySheetProps>(
    ({ onClose }, ref) => {
        const snapPoints = useMemo(() => ['70%', '90%'], []);

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
                    <Text style={styles.title}>Privacidade e Segurança</Text>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.container}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Seus Dados</Text>
                        <TouchableOpacity style={styles.actionRow}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="download-outline" size={20} color="white" />
                                <Text style={styles.rowText}>Baixar minhas informações</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.actionRow}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="eye-off-outline" size={20} color="#ff9066" />
                                <Text style={styles.rowText}>Ocultar anúncios</Text>
                            </View>
                            <View style={{ backgroundColor: 'rgba(255, 144, 102, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 }}>
                                <Text style={{ color: '#ff9066', fontSize: 10, fontFamily: 'PlusJakartaSans-Bold' }}>ATIVADO</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionRow}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                <Text style={[styles.rowText, { color: '#ff4444' }]}>Excluir minha conta</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Termos e Políticas</Text>
                        <View style={styles.policyCard}>
                            <Text style={styles.policyText}>
                                Sua privacidade é nossa prioridade. O TokTok utiliza criptografia para proteger seus dados e nunca compartilha suas informações de contato sem sua autorização explícita ao entrar em contato com um anúncio.
                            </Text>
                            <TouchableOpacity style={styles.linkBtn}>
                                <Text style={styles.linkText}>Ler Política de Privacidade Completa</Text>
                            </TouchableOpacity>
                        </View>
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
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 20,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    rowText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-Medium',
    },
    policyCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    policyText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Medium',
        lineHeight: 22,
    },
    linkBtn: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    linkText: {
        color: '#ff9066',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
    },
});

export default PrivacySheet;
