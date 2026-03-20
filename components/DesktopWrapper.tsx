import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform, ImageBackground } from 'react-native';

export default function DesktopWrapper({ children }: { children: React.ReactNode }) {
    const { width, height } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width > 768;

    if (!isDesktop) return <>{children}</>;

    return (
        <View style={styles.outerContainer}>
            {/* Ambient Background for Desktop */}
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1374&auto=format&fit=crop' }} 
                style={StyleSheet.absoluteFill}
                blurRadius={30}
            >
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' }} />
            </ImageBackground>

            <View style={[styles.innerContainer, { height: Math.min(height * 0.95, 900) }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        width: 430, // iPhone 14/15 Pro Max-ish width
        backgroundColor: '#0e0e0e',
        borderRadius: 48,
        overflow: 'hidden',
        borderWidth: 8,
        borderColor: '#1f1f1f',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 30 },
        shadowOpacity: 0.6,
        shadowRadius: 50,
        elevation: 20,
    }
});
