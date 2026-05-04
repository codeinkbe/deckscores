import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Group, InvitePreview } from '@deckscores/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useApi } from '@/lib/api';

export default function InviteScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const api = useApi();

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const fetchPreview = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const { invite } = await api.request<{ invite: InvitePreview }>(`/api/invites/${code}`);
      setPreview(invite);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [api, code]);

  useEffect(() => {
    void fetchPreview();
  }, [fetchPreview]);

  const handleAccept = async () => {
    if (!code) return;
    setAccepting(true);
    setError(null);
    try {
      const { group } = await api.request<{ group: Group }>(
        `/api/invites/${code}/accept`,
        { method: 'POST' },
      );
      router.replace(`/groep/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accepteren mislukt');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/(tabs)/groepen')} hitSlop={12}>
          <Ionicons name="close" size={28} color={Palette.greyDark} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Palette.blueDark} size="large" />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !preview ? (
        <Text style={styles.error}>Uitnodiging niet gevonden.</Text>
      ) : (
        <View style={styles.card}>
          <Ionicons name="people-circle" size={84} color={Palette.blueDark} />
          <Text style={styles.title}>{preview.group_name}</Text>
          <Text style={styles.meta}>
            {preview.member_count} {preview.member_count === 1 ? 'lid' : 'leden'}
          </Text>
          {preview.invited_by ? (
            <Text style={styles.invitedBy}>Uitgenodigd door {preview.invited_by}</Text>
          ) : null}

          {preview.already_member ? (
            <KlaverjasButton
              label="Open groep"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.replace(`/groep/${preview.group_id}`)}
            />
          ) : (
            <KlaverjasButton
              label={accepting ? 'Bezig...' : 'Accepteer uitnodiging'}
              variant="success"
              size="lg"
              fullWidth
              disabled={accepting}
              onPress={handleAccept}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  center: { padding: Spacing.xxl, alignItems: 'center' },
  error: { color: Palette.redAction, padding: Spacing.lg, textAlign: 'center' },
  card: {
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
    backgroundColor: Palette.blueVeryLight,
    borderRadius: Radius.lg,
  },
  title: { ...Typography.title, color: Palette.blueDark, textAlign: 'center' },
  meta: { color: Palette.greyDark },
  invitedBy: { color: Palette.greyMid, fontStyle: 'italic', marginBottom: Spacing.md },
});
