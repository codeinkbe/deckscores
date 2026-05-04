import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CreateGroupInput, Group } from '@deckscores/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Screen } from '@/components/ui/screen';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useApi } from '@/lib/api';

export default function NieuweGroepScreen() {
  const router = useRouter();
  const api = useApi();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateGroupInput = { name: name.trim() };
      const { group } = await api.request<{ group: Group }>('/api/groups', {
        method: 'POST',
        body: payload,
      });
      router.replace(`/groep/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={router.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={Palette.blueDark} />
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <Text style={styles.title}>Nieuwe groep</Text>
      <Text style={styles.subtitle}>Geef je groep een naam (bv. &quot;Familie&quot; of &quot;Vrijdagavond&quot;).</Text>

      <KlaverjasInput
        label="Groepsnaam"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholder="Bijv. Familie de Bruijn"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <KlaverjasButton
        label={submitting ? 'Bezig...' : 'Groep aanmaken'}
        variant="success"
        size="lg"
        fullWidth
        disabled={!isValid || submitting}
        onPress={handleSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { ...Typography.title, color: Palette.blueDark },
  subtitle: { color: Palette.greyDark, marginBottom: Spacing.md },
  error: { color: Palette.redAction },
});
