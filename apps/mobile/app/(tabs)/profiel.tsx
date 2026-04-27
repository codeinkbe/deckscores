import { useClerk } from '@clerk/expo';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Screen } from '@/components/ui/screen';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useProfile, type ProfileFormInput } from '@/hooks/use-profile';

export default function ProfielScreen() {
  const { signOut } = useClerk();
  const { profile, defaults, save, loading, error } = useProfile();
  const [form, setForm] = useState<ProfileFormInput>(defaults);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setForm(defaults);
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (key: keyof ProfileFormInput) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await save(form);
      setFeedback('Opgeslagen');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      <Text style={styles.title}>Profiel</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <KlaverjasInput
        label="Voornaam"
        value={form.first_name}
        onChangeText={update('first_name')}
        autoCapitalize="words"
      />
      <KlaverjasInput
        label="Achternaam"
        value={form.last_name}
        onChangeText={update('last_name')}
        autoCapitalize="words"
      />
      <KlaverjasInput
        label="Familie nummer"
        value={form.member_number}
        onChangeText={update('member_number')}
        keyboardType="number-pad"
      />
      <KlaverjasInput
        label="E-mail"
        value={form.email}
        onChangeText={update('email')}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <KlaverjasButton
        label={saving ? 'Opslaan...' : 'Opslaan'}
        variant="success"
        fullWidth
        size="lg"
        disabled={saving}
        onPress={handleSave}
      />

      <View style={{ height: Spacing.xl }} />

      <KlaverjasButton
        label="Uitloggen"
        variant="outline"
        fullWidth
        onPress={() => signOut()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...Typography.title, color: Palette.blueDark, marginBottom: Spacing.md },
  error: { color: Palette.redAction },
  feedback: { color: Palette.greenAction, fontWeight: '600' },
});
