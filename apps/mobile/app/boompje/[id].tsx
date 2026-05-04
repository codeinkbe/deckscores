import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { AddGiffieInput, Boompje } from '@deckscores/shared';
import { BoompjeSummary } from '@/components/boompje/boompje-summary';
import { GiffieInputModal, type SubmitInput } from '@/components/boompje/giffie-input-modal';
import { GiffiesTable } from '@/components/boompje/giffies-table';
import { TeamHeader } from '@/components/boompje/team-header';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { useActiveBoompje } from '@/stores/use-active-boompje';

export default function BoompjeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const api = useApi();
  const { boompje, loading, error, setBoompje, setLoading, setError, clear } = useActiveBoompje();

  const [scoreSheetOpen, setScoreSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBoompje = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { boompje: doc } = await api.request<{ boompje: Boompje }>(`/api/boompjes/${id}`);
      setBoompje(doc);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Laden mislukt');
    } finally {
      setLoading(false);
    }
  }, [api, id, setBoompje, setError, setLoading]);

  useEffect(() => {
    void fetchBoompje();
    return () => clear();
  }, [fetchBoompje, clear]);

  const handleSubmitGiffie = async (input: SubmitInput) => {
    if (!boompje) return;
    setSaving(true);
    setError(null);
    try {
      const body: AddGiffieInput = {
        gegaan_seat: input.gegaan_seat,
        troef: input.troef,
        raw_scores: input.raw_scores,
        pit: input.pit,
        verzaakt: input.verzaakt,
      };
      const { boompje: updated } = await api.request<{ boompje: Boompje }>(
        `/api/boompjes/${boompje.id}/giffies`,
        { method: 'POST', body },
      );
      setBoompje(updated);
      setScoreSheetOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !boompje) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Palette.blueDark} />
        </View>
      </Screen>
    );
  }

  if (!boompje) {
    return (
      <Screen>
        <Text style={styles.error}>{error ?? 'Boompje niet gevonden'}</Text>
        <KlaverjasButton label="Terug" onPress={() => router.back()} variant="outline" />
      </Screen>
    );
  }

  const isFinished = boompje.status === 'finished';

  return (
    <Screen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={Palette.blueDark} />
        </Pressable>
        <Text style={styles.boompjeMeta}>
          {boompje.giffies.length} / {boompje.format === '16_giffies' ? 16 : '∞'} giffies
          {isFinished ? ' · klaar' : ''}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.headerWrap}>
        <TeamHeader boompje={boompje} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <GiffiesTable boompje={boompje} />
        {isFinished ? <BoompjeSummary boompje={boompje} /> : null}
      </ScrollView>

      {error ? <Text style={styles.errorBar}>{error}</Text> : null}

      {!isFinished ? (
        <View style={styles.bottomBar}>
          <KlaverjasButton
            label="+ Score giffie"
            variant="success"
            size="lg"
            fullWidth
            onPress={() => setScoreSheetOpen(true)}
          />
        </View>
      ) : (
        <View style={styles.bottomBar}>
          <KlaverjasButton
            label="Terug naar groep"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() =>
              boompje.group_id
                ? router.replace(`/groep/${boompje.group_id}`)
                : router.replace('/(tabs)/groepen')
            }
          />
        </View>
      )}

      <GiffieInputModal
        visible={scoreSheetOpen}
        boompje={boompje}
        saving={saving}
        onClose={() => setScoreSheetOpen(false)}
        onSubmit={handleSubmitGiffie}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  boompjeMeta: { color: Palette.greyMid, fontSize: 13 },
  headerWrap: { paddingHorizontal: Spacing.lg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  errorBar: {
    color: Palette.redAction,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    textAlign: 'center',
  },
  bottomBar: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.greyLight,
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  error: { color: Palette.redAction, padding: Spacing.lg },
});
