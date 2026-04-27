import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Boompje, NumPlayers, Player, Seat, Troef } from '@deckscores/shared';
import { ALL_TROEVEN } from '@deckscores/shared';
import { TROEF_COLOR, TROEF_LABEL } from '@/constants/troef';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  visible: boolean;
  boompje: Boompje;
  onConfirm: (seat: Seat, troef: Troef) => void;
  onClose: () => void;
};

const SEAT_ORDER_BY_NUM_PLAYERS: Record<NumPlayers, Seat[]> = {
  4: [0, 2, 1, 3],
  3: [0, 2, 1],
  2: [0, 1],
};

export function WieGaatModal({ visible, boompje, onConfirm, onClose }: Props) {
  const [seat, setSeat] = useState<Seat | null>(null);
  const [troef, setTroef] = useState<Troef | null>(null);

  useEffect(() => {
    if (visible) {
      setSeat(null);
      setTroef(null);
    }
  }, [visible]);

  const numPlayers = boompje.settings.num_players;
  const seatOrder = SEAT_ORDER_BY_NUM_PLAYERS[numPlayers];
  const seatPlayer = useMemo(() => buildSeatLookup(boompje), [boompje]);

  return (
    <Modal animationType="fade" visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Wie gaat er?</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Palette.greyDark} />
            </Pressable>
          </View>

          <View style={styles.options}>
            {seatOrder.map((s) => {
              const player = seatPlayer[s];
              const isSelected = seat === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSeat(s)}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {player.display_name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.subTitle}>Op welke kleur?</Text>

          <View style={styles.troefRow}>
            {ALL_TROEVEN.map((t) => (
              <Pressable
                key={t}
                onPress={() => setTroef(t)}
                style={({ pressed }) => [
                  styles.troefBtn,
                  troef === t && styles.troefBtnSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={[styles.troefLabel, { color: TROEF_COLOR[t] }]}>{TROEF_LABEL[t]}</Text>
              </Pressable>
            ))}
          </View>

          <KlaverjasButton
            label="Start Giffie"
            variant="success"
            size="lg"
            fullWidth
            disabled={seat === null || troef === null}
            onPress={() => {
              if (seat !== null && troef !== null) onConfirm(seat, troef);
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const buildSeatLookup = (boompje: Boompje): Record<Seat, Player> => {
  const lookup: Record<Seat, Player> = {};
  for (const participant of boompje.participants) {
    lookup[participant.seat] = participant.player;
  }
  return lookup;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.heading, color: Palette.black },
  subTitle: { ...Typography.subheading, color: Palette.greyDark, textAlign: 'center' },
  options: { gap: Spacing.sm },
  option: {
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.greyLight,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  optionSelected: { borderColor: Palette.blueDark, backgroundColor: Palette.blueLight },
  optionPressed: { opacity: 0.85 },
  optionText: { ...Typography.body, color: Palette.greyDark },
  optionTextSelected: { color: Palette.blueDark, fontWeight: '700' },
  troefRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-around' },
  troefBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.greyLight,
    alignItems: 'center',
  },
  troefBtnSelected: { borderColor: Palette.blueDark, backgroundColor: Palette.blueVeryLight },
  troefLabel: { fontSize: 26 },
});
