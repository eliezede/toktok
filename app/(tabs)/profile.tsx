import { auth } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { profile, isLoading } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.replace('/auth/login');
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text className="text-gray-400 font-black tracking-widest uppercase">Initializing...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <View className="flex-1 items-center justify-center bg-white p-8">
                <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-6">
                    <Ionicons name="person-circle" size={64} color="#8B5CF6" />
                </View>
                <Text className="text-3xl font-black mt-4 text-center text-gray-900">Session Error</Text>
                <Text className="text-gray-500 text-center mt-4 text-base leading-6">
                    We couldn't synchronize your profile data. This usually happens if the account was created recently or the session expired.
                </Text>
                <TouchableOpacity
                    className="mt-10 bg-primary w-full py-5 rounded-2xl shadow-xl shadow-primary/30"
                    onPress={handleLogout}
                >
                    <Text className="text-white font-black text-center text-lg uppercase tracking-widest">Back to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-6 pt-20" showsVerticalScrollIndicator={false}>
            <View className="items-center mb-10">
                <View className="w-28 h-28 bg-primary rounded-full mb-6 items-center justify-center shadow-2xl shadow-primary/40 border-[6px] border-white">
                    <Text className="text-5xl font-black text-white">
                        {profile.fullName.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text className="text-3xl font-black text-gray-900 tracking-tighter">{profile.fullName}</Text>
                <Text className="text-gray-400 font-bold mt-1">{profile.email}</Text>

                <View className="flex-row mt-8 px-6 w-full justify-around">
                    <View className="items-center">
                        <Text className="text-xl font-black text-gray-900">12</Text>
                        <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Posts</Text>
                    </View>
                    <View className="items-center border-x border-gray-100 px-8">
                        <Text className="text-xl font-black text-gray-900">{profile.followerCount || 0}</Text>
                        <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Followers</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-black text-gray-900">48</Text>
                        <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Following</Text>
                    </View>
                </View>
            </View>

            <View className="mb-10">
                <Text className="text-gray-900 font-black uppercase text-xs tracking-widest mb-4 opacity-50">Account Dashboard</Text>

                {profile.role === 'buyer' && (
                    <View className="gap-4">
                        <TouchableOpacity className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex-row justify-between items-center shadow-sm">
                            <View className="flex-row items-center">
                                <View className="bg-white p-2 rounded-xl border border-gray-100 mr-4">
                                    <Ionicons name="heart" size={20} color="#EF4444" />
                                </View>
                                <Text className="text-lg font-bold text-gray-900">Saved Units</Text>
                            </View>
                            <Text className="text-gray-400 font-black">{profile.savedProperties?.length || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex-row justify-between items-center shadow-sm">
                            <View className="flex-row items-center">
                                <View className="bg-white p-2 rounded-xl border border-gray-100 mr-4">
                                    <Ionicons name="people" size={20} color="#8B5CF6" />
                                </View>
                                <Text className="text-lg font-bold text-gray-900">Following</Text>
                            </View>
                            <Text className="text-gray-400 font-black">{profile.followedAgents?.length || 0}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {(profile.role === 'agent' || profile.role === 'agency') && (
                    <View className="gap-4">
                        <TouchableOpacity className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex-row justify-between items-center shadow-sm">
                            <View className="flex-row items-center">
                                <View className="bg-white p-2 rounded-xl border border-gray-100 mr-4">
                                    <Ionicons name="list" size={20} color="#10B981" />
                                </View>
                                <Text className="text-lg font-bold text-gray-900">My Live Listings</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex-row justify-between items-center shadow-sm">
                            <View className="flex-row items-center">
                                <View className="bg-white p-2 rounded-xl border border-gray-100 mr-4">
                                    <Ionicons name="stats-chart" size={20} color="#3B82F6" />
                                </View>
                                <Text className="text-lg font-bold text-gray-900">Follower Insights</Text>
                            </View>
                            <Text className="text-gray-400 font-black">{profile.followerCount || 0}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex-row justify-between items-center"
                            onPress={() => router.push('/pro')}
                        >
                            <View className="flex-row items-center">
                                <View className="bg-primary p-2 rounded-xl mr-4 shadow-lg shadow-primary/30">
                                    <Ionicons name="flash" size={20} color="white" />
                                </View>
                                <View>
                                    <Text className="text-lg font-black text-primary">Pro Tools</Text>
                                    <Text className="text-primary/60 text-xs font-bold uppercase tracking-tighter">Analytics & Boosts</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>
                )}

                {profile.role === 'agency' && (
                    <TouchableOpacity
                        className="bg-gray-900 p-6 rounded-[32px] flex-row justify-between items-center mt-6 shadow-2xl"
                        onPress={() => router.push('/admin')}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-white/10 p-3 rounded-2xl mr-4">
                                <Ionicons name="shield-checkmark" size={20} color="white" />
                            </View>
                            <View>
                                <Text className="text-white font-black text-lg">HQ Administration</Text>
                                <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest">Platform Core Access</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="white" />
                    </TouchableOpacity>
                )}

                <Text className="text-gray-900 font-black uppercase text-xs tracking-widest mt-12 mb-4 opacity-50">Preferences</Text>
                <View className="bg-gray-50 rounded-[32px] border border-gray-100 p-2">
                    {[
                        { icon: 'settings-outline', label: 'Edit Profile', color: '#6B7280' },
                        { icon: 'notifications-outline', label: 'Notifications', color: '#6B7280' },
                        { icon: 'shield-outline', label: 'Privacy & Security', color: '#6B7280' },
                        { icon: 'help-circle-outline', label: 'Help & Support', color: '#6B7280' },
                    ].map((item, idx) => (
                        <TouchableOpacity key={idx} className={`flex-row justify-between items-center p-5 ${idx !== 3 ? 'border-b border-gray-100' : ''}`}>
                            <View className="flex-row items-center">
                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                                <Text className="ml-4 text-base font-bold text-gray-700">{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                className="w-full border-2 border-red-50/50 bg-red-50/20 py-5 rounded-2xl items-center mb-24"
                onPress={handleLogout}
            >
                <Text className="text-red-500 font-black text-lg uppercase tracking-widest">Terminate Session</Text>
            </TouchableOpacity>
        </ScrollView >
    );
}
