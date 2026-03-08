import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MOCK_PROPERTIES } from '../../utils/mockData';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Apartment', 'Home', 'Villa', 'Commercial'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const filteredProperties = MOCK_PROPERTIES.filter(p =>
    (activeFilter === 'All' || p.propertyType.toLowerCase() === activeFilter.toLowerCase()) &&
    (p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-20 pb-4 bg-white shadow-sm z-10">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-4xl font-black text-gray-900 tracking-tighter">Explore</Text>
          <TouchableOpacity className="bg-gray-100 p-3 rounded-2xl">
            <Ionicons name="options" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-3xl px-5 py-4 mb-6 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900 font-medium"
            placeholder="Search cities, neighborhoods..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              className={`px-8 py-3 rounded-2xl mr-3 border ${activeFilter === filter ? 'bg-primary border-primary shadow-lg shadow-primary/30' : 'bg-white border-gray-100'}`}
              onPress={() => setActiveFilter(filter)}
            >
              <Text className={`font-black uppercase text-[10px] tracking-widest ${activeFilter === filter ? 'text-white' : 'text-gray-400'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-black text-gray-900 uppercase tracking-tighter">Recommended For You</Text>
          <Text className="text-primary font-black text-xs uppercase tracking-widest">{filteredProperties.length} Results</Text>
        </View>

        <View className="flex-row flex-wrap justify-between pb-32">
          {filteredProperties.map(property => (
            <TouchableOpacity
              key={property.id}
              style={{ width: ITEM_WIDTH }}
              className="bg-white rounded-[32px] mb-8 overflow-hidden border border-gray-100 shadow-sm"
              onPress={() => router.push(`/property/${property.id}`)}
              activeOpacity={0.9}
            >
              <View className="h-48 bg-gray-100">
                {property.imageUrls && property.imageUrls.length > 0 ? (
                  <Image source={property.imageUrls[0]} style={{ flex: 1 }} contentFit="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="home" size={40} color="#D1D5DB" />
                  </View>
                )}
                <View className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                  <Text className="text-primary text-[10px] font-black uppercase tracking-widest">{property.operation}</Text>
                </View>
              </View>
              <View className="p-5">
                <Text className="font-black text-xl text-gray-900 mb-1">{formatPrice(property.price)}</Text>
                <Text className="text-gray-400 font-bold text-xs mb-3" numberOfLines={1}>{property.neighborhood}, {property.city}</Text>

                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center">
                    <Ionicons name="bed-outline" size={14} color="#8B5CF6" />
                    <Text className="text-gray-600 text-xs font-black ml-1">{property.bedrooms}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="water-outline" size={14} color="#8B5CF6" />
                    <Text className="text-gray-600 text-xs font-black ml-1">{property.bathrooms}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {filteredProperties.length === 0 && (
            <View className="w-full py-20 items-center justify-center">
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 font-black text-lg text-center uppercase tracking-widest">No properties found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Map Button */}
      <TouchableOpacity
        className="absolute bottom-10 left-1/2 -ml-20 bg-gray-900 px-8 py-4 rounded-full flex-row items-center shadow-2xl z-20"
        onPress={() => { }}
      >
        <Ionicons name="map" size={18} color="white" />
        <Text className="text-white font-black uppercase text-xs ml-3 tracking-widest">Map View</Text>
      </TouchableOpacity>
    </View>
  );
}
