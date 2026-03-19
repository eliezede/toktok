import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserRole } from '../../types';

export default function RoleSelectionScreen() {
  const insets = useSafeAreaInsets();

  const handleRoleSelect = (role: UserRole) => {
    router.push({
        pathname: '/auth/login',
        params: { role }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0e0e0e' }}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(14, 14, 14, 0.95)', '#0e0e0e']}
          style={{ flex: 1, paddingHorizontal: 32 }}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: (insets?.bottom || 0) + 40 }}>
            <Text 
              style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 12, lineHeight: 40 }}
            >
              Como você quer usar o TokTok?
            </Text>
            
            <Text 
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginBottom: 30 }}
            >
              Escolha seu perfil para personalizarmos sua experiência.
            </Text>

            <View style={{ marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => handleRoleSelect('buyer')}
                style={{
                  backgroundColor: 'rgba(255, 144, 102, 0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 144, 102, 0.4)',
                  padding: 16,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12
                } as any}
              >
                <View style={{ 
                  backgroundColor: '#ff9066', 
                  width: 40, 
                  height: 40, 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 16 
                }}>
                  <Ionicons name="search" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Quero Comprar</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Veja imóveis em vídeo</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRoleSelect('agent')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  padding: 16,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12
                } as any}
              >
                <View style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  width: 40, 
                  height: 40, 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 16 
                }}>
                  <Ionicons name="person" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Sou Agente</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Anuncie seus imóveis</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleRoleSelect('agency')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  padding: 16,
                  borderRadius: 20,
                  flexDirection: 'row',
                  alignItems: 'center'
                } as any}
              >
                <View style={{ 
                  backgroundColor: 'rgba(255,255,255,0.15)', 
                  width: 40, 
                  height: 40, 
                  borderRadius: 12, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: 16 
                }}>
                  <Ionicons name="business" size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Sou Imobiliária</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Gestão profissional</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
