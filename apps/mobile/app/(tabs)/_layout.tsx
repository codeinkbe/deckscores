import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const scheme = useColorScheme();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.blueDark,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarStyle: { borderTopColor: palette.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="boompjes"
        options={{
          title: 'Boompjes',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profiel"
        options={{
          title: 'Profiel',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
