import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React, { useMemo, forwardRef, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

interface FilterSheetProps {
    onApply: (filters: any) => void;
    onClose: () => void;
}

const FilterSheet = forwardRef<BottomSheetModal, FilterSheetProps>(
    ({ onApply, onClose }, ref) => {
        const [priceRange, setPriceRange] = useState('Todas');
        const [purpose, setPurpose] = useState('Todos');
        const [bedrooms, setBedrooms] = useState('Qualquer');
        const [suites, setSuites] = useState('Qualquer');
        const [bathrooms, setBathrooms] = useState('Qualquer');
        const [hideSold, setHideSold] = useState(false);
        const [hideReserved, setHideReserved] = useState(false);
        const [furnished, setFurnished] = useState(false);
        const [petFriendly, setPetFriendly] = useState(false);
        const [acceptsFinancing, setAcceptsFinancing] = useState(false);
        const [acceptsExchange, setAcceptsExchange] = useState(false);
        const [parkingSpaces, setParkingSpaces] = useState('Qualquer');
        const [areaRange, setAreaRange] = useState('Todas');
        const [amenities, setAmenities] = useState<string[]>([]);

        const snapPoints = useMemo(() => ['70%', '90%'], []);

        const priceOptions = ['Todas', 'Até R$ 500k', 'R$ 500k - 1M', 'R$ 1M - 2M', 'Acima de 2M'];
        const areaOptions = ['Todas', 'Até 50m²', '50 - 100m²', '100 - 200m²', 'Acima de 200m²'];
        const roomOptions = ['Qualquer', '1+', '2+', '3+', '4+'];
        const parkingOptions = ['Qualquer', '1+', '2+', '3+', '4+'];
        
        const AMENITY_OPTIONS = [
            'Piscina', 'Academia', 'Churrasqueira', 'Salão de Festas', 'Playground', 
            'Sauna', 'Quadra', 'Varanda', 'Portaria 24h', 'Ar Condicionado', 'Elevador'
        ];

        const handleReset = () => {
            setPriceRange('Todas');
            setPurpose('Todos');
            setBedrooms('Qualquer');
            setSuites('Qualquer');
            setBathrooms('Qualquer');
            setHideSold(false);
            setHideReserved(false);
            setFurnished(false);
            setPetFriendly(false);
            setAcceptsFinancing(false);
            setAcceptsExchange(false);
            setParkingSpaces('Qualquer');
            setAreaRange('Todas');
            setAmenities([]);
        };

        const handleApply = () => {
            onApply({
                priceRange,
                purpose,
                bedrooms,
                suites,
                bathrooms,
                hideSold,
                hideReserved,
                furnished,
                petFriendly,
                acceptsFinancing,
                acceptsExchange,
                parkingSpaces,
                areaRange,
                amenities
            });
            onClose();
        };

        const renderOption = (options: string[], current: string, setter: (val: string) => void) => (
            <View style={styles.optionGrid}>
                {options.map((opt) => (
                    <TouchableOpacity 
                        key={opt} 
                        style={[
                            styles.chip, 
                            current === opt && styles.chipActive
                        ]} 
                        onPress={() => setter(opt)}
                    >
                        <Text style={[
                            styles.chipText, 
                            current === opt && styles.chipTextActive
                        ]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );

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
                    <TouchableOpacity onPress={handleReset}>
                        <Text style={styles.resetBtn}>Resetar</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Filtros</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <BottomSheetScrollView contentContainerStyle={styles.container}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tipo de Negócio</Text>
                        {renderOption(['Todos', 'Venda', 'Aluguel', 'Temporada'], purpose, setPurpose)}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Faixa de Preço</Text>
                        {renderOption(priceOptions, priceRange, setPriceRange)}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Área Útil</Text>
                        {renderOption(areaOptions, areaRange, setAreaRange)}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Diferenciais e Negociação</Text>
                        <View style={styles.optionGrid}>
                            <TouchableOpacity 
                                style={[styles.chip, furnished && styles.chipActive]} 
                                onPress={() => setFurnished(!furnished)}
                            >
                                <Text style={[styles.chipText, furnished && styles.chipTextActive]}>Mobiliado</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.chip, petFriendly && styles.chipActive]} 
                                onPress={() => setPetFriendly(!petFriendly)}
                            >
                                <Text style={[styles.chipText, petFriendly && styles.chipTextActive]}>Pet Friendly</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.chip, acceptsFinancing && styles.chipActive]} 
                                onPress={() => setAcceptsFinancing(!acceptsFinancing)}
                            >
                                <Text style={[styles.chipText, acceptsFinancing && styles.chipTextActive]}>Financiamento</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.chip, acceptsExchange && styles.chipActive]} 
                                onPress={() => setAcceptsExchange(!acceptsExchange)}
                            >
                                <Text style={[styles.chipText, acceptsExchange && styles.chipTextActive]}>Aceita Permuta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Amenidades do Imóvel / Condomínio</Text>
                        <View style={styles.optionGrid}>
                            {AMENITY_OPTIONS.map(opt => (
                                <TouchableOpacity 
                                    key={opt}
                                    style={[styles.chip, amenities.includes(opt) && styles.chipActive]} 
                                    onPress={() => {
                                        if (amenities.includes(opt)) setAmenities(amenities.filter(a => a !== opt));
                                        else setAmenities([...amenities, opt]);
                                    }}
                                >
                                    <Text style={[styles.chipText, amenities.includes(opt) && styles.chipTextActive]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quartos</Text>
                        {renderOption(roomOptions, bedrooms, setBedrooms)}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Banheiros</Text>
                        {renderOption(roomOptions, bathrooms, setBathrooms)}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vagas de Garagem</Text>
                        {renderOption(parkingOptions, parkingSpaces, setParkingSpaces)}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferências</Text>
                        <View style={styles.optionGrid}>
                            <TouchableOpacity 
                                style={[styles.chip, hideSold && styles.chipActive]} 
                                onPress={() => setHideSold(!hideSold)}
                            >
                                <Text style={[styles.chipText, hideSold && styles.chipTextActive]}>Esconder Vendidos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.chip, hideReserved && styles.chipActive]} 
                                onPress={() => setHideReserved(!hideReserved)}
                            >
                                <Text style={[styles.chipText, hideReserved && styles.chipTextActive]}>Esconder Reservados</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                        <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
                    </TouchableOpacity>
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
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontSize: 20,
        fontFamily: 'PlusJakartaSans-Bold',
        color: 'white',
    },
    resetBtn: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
    },
    container: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 60,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-Bold',
        marginBottom: 16,
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    chip: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    chipActive: {
        backgroundColor: 'rgba(255, 144, 102, 0.1)',
        borderColor: '#ff9066',
    },
    chipText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 13,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    chipTextActive: {
        color: '#ff9066',
    },
    applyBtn: {
        backgroundColor: '#ff9066',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    applyBtnText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-Bold',
    },
});

export default FilterSheet;
