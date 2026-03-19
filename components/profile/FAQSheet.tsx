import React, { forwardRef, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

interface FAQSheetProps {
    onClose: () => void;
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <View className="mb-4 border-b border-white/5 pb-4">
            <TouchableOpacity 
                onPress={() => setIsOpen(!isOpen)}
                className="flex-row items-center justify-between"
            >
                <Text className="text-white font-bold text-lg flex-1 pr-4">{question}</Text>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
            {isOpen && (
                <Text className="text-gray-400 text-base mt-3 leading-6">
                    {answer}
                </Text>
            )}
        </View>
    );
};

const FAQSheet = forwardRef<BottomSheetModal, FAQSheetProps>(({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['75%'], []);

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
                <Text className="text-white text-2xl font-black mb-6">FAQ</Text>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    <FAQItem 
                        question="Como publico um imóvel?" 
                        answer="Para publicar, você precisa de uma conta de Agente ou Imobiliária. Basta clicar no ícone de '+' na barra inferior e seguir as instruções para gravar ou carregar seu vídeo."
                    />
                    <FAQItem 
                        question="O TokTok é gratuito?" 
                        answer="Sim, o download e a navegação básica são gratuitos. Oferecemos planos Pro para agentes que desejam recursos avançados de marketing e visibilidade."
                    />
                    <FAQItem 
                        question="Como entro em contato com um agente?" 
                        answer="Em cada vídeo de imóvel, você encontrará botões de contato direto (WhatsApp, Ligação ou Chat) no perfil do anunciante."
                    />
                    <FAQItem 
                        question="Posso salvar imóveis favoritos?" 
                        answer="Sim, basta clicar no ícone de coração. Se você criar uma conta, seus favoritos serão sincronizados em todos os seus dispositivos."
                    />
                </ScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

export default FAQSheet;
