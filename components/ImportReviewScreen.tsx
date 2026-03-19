import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ConfidenceLevel, ListingDraft, PropertyListing } from '../types';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface ImportReviewScreenProps {
    draft: ListingDraft;
    onContinue: (updatedFields: Partial<PropertyListing>) => void;
    onCancel: () => void;
    onReImport: () => void;
}

const getConfidenceColor = (level?: ConfidenceLevel) => {
    switch (level) {
        case 'high': return '#34C759'; // Green
        case 'medium': return '#FFCC00'; // Amber
        case 'low': return '#FF3B30'; // Red
        case 'missing': return 'rgba(255,255,255,0.2)'; // Gray
        default: return 'rgba(255,255,255,0.1)';
    }
};

const getConfidenceLabel = (level?: ConfidenceLevel) => {
    switch (level) {
        case 'high': return 'ALTA';
        case 'medium': return 'MÉDIA';
        case 'low': return 'BAIXA';
        case 'missing': return 'AUSENTE';
        default: return 'DESCONHECIDO';
    }
};

const PROPERTY_TYPES_MAP = [
    { value: 'house', label: 'Casa' },
    { value: 'apartment', label: 'Apartamento' },
    { value: 'studio', label: 'Studio' },
    { value: 'penthouse', label: 'Cobertura' },
    { value: 'land', label: 'Terreno' },
    { value: 'commercial', label: 'Comercial' },
    { value: 'villa', label: 'Vila' },
    { value: 'farm', label: 'Fazenda' },
];

const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(num).replace('R$', '').trim();
};

const formatCEP = (val: string) => {
    const numbers = val.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};

const ConfidenceBadge = ({ draft, field }: { draft: ListingDraft, field: string }) => {
    const conf = draft.fieldConfidence?.[field];
    if (!conf) return null;

    return (
        <View style={styles.confidenceBadge}>
            <View
                style={[styles.confidenceDot, { backgroundColor: getConfidenceColor(conf.confidenceLevel) }]}
            />
            <Text style={styles.confidenceText}>
                {getConfidenceLabel(conf.confidenceLevel)}
            </Text>
        </View>
    );
};

const FieldLabel = ({ label, draft, fieldName, required }: { label: string, draft: ListingDraft, fieldName?: string, required?: boolean }) => (
    <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {required && <Text style={styles.requiredStar}>*</Text>}
        {fieldName && <ConfidenceBadge draft={draft} field={fieldName} />}
    </View>
);

const ReviewInput = ({ label, draft, fieldName, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, required = false, maxLength }: any) => (
    <View style={styles.inputContainer}>
        <FieldLabel label={label} draft={draft} fieldName={fieldName} required={required} />
        <BlurView intensity={20} tint="dark" style={[styles.inputWrapper, multiline && styles.inputWrapperMultiline]}>
            <TextInput
                style={[styles.input, multiline && styles.inputMultiline]}
                value={value?.toString() || ''}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType={keyboardType}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
                maxLength={maxLength}
            />
        </BlurView>
    </View>
);

