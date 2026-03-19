import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FormInput, SelectChip } from '../property/PropertyFormElements';
import { formatCurrency } from '../../utils/currency';

interface PostStepBasicInfoProps {
    operation: 'sale' | 'rent' | 'seasonal';
    setOperation: (op: 'sale' | 'rent' | 'seasonal') => void;
    title: string;
    setTitle: (text: string) => void;
    description: string;
    setDescription: (text: string) => void;
    price: string;
    setPrice: (text: string) => void;
    condoFee: string;
    setCondoFee: (text: string) => void;
    iptu: string;
    setIptu: (text: string) => void;
    onBack: () => void;
    onNext: () => void;
}

export const PostStepBasicInfo = ({
    operation,
    setOperation,
    title,
    setTitle,
    description,
    setDescription,
    price,
    setPrice,
    condoFee,
    setCondoFee,
    iptu,
    setIptu,
    onBack,
    onNext
}: PostStepBasicInfoProps) => {
    return (
        <View>
            <Text style={{ fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', color: 'white', textTransform: 'uppercase', letterSpacing: 0, marginBottom: 16 }}>Passo 2: Info Básica</Text>
            <View style={{ marginBottom: 20 }}>
                <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Tipo de Oferta</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    <SelectChip selected={operation === 'sale'} onSelect={() => setOperation('sale')} label="Venda" />
                    <SelectChip selected={operation === 'rent'} onSelect={() => setOperation('rent')} label="Aluguel" />
                    <SelectChip selected={operation === 'seasonal'} onSelect={() => setOperation('seasonal')} label="Temporada" />
                </View>
            </View>
            <FormInput label="Título do Anúncio" placeholder="Ex: Apartamento em Copacabana" value={title} onChangeText={setTitle} icon="text-outline" />
            <FormInput label="Descrição" placeholder="Detalhes que fazem a diferença..." value={description} onChangeText={setDescription} multiline numberOfLines={3} icon="reader-outline" />
            <FormInput 
                label="Preço (R$)" 
                placeholder="0,00" 
                value={price} 
                onChangeText={(text) => setPrice(formatCurrency(text))} 
                keyboardType="numeric" 
                icon="cash-outline" 
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <FormInput 
                        label="Condomínio" 
                        placeholder="0,00" 
                        value={condoFee} 
                        onChangeText={(text) => setCondoFee(formatCurrency(text))} 
                        keyboardType="numeric" 
                        icon="business-outline" 
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <FormInput 
                        label="IPTU / Taxas" 
                        placeholder="0,00" 
                        value={iptu} 
                        onChangeText={(text) => setIptu(formatCurrency(text))} 
                        keyboardType="numeric" 
                        icon="receipt-outline" 
                    />
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 24 }}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }} onPress={onBack}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'PlusJakartaSans-Bold', textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 2, backgroundColor: '#ff9066', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }} onPress={onNext}>
                    <Text style={{ color: 'white', fontFamily: 'PlusJakartaSans-Bold', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1.5 }}>Próximo Passo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
