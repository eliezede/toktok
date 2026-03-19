import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

export type TabType = 'Resumo' | 'Fotos' | 'Planta' | 'Mapa';

interface PropertySheetTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const PropertySheetTabs: React.FC<PropertySheetTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <View style={styles.tabsWrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}
            >
                {(['Resumo', 'Fotos', 'Planta', 'Mapa'] as TabType[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => onTabChange(tab)}
                        style={[
                            styles.tabBtn,
                            activeTab === tab && styles.tabBtnActive
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === tab && styles.tabTextActive
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    tabsWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        marginBottom: 8,
    },
    tabsScroll: {
        paddingHorizontal: 20,
    },
    tabBtn: {
        marginRight: 24,
        paddingVertical: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: '#ff9066',
    },
    tabText: {
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tabTextActive: {
        color: 'white',
    },
});
