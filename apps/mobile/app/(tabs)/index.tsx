import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Group } from '@deckscores/shared';
import { SpiekbriefCard } from '@/components/home/spiekbrief-card';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useGroups } from '@/hooks/use-groups';
import { useProfile } from '@/hooks/use-profile';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, loading, error } = useProfile();
  const { groups } = useGroups();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (loading || !profile) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={Palette.blueDark} size="large" />
        </View>
      </Screen>
    );
  }

  const handleNewBoompje = () => {
    if (groups.length === 0) {
      router.push('/groep/new');
      return;
    }
    if (groups.length === 1) {
      router.push(`/boompje/new?group_id=${groups[0].id}`);
      return;
    }
    setPickerOpen(true);
  };

  return (
    <Screen scroll>
      <Text style={styles.greeting}>Hoi {profile.first_name}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.bigButton, pressed && styles.bigButtonPressed]}
        onPress={handleNewBoompje}
      >
        <Ionicons name="add" size={64} color={Palette.white} />
        <Text style={styles.bigButtonLabel}>Nieuw Boompje</Text>
      </Pressable>

      <View style={styles.menu}>
        <MenuItem
          icon="people-outline"
          label="Groepen"
          onPress={() => router.push('/(tabs)/groepen')}
        />
        <MenuItem
          icon="book-outline"
          label="Spelregels"
          onPress={() => router.push('/spelregels')}
        />
        <MenuItem icon="bar-chart-outline" label="Statistieken" disabled />
      </View>

      <SpiekbriefCard onPress={() => router.push('/spelregels')} />

      <Modal
        visible={pickerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.pickerCard} onPress={() => undefined}>
            <Text style={styles.pickerTitle}>In welke groep?</Text>
            {groups.map((group) => (
              <GroupPickerRow
                key={group.id}
                group={group}
                onPress={() => {
                  setPickerOpen(false);
                  router.push(`/boompje/new?group_id=${group.id}`);
                }}
              />
            ))}
            <KlaverjasButton
              label="Annuleren"
              variant="ghost"
              fullWidth
              onPress={() => setPickerOpen(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
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

function GroupPickerRow({ group, onPress }: { group: Group; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pickerRow, pressed && styles.pickerRowPressed]}
    >
      <Ionicons name="people" size={20} color={Palette.blueDark} />
      <Text style={styles.pickerLabel}>{group.name}</Text>
      <Ionicons name="chevron-forward" size={18} color={Palette.greyMid} />
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
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  bigButtonPressed: { opacity: 0.85 },
  bigButtonLabel: { color: Palette.white, fontSize: 22, fontWeight: '700' },
  menu: { gap: Spacing.sm, marginTop: Spacing.lg },
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pickerCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  pickerTitle: {
    ...Typography.subheading,
    color: Palette.blueDark,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.md,
  },
  pickerRowPressed: { backgroundColor: Palette.blueLight },
  pickerLabel: { ...Typography.bodyBold, color: Palette.black, flex: 1 },
});
