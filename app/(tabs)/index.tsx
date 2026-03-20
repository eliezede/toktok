import FeedItem from '@/components/FeedItem';
import PropertyBottomSheet from '@/components/sheets/PropertyBottomSheet';
import { PropertyQueryService } from '@/services/property/propertyQueryService';
import { PropertyListing } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ViewToken, Animated } from 'react-native';
import { useAuth } from '@/hooks/useAuth';

const { height: DEVICE_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');
const WINDOW_HEIGHT = Platform.OS === 'web' && DEVICE_HEIGHT > 768 ? Math.min(DEVICE_HEIGHT * 0.95, 900) : DEVICE_HEIGHT;

import { useFeed } from '@/context/FeedContext';

export default function HomeScreen() {
  const { setActiveProperty, bottomSheetRef } = useFeed();
  const { profile } = useAuth();
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [activeTab, setActiveTab] = useState<'Following' | 'For You'>('For You');

  const headerOpacity = useRef(new Animated.Value(1)).current;

  const isPro = profile?.role === 'agent' || profile?.role === 'agency';
  const isBuyer = profile?.role === 'buyer';

  const showHeader = () => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideHeader = () => {
    Animated.timing(headerOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const fetchListings = async () => {
    setLoading(true);
    const data = await PropertyQueryService.getListings();
    console.log(`[HomeScreen] Fetched ${data.length} listings`);
    setListings(data);
    if (data.length > 0) {
      setActiveProperty(data[0]);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await PropertyQueryService.getListings();
    setListings(data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleFichaPress = useCallback((property: PropertyListing) => {
    setActiveProperty(property);
    bottomSheetRef.current?.present();
  }, [setActiveProperty, bottomSheetRef]);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      showHeader();
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
      const index = viewableItems[0].index || 0;
      setActiveVideoIndex(index);
      if (listings[index]) {
        setActiveProperty(listings[index]);
      }
    }
  }).current;

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={['#0e0e0e', '#0e0e0e']}
        style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color="#ff9066" />
        <Text style={{ 
          color: 'white', 
          marginTop: 24, 
          fontFamily: 'PlusJakartaSans-Bold', 
          letterSpacing: 4, 
          fontSize: 10, 
          textTransform: 'uppercase',
          opacity: 0.8
        }}>
          Descobrindo o Luxo
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={listings}
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
        onRefresh={onRefresh}
        refreshing={refreshing}
        decelerationRate="fast"
        snapToInterval={WINDOW_HEIGHT} // Match the dynamic item height
        snapToAlignment="start"
        initialNumToRender={2}
        windowSize={3}
        onScrollBeginDrag={hideHeader}
        onMomentumScrollEnd={showHeader}
        ListEmptyComponent={
          <View style={{ height: WINDOW_HEIGHT - 100, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
            <Ionicons name="videocam-outline" size={64} color="rgba(255, 144, 102, 0.3)" />
            <Text style={{ color: 'white', fontSize: 20, fontFamily: 'PlusJakartaSans-Bold', textAlign: 'center', marginTop: 24, letterSpacing: 1 }}>
              SEM TOURS AINDA
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', marginTop: 12, fontFamily: 'Manrope-Regular', fontSize: 14 }}>
              Seja o primeiro a postar um tour de imóvel de luxo.
            </Text>
          </View>
        }
      />

      <Animated.View style={[styles.topNavContainer, { opacity: headerOpacity }]}>
        <SafeAreaView style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
            {isPro && (
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/post')}
                style={styles.addButton}
              >
                <Ionicons name="add" size={28} color="white" />
              </TouchableOpacity>
            )}
            
            <View style={[styles.topNav, profile && { backgroundColor: 'transparent' }]}>
              <TouchableOpacity onPress={() => setActiveTab('Following')}>
                <Text style={[styles.navText, activeTab === 'Following' && styles.navTextActive]}>Seguindo</Text>
              </TouchableOpacity>
              <View style={styles.navSeparator} />
              <TouchableOpacity onPress={() => setActiveTab('For You')}>
                <Text style={[styles.navText, activeTab === 'For You' && styles.navTextActive]}>Para Você</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      <PropertyBottomSheet
        ref={bottomSheetRef}
        property={listings[activeVideoIndex] || null}
        onClose={() => { }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
  },
  topNavContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : (Platform.OS === 'web' ? 20 : 50),
    width: WINDOW_WIDTH,
    zIndex: 10,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  navTextActive: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  navSeparator: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  }
});
