import React from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

export interface ActionItem {
    label: string;
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    type?: 'default' | 'destructive' | 'primary';
}

interface ActionSheetProps {
    visible: boolean;
    title?: string;
    message?: string;
    actions: ActionItem[];
    onClose: () => void;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
    visible,
    title,
    message,
    actions,
    onClose
}) => {
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
                    <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                    <TouchableOpacity 
                        activeOpacity={1} 
                        onPress={onClose} 
                        style={styles.dismissOverlay} 
                    />
                </Animated.View>
                
                <Animated.View
                    entering={SlideInDown.springify().damping(20).stiffness(150)}
                    exiting={SlideOutDown.duration(200)}
                    style={styles.sheetContainer}
                >
                    <View style={styles.handle} />
                    
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            {message && <Text style={styles.message}>{message}</Text>}
                        </View>
                    )}
                    
                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.actionsList}
                    >
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.actionItem,
                                    index === actions.length - 1 && styles.lastItem
                                ]}
                                onPress={() => {
                                    onClose();
                                    action.onPress();
                                }}
                            >
                                <View style={styles.actionContent}>
                                    {action.icon && (
                                        <View style={[
                                            styles.iconBox,
                                            { backgroundColor: action.type === 'destructive' ? 'rgba(255,59,48,0.1)' : 'rgba(255,255,255,0.05)' }
                                        ]}>
                                            <Ionicons 
                                                name={action.icon} 
                                                size={20} 
                                                color={action.type === 'destructive' ? '#FF3B30' : action.type === 'primary' ? '#ff9066' : 'white'} 
                                            />
                                        </View>
                                    )}
                                    <Text style={[
                                        styles.actionLabel,
                                        action.type === 'destructive' ? styles.destructiveLabel : 
                                        action.type === 'primary' ? styles.primaryLabel : null
                                    ]}>
                                        {action.label}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={onClose}
                    >
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    dismissOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetContainer: {
        backgroundColor: '#131313',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        paddingBottom: 40,
        maxHeight: WINDOW_HEIGHT * 0.8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderBottomWidth: 0,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: 'white',
        textAlign: 'center',
    },
    message: {
        fontSize: 13,
        fontFamily: 'PlusJakartaSans-Medium',
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        marginTop: 4,
    },
    actionsList: {
        paddingHorizontal: 16,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.02)',
    },
    lastItem: {
        marginBottom: 24,
    },
    actionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-Bold',
        color: 'white',
    },
    destructiveLabel: {
        color: '#FF3B30',
    },
    primaryLabel: {
        color: '#ff9066',
    },
    cancelButton: {
        marginHorizontal: 16,
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cancelText: {
        color: 'rgba(255,255,255,0.6)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 16,
    }
});
