import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Group } from '@deckscores/shared';
import { Screen } from '@/components/ui/screen';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useGroups } from '@/hooks/use-groups';

export default function GroepenScreen() {
  const router = useRouter();
  const { groups, loading, error, refresh } = useGroups();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <Screen padded={false}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Groepen</Text>
        <Text style={styles.subtitle}>Speel je boompjes binnen een vaste groep.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Palette.blueDark} size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={groups}
          keyExtractor={(g) => g.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-circle-outline" size={64} color={Palette.greyMid} />
              <Text style={styles.emptyText}>
                Nog geen groep. Maak er een om met vrienden of familie boompjes te spelen.
              </Text>
              <KlaverjasButton
                label="+ Nieuwe groep"
                variant="primary"
                onPress={() => router.push('/groep/new')}
              />
            </View>
          }
          renderItem={({ item }) => (
            <GroepRow group={item} onPress={() => router.push(`/groep/${item.id}`)} />
          )}
          ListFooterComponent={
            groups.length > 0 ? (
              <View style={styles.footerActions}>
                <KlaverjasButton
                  label="+ Nieuwe groep"
                  variant="primary"
                  onPress={() => router.push('/groep/new')}
                />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

type RowProps = { group: Group; onPress: () => void };

function GroepRow({ group, onPress }: RowProps) {
  const activeMembers = group.members.filter((m) => m.status === 'active');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="people" size={24} color={Palette.blueDark} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{group.name}</Text>
        <Text style={styles.rowMeta}>
          {activeMembers.length} {activeMembers.length === 1 ? 'lid' : 'leden'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Palette.greyMid} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  title: { ...Typography.title, color: Palette.blueDark },
  subtitle: { color: Palette.greyMid },
  list: { padding: Spacing.lg, gap: Spacing.md, flexGrow: 1 },
  separator: { height: Spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: Palette.redAction, padding: Spacing.lg, textAlign: 'center' },
  empty: { alignItems: 'center', padding: Spacing.xl, gap: Spacing.md },
  emptyText: { color: Palette.greyMid, textAlign: 'center' },
  footerActions: { paddingTop: Spacing.lg, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rowPressed: { backgroundColor: Palette.blueLight },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.blueVeryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { ...Typography.bodyBold, color: Palette.blueDark },
  rowMeta: { color: Palette.greyMid, fontSize: 12 },
});
