import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyListing } from '@/types';

interface PropertySheetSpecsProps {
    property: PropertyListing;
}

export const PropertySheetSpecs: React.FC<PropertySheetSpecsProps> = ({ property }) => {
    return (
        <View style={styles.specsRow}>
            <View style={styles.specItem}>
                <Ionicons name="bed-outline" size={18} color="#ff9066" />
                <Text style={styles.specValue}>{property.bedrooms}</Text>
                <Text style={styles.specLabel}>Quartos</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
                <Ionicons name="water-outline" size={18} color="#ff9066" />
                <Text style={styles.specValue}>{property.bathrooms}</Text>
                <Text style={styles.specLabel}>Banhos</Text>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specItem}>
                <Ionicons name="expand-outline" size={18} color="#ff9066" />
                <Text style={styles.specValue}>{property.areaValue}</Text>
                <Text style={styles.specLabel}>{property.areaUnit || 'm²'}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    specsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 24,
    },
    specItem: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    specValue: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 16,
    },
    specLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 9,
        textTransform: 'uppercase',
    },
    specDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
});
