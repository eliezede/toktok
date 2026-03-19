import React, { forwardRef, useMemo } from 'react';
import { View, Text } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

interface BlogSheetProps {
    onClose: () => void;
}

const BlogSheet = forwardRef<BottomSheetModal, BlogSheetProps>(({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['40%'], []);

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
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
            <BottomSheetView className="flex-1 p-8 items-center justify-center">
                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="megaphone-outline" size={40} color="#ff9066" />
                </View>
                <Text className="text-white text-3xl font-black mb-2">Blog TokTok</Text>
                <Text className="text-primary font-bold text-lg uppercase tracking-widest">Brevemente</Text>
                <Text className="text-gray-400 text-center mt-4 text-base leading-6">
                    Estamos preparando conteúdos exclusivos sobre o mercado imobiliário para você. Fique atento!
                </Text>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default BlogSheet;
