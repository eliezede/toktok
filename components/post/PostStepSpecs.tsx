import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FormInput, SelectChip, FilterChip } from '../property/PropertyFormElements';
import { PropertyType } from '../../types';

const AMENITY_OPTIONS = [
    'Piscina', 'Academia', 'Churrasqueira', 'Salão de Festas', 'Playground', 
    'Sauna', 'Quadra', 'Varanda', 'Portaria 24h', 'Ar Condicionado', 'Elevador'
];

interface PostStepSpecsProps {
    propertyType: PropertyType;
    setPropertyType: (type: PropertyType) => void;
    bedrooms: string;
    setBedrooms: (text: string) => void;
    suites: string;
    setSuites: (text: string) => void;
    bathrooms: string;
    setBathrooms: (text: string) => void;
    squareMeters: string;
    setSquareMeters: (text: string) => void;
    furnished: boolean;
    setFurnished: (val: boolean) => void;
    petFriendly: boolean;
    setPetFriendly: (val: boolean) => void;
    parkingSpaces: string;
    setParkingSpaces: (text: string) => void;
    acceptsFinancing: boolean;
    setAcceptsFinancing: (val: boolean) => void;
    acceptsExchange: boolean;
    setAcceptsExchange: (val: boolean) => void;
    floor: string;
    setFloor: (text: string) => void;
    yearBuilt: string;
    setYearBuilt: (text: string) => void;
    amenities: string[];
    setAmenities: (val: string[]) => void;
    onBack: () => void;
    onNext: () => void;
}

export const PostStepSpecs = ({
    propertyType,
    setPropertyType,
    bedrooms,
    setBedrooms,
    suites,
    setSuites,
    bathrooms,
    setBathrooms,
    squareMeters,
    setSquareMeters,
    furnished,
    setFurnished,
    petFriendly,
    setPetFriendly,
    parkingSpaces,
    setParkingSpaces,
    acceptsFinancing,
    setAcceptsFinancing,
    acceptsExchange,
    setAcceptsExchange,
    floor,
    setFloor,
    yearBuilt,
    setYearBuilt,
    amenities,
    setAmenities,
    onBack,
    onNext
}: PostStepSpecsProps) => {
    return (
        <View>
            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: 0, marginBottom: 16 }}>Passo 3: Especificações</Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Tipo de Imóvel</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                <SelectChip selected={propertyType === 'apartment'} onSelect={() => setPropertyType('apartment')} label="Apto" />
                <SelectChip selected={propertyType === 'house'} onSelect={() => setPropertyType('house')} label="Casa" />
                <SelectChip selected={propertyType === 'villa'} onSelect={() => setPropertyType('villa')} label="Cobert" />
                <SelectChip selected={propertyType === 'land'} onSelect={() => setPropertyType('land')} label="Terr" />
                <SelectChip selected={propertyType === 'commercial'} onSelect={() => setPropertyType('commercial')} label="Comerc" />
                <SelectChip selected={propertyType === 'penthouse'} onSelect={() => setPropertyType('penthouse')} label="Penth" />
                <SelectChip selected={propertyType === 'farm'} onSelect={() => setPropertyType('farm')} label="Faz" />
                <SelectChip selected={propertyType === 'studio'} onSelect={() => setPropertyType('studio')} label="Studio" />
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <FormInput label="Quartos" placeholder="0" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" icon="bed-outline" maxLength={2} />
                </View>
                <View style={{ flex: 1 }}>
                    <FormInput label="Suítes" placeholder="0" value={suites} onChangeText={setSuites} keyboardType="numeric" icon="star-outline" maxLength={2} />
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <FormInput label="Banheiros" placeholder="0" value={bathrooms} onChangeText={setBathrooms} keyboardType="numeric" icon="water-outline" maxLength={2} />
                </View>
                <View style={{ flex: 1 }}>
                    <FormInput label="Área (m²)" placeholder="0" value={squareMeters} onChangeText={setSquareMeters} keyboardType="numeric" icon="expand-outline" maxLength={6} />
                </View>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <FormInput label="Vagas" placeholder="0" value={parkingSpaces} onChangeText={setParkingSpaces} keyboardType="numeric" icon="car-outline" maxLength={2} />
                </View>
                <View style={{ flex: 1 }}>
                    <FormInput label="Andar" placeholder="10" value={floor} onChangeText={setFloor} keyboardType="numeric" icon="layers-outline" maxLength={3} />
                </View>
                <View style={{ flex: 1 }}>
                    <FormInput label="Ano" placeholder="2020" value={yearBuilt} onChangeText={setYearBuilt} keyboardType="numeric" icon="calendar-outline" maxLength={4} />
                </View>
            </View>

            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 8, marginBottom: 8, marginLeft: 4 }}>Diferenciais e Negociação</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <SelectChip selected={furnished} onSelect={() => setFurnished(!furnished)} label="Mobiliado" />
                <SelectChip selected={petFriendly} onSelect={() => setPetFriendly(!petFriendly)} label="Pet Friendly" />
                <SelectChip selected={acceptsFinancing} onSelect={() => setAcceptsFinancing(!acceptsFinancing)} label="Financ" />
                <SelectChip selected={acceptsExchange} onSelect={() => setAcceptsExchange(!acceptsExchange)} label="Permuta" />
            </View>

            <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 8, marginLeft: 4 }}>Comodidades</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {AMENITY_OPTIONS.map(option => (
                    <FilterChip 
                        key={option}
                        label={option}
                        selected={amenities.includes(option)}
                        onSelect={() => {
                            if (amenities.includes(option)) {
                                setAmenities(amenities.filter(i => i !== option));
                            } else {
                                setAmenities([...amenities, option]);
                            }
                        }}
                    />
                ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 24 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }} onPress={onBack}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 2, backgroundColor: '#ff9066', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }} onPress={onNext}>
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.5 }}>Localização</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
