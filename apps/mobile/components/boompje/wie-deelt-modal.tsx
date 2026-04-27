import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NumPlayers, Player, Seat } from '@cardapp/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  visible: boolean;
  numPlayers: NumPlayers;
  seats: Record<Seat, Player>;
  selectedSeat: Seat | null;
  onSelectSeat: (seat: Seat) => void;
  onConfirm: () => void;
  onClose: () => void;
};

const SEAT_ORDER_BY_NUM_PLAYERS: Record<NumPlayers, Seat[]> = {
  4: [0, 2, 3, 1],
  3: [0, 2, 1],
  2: [0, 1],
};

export function WieDeeltModal({
  visible,
  numPlayers,
  seats,
  selectedSeat,
  onSelectSeat,
  onConfirm,
  onClose,
}: Props) {
  const seatOrder = SEAT_ORDER_BY_NUM_PLAYERS[numPlayers];

  return (
    <Modal animationType="fade" visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Wie deelt de eerste keer?</Text>

          <View style={styles.options}>
            {seatOrder.map((seat) => {
              const player = seats[seat];
              const isSelected = selectedSeat === seat;
              return (
                <Pressable
                  key={seat}
                  onPress={() => onSelectSeat(seat)}
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

          <KlaverjasButton
            label="Start boompje"
            variant="success"
            size="lg"
            fullWidth
            disabled={selectedSeat === null}
            onPress={onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: { ...Typography.heading, color: Palette.black, textAlign: 'center' },
  options: { gap: Spacing.sm },
  option: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.greyLight,
    alignItems: 'center',
  },
  optionPressed: { backgroundColor: Palette.blueVeryLight },
  optionSelected: {
    borderColor: Palette.blueDark,
    backgroundColor: Palette.blueLight,
  },
  optionText: { ...Typography.bodyBold, color: Palette.greyDark },
  optionTextSelected: { color: Palette.blueDark },
});
