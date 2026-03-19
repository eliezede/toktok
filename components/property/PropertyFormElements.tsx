import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean;
    numberOfLines?: number;
    icon?: keyof typeof Ionicons.glyphMap;
    maxLength?: number;
}

export const FormInput = ({ 
    label, 
    placeholder, 
    value, 
    onChangeText, 
    keyboardType = 'default', 
    multiline = false, 
    numberOfLines = 1, 
    icon,
    maxLength
}: FormInputProps) => (
    <View style={{ marginBottom: 16 }}>
        <Text style={{ 
            color: 'rgba(255, 255, 255, 0.4)', 
            fontFamily: 'PlusJakartaSans-Bold', 
            fontSize: 10, 
            textTransform: 'uppercase', 
            letterSpacing: 1, 
            marginBottom: 4, 
            marginLeft: 4 
        }}>{label}</Text>
        <BlurView 
            intensity={20} 
            tint="dark" 
            style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                borderRadius: 16, 
                borderStyle: 'solid', 
                borderWidth: 1, 
                borderColor: 'rgba(255, 255, 255, 0.1)', 
                paddingHorizontal: 14, 
                height: multiline ? (numberOfLines * 22 + 28) : 54, 
                overflow: 'hidden' 
            }}
        >
            {icon && <Ionicons name={icon} size={18} color="rgba(255, 255, 255, 0.4)" style={{ marginRight: 10 }} />}
            <TextInput
                style={{ 
                    flex: 1, 
                    color: 'white', 
                    fontFamily: 'PlusJakartaSans-Medium', 
                    fontSize: 15, 
                    textAlignVertical: multiline ? 'top' : 'center', 
                    paddingTop: multiline ? 12 : 0, 
                    paddingBottom: multiline ? 12 : 0 
                }}
                placeholder={placeholder}
                placeholderTextColor="rgba(255, 255, 255, 0.2)"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
                numberOfLines={numberOfLines}
                maxLength={maxLength}
            />
        </BlurView>
    </View>
);

interface SelectChipProps {
    selected: boolean;
    onSelect: () => void;
    label: string;
}

export const SelectChip = ({ selected, onSelect, label }: SelectChipProps) => (
    <TouchableOpacity
        onPress={onSelect}
        style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            marginRight: 8,
            borderStyle: 'solid',
            borderWidth: 2,
            borderColor: selected ? '#ff9066' : 'rgba(255, 255, 255, 0.05)',
            backgroundColor: selected ? 'rgba(255, 144, 102, 0.1)' : 'transparent'
        }}
    >
        <Text style={{ 
            fontFamily: 'PlusJakartaSans-Bold', 
            fontSize: 11, 
            textTransform: 'uppercase', 
            letterSpacing: 0.5, 
            color: selected ? '#ff9066' : 'rgba(255, 255, 255, 0.4)' 
        }}>
            {label}
        </Text>
    </TouchableOpacity>
);

export const FilterChip = ({ selected, onSelect, label }: SelectChipProps) => (
    <TouchableOpacity
        onPress={onSelect}
        style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            marginRight: 8,
            marginBottom: 8,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: selected ? '#ff9066' : 'rgba(255, 255, 255, 0.1)',
            backgroundColor: selected ? 'rgba(255, 144, 102, 0.1)' : 'rgba(255, 255, 255, 0.03)'
        }}
    >
        <Text style={{ 
            fontFamily: 'PlusJakartaSans-Bold', 
            fontSize: 11, 
            textTransform: 'uppercase', 
            letterSpacing: 0.5, 
            color: selected ? '#ff9066' : 'rgba(255, 255, 255, 0.4)' 
        }}>
            {label}
        </Text>
    </TouchableOpacity>
);

