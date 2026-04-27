import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Screen } from '@/components/ui/screen';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useProfile, type ProfileFormInput } from '@/hooks/use-profile';

export function ProfielSetupGate() {
  const { defaults, save } = useProfile();
  const [form, setForm] = useState<ProfileFormInput>(defaults);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof ProfileFormInput) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isValid =
    form.first_name.trim().length > 0 &&
    form.last_name.trim().length > 0 &&
    form.email.trim().length > 0;

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await save(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Registreren</Text>
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
      <KlaverjasInput
        label="Familie nummer"
        value={form.member_number}
        onChangeText={update('member_number')}
        keyboardType="number-pad"
        placeholder="Bijv. 42"
      />
      <KlaverjasInput
        label="E-mail"
        value={form.email}
        onChangeText={update('email')}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="naam@email.nl"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {saving ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Palette.blueDark} />
        </View>
      ) : (
        <KlaverjasButton
          label="Registreer"
          variant="success"
          size="lg"
          fullWidth
          disabled={!isValid}
          onPress={handleSubmit}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...Typography.title, color: Palette.blueDark },
  subtitle: { ...Typography.subheading, color: Palette.greyDark, marginBottom: Spacing.md },
  error: { color: Palette.redAction },
  loading: { padding: Spacing.lg, alignItems: 'center' },
});
