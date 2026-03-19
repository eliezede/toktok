import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Import Specific Sheets
import AppearanceSheet from './AppearanceSheet';
import LegalSheet from './LegalSheet';
import FAQSheet from './FAQSheet';
import BlogSheet from './BlogSheet';

const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-[2px] mt-8 mb-4 ml-1">
        {title}
    </Text>
);

const ProfileItem = ({ icon, label, action, showChevron = true }: { icon: any, label: string, action: () => void, showChevron?: boolean }) => (
    <TouchableOpacity 
        onPress={action}
        className="flex-row items-center justify-between p-4 border-b border-white/5 h-16"
    >
        <View className="flex-row items-center">
            <View className="w-8 items-center">
                <Ionicons name={icon} size={22} color="white" />
            </View>
            <Text className="ml-4 text-base font-bold text-white">{label}</Text>
        </View>
        {showChevron && <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />}
    </TouchableOpacity>
);

export default function GuestProfile() {
    // Sheet Refs
    const appearanceSheetRef = useRef<BottomSheetModal>(null);
    const legalSheetRef = useRef<BottomSheetModal>(null);
    const faqSheetRef = useRef<BottomSheetModal>(null);
    const blogSheetRef = useRef<BottomSheetModal>(null);

    // Handlers
    const handleLogin = () => router.push('/auth/login');
    
    // "Como voce quer usar o Toktok" corresponds to the role selection screen
    const goToTokTokSelection = () => router.push('/auth/role-selection');

    const handleRate = () => Alert.alert("Avaliar", "Funcionalidade disponível em breve na loja.");
    
    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Confira o TokTok: A nova forma de descobrir imóveis em vídeo! https://toktok.app',
            });
        } catch (error: any) {
            console.error(error.message);
        }
    };

    const openAppearance = useCallback(() => appearanceSheetRef.current?.present(), []);
    const openLegal = useCallback(() => legalSheetRef.current?.present(), []);
    const openFAQ = useCallback(() => faqSheetRef.current?.present(), []);
    const openBlog = useCallback(() => blogSheetRef.current?.present(), []);

    return (
        <ScrollView className="flex-1 px-6 pt-6 bg-[#0e0e0e]" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="items-center mb-10 pt-4">
                <View className="w-24 h-24 bg-white/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="person" size={56} color="white" />
                </View>
                <Text className="text-white text-center text-lg font-bold px-8 leading-6 mb-8">
                    Crie alertas, receba atualizações e salve seus anúncios favoritos.
                </Text>
                <TouchableOpacity 
                    onPress={handleLogin}
                    className="bg-primary px-16 py-4 rounded-full shadow-2xl shadow-primary/40"
                >
                    <Text className="text-white font-black text-lg uppercase tracking-widest">Entrar</Text>
                </TouchableOpacity>
            </View>

            {/* Gerenciamento */}
            <SectionTitle title="Gerenciamento" />
            <View className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                <ProfileItem icon="pencil" label="Publicar seu anúncio" action={goToTokTokSelection} />
                <ProfileItem icon="home" label="Meus anúncios publicados" action={goToTokTokSelection} />
                <ProfileItem icon="trash" label="Meus descartados" action={goToTokTokSelection} />
            </View>

            {/* Recomendações */}
            <SectionTitle title="Recomendações" />
            <View className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                <ProfileItem icon="star" label="Avalie o aplicativo" action={handleRate} />
                <ProfileItem icon="heart" label="Recomende para um amigo" action={handleShare} />
            </View>

            {/* Configurações */}
            <SectionTitle title="Configurações" />
            <View className="bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                <ProfileItem icon="document-text" label="Meus Consentimentos" action={() => {}} />
                <ProfileItem icon="settings" label="Configurações do aplicativo" action={() => {}} />
                <ProfileItem icon="color-palette" label="Aparência" action={openAppearance} />
            </View>

            {/* Informações e Suporte */}
            <SectionTitle title="Informações e Suporte" />
            <View className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 mb-20">
                <ProfileItem icon="document" label="Aviso legal" action={openLegal} />
                <ProfileItem icon="help-circle" label="Perguntas Frequentes - FAQ" action={openFAQ} />
                <ProfileItem icon="megaphone" label="Blog TokTok" action={openBlog} />
            </View>

            {/* Bottom Sheets */}
            <AppearanceSheet ref={appearanceSheetRef} onClose={() => appearanceSheetRef.current?.dismiss()} />
            <LegalSheet ref={legalSheetRef} onClose={() => legalSheetRef.current?.dismiss()} />
            <FAQSheet ref={faqSheetRef} onClose={() => faqSheetRef.current?.dismiss()} />
            <BlogSheet ref={blogSheetRef} onClose={() => blogSheetRef.current?.dismiss()} />
        </ScrollView>
    );
}
