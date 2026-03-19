import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, useState, useEffect, forwardRef } from 'react';
import { Text, View, StyleSheet, Switch, Alert } from 'react-native';
import { UserProfile } from '../../types';
import { UserService } from '../../services/userService';

interface NotificationsSheetProps {
    user: any;
    profile: UserProfile | null;
    onClose: () => void;
}

const NotificationsSheet = forwardRef<BottomSheetModal, NotificationsSheetProps>(
    ({ user, profile, onClose }, ref) => {
        const [pushEnabled, setPushEnabled] = useState(true);
        const [emailEnabled, setEmailEnabled] = useState(false);

        const snapPoints = useMemo(() => ['50%', '70%'], []);

        // Sync with profile data
        useEffect(() => {
            if (profile?.notifications) {
                setPushEnabled(profile.notifications.push);
                setEmailEnabled(profile.notifications.email);
            }
        }, [profile]);

        const handleTogglePush = async (value: boolean) => {
            setPushEnabled(value);
            if (!user) return;
            try {
                await UserService.updateProfile(user.uid, {
                    notifications: {
                        push: value,
                        email: emailEnabled
                    }
                });
            } catch (error) {
                console.error("Error updating push settings:", error);
                setPushEnabled(!value);
                Alert.alert("Erro", "Não foi possível atualizar as configurações.");
            }
        };

        const handleToggleEmail = async (value: boolean) => {
            setEmailEnabled(value);
            if (!user) return;
            try {
                await UserService.updateProfile(user.uid, {
                    notifications: {
                        push: pushEnabled,
                        email: value
                    }
                });
            } catch (error) {
                console.error("Error updating email settings:", error);
                setEmailEnabled(!value);
                Alert.alert("Erro", "Não foi possível atualizar as configurações.");
            }
        };

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
                    <Text style={styles.title}>Notificações</Text>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.container}>
                    <View style={styles.sheetContent}>
                        <View style={styles.item}>
                            <View style={styles.itemText}>
                                <Text style={styles.itemTitle}>Push Notifications</Text>
                                <Text style={styles.itemSubtitle}>Alertas imediatos de novos leads e mensagens</Text>
                            </View>
                            <Switch 
                                value={pushEnabled} 
                                onValueChange={handleTogglePush}
                                trackColor={{ false: "#3e3e3e", true: "rgba(255, 144, 102, 0.5)" }}
                                thumbColor={pushEnabled ? "#ff9066" : "#f4f3f4"}
                            />
                        </View>

                        <View style={styles.item}>
                            <View style={styles.itemText}>
                                <Text style={styles.itemTitle}>E-mail Marketing</Text>
                                <Text style={styles.itemSubtitle}>Novidades sobre o mercado e dicas semanais</Text>
                            </View>
                            <Switch 
                                value={emailEnabled} 
                                onValueChange={handleToggleEmail}
                                trackColor={{ false: "#3e3e3e", true: "rgba(255, 144, 102, 0.5)" }}
                                thumbColor={emailEnabled ? "#ff9066" : "#f4f3f4"}
                            />
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Ionicons name="notifications-outline" size={60} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.footerText}>Preferências Sincronizadas</Text>
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
        paddingTop: 24,
        paddingBottom: 40,
    },
    sheetContent: {
        gap: 16,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    itemText: {
        flex: 1,
        marginRight: 16,
    },
    itemTitle: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 16,
    },
    itemSubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Medium',
        marginTop: 4,
    },
    footer: {
        marginTop: 60,
        alignItems: 'center',
        opacity: 0.5,
    },
    footerText: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: 12,
    },
});

export default NotificationsSheet;
