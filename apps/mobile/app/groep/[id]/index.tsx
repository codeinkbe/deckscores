import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BoompjeStatus } from '@deckscores/shared';
import { BoompjeRow } from '@/components/boompje/boompje-row';
import { Screen } from '@/components/ui/screen';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useBoompjes } from '@/hooks/use-boompjes';
import { useGroup } from '@/hooks/use-group';

type Tab = { key: BoompjeStatus; label: string };

const TABS: Tab[] = [
  { key: 'open', label: 'Open boom' },
  { key: 'finished', label: 'Historie' },
];

export default function GroepDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<BoompjeStatus>('open');
  const { group, refresh: refreshGroup } = useGroup(id);
  const { boompjes, loading, error, refresh } = useBoompjes(id, activeTab);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshGroup();
    }, [refresh, refreshGroup]),
  );

  return (
    <Screen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={Palette.blueDark} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {group?.name ?? 'Groep'}
        </Text>
        <Pressable
          onPress={() => router.push(`/groep/${id}/leden`)}
          hitSlop={12}
        >
          <Ionicons name="people" size={24} color={Palette.blueDark} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.tabActive,
                pressed && styles.tabPressed,
              ]}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Palette.blueDark} size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={boompjes}
          keyExtractor={(b) => b.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {activeTab === 'open' ? 'Geen open boom in deze groep.' : 'Nog geen historie.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <BoompjeRow
              boompje={item}
              onPress={() => router.push(`/boompje/${item.id}`)}
            />
          )}
        />
      )}

      <View style={styles.bottomBar}>
        <KlaverjasButton
          label="+ Nieuw boompje"
          variant="success"
          size="lg"
          fullWidth
          onPress={() => router.push(`/boompje/new?group_id=${id}`)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  topTitle: { ...Typography.heading, color: Palette.blueDark, flex: 1, textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.pill,
    padding: 4,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  tabActive: { backgroundColor: Palette.blueDark },
  tabPressed: { opacity: 0.85 },
  tabLabel: { color: Palette.greyDark, fontWeight: '600' },
  tabLabelActive: { color: Palette.white },
  list: { padding: Spacing.lg, gap: Spacing.md, flexGrow: 1 },
  separator: { height: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: Palette.redAction, padding: Spacing.lg, textAlign: 'center' },
  empty: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.lg },
  emptyText: { color: Palette.greyMid, textAlign: 'center' },
  bottomBar: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Palette.greyLight,
    backgroundColor: Palette.white,
  },
});
