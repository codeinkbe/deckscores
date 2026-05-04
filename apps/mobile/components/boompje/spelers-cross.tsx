import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NumPlayers, Player, Seat } from '@deckscores/shared';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  numPlayers: NumPlayers;
  seats: Record<Seat, Player>;
  onTapSeat: (seat: Seat) => void;
};

export function SpelersCross({ numPlayers, seats, onTapSeat }: Props) {
  if (numPlayers === 4) return <CrossLayout seats={seats} onTapSeat={onTapSeat} />;
  if (numPlayers === 3) return <TriangleLayout seats={seats} onTapSeat={onTapSeat} />;
  return <FaceOffLayout seats={seats} onTapSeat={onTapSeat} />;
}

type LayoutProps = {
  seats: Record<Seat, Player>;
  onTapSeat: (seat: Seat) => void;
};

function CrossLayout({ seats, onTapSeat }: LayoutProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <SeatChip
          editable
          label="Jouw maat"
          player={seats[2]}
          onPress={() => onTapSeat(2)}
          style={styles.center}
        />
      </View>

      <View style={styles.row}>
        <SeatChip
          editable
          label="Zij - links van je"
          player={seats[3]}
          onPress={() => onTapSeat(3)}
          style={styles.half}
        />
        <SeatChip
          editable
          label="Zij - rechts van je"
          player={seats[1]}
          onPress={() => onTapSeat(1)}
          style={styles.half}
        />
      </View>

      <View style={styles.row}>
        <SeatChip
          editable
          label="Jij"
          player={seats[0]}
          onPress={() => onTapSeat(0)}
          style={styles.center}
        />
      </View>
    </View>
  );
}

function TriangleLayout({ seats, onTapSeat }: LayoutProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <SeatChip
          editable
          label="Tegenstander links"
          player={seats[2]}
          onPress={() => onTapSeat(2)}
          style={styles.half}
        />
        <SeatChip
          editable
          label="Tegenstander rechts"
          player={seats[1]}
          onPress={() => onTapSeat(1)}
          style={styles.half}
        />
      </View>

      <View style={styles.row}>
        <SeatChip
          editable
          label="Jij"
          player={seats[0]}
          onPress={() => onTapSeat(0)}
          style={styles.center}
        />
      </View>
    </View>
  );
}

function FaceOffLayout({ seats, onTapSeat }: LayoutProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <SeatChip
          editable
          label="Tegenstander"
          player={seats[1]}
          onPress={() => onTapSeat(1)}
          style={styles.center}
        />
      </View>

      <View style={styles.row}>
        <SeatChip
          editable
          label="Jij"
          player={seats[0]}
          onPress={() => onTapSeat(0)}
          style={styles.center}
        />
      </View>
    </View>
  );
}

type ChipProps = {
  label: string;
  player?: Player;
  editable: boolean;
  onPress?: () => void;
  style?: object;
};

function SeatChip({ label, player, editable, onPress, style }: ChipProps) {
  const display = player?.display_name;
  const variant = player ? 'filled' : 'empty';

  const Wrapper: React.ElementType = editable ? Pressable : View;

  return (
    <Wrapper
      onPress={editable ? onPress : undefined}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.chip,
        variant === 'empty' && styles.chipEmpty,
        variant === 'filled' && styles.chipFilled,
        pressed && styles.chipPressed,
        style,
      ]}
    >
      <View style={styles.chipInner}>
        <Text
          style={[styles.chipText, variant === 'empty' && styles.chipTextEmpty]}
          numberOfLines={1}
        >
          {display ?? label}
        </Text>
        {editable ? (
          <Ionicons
            name={player ? 'pencil' : 'add'}
            size={18}
            color={player ? Palette.blueDark : Palette.greenAction}
          />
        ) : null}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm, marginVertical: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  center: { width: '80%' },
  half: { flex: 1 },
  chip: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  chipEmpty: {
    borderColor: Palette.greyLight,
    backgroundColor: Palette.white,
  },
  chipFilled: {
    borderColor: Palette.blueLight,
    backgroundColor: Palette.blueVeryLight,
  },
  chipPressed: { opacity: 0.85 },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  chipText: { ...Typography.bodyBold, color: Palette.black, flex: 1 },
  chipTextEmpty: { color: Palette.greyDark, fontWeight: '500' },
});
