import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View, Text } from 'react-native';

import { useFeed } from '@/context/FeedContext';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { profile, isGuest } = useAuth();
  const { activeProperty, presentBottomSheet } = useFeed();

  // Role-based logic for the central tab
  const isPro = profile?.role === 'agent' || profile?.role === 'agency';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ff9066', // Primary Orange
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { 
          backgroundColor: '#0e0e0e',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Salvos',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="bookmark" color={color} />,
        }}
      />
      <Tabs.Screen
        name="post"
        listeners={{
          tabPress: (e) => {
            if (!isPro) {
              e.preventDefault();
            }
          },
        }}
        options={{
          title: 'Post',
          href: isPro ? undefined : null, // Only agents see the post tab
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="add-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="mail" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 16, 
              overflow: 'hidden', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: focused ? 'rgba(255, 144, 102, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
              borderWidth: focused ? 1.5 : 0, 
              borderColor: '#ff9066' 
            }}>
              {profile?.profileImage ? (
                <Image 
                  source={{ uri: profile.profileImage }} 
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                  {isGuest || !profile ? (
                    <Ionicons name="person" size={18} color={color} />
                  ) : (
                    <Text style={{ color: color, fontSize: 13, fontFamily: 'PlusJakartaSans-Bold' }}>
                      {profile?.fullName?.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
