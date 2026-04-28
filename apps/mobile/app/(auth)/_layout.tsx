import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';
import { LoadingScreen } from '@/components/ui/loading-screen';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen />;
  if (isSignedIn) return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" options={{ animation: 'slide_from_left' }} />
      <Stack.Screen name="sign-up" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
