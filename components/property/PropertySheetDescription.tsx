import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { PropertyListing } from '@/types';

interface PropertySheetDescriptionProps {
    property: PropertyListing;
}

export const PropertySheetDescription: React.FC<PropertySheetDescriptionProps> = ({ property }) => {
    return (
        <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Sobre o Imóvel</Text>
            <Text style={styles.descriptionText}>
                {property.descriptionLong?.slice(0, 150)}...
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    descriptionBox: {
        marginBottom: 32,
    },
    descriptionLabel: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    descriptionText: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 15,
        lineHeight: 24,
    },
});
