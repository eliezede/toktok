import React from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '@/types';

interface PropertySheetAgentCardProps {
    agentProfile: UserProfile | null;
    onViewDetails: () => void;
}

export const PropertySheetAgentCard: React.FC<PropertySheetAgentCardProps> = ({ agentProfile, onViewDetails }) => {
    return (
        <TouchableOpacity 
            style={styles.agentCardCompact}
            activeOpacity={0.8}
            onPress={onViewDetails}
        >
            <View style={styles.agentAvatarContainer}>
                {agentProfile?.profileImage ? (
                    <Image source={{ uri: agentProfile.profileImage }} style={styles.agentAvatar} />
                ) : (
                    <View style={styles.agentAvatarFallback}>
                        <Text style={styles.agentInitial}>{agentProfile?.fullName?.[0] || 'A'}</Text>
                    </View>
                )}
                {agentProfile?.isVerified && <View style={styles.verifiedDot} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.agentNameSheet}>
                    {(agentProfile?.role === 'agency' ? agentProfile.agencyName : agentProfile?.fullName) || 'Agente Premium'}
                </Text>
                <Text style={styles.creciTextSheet}>
                    {agentProfile?.role === 'agency' 
                        ? (agentProfile.creciCompany ? `CRECI-J: ${agentProfile.creciCompany}` : 'Imobiliária Verificada')
                        : (agentProfile?.creciNumber ? `CRECI: ${agentProfile.creciNumber}-${agentProfile.creciState || 'SP'}` : 'Consultor Verificado')
                    }
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    agentCardCompact: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 24,
    },
    agentAvatarContainer: {
        position: 'relative',
    },
    agentAvatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
    },
    agentAvatarFallback: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#ff9066',
        alignItems: 'center',
        justifyContent: 'center',
    },
    agentInitial: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    verifiedDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: '#131313',
    },
    agentNameSheet: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
    },
    creciTextSheet: {
        color: '#ff9066',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 10,
        textTransform: 'uppercase',
        marginTop: 2,
    },
});
