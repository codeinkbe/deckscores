import { useClerk } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Screen } from '@/components/ui/screen';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';

type SetupForm = {
  first_name: string;
  last_name: string;
};

export default function ProfielSetupScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { defaults, save } = useProfile();
  const [form, setForm] = useState<SetupForm>({
    first_name: defaults.first_name,
    last_name: defaults.last_name,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof SetupForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.first_name.trim().length > 0 && form.last_name.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    setSaving(true);
    setError(null);
    try {
      await save({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: defaults.email,
      });
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Uitloggen"
          hitSlop={Spacing.sm}
          onPress={() => void signOut()}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
        >
          <Ionicons name="log-out-outline" size={22} color={Palette.blueDark} />
          <Text style={styles.logoutLabel}>Uitloggen</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Bijna klaar</Text>
      <Text style={styles.subtitle}>Wie ben je?</Text>

      <KlaverjasInput
        label="Voornaam"
        value={form.first_name}
        onChangeText={update('first_name')}
        autoCapitalize="words"
        placeholder="Voornaam"
      />
      <KlaverjasInput
        label="Achternaam"
        value={form.last_name}
        onChangeText={update('last_name')}
        autoCapitalize="words"
        placeholder="Achternaam"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <KlaverjasButton
        label={saving ? 'Bezig...' : 'Doorgaan'}
        variant="success"
        size="lg"
        fullWidth
        disabled={!isValid || saving}
        onPress={handleSubmit}
      />

      {saving ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Palette.blueDark} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  logoutButtonPressed: { opacity: 0.6 },
  logoutLabel: { ...Typography.label, color: Palette.blueDark },
  title: { ...Typography.title, color: Palette.blueDark },
  subtitle: { ...Typography.subheading, color: Palette.greyDark, marginBottom: Spacing.md },
  error: { color: Palette.redAction },
  loading: { padding: Spacing.lg, alignItems: 'center' },
});