export default function ImportReviewScreen({ draft, onContinue, onCancel, onReImport }: ImportReviewScreenProps) {
    const [fields, setFields] = useState<Partial<PropertyListing>>(draft.fields);

    const player = useVideoPlayer(fields.videoUrl || '', player => {
        player.loop = true;
    });

    useEffect(() => {
        if (fields.videoUrl && player) {
            console.log(`[ImportReviewScreen] New Video URL detected: ${fields.videoUrl.substring(0, 50)}...`);
            player.play();
        }
    }, [fields.videoUrl, player]);

    const updateField = (key: keyof PropertyListing, value: any) => {
        setFields(prev => ({ ...prev, [key]: value }));
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['rgba(255, 144, 102, 0.05)', 'transparent']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>REVISAR IMPORTAÇÃO</Text>
                        <Text style={styles.headerSubtitle}>{draft.importMetadata?.sourcePlatform || 'Website'}</Text>
                    </View>
                    <TouchableOpacity onPress={onReImport} style={styles.headerButton}>
                        <Ionicons name="refresh" size={20} color="#ff9066" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Section: Video Preview - NOW AT THE TOP */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Ionicons name="videocam" size={18} color="#ff9066" />
                            </View>
                            <Text style={styles.sectionTitle}>PRÉVIA DO VÍDEO</Text>
                        </View>

                        {fields.videoUrl ? (
                            <View style={styles.videoPreviewContainer}>
                                <VideoView
                                    player={player}
                                    style={styles.videoPreview}
                                    allowsPictureInPicture
                                />
                                <View style={styles.videoOverlay}>
                                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                                    <Text style={styles.videoOverlayText}>VÍDEO EXTRAÍDO</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={[styles.videoSuccessBox, { backgroundColor: 'rgba(255, 59, 48, 0.1)', borderColor: 'rgba(255, 59, 48, 0.2)' }]}>
                                <Ionicons name="videocam-off" size={20} color="#FF3B30" />
                                <Text style={[styles.videoSuccessText, { color: '#FF3B30' }]}>VÍDEO NÃO ENCONTRADO (LINK PRIVADO?)</Text>
                            </View>
                        )}
                    </View>

                    {/* Warning Summary */}
                    {draft.importMetadata?.importWarnings && draft.importMetadata.importWarnings.length > 0 && (
                        <View style={styles.warningBox}>
                            <Ionicons name="warning" size={20} color="#FFCC00" />
                            <View style={styles.warningTextContainer}>
                                <Text style={styles.warningTitle}>AVISOS DE IMPORTAÇÃO</Text>
                                {draft.importMetadata.importWarnings.map((w, i) => (
                                    <Text key={i} style={styles.warningText}>• {w}</Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Section: Basic Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Ionicons name="information-circle" size={18} color="#ff9066" />
                            </View>
                            <Text style={styles.sectionTitle}>INFORMAÇÕES BÁSICAS</Text>
                        </View>

                        <ReviewInput
                            label="Título do Anúncio"
                            draft={draft}
                            fieldName="listingTitle"
                            value={fields.listingTitle}
                            onChangeText={(t: string) => updateField('listingTitle', t)}
                            placeholder="Ex: Apartamento em Copacabana"
                            required
                        />

                        <ReviewInput
                            label="Descrição"
                            draft={draft}
                            fieldName="descriptionLong"
                            value={fields.descriptionLong}
                            onChangeText={(t: string) => updateField('descriptionLong', t)}
                            placeholder="Descrição completa do imóvel..."
                            multiline
                        />
                    </View>

                    {/* Section: Price */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Ionicons name="cash" size={18} color="#ff9066" />
                            </View>
                            <Text style={styles.sectionTitle}>VALORES E DETALHES</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <FieldLabel label="Tipo de Anúncio" draft={draft} fieldName="listingType" required />
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[styles.typeButton, fields.listingType === 'sale' && styles.typeButtonActive]}
                                        onPress={() => updateField('listingType', 'sale')}
                                    >
                                        <Text style={[styles.typeButtonText, fields.listingType === 'sale' && styles.typeButtonTextActive]}>VENDA</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.typeButton, fields.listingType === 'rent' && styles.typeButtonActive]}
                                        onPress={() => updateField('listingType', 'rent')}
                                    >
                                        <Text style={[styles.typeButtonText, fields.listingType === 'rent' && styles.typeButtonTextActive]}>ALUGUEL</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 2 }}>
                                <ReviewInput
                                    label="Preço"
                                    draft={draft}
                                    fieldName="price"
                                    value={formatCurrency(fields.price || 0)}
                                    onChangeText={(t: string) => {
                                        const num = parseFloat(t.replace(/\D/g, '')) || 0;
                                        updateField('price', num);
                                    }}
                                    keyboardType="numeric"
                                    required
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label="Moeda"
                                    draft={draft}
                                    fieldName="currency"
                                    value={fields.currency || 'BRL'}
                                    onChangeText={(t: string) => updateField('currency', t)}
                                    placeholder="BRL"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label="Condomínio"
                                    draft={draft}
                                    fieldName="condoFee"
                                    value={formatCurrency(fields.condoFee || 0)}
                                    onChangeText={(t: string) => {
                                        const num = parseFloat(t.replace(/\D/g, '')) || 0;
                                        updateField('condoFee', num);
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label="IPTU"
                                    draft={draft}
                                    fieldName="iptu"
                                    value={formatCurrency(fields.iptu || 0)}
                                    onChangeText={(t: string) => {
                                        const num = parseFloat(t.replace(/\D/g, '')) || 0;
                                        updateField('iptu', num);
                                    }}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label="Quartos"
                                    draft={draft}
                                    fieldName="bedrooms"
                                    value={fields.bedrooms}
                                    onChangeText={(t: string) => updateField('bedrooms', parseInt(t) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label="Suítes"
                                    draft={draft}
                                    fieldName="suites"
                                    value={fields.suites}
                                    onChangeText={(t: string) => updateField('suites', parseInt(t) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label="Banheiros"
                                    draft={draft}
                                    fieldName="bathrooms"
                                    value={fields.bathrooms}
                                    onChangeText={(t: string) => updateField('bathrooms', parseInt(t) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label="Vagas"
                                    draft={draft}
                                    fieldName="parkingSpaces"
                                    value={fields.parkingSpaces}
                                    onChangeText={(t: string) => updateField('parkingSpaces', parseInt(t) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <ReviewInput
                                    label={`Área (${fields.areaUnit || 'm²'})`}
                                    draft={draft}
                                    fieldName="areaValue"
                                    value={fields.areaValue}
                                    onChangeText={(t: string) => updateField('areaValue', parseFloat(t) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <FieldLabel label="Tipo de Imóvel" draft={draft} fieldName="propertyType" />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelectorScroll}>
                                {PROPERTY_TYPES_MAP.map(type => (
                                    <TouchableOpacity 
                                        key={type.value}
                                        style={[styles.propertyTypeChip, fields.propertyType === type.value && styles.propertyTypeChipActive]}
                                        onPress={() => updateField('propertyType', type.value)}
                                    >
                                        <Text style={[styles.propertyTypeChipText, fields.propertyType === type.value && styles.propertyTypeChipTextActive]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Section: Location */}
                    <View style={[styles.section, { marginBottom: 40 }]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Ionicons name="location" size={18} color="#ff9066" />
                            </View>
                            <Text style={styles.sectionTitle}>LOCALIZAÇÃO</Text>
                        </View>

                        <ReviewInput
                            label="CEP"
                            draft={draft}
                            fieldName="postalCode"
                            value={formatCEP(fields.postalCode || '')}
                            onChangeText={(t: string) => updateField('postalCode', formatCEP(t))}
                            placeholder="00000-000"
                            keyboardType="numeric"
                            maxLength={9}
                        />

                        <ReviewInput
                            label="Cidade"
                            draft={draft}
                            fieldName="city"
                            value={fields.city}
                            onChangeText={(t: string) => updateField('city', t)}
                            required
                        />

                        <ReviewInput
                            label="Bairro"
                            draft={draft}
                            fieldName="neighborhood"
                            value={fields.neighborhood}
                            onChangeText={(t: string) => updateField('neighborhood', t)}
                        />

                        <ReviewInput
                            label="Endereço"
                            draft={draft}
                            fieldName="addressLine1"
                            value={fields.addressLine1}
                            onChangeText={(t: string) => updateField('addressLine1', t)}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => onContinue(fields)}
                    >
                        <LinearGradient
                            colors={['#ff9066', '#ff7043']}
                            style={styles.continueButton}
                        >
                            <Text style={styles.continueButtonText}>CONFIRMAR E CONTINUAR</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={() => onContinue({})} // Continue with defaults
                    >
                        <Text style={styles.skipButtonText}>PULAR REVISÃO E CONTINUAR</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0e0e0e',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 12,
        letterSpacing: 2,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 9,
        marginTop: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 204, 0, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 204, 0, 0.2)',
        padding: 20,
        borderRadius: 24,
        marginBottom: 32,
    },
    warningTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    warningTitle: {
        color: '#FFCC00',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 10,
        letterSpacing: 1,
        marginBottom: 8,
    },
    warningText: {
        color: 'rgba(255, 204, 0, 0.8)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Medium',
        lineHeight: 18,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    videoSuccessBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(52, 199, 89, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    videoSuccessText: {
        color: '#34C759',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 10,
        letterSpacing: 1,
        marginLeft: 12,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 144, 102, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: 'white',
        letterSpacing: -0.5,
    },
    videoPreviewContainer: {
        width: '100%',
        aspectRatio: 9 / 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
    },
    videoPreview: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    videoOverlayText: {
        color: '#34C759',
        fontSize: 10,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        marginLeft: 6,
        letterSpacing: 1,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    typeButton: {
        flex: 1,
        height: 54,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeButtonActive: {
        backgroundColor: 'rgba(255, 144, 102, 0.1)',
        borderColor: '#ff9066',
    },
    typeButtonText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 12,
        letterSpacing: 1,
    },
    typeButtonTextActive: {
        color: '#ff9066',
    },
    typeSelectorScroll: {
        marginBottom: 8,
    },
    propertyTypeChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    propertyTypeChipActive: {
        backgroundColor: 'rgba(255, 144, 102, 0.1)',
        borderColor: '#ff9066',
    },
    propertyTypeChipText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 12,
    },
    propertyTypeChipTextActive: {
        color: '#ff9066',
    },
    inputContainer: {
        marginBottom: 24,
    },
    fieldLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginLeft: 4,
    },
    fieldLabel: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    requiredStar: {
        color: '#FF3B30',
        marginLeft: 4,
    },
    confidenceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 12,
    },
    confidenceDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    confidenceText: {
        fontSize: 8,
        fontFamily: 'PlusJakartaSans-ExtraBold',
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        minHeight: 64,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    inputWrapperMultiline: {
        paddingVertical: 16,
        minHeight: 120,
    },
    input: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 16,
    },
    inputMultiline: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        backgroundColor: '#0e0e0e',
    },
    continueButton: {
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    continueButtonText: {
        color: 'white',
        fontFamily: 'PlusJakartaSans-ExtraBold',
        fontSize: 14,
        letterSpacing: 2,
    },
    skipButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    skipButtonText: {
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 10,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
});
