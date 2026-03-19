import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FormInput } from '../property/PropertyFormElements';

interface PostStepLocationProps {
    city: string;
    setCity: (text: string) => void;
    neighborhood: string;
    setNeighborhood: (text: string) => void;
    address: string;
    setAddress: (text: string) => void;
    postalCode: string;
    setPostalCode: (text: string) => void;
    onBack: () => void;
    onNext: () => void;
}

export const PostStepLocation = ({
    city,
    setCity,
    neighborhood,
    setNeighborhood,
    address,
    setAddress,
    postalCode,
    setPostalCode,
    onBack,
    onNext
}: PostStepLocationProps) => {
    const formatCEP = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        if (numbers.length <= 5) return numbers;
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    };

    return (
        <View>
            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: 0, marginBottom: 16 }}>Passo 4: Localização</Text>
            <FormInput label="Cidade" placeholder="Cidade" value={city} onChangeText={setCity} icon="business-outline" />
            <FormInput label="Bairro" placeholder="Bairro" value={neighborhood} onChangeText={setNeighborhood} icon="map-outline" />
            <FormInput label="Endereço Completo" placeholder="Rua, Número, Complemento..." value={address} onChangeText={setAddress} icon="pin-outline" />
            <FormInput 
                label="CEP" 
                placeholder="00000-000" 
                value={formatCEP(postalCode)} 
                onChangeText={(t) => setPostalCode(formatCEP(t))} 
                keyboardType="numeric" 
                icon="mail-outline" 
                maxLength={9}
            />


            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 24 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }} onPress={onBack}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 2, backgroundColor: '#ff9066', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }} onPress={onNext}>
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.5 }}>Quase lá</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
