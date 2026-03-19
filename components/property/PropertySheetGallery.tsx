import React from 'react';
import { Dimensions, Image, ScrollView, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyListing } from '@/types';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface PropertySheetGalleryProps {
    property: PropertyListing;
}

export const PropertySheetGallery: React.FC<PropertySheetGalleryProps> = ({ property }) => {
    return (
        <View style={styles.content}>
            <Text style={styles.tabTitle}>Fotos do Imóvel</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToInterval={WINDOW_WIDTH - 48}
                decelerationRate="fast"
                style={styles.photoContainer}
            >
                {property.imageUrls.map((url, index) => (
                    <View key={index} style={styles.photoFrame}>
                        <Image source={{ uri: url }} style={styles.photo} resizeMode="cover" />
                        <View style={styles.photoIndex}>
                            <Text style={styles.photoIndexText}>{index + 1} / {property.imageUrls.length}</Text>
                        </View>
                    </View>
                ))}
                {property.imageUrls.length === 0 && (
                    <View style={styles.emptyPhotos}>
                        <Ionicons name="images-outline" size={40} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.emptyText}>Sem fotos disponíveis</Text>
                    </View>
                )}
            </ScrollView>
            <Text style={styles.swipeHint}>Deslize para ver mais</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: 24,
    },
    tabTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Bold',
        marginBottom: 20,
    },
    photoContainer: {
        width: WINDOW_WIDTH - 48,
        aspectRatio: 4 / 3,
        borderRadius: 24,
        overflow: 'hidden',
    },
    photoFrame: {
        width: WINDOW_WIDTH - 48,
        aspectRatio: 4 / 3,
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    photoIndex: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    photoIndexText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    swipeHint: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 12,
        marginTop: 16,
    },
    emptyPhotos: {
        width: WINDOW_WIDTH - 48,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.2)',
        fontFamily: 'PlusJakartaSans-Bold',
        marginTop: 12,
    },
});
