import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  buildBuckets,
  seatsForNumPlayers,
  type Boompje,
  type BoompjeFormat,
  type BoompjeSettings,
  type CreateBoompjeInput,
  type NumPlayers,
  type Participant,
  type Player,
  type Seat,
} from '@cardapp/shared';
import { FormatToggle } from '@/components/boompje/format-toggle';
import { SpelInstellingenModal } from '@/components/boompje/spel-instellingen-modal';
import { SpelersCross } from '@/components/boompje/spelers-cross';
import { SpelersPickerModal } from '@/components/boompje/spelers-picker';
import { WieDeeltModal } from '@/components/boompje/wie-deelt-modal';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Screen } from '@/components/ui/screen';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { useApi } from '@/lib/api';
import { useProfile } from '@/hooks/use-profile';

const DEFAULT_SETTINGS: BoompjeSettings = {
  afronden: true,
  deler_aangeven: false,
  op_16e_actie: 'maken',
  num_players: 4,
};

export default function NieuwBoompje() {
  const router = useRouter();
  const api = useApi();
  const { profile } = useProfile();

  const [format, setFormat] = useState<BoompjeFormat>('16_giffies');
  const [settings, setSettings] = useState<BoompjeSettings>(DEFAULT_SETTINGS);
  const [seats, setSeats] = useState<Record<Seat, Player>>({});

  const [pickingSeat, setPickingSeat] = useState<Seat | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wieDeeltOpen, setWieDeeltOpen] = useState(false);
  const [dealerSeat, setDealerSeat] = useState<Seat | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numPlayers = settings.num_players;
  const allSeats = useMemo(() => seatsForNumPlayers(numPlayers), [numPlayers]);

  const filledSeats = useMemo<Record<Seat, Player>>(() => {
    if (!profile) return seats;
    const me: Player = {
      kind: 'account',
      clerk_id: profile.clerk_id,
      display_name: `${profile.first_name} ${profile.last_name}`.trim() || profile.first_name,
    };
    return { 0: me, ...seats };
  }, [seats, profile]);

  const handleChangeSettings = (next: BoompjeSettings) => {
    if (next.num_players !== settings.num_players) {
      setSeats({});
      setDealerSeat(null);
    }
    setSettings(next);
  };

  const allSeatsFilled = allSeats.every((seat) => Boolean(filledSeats[seat]));

  const handleStart = () => {
    if (!allSeatsFilled) return;
    setDealerSeat(null);
    setWieDeeltOpen(true);
  };

  const handleConfirmDealer = async () => {
    if (dealerSeat === null || !allSeatsFilled) return;
    setSubmitting(true);
    setError(null);
    try {
      const participants: Participant[] = allSeats.map((seat) => ({
        player: filledSeats[seat],
        seat,
      }));
      const buckets = buildBuckets(participants);

      const payload: CreateBoompjeInput = {
        format,
        settings,
        participants,
        buckets,
        dealer_seat: dealerSeat,
      };
      const { boompje } = await api.request<{ boompje: Boompje }>('/api/boompjes', {
        method: 'POST',
        body: payload,
      });
      setWieDeeltOpen(false);
      router.replace(`/boompje/${boompje.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Aanmaken mislukt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    if (pickingSeat === null) return;
    setSeats((prev) => ({ ...prev, [pickingSeat]: player }));
    setPickingSeat(null);
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Pressable onPress={router.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={Palette.blueDark} />
        </Pressable>
        <Ionicons name="add-circle" size={36} color={Palette.blueDark} />
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.title}>Klaverjas boompje</Text>
      <Text style={styles.date}>{formatDate(new Date())}</Text>

      <FormatToggle
        format={format}
        onChangeFormat={setFormat}
        op16e={settings.op_16e_actie}
        onChangeOp16e={(actie) => setSettings((s) => ({ ...s, op_16e_actie: actie }))}
      />

      <Text style={styles.sectionTitle}>Wie speelt er?</Text>
      <SpelersCross
        numPlayers={numPlayers}
        seats={filledSeats}
        onTapSeat={(seat) => setPickingSeat(seat)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <KlaverjasButton
          label="Start"
          variant="success"
          size="lg"
          fullWidth
          disabled={!allSeatsFilled || submitting}
          onPress={handleStart}
        />
        <Pressable onPress={() => setSettingsOpen(true)} style={styles.settingsLink}>
          <Ionicons name="settings-outline" size={18} color={Palette.greyDark} />
          <Text style={styles.settingsLinkText}>Spel instellingen</Text>
        </Pressable>
      </View>

      <SpelersPickerModal
        visible={pickingSeat !== null}
        title={pickingSeat !== null ? seatTitle(pickingSeat, numPlayers) : ''}
        onClose={() => setPickingSeat(null)}
        onSelect={handleSelectPlayer}
      />

      <SpelInstellingenModal
        visible={settingsOpen}
        settings={settings}
        onChange={handleChangeSettings}
        onClose={() => setSettingsOpen(false)}
      />

      {wieDeeltOpen && allSeatsFilled ? (
        <WieDeeltModal
          visible={wieDeeltOpen}
          numPlayers={numPlayers}
          seats={filledSeats}
          selectedSeat={dealerSeat}
          onSelectSeat={setDealerSeat}
          onConfirm={submitting ? () => undefined : handleConfirmDealer}
          onClose={() => setWieDeeltOpen(false)}
        />
      ) : null}

      {submitting ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={Palette.white} />
        </View>
      ) : null}
    </Screen>
  );
}

const seatTitle = (seat: Seat, numPlayers: NumPlayers): string => {
  if (numPlayers === 4) {
    if (seat === 1) return 'Zij - rechts van je';
    if (seat === 2) return 'Jouw maat';
    return 'Zij - links van je';
  }
  if (numPlayers === 3) {
    return seat === 1 ? 'Tegenstander rechts' : 'Tegenstander links';
  }
  return 'Tegenstander';
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...Typography.heading, color: Palette.black, textAlign: 'center' },
  date: { color: Palette.greyMid, textAlign: 'center', marginBottom: Spacing.md },
  sectionTitle: {
    ...Typography.subheading,
    color: Palette.greyDark,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: Spacing.lg,
  },
  error: { color: Palette.redAction, textAlign: 'center' },
  actions: { gap: Spacing.md, alignItems: 'center', marginTop: Spacing.lg },
  settingsLink: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.sm },
  settingsLinkText: { color: Palette.greyDark, fontWeight: '600', letterSpacing: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
