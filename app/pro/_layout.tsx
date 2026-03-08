import { Stack } from 'expo-router';

export default function ProLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="promote" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
    );
}
