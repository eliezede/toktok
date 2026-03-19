import React, { useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
    FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface CustomModalProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'warning' | 'error' | 'info';
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const CustomModal: React.FC<CustomModalProps> = ({
    visible,
    title,
    message,
    type = 'info',
    onClose,
    onConfirm,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle' as const, color: '#34C759' };
            case 'warning': return { name: 'warning' as const, color: '#FFCC00' };
            case 'error': return { name: 'alert-circle' as const, color: '#FF3B30' };
            default: return { name: 'information-circle' as const, color: '#ff9066' };
        }
    };

    const icon = getIcon();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            onRequestClose={onClose}
            animationType="none"
        >
            <View style={styles.overlay}>
                <Animated.View 
                    entering={FadeIn.duration(300)} 
                    exiting={FadeOut.duration(200)}
                    style={StyleSheet.absoluteFill}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={onClose} 
                        style={styles.dismissOverlay} 
                    />
                </Animated.View>
                
                <Animated.View
                    entering={ZoomIn.springify().damping(15)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                            <Ionicons name={icon.name} size={32} color={icon.color} />
                        </View>
                        
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                        
                        <View style={styles.buttonContainer}>
                            {onConfirm && (
                                <TouchableOpacity 
                                    style={styles.cancelButton} 
                                    onPress={onClose}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity 
                                style={[
                                    styles.confirmButton, 
                                    onConfirm && { flex: 1.5 },
                                    !onConfirm && { width: '100%' },
                                    type === 'warning' || type === 'error' ? { backgroundColor: '#FF3B30' } : { backgroundColor: '#ff9066' }
                                ]} 
                                onPress={onConfirm || onClose}
                            >
                                <Text style={styles.confirmButtonText}>
                                    {onConfirm ? confirmText : 'OK'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    dismissOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#131313',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    modalContent: {
        padding: 32,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Medium',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cancelButtonText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
    },
    confirmButton: {
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
    }
});
