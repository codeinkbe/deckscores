import { useFocusEffect, useRouter } from 'expo-router';
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

type Tab = { key: BoompjeStatus; label: string };

const TABS: Tab[] = [
  { key: 'open', label: 'Open boom' },
  { key: 'finished', label: 'Historie' },
];

export default function BoompjesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BoompjeStatus>('open');
  const { boompjes, loading, error, refresh } = useBoompjes(activeTab);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Boompjes</Text>

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
                {activeTab === 'open' ? 'Geen open boom.' : 'Nog geen historie.'}
              </Text>
              {activeTab === 'open' ? (
                <KlaverjasButton
                  label="+ Nieuw Boompje"
                  variant="primary"
                  onPress={() => router.push('/boompje/new')}
                />
              ) : null}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Palette.greyVeryLight,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.title, color: Palette.blueDark },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.pill,
    padding: 4,
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
  list: { padding: Spacing.lg, gap: Spacing.md },
  separator: { height: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: Palette.redAction, padding: Spacing.lg, textAlign: 'center' },
  empty: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.lg },
  emptyText: { color: Palette.greyMid },
});
