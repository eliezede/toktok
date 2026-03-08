import FeedItem from '@/components/FeedItem';
import PropertyBottomSheet from '@/components/PropertyBottomSheet';
import { PropertyListing } from '@/types';
import { MOCK_PROPERTIES } from '@/utils/mockData';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ViewToken } from 'react-native';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [activeTab, setActiveTab] = useState<'Following' | 'For You'>('For You');
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleFichaPress = useCallback((property: PropertyListing) => {
    setSelectedProperty(property);
    bottomSheetModalRef.current?.present();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveVideoIndex(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        data={activeTab === 'For You' ? MOCK_PROPERTIES : MOCK_PROPERTIES.slice(1)} // Mock different feeds
        renderItem={({ item, index }) => (
          <FeedItem
            item={item}
            isActive={isScreenFocused && activeVideoIndex === index}
            onFichaPress={() => handleFichaPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        decelerationRate="fast"
        snapToInterval={WINDOW_HEIGHT - 80} // Must match FeedItem height
        snapToAlignment="start"
        initialNumToRender={2}
        windowSize={3}
      />

      <SafeAreaView style={styles.topNavContainer}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => setActiveTab('Following')}>
            <Text style={[styles.navText, activeTab === 'Following' && styles.navTextActive]}>Following</Text>
          </TouchableOpacity>
          <View style={styles.navSeparator} />
          <TouchableOpacity onPress={() => setActiveTab('For You')}>
            <Text style={[styles.navText, activeTab === 'For You' && styles.navTextActive]}>For You</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <PropertyBottomSheet
        ref={bottomSheetModalRef}
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  topNavContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
    width: WINDOW_WIDTH,
    alignItems: 'center',
    zIndex: 10,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  navTextActive: {
    color: 'white',
    fontSize: 18,
  },
  navSeparator: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 16,
  }
});
