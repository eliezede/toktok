import React, { forwardRef, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

interface AppearanceSheetProps {
    onClose: () => void;
}

const AppearanceSheet = forwardRef<BottomSheetModal, AppearanceSheetProps>(({ onClose }, ref) => {
    const { colorScheme, setColorScheme } = useColorScheme();
    
    const snapPoints = useMemo(() => ['35%'], []);

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    );

    const Option = ({ label, value, icon }: { label: string, value: 'light' | 'dark' | 'system', icon: any }) => (
        <TouchableOpacity 
            onPress={() => {
                setColorScheme(value);
                onClose();
            }}
            className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 ${colorScheme === value ? 'bg-primary/10 border border-primary/30' : 'bg-white/5'}`}
        >
            <View className="flex-row items-center">
                <Ionicons name={icon} size={20} color={colorScheme === value ? '#ff9066' : '#999'} />
                <Text className={`ml-4 text-base font-bold ${colorScheme === value ? 'text-primary' : 'text-white'}`}>{label}</Text>
            </View>
            {colorScheme === value && <Ionicons name="checkmark-circle" size={20} color="#ff9066" />}
        </TouchableOpacity>
    );

    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose
            backgroundStyle={{ backgroundColor: '#131313' }}
            handleIndicatorStyle={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        >
            <BottomSheetView className="flex-1 p-6">
                <Text className="text-white text-xl font-black mb-6">Aparência</Text>
                
                <View>
                    <Option label="Claro" value="light" icon="sunny-outline" />
                    <Option label="Escuro" value="dark" icon="moon-outline" />
                    <Option label="Sistema" value="system" icon="phone-portrait-outline" />
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default AppearanceSheet;
