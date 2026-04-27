import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { Player, ProfileSearchResult } from '@cardapp/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useApi } from '@/lib/api';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelect: (player: Player) => void;
};

type SearchResponse = { results: ProfileSearchResult[] };

export function SpelersPickerModal({ visible, title, onClose, onSelect }: Props) {
  const api = useApi();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setResults([]);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.request<SearchResponse>('/api/profiles/search', {
          searchParams: { q: query.trim() },
        });
        setResults(response.results);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [api, query, visible]);

  const guestName = query.trim();
  const canAddGuest = guestName.length > 0 && !loading;

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
              <Ionicons name="close" size={24} color={Palette.greyDark} />
            </Pressable>
          </View>

          <KlaverjasInput
            placeholder="Zoek op naam of familienummer"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
          />

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Palette.blueDark} />
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.clerk_id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                query.trim().length >= 2 ? (
                  <Text style={styles.emptyText}>Geen accounts gevonden</Text>
                ) : (
                  <Text style={styles.emptyText}>Typ minimaal 2 letters</Text>
                )
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    onSelect({
                      kind: 'account',
                      clerk_id: item.clerk_id,
                      display_name: `${item.first_name} ${item.last_name}`.trim(),
                    })
                  }
                  style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarLetter}>
                      {(item.first_name[0] ?? '?').toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultName}>
                      {item.first_name} {item.last_name}
                    </Text>
                    {item.member_number ? (
                      <Text style={styles.resultMeta}>nr. {item.member_number}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Palette.greyMid} />
                </Pressable>
              )}
            />
          )}

          <View style={styles.guestSection}>
            <Text style={styles.guestLabel}>Geen account? Voeg toe als gast</Text>
            <KlaverjasButton
              label={canAddGuest ? `Voeg "${guestName}" toe als gast` : 'Vul eerst een naam in'}
              variant="outline"
              size="md"
              fullWidth
              disabled={!canAddGuest}
              onPress={() => onSelect({ kind: 'guest', display_name: guestName })}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...Typography.heading, color: Palette.blueDark },
  closeButton: { padding: Spacing.xs },
  loading: { padding: Spacing.xl, alignItems: 'center' },
  separator: { height: 1, backgroundColor: Palette.greyVeryLight },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  resultRowPressed: { backgroundColor: Palette.blueVeryLight },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: Palette.blueDark, fontWeight: '700' },
  resultName: { ...Typography.bodyBold, color: Palette.black },
  resultMeta: { color: Palette.greyMid, fontSize: Typography.caption.fontSize },
  emptyText: { color: Palette.greyMid, padding: Spacing.lg, textAlign: 'center' },
  guestSection: { gap: Spacing.sm, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.greyVeryLight },
  guestLabel: { color: Palette.greyDark, fontSize: Typography.caption.fontSize },
});
