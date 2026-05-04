import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  AddGroupMemberInput,
  Group,
  GroupMember,
  ProfileSearchResult,
} from '@deckscores/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { useGroup } from '@/hooks/use-group';

const buildInviteUrl = (code: string) => `deckscores://invite/${code}`;

export default function GroepLedenScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const api = useApi();
  const { group, setGroup, loading, error, refresh } = useGroup(id);

  const [guestName, setGuestName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);

  const activeMembers = group?.members.filter((m) => m.status !== 'left') ?? [];

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    try {
      const { results } = await api.request<{ results: ProfileSearchResult[] }>(
        '/api/profiles/search',
        { searchParams: { q: searchQuery.trim() } },
      );
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
  };

  const addMember = async (payload: AddGroupMemberInput) => {
    if (!id) return;
    setAdding(true);
    try {
      const { group: updated } = await api.request<{ group: Group }>(
        `/api/groups/${id}/members`,
        { method: 'POST', body: payload },
      );
      setGroup(updated);
      setGuestName('');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      Alert.alert('Toevoegen mislukt', err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setAdding(false);
    }
  };

  const handleAddGuest = async () => {
    const name = guestName.trim();
    if (name.length === 0) return;
    await addMember({ kind: 'guest', display_name: name });
  };

  const handleAddAccount = async (profile: ProfileSearchResult) => {
    const displayName = `${profile.first_name} ${profile.last_name}`.trim();
    await addMember({ kind: 'account', clerk_id: profile.clerk_id, display_name: displayName });
  };

  const handleRemove = async (member: GroupMember) => {
    if (!id) return;
    Alert.alert(
      'Lid verwijderen',
      `${member.display_name} verwijderen uit de groep?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { group: updated } = await api.request<{ group: Group }>(
                `/api/groups/${id}/members/${member.id}`,
                { method: 'DELETE' },
              );
              setGroup(updated);
            } catch (err) {
              Alert.alert('Verwijderen mislukt', err instanceof Error ? err.message : 'Fout');
            }
          },
        },
      ],
    );
  };

  const handleShareInvite = async () => {
    if (!group) return;
    const url = buildInviteUrl(group.invite_code);
    await Share.share({
      message: `Doe mee met groep "${group.name}" op DeckScores: ${url}`,
    });
  };

  const handleCopyCode = async () => {
    if (!group) return;
    await Clipboard.setStringAsync(group.invite_code);
    Alert.alert('Gekopieerd', `Invite-code ${group.invite_code} staat op je klembord.`);
  };

  return (
    <Screen padded={false}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={Palette.blueDark} />
        </Pressable>
        <Text style={styles.topTitle}>Leden</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading && !group ? (
        <View style={styles.center}>
          <ActivityIndicator color={Palette.blueDark} size="large" />
        </View>
      ) : !group ? (
        <Text style={styles.error}>{error ?? 'Groep niet gevonden'}</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={activeMembers}
          keyExtractor={(m) => m.id}
          onRefresh={refresh}
          refreshing={loading}
          ListHeaderComponent={
            <View style={styles.sections}>
              <View style={styles.inviteCard}>
                <Text style={styles.cardTitle}>Uitnodigen</Text>
                <Text style={styles.cardSub}>
                  Deel deze code of link, of zoek hieronder een account.
                </Text>
                <Pressable onPress={handleCopyCode} style={styles.codePill}>
                  <Text style={styles.codeText}>{group.invite_code}</Text>
                  <Ionicons name="copy-outline" size={16} color={Palette.blueDark} />
                </Pressable>
                <KlaverjasButton
                  label="Deel uitnodiging"
                  variant="primary"
                  fullWidth
                  onPress={handleShareInvite}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.cardTitle}>Zoek account</Text>
                <KlaverjasInput
                  placeholder="Naam"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="words"
                  onSubmitEditing={handleSearch}
                />
                <KlaverjasButton
                  label={searching ? 'Zoeken...' : 'Zoeken'}
                  variant="outline"
                  onPress={handleSearch}
                  disabled={searchQuery.trim().length < 2 || searching}
                />
                {searchResults.map((r) => (
                  <Pressable
                    key={r.clerk_id}
                    style={({ pressed }) => [styles.searchRow, pressed && styles.rowPressed]}
                    onPress={() => handleAddAccount(r)}
                    disabled={adding}
                  >
                    <Ionicons name="person-circle-outline" size={28} color={Palette.blueDark} />
                    <Text style={styles.searchName}>
                      {r.first_name} {r.last_name}
                    </Text>
                    <Ionicons name="add-circle" size={22} color={Palette.greenAction} />
                  </Pressable>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.cardTitle}>Voeg een gast toe</Text>
                <Text style={styles.cardSub}>
                  Voor mensen zonder account (bv. opa). Ze kunnen niet inloggen, maar wel meespelen in scores.
                </Text>
                <KlaverjasInput
                  placeholder="Naam van de gast"
                  value={guestName}
                  onChangeText={setGuestName}
                  autoCapitalize="words"
                />
                <KlaverjasButton
                  label={adding ? 'Toevoegen...' : 'Voeg gast toe'}
                  variant="outline"
                  onPress={handleAddGuest}
                  disabled={guestName.trim().length === 0 || adding}
                />
              </View>

              <Text style={[styles.cardTitle, styles.membersTitle]}>
                Leden ({activeMembers.length})
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <MemberRow member={item} onRemove={() => handleRemove(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
        />
      )}
    </Screen>
  );
}

type MemberRowProps = { member: GroupMember; onRemove: () => void };

function MemberRow({ member, onRemove }: MemberRowProps) {
  const isOwner = member.role === 'owner';
  const isInvited = member.kind === 'account' && member.status === 'invited';

  return (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Ionicons
          name={member.kind === 'guest' ? 'person-outline' : 'person-circle'}
          size={24}
          color={Palette.blueDark}
        />
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{member.display_name}</Text>
        <Text style={styles.memberMeta}>
          {isOwner
            ? 'Owner'
            : member.kind === 'guest'
            ? 'Gast'
            : isInvited
            ? 'Uitgenodigd'
            : 'Lid'}
        </Text>
      </View>
      {!isOwner ? (
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={Palette.redAction} />
        </Pressable>
      ) : null}
    </View>
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
  },
  topTitle: { ...Typography.heading, color: Palette.blueDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: Palette.redAction, padding: Spacing.lg, textAlign: 'center' },
  list: { padding: Spacing.lg, gap: Spacing.md },
  sections: { gap: Spacing.lg, paddingBottom: Spacing.md },
  inviteCard: {
    gap: Spacing.sm,
    backgroundColor: Palette.blueVeryLight,
    padding: Spacing.lg,
    borderRadius: Radius.md,
  },
  section: { gap: Spacing.sm },
  cardTitle: { ...Typography.subheading, color: Palette.blueDark },
  cardSub: { color: Palette.greyDark, fontSize: 13 },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Palette.white,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.blueLight,
  },
  codeText: {
    ...Typography.bodyBold,
    color: Palette.blueDark,
    letterSpacing: 1.5,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.md,
  },
  rowPressed: { opacity: 0.85 },
  searchName: { ...Typography.body, color: Palette.black, flex: 1 },
  membersTitle: { marginTop: Spacing.sm },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.md,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.blueVeryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { ...Typography.bodyBold, color: Palette.black },
  memberMeta: { color: Palette.greyMid, fontSize: 12 },
  memberSeparator: { height: Spacing.xs },
});
