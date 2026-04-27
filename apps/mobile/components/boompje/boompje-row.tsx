import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Boompje } from '@deckscores/shared';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  boompje: Boompje;
  onPress: () => void;
};

const FORMAT_LABEL: Record<Boompje['format'], string> = {
  '16_giffies': '16 Giffies',
  '1000_punten': '1000 Punten',
  '1500_punten': '1500 Punten',
};

export function BoompjeRow({ boompje, onPress }: Props) {
  const winner = winnerBucket(boompje);
  const date = new Date(boompje.created_at);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.left}>
        <Text style={styles.title}>{FORMAT_LABEL[boompje.format]}</Text>
        <Text style={styles.subtitle}>
          {date.toLocaleDateString('nl-NL')} · {boompje.giffies.length} giffies
        </Text>
      </View>
      {boompje.buckets.map((bucket) => (
        <View key={bucket.id} style={styles.scoreCol}>
          <Text style={styles.scoreLabel} numberOfLines={1}>
            {shortLabel(bucket.label)}
          </Text>
          <Text style={styles.scoreValue}>{boompje.totals[bucket.id] ?? 0}</Text>
        </View>
      ))}
      {boompje.status === 'finished' && winner ? (
        <View style={styles.winnerBadge}>
          <Text style={styles.winnerText} numberOfLines={1}>
            {shortLabel(winner.label)}
          </Text>
        </View>
      ) : (
        <Ionicons name="play-circle" size={26} color={Palette.greenAction} />
      )}
    </Pressable>
  );
}

const winnerBucket = (boompje: Boompje) => {
  let best: { id: string; label: string; score: number } | null = null;
  for (const bucket of boompje.buckets) {
    const score = boompje.totals[bucket.id] ?? 0;
    if (!best || score > best.score) {
      best = { id: bucket.id, label: bucket.label, score };
    }
  }
  return best;
};

const shortLabel = (label: string) => (label.length > 6 ? `${label.slice(0, 6)}.` : label);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  rowPressed: { backgroundColor: Palette.blueLight },
  left: { flex: 1 },
  title: { ...Typography.bodyBold, color: Palette.blueDark },
  subtitle: { color: Palette.greyMid, fontSize: 12 },
  scoreCol: { alignItems: 'center', minWidth: 40 },
  scoreLabel: { color: Palette.greyMid, fontSize: 11 },
  scoreValue: { ...Typography.bodyBold, color: Palette.black },
  winnerBadge: {
    backgroundColor: Palette.greenAction,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  winnerText: { color: Palette.white, fontWeight: '700', fontSize: 12 },
});
