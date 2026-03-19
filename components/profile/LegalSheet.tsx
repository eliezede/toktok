import React, { forwardRef, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface LegalSheetProps {
    onClose: () => void;
}

const LegalSheet = forwardRef<BottomSheetModal, LegalSheetProps>(({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['60%'], []);

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
            <BottomSheetView className="flex-1 p-8">
                <Text className="text-white text-2xl font-black mb-6">Aviso Legal</Text>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="text-gray-400 text-base leading-6 mb-4">
                        Este é um aviso legal genérico para o TokTok. Ao utilizar este aplicativo, você concorda com nossos termos de serviço e políticas de privacidade.
                    </Text>
                    <Text className="text-gray-400 text-base leading-6 mb-4">
                        O TokTok atua apenas como uma plataforma de divulgação de vídeos imobiliários. Não nos responsabilizamos pela veracidade das informações fornecidas pelos anunciantes.
                    </Text>
                    <Text className="text-gray-400 text-base leading-6 mb-4">
                        Recomendamos sempre a verificação presencial dos imóveis e a consulta de profissionais qualificados antes de qualquer transação financeira.
                    </Text>
                    <Text className="text-gray-400 text-base leading-6">
                        © 2026 TokTok Inc. Todos os direitos reservados.
                    </Text>
                </ScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default LegalSheet;
