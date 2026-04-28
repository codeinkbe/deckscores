import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loading, error } = useProfile();

  if (loading || !profile) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={Palette.blueDark} size="large" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.greeting}>Hoi {profile.first_name}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.bigButton, pressed && styles.bigButtonPressed]}
        onPress={() => router.push('/boompje/new')}
      >
        <Ionicons name="add" size={72} color={Palette.white} />
        <Text style={styles.bigButtonLabel}>Nieuw Boompje</Text>
      </Pressable>

      <View style={styles.menu}>
        <MenuItem
          icon="leaf-outline"
          label="Open Boom"
          onPress={() => router.push('/(tabs)/boompjes')}
        />
        <MenuItem
          icon="book-outline"
          label="Spelregels"
          onPress={() => router.push('/spelregels')}
        />
        <MenuItem icon="bar-chart-outline" label="Statistieken" disabled />
        <MenuItem icon="settings-outline" label="Instellingen" disabled />
      </View>
    </Screen>
  );
}

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
};

function MenuItem({ icon, label, onPress, disabled }: MenuItemProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.menuItem,
        disabled && styles.menuItemDisabled,
        pressed && !disabled && styles.menuItemPressed,
      ]}
    >
      <Ionicons name={icon} size={22} color={disabled ? Palette.greyMid : Palette.blueDark} />
      <Text style={[styles.menuLabel, disabled && styles.menuLabelDisabled]}>{label}</Text>
      {disabled ? <Text style={styles.soonBadge}>binnenkort</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { ...Typography.heading, color: Palette.blueDark, marginBottom: Spacing.xs },
  error: { color: Palette.redAction },
  bigButton: {
    backgroundColor: Palette.blueDark,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  bigButtonPressed: { opacity: 0.85 },
  bigButtonLabel: { color: Palette.white, fontSize: 22, fontWeight: '700' },
  menu: { gap: Spacing.sm, marginTop: Spacing.xl },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Palette.greyVeryLight,
  },
  menuItemPressed: { backgroundColor: Palette.blueLight },
  menuItemDisabled: { opacity: 0.55 },
  menuLabel: { ...Typography.bodyBold, color: Palette.blueDark, flex: 1 },
  menuLabelDisabled: { color: Palette.greyDark },
  soonBadge: {
    color: Palette.greyMid,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
