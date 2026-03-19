import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyListing } from '@/types';

interface PropertySheetSummaryProps {
    property: PropertyListing;
    isOwner: boolean;
    onOpenManagement: (property: PropertyListing) => void;
}

export const PropertySheetSummary: React.FC<PropertySheetSummaryProps> = ({ property, isOwner, onOpenManagement }) => {
    const formattedPrice = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        maximumFractionDigits: 0 
    }).format(property.price);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{formattedPrice}</Text>
                        {property.listingStatus && property.listingStatus !== 'active' && property.listingStatus !== 'archived' && (
                            <View style={[
                                styles.miniStatusBadge,
                                property.listingStatus === 'sold' || property.listingStatus === 'rented' ? styles.statusSoldMini : styles.statusReservedMini
                            ]}>
                                <Text style={styles.miniStatusText}>
                                    {property.listingStatus === 'sold' ? 'VENDIDO' : 
                                     property.listingStatus === 'rented' ? 'ALUGADO' : 'RESERVADO'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.purpose}>{property.listingType === 'sale' ? 'Venda' : 'Aluguel'}</Text>
                </View>
                
                <View style={styles.tagRow}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{property.propertyType.toUpperCase()}</Text>
                    </View>
                    {isOwner && (
                        <TouchableOpacity 
                            onPress={() => onOpenManagement(property)}
                            style={styles.managementBtn}
                        >
                            <Ionicons name="ellipsis-vertical" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <Text style={styles.listingTitle}>{property.listingTitle}</Text>

            <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color="#ff9066" />
                <Text style={styles.locationText}>{property.neighborhood}, {property.city}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    headerRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        flex: 1 
    },
    priceRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8 
    },
    price: {
        fontSize: 32,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: 'white',
        letterSpacing: -1,
    },
    miniStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    statusSoldMini: {
        backgroundColor: '#FF2D55',
    },
    statusReservedMini: {
        backgroundColor: '#ff9066',
    },
    miniStatusText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 10,
    },
    purpose: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    tagRow: { 
        flexDirection: 'row', 
        gap: 12, 
        alignItems: 'center' 
    },
    tag: {
        backgroundColor: 'rgba(255, 144, 102, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 144, 102, 0.2)',
    },
    tagText: {
        color: '#ff9066',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 10,
        letterSpacing: 0.5,
    },
    managementBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    listingTitle: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans-Bold',
        color: 'white',
        marginTop: 12,
        marginBottom: 8,
        lineHeight: 28,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 24,
    },
    locationText: {
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 14,
    },
});
