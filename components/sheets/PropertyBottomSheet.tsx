import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { PropertyListing, UserProfile } from '../../types';
import { UserService } from '../../services/userService';
import { usePropertyManagement } from '../../hooks/usePropertyManagement';
import { CustomModal } from '../ui/CustomModal';
import { ActionSheet } from '../ui/ActionSheet';
import { useAuth } from '../../hooks/useAuth';

// Modular Components
import { PropertySheetTabs, TabType } from '../property/PropertySheetTabs';
import { PropertySheetSummary } from '../property/PropertySheetSummary';
import { PropertySheetSpecs } from '../property/PropertySheetSpecs';
import { PropertySheetDescription } from '../property/PropertySheetDescription';
import { PropertySheetAgentCard } from '../property/PropertySheetAgentCard';
import { PropertySheetGallery } from '../property/PropertySheetGallery';
import { PropertySheetActions } from '../property/PropertySheetActions';

interface PropertyBottomSheetProps {
    property: PropertyListing | null;
    onClose: () => void;
}

const PropertyBottomSheet = React.forwardRef<BottomSheetModal, PropertyBottomSheetProps>(
    ({ property, onClose }, ref) => {
        const [activeTab, setActiveTab] = useState<TabType>('Resumo');
        const [agentProfile, setAgentProfile] = useState<UserProfile | null>(null);

        const { user } = useAuth();
        const {
            sheetVisible,
            setSheetVisible,
            modalVisible,
            setModalVisible,
            modalConfig,
            openManagement,
            getManagementActions
        } = usePropertyManagement();

        const isOwner = user?.uid === property?.createdBy;

        // Fetch agent profile
        useEffect(() => {
            const fetchAgent = async () => {
                if (property?.createdBy) {
                    const profile = await UserService.getUserProfile(property.createdBy);
                    setAgentProfile(profile);
                }
            };
            fetchAgent();
        }, [property?.createdBy]);

        // variables
        const snapPoints = useMemo(() => ['50%', '90%'], []);

        const handleViewDetails = useCallback(() => {
            if (!property) return;
            // Immediate programmatic dismissal through the ref
            if (ref && 'current' in ref) {
                (ref as any).current?.dismiss();
            }
            // Navigate to property details
            router.push(`/property/${property.id}`);
        }, [property, ref]);

        const renderTabContent = () => {
            if (!property) return null;

            switch (activeTab) {
                case 'Resumo':
                    return (
                        <View style={styles.content}>
                            <PropertySheetSummary 
                                property={property} 
                                isOwner={isOwner} 
                                onOpenManagement={openManagement} 
                            />
                            <PropertySheetSpecs property={property} />
                            <PropertySheetDescription property={property} />
                            <PropertySheetAgentCard 
                                agentProfile={agentProfile} 
                                onViewDetails={handleViewDetails} 
                            />
                            <PropertySheetActions onViewDetails={handleViewDetails} />
                        </View>
                    );
                case 'Fotos':
                    return <PropertySheetGallery property={property} />;
                default:
                    return (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBox}>
                                <Ionicons name="construct-outline" size={32} color="rgba(255,255,255,0.2)" />
                            </View>
                            <Text style={styles.emptyTitle}>Em Breve</Text>
                            <Text style={styles.emptySubtitle}>Estamos preparando esta seção para você.</Text>
                        </View>
                    );
            }
        };

        return (
            <BottomSheetModal
                ref={ref}
                index={0}
                snapPoints={snapPoints}
                onDismiss={onClose}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.indicator}
            >
                <BottomSheetScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 60 }}
                >
                    <PropertySheetTabs activeTab={activeTab} onTabChange={setActiveTab} />
                    {renderTabContent()}
                </BottomSheetScrollView>

                {/* Management UI */}
                {property && (
                    <>
                        <ActionSheet
                            visible={sheetVisible}
                            onClose={() => setSheetVisible(false)}
                            title="Gerenciar Imóvel"
                            message="Escolha uma ação para esta publicação"
                            actions={getManagementActions(property)}
                        />
                        <CustomModal
                            visible={modalVisible}
                            onClose={() => setModalVisible(false)}
                            {...modalConfig}
                        />
                    </>
                )}
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: '#131313',
        borderRadius: 40,
    },
    indicator: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 60,
    },
    content: {
        padding: 24,
    },
    emptyState: {
        padding: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIconBox: {
        width: 64,
        height: 64,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    emptySubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
    },
});

export default PropertyBottomSheet;
