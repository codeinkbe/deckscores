import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { GroupMember, Player } from '@deckscores/shared';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  members: GroupMember[];
  takenMemberIds: string[];
  onClose: () => void;
  onSelect: (player: Player) => void;
};

const memberToPlayer = (member: GroupMember): Player =>
  member.kind === 'account'
    ? {
        kind: 'account',
        member_id: member.id,
        clerk_id: member.clerk_id,
        display_name: member.display_name,
      }
    : {
        kind: 'guest',
        member_id: member.id,
        display_name: member.display_name,
      };

export function SpelersPickerModal({
  visible,
  title,
  members,
  takenMemberIds,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState('');

  const available = useMemo(() => {
    const taken = new Set(takenMemberIds);
    const lower = query.trim().toLowerCase();
    return members
      .filter((m) => m.status === 'active' && !taken.has(m.id))
      .filter((m) => (lower ? m.display_name.toLowerCase().includes(lower) : true));
  }, [members, takenMemberIds, query]);

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
            placeholder="Zoek lid"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
          />

          <FlatList
            data={available}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Geen leden meer beschikbaar. Voeg er meer toe via de leden-pagina.
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(memberToPlayer(item))}
                style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
              >
                <View style={styles.avatar}>
                  <Ionicons
                    name={item.kind === 'guest' ? 'person-outline' : 'person-circle'}
                    size={22}
                    color={Palette.blueDark}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.display_name}</Text>
                  <Text style={styles.resultMeta}>
                    {item.kind === 'guest' ? 'Gast' : 'Account'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Palette.greyMid} />
              </Pressable>
            )}
          />
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
  resultName: { ...Typography.bodyBold, color: Palette.black },
  resultMeta: { color: Palette.greyMid, fontSize: Typography.caption.fontSize },
  emptyText: { color: Palette.greyMid, padding: Spacing.lg, textAlign: 'center' },
});
