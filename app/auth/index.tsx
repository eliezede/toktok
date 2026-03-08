import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function AuthLandingScreen() {
    return (
        <View className="flex-1 items-center justify-center bg-white px-6">
            <View className="flex-1 justify-center items-center w-full">
                <Text className="text-4xl font-extrabold text-primary mb-2">TokTok</Text>
                <Text className="text-gray-500 text-center mb-8">Discover your next home through video</Text>
            </View>

            <View className="w-full pb-12">
                <TouchableOpacity
                    className="w-full bg-primary py-4 rounded-full items-center mb-4"
                    onPress={() => router.push('/auth/signup')}
                >
                    <Text className="text-white font-bold text-lg">Create Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-full border border-gray-300 py-4 rounded-full items-center mb-4"
                    onPress={() => router.push('/auth/login')}
                >
                    <Text className="text-gray-800 font-bold text-lg">Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
