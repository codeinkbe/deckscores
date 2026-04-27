import { useAuth } from '@clerk/expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" options={{ animation: 'slide_from_left' }} />
      <Stack.Screen name="sign-up" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
