import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useMemo, useState, useEffect, forwardRef } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { UserProfile } from '../../types';
import { UserService } from '../../services/userService';
import { formatCurrency, unformatCurrency } from '../../utils/currency';
import { FilterChip } from '../property/PropertyFormElements';

const INTEREST_OPTIONS = [
    'Apartamento', 'Casa', 'Cobertura', 'Terreno', 'Comercial', 
    'Sítio', 'Fazenda', 'Loft', 'Studio', 'Lançamento', 'Pronto para Morar'
];

const BRAZIL_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface EditProfileSheetProps {
    user: any;
    profile: UserProfile | null;
    onClose: () => void;
}

const EditProfileSheet = forwardRef<BottomSheetModal, EditProfileSheetProps>(
    ({ user, profile, onClose }, ref) => {
        const [fullName, setFullName] = useState('');
        const [bio, setBio] = useState('');
        const [phone, setPhone] = useState('');
        const [whatsapp, setWhatsapp] = useState('');
        
        // Agent specifics
        const [creciNumber, setCreciNumber] = useState('');
        const [creciState, setCreciState] = useState('');
        const [experienceYears, setExperienceYears] = useState('');
        
        // Agency specifics
        const [agencyName, setAgencyName] = useState('');
        const [cnpj, setCnpj] = useState('');
        const [creciCompany, setCreciCompany] = useState('');
        const [teamSize, setTeamSize] = useState('');
        const [foundedYear, setFoundedYear] = useState('');
        const [instagram, setInstagram] = useState('');
        const [linkedin, setLinkedin] = useState('');
        const [website, setWebsite] = useState('');

        // Buyer specifics
        const [interests, setInterests] = useState<string[]>([]);
        const [minBudget, setMinBudget] = useState('');
        const [maxBudget, setMaxBudget] = useState('');

        const [isSaving, setIsSaving] = useState(false);

        const snapPoints = useMemo(() => ['75%', '90%'], []);

        // Sync with profile data
        useEffect(() => {
            if (profile) {
                setFullName(profile.fullName || '');
                setBio(profile.bio || '');
                setPhone(profile.phone || '');
                setWhatsapp(profile.whatsapp || '');
                
                // Agent
                setCreciNumber(profile.creciNumber || '');
                setCreciState(profile.creciState || '');
                setExperienceYears(profile.experienceYears?.toString() || '');
                
                // Agency
                setAgencyName(profile.agencyName || '');
                setCnpj(profile.cnpj || '');
                setCreciCompany(profile.creciCompany || '');
                setTeamSize(profile.teamSize?.toString() || '');
                setFoundedYear(profile.foundedYear?.toString() || '');
                
                setInstagram(profile.socialMedia?.instagram || '');
                setLinkedin(profile.socialMedia?.linkedin || '');
                setWebsite(profile.socialMedia?.website || '');

                // Buyer
                setInterests(profile.interests || []);
                setMinBudget(formatCurrency(profile.budgetRange?.min?.toString() || ''));
                setMaxBudget(formatCurrency(profile.budgetRange?.max?.toString() || ''));
            }
        }, [profile]);

        const handleSave = async () => {
            if (!user) return;
            
            setIsSaving(true);
            try {
                const updateData: Partial<UserProfile> = {
                    fullName,
                    bio,
                    whatsapp,
                    socialMedia: {
                        instagram,
                        linkedin,
                        website
                    }
                };

                if (profile?.role === 'agent') {
                    updateData.creciNumber = creciNumber;
                    updateData.creciState = creciState;
                    updateData.experienceYears = parseInt(experienceYears) || 0;
                } else if (profile?.role === 'agency') {
                    updateData.agencyName = agencyName;
                    updateData.cnpj = cnpj;
                    updateData.creciCompany = creciCompany;
                    updateData.teamSize = parseInt(teamSize) || 0;
                    updateData.foundedYear = parseInt(foundedYear) || 0;
                } else if (profile?.role === 'buyer') {
                    updateData.interests = interests;
                    if (minBudget || maxBudget) {
                        updateData.budgetRange = {
                            min: parseInt(unformatCurrency(minBudget)) || 0,
                            max: parseInt(unformatCurrency(maxBudget)) || 0
                        };
                    }
                }

                await UserService.updateProfile(user.uid, updateData);
                Alert.alert("Sucesso", "Seu perfil foi atualizado!");
                onClose();
            } catch (error) {
                console.error("Error saving profile:", error);
                Alert.alert("Erro", "Não foi possível salvar as alterações.");
            } finally {
                setIsSaving(false);
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
                    <Text style={styles.title}>Editar Perfil</Text>
                    <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#ff9066" />
                        ) : (
                            <Text style={styles.saveBtn}>Salvar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.container}>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome Completo</Text>
                            <BottomSheetTextInput 
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="Seu nome"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio / Apresentação</Text>
                            <BottomSheetTextInput 
                                style={[styles.input, styles.textArea]}
                                multiline
                                numberOfLines={4}
                                value={bio}
                                onChangeText={setBio}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="Conte um pouco sobre sua experiência..."
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>WhatsApp de Contato (Direct)</Text>
                            <BottomSheetTextInput 
                                style={styles.input}
                                value={whatsapp}
                                onChangeText={setWhatsapp}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="(11) 99999-9999"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Telefone Fixo / Alternativo</Text>
                            <BottomSheetTextInput 
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="(11) 3333-3333"
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.sectionDivider} />
                        <Text style={styles.sectionTitle}>Redes e Links</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Instagram</Text>
                            <BottomSheetTextInput 
                                style={styles.input}
                                value={instagram}
                                onChangeText={setInstagram}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="@seuusuario"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>LinkedIn</Text>
                            <BottomSheetTextInput 
                                style={styles.input}
                                value={linkedin}
                                onChangeText={setLinkedin}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="linkedin.com/in/usuario"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Website / Portfolio</Text>
                            <BottomSheetTextInput 
                                style={styles.input}
                                value={website}
                                onChangeText={setWebsite}
                                placeholderTextColor="rgba(255,255,255,0.2)"
                                placeholder="www.seusite.com.br"
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        </View>

                        {profile?.role === 'agent' && (
                            <>
                                <View style={styles.sectionDivider} />
                                <Text style={styles.sectionTitle}>Dados Profissionais (Corretor)</Text>
                                
                                <View style={styles.row}>
                                    <View style={{ flex: 2 }}>
                                        <Text style={styles.label}>Número do CRECI</Text>
                                        <BottomSheetTextInput 
                                            style={styles.input}
                                            value={creciNumber}
                                            onChangeText={setCreciNumber}
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            placeholder="123456"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Estado (UF)</Text>
                                        <BottomSheetScrollView 
                                            horizontal 
                                            showsHorizontalScrollIndicator={false}
                                            style={{ marginTop: 8 }}
                                        >
                                            {BRAZIL_STATES.map(state => (
                                                <FilterChip 
                                                    key={state}
                                                    label={state}
                                                    selected={creciState === state}
                                                    onSelect={() => setCreciState(state)}
                                                />
                                            ))}
                                        </BottomSheetScrollView>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Anos de Experiência</Text>
                                    <BottomSheetTextInput 
                                        style={styles.input}
                                        value={experienceYears}
                                        onChangeText={setExperienceYears}
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        placeholder="5"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </>
                        )}

                        {profile?.role === 'agency' && (
                            <>
                                <View style={styles.sectionDivider} />
                                <Text style={styles.sectionTitle}>Dados da Imobiliária</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nome Fantasia</Text>
                                    <BottomSheetTextInput 
                                        style={styles.input}
                                        value={agencyName}
                                        onChangeText={setAgencyName}
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        placeholder="Minha Imobiliária"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>CNPJ</Text>
                                    <BottomSheetTextInput 
                                        style={styles.input}
                                        value={cnpj}
                                        onChangeText={setCnpj}
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        placeholder="00.000.000/0000-00"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>CRECI Jurídico (J)</Text>
                                    <BottomSheetTextInput 
                                        style={styles.input}
                                        value={creciCompany}
                                        onChangeText={setCreciCompany}
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        placeholder="123456-J"
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Tamanho da Equipe</Text>
                                        <BottomSheetTextInput 
                                            style={styles.input}
                                            value={teamSize}
                                            onChangeText={setTeamSize}
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            placeholder="10"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Ano de Fundação</Text>
                                        <BottomSheetTextInput 
                                            style={styles.input}
                                            value={foundedYear}
                                            onChangeText={setFoundedYear}
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            placeholder="1995"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </>
                        )}

                        {profile?.role === 'buyer' && (
                            <>
                                <View style={styles.sectionDivider} />
                                <Text style={styles.sectionTitle}>Preferências de Compra</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>O que você procura?</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                                        {INTEREST_OPTIONS.map(option => (
                                            <FilterChip 
                                                key={option}
                                                label={option}
                                                selected={interests.includes(option)}
                                                onSelect={() => {
                                                    if (interests.includes(option)) {
                                                        setInterests(interests.filter(i => i !== option));
                                                    } else {
                                                        setInterests([...interests, option]);
                                                    }
                                                }}
                                            />
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Orçamento Mínimo</Text>
                                        <BottomSheetTextInput 
                                            style={styles.input}
                                            value={minBudget}
                                            onChangeText={(text) => setMinBudget(formatCurrency(text))}
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            placeholder="500.000"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>Orçamento Máximo</Text>
                                        <BottomSheetTextInput 
                                            style={styles.input}
                                            value={maxBudget}
                                            onChangeText={(text) => setMaxBudget(formatCurrency(text))}
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            placeholder="1.500.000"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </BottomSheetScrollView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans-Bold',
        color: 'white',
    },
    saveBtn: {
        color: '#ff9066',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 16,
    },
    container: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ff9066',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: 'white',
        fontSize: 32,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    photoHint: {
        marginTop: 12,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Medium',
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 18,
        color: 'white',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-Medium',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    sectionDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 8,
    },
    sectionTitle: {
        color: '#ff9066',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
});

export default EditProfileSheet;
