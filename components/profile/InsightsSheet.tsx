import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, forwardRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

interface InsightsSheetProps {
    onClose: () => void;
}

const InsightsSheet = forwardRef<BottomSheetModal, InsightsSheetProps>(
    ({ onClose }, ref) => {
        const snapPoints = useMemo(() => ['60%', '85%'], []);

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
                    <Text style={styles.title}>Insights de Audiência</Text>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.heroTitle}>O desempenho das suas propriedades</Text>
                    
                    <View style={styles.grid}>
                        <View style={styles.card}>
                            <Text style={styles.cardValue}>1.2k</Text>
                            <Text style={styles.cardLabel}>Visualizações</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.cardValue}>48</Text>
                            <Text style={styles.cardLabel}>Leads Gerados</Text>
                        </View>
                    </View>

                    <View style={styles.maintenanceCard}>
                        <Ionicons name="analytics" size={40} color="#ff9066" style={{ marginBottom: 16 }} />
                        <Text style={styles.maintenanceTitle}>Painel em Construção</Text>
                        <Text style={styles.maintenanceText}>
                            Estamos processando os dados do último mês. Em breve teremos gráficos detalhados sobre o alcance dos seus vídeos.
                        </Text>
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
        fontSize: 28,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        marginBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    card: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardValue: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    cardLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Medium',
        marginTop: 4,
    },
    maintenanceCard: {
        backgroundColor: 'rgba(255, 144, 102, 0.05)',
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 144, 102, 0.1)',
        marginTop: 20,
    },
    maintenanceTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Bold',
        marginBottom: 8,
    },
    maintenanceText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'PlusJakartaSans-Medium',
    },
});

export default InsightsSheet;
