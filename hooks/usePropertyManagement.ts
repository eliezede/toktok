import { useState, useCallback } from 'react';
import { PropertyListing } from '../types';
import { PropertyActionService } from '../services/property/propertyActionService';
import { router } from 'expo-router';

export function usePropertyManagement(onDataChange?: () => void) {
    const [sheetVisible, setSheetVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'warning' | 'error' | 'info';
        onConfirm?: () => void;
        confirmText?: string;
    }>({
        title: '',
        message: '',
        type: 'info'
    });
    const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

    const openManagement = useCallback((property: PropertyListing) => {
        setSelectedProperty(property);
        setSheetVisible(true);
    }, []);

    const showModal = useCallback((config: typeof modalConfig) => {
        setModalConfig(config);
        setModalVisible(true);
    }, []);

    const handleUpdateStatus = useCallback(async (propertyId: string, status: PropertyListing['listingStatus']) => {
        try {
            await PropertyActionService.updateStatus(propertyId, status);
            onDataChange?.();
            showModal({
                title: 'Sucesso!',
                message: `O imóvel foi marcado como ${status === 'active' ? 'Ativo' : status === 'sold' ? 'Vendido' : 'Reservado'}.`,
                type: 'success'
            });
        } catch (error) {
            showModal({
                title: 'Erro',
                message: 'Não foi possível atualizar o status do imóvel.',
                type: 'error'
            });
        }
    }, [onDataChange, showModal]);

    const handleArchive = useCallback(async (propertyId: string, archive: boolean) => {
        try {
            if (archive) {
                await PropertyActionService.archiveListing(propertyId);
            } else {
                await PropertyActionService.unarchiveListing(propertyId);
            }
            onDataChange?.();
            showModal({
                title: archive ? 'Imóvel Arquivado' : 'Imóvel Ativado',
                message: archive ? 'A listagem não aparecerá mais no feed público.' : 'A listagem já está visível para todos.',
                type: 'success'
            });
        } catch (error) {
            showModal({
                title: 'Erro',
                message: 'Falha ao processar arquivamento.',
                type: 'error'
            });
        }
    }, [onDataChange, showModal]);

    const handleDelete = useCallback(async (propertyId: string) => {
        showModal({
            title: 'Eliminar Imóvel',
            message: 'Esta ação é irreversível. Todas as fotos e dados serão perdidos para sempre.',
            type: 'warning',
            confirmText: 'Sim, Eliminar',
            onConfirm: async () => {
                try {
                    await PropertyActionService.deleteListing(propertyId);
                    setModalVisible(false);
                    onDataChange?.();
                    // If we are on the property detail screen, we should go back
                    if (router.canGoBack()) router.back();
                } catch (error) {
                    showModal({
                        title: 'Erro',
                        message: 'Não foi possível eliminar o imóvel.',
                        type: 'error'
                    });
                }
            }
        });
    }, [onDataChange, showModal]);

    const getManagementActions = useCallback((property: PropertyListing) => {
        const actions: any[] = [
            {
                label: 'Editar Detalhes',
                icon: 'create-outline',
                type: 'primary',
                onPress: () => router.push(`/property/edit/${property.id}`)
            },
            {
                label: property.listingStatus === 'active' ? 'Marcar como Reservado' : 'Marcar como Ativo',
                icon: property.listingStatus === 'active' ? 'bookmark-outline' : 'checkmark-circle-outline',
                onPress: () => handleUpdateStatus(property.id, property.listingStatus === 'active' ? 'reserved' : 'active')
            },
            {
                label: property.listingStatus === 'sold' ? 'Marcar como Ativo' : 'Marcar como Vendido',
                icon: property.listingStatus === 'sold' ? 'checkmark-circle-outline' : 'cash-outline',
                onPress: () => handleUpdateStatus(property.id, property.listingStatus === 'sold' ? 'active' : 'sold')
            },
            {
                label: property.listingStatus === 'archived' ? 'Desarquivar' : 'Arquivar Publicação',
                icon: property.listingStatus === 'archived' ? 'eye-outline' : 'eye-off-outline',
                onPress: () => handleArchive(property.id, property.listingStatus !== 'archived')
            },
            {
                label: 'Eliminar Permanente',
                icon: 'trash-outline',
                type: 'destructive',
                onPress: () => handleDelete(property.id)
            }
        ];
        return actions;
    }, [handleUpdateStatus, handleArchive, handleDelete]);

    return {
        sheetVisible,
        setSheetVisible,
        modalVisible,
        setModalVisible,
        modalConfig,
        selectedProperty,
        openManagement,
        getManagementActions,
        handleDelete,
        handleArchive,
        handleUpdateStatus,
        showModal
    };
}
