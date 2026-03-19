import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PropertySheetActionsProps {
    onViewDetails: () => void;
}

export const PropertySheetActions: React.FC<PropertySheetActionsProps> = ({ onViewDetails }) => {
    return (
        <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.9}
            onPress={onViewDetails}
        >
            <Text style={styles.primaryBtnText}>Ver ficha completa</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    primaryBtn: {
        backgroundColor: '#ff9066',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 24,
        gap: 12,
    },
    primaryBtnText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 16,
    },
});
