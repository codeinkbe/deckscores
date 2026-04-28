import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfile } from '@/hooks/use-profile';

export default function TabsLayout() {
  const { isLoaded } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const scheme = useColorScheme();

  if (!isLoaded || profileLoading) return <LoadingScreen />;
  if (!profile) return <Redirect href="/profiel-setup" />;

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
