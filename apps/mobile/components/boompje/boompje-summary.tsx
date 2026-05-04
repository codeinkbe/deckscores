import { StyleSheet, Text, View } from 'react-native';
import type { Boompje, Player, Seat } from '@deckscores/shared';
import { ALL_TROEVEN, displayScore } from '@deckscores/shared';
import { TROEF_COLOR, TROEF_LABEL, TROEF_NAME } from '@/constants/troef';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  boompje: Boompje;
};

export function BoompjeSummary({ boompje }: Props) {
  const winner = winnerBucket(boompje);
  const totalRoem = boompje.giffies.reduce(
    (sum, giffie) =>
      sum + Object.values(giffie.scores).reduce((s, score) => s + score.roem, 0),
    0,
  );

  const seatGoneCounts = countBy(boompje.giffies, (g) => g.gegaan_seat);
  const mostGoneSeat = topKey(seatGoneCounts);
  const mostGonePlayer =
    mostGoneSeat !== null ? seatPlayer(Number(mostGoneSeat) as Seat, boompje) : null;

  const troefCounts = countBy(boompje.giffies, (g) => g.troef);
  const sortedTroef = ALL_TROEVEN.map((t) => ({ troef: t, count: troefCounts[t] ?? 0 }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Boompje afgesloten</Text>
      {winner ? (
        <Text style={styles.winner}>{winner.label} heeft gewonnen!</Text>
      ) : null}

      <View style={styles.statsGrid}>
        {boompje.buckets.map((bucket) => (
          <Stat
            key={bucket.id}
            label={`Totaal ${bucket.label}`}
            value={String(
              displayScore(boompje.totals[bucket.id] ?? 0, {
                afronden: boompje.settings.afronden,
                format: boompje.format,
              }),
            )}
          />
        ))}
        <Stat label="Aantal giffies" value={String(boompje.giffies.length)} />
        <Stat label="Totale roem" value={String(totalRoem)} />
      </View>

      {mostGonePlayer && mostGoneSeat !== null ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meest gegaan</Text>
          <Text style={styles.sectionBody}>
            {mostGonePlayer.display_name} ({seatGoneCounts[mostGoneSeat] ?? 0} keer)
          </Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gespeelde kleuren</Text>
        <View style={styles.troefRow}>
          {sortedTroef.map(({ troef, count }) => (
            <View key={troef} style={styles.troefBadge}>
              <Text style={[styles.troefSymbol, { color: TROEF_COLOR[troef] }]}>
                {TROEF_LABEL[troef]}
              </Text>
              <Text style={styles.troefCount}>{count}</Text>
              <Text style={styles.troefName}>{TROEF_NAME[troef]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
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

const seatPlayer = (seat: Seat, boompje: Boompje): Player | null =>
  boompje.participants.find((p) => p.seat === seat)?.player ?? null;

const countBy = <T, K extends string | number>(
  items: T[],
  selector: (item: T) => K,
): Record<K, number> => {
  const counts = {} as Record<K, number>;
  for (const item of items) {
    const key = selector(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
};

const topKey = <K extends string | number>(counts: Record<K, number>): K | null => {
  const entries = Object.entries(counts) as [K, number][];
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const troefStyles = {
  badge: {
    flexBasis: '22%' as const,
    alignItems: 'center' as const,
    paddingVertical: Spacing.sm,
    backgroundColor: Palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.greyLight,
  },
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Palette.blueVeryLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
    margin: Spacing.lg,
  },
  title: { ...Typography.heading, color: Palette.blueDark },
  winner: { ...Typography.subheading, color: Palette.greenAction, fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stat: {
    flexBasis: '47%',
    backgroundColor: Palette.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  statLabel: { color: Palette.greyMid, fontSize: 12 },
  statValue: { ...Typography.heading, color: Palette.blueDark },
  section: { gap: Spacing.xs },
  sectionTitle: { ...Typography.bodyBold, color: Palette.greyDark },
  sectionBody: { ...Typography.body, color: Palette.black },
  troefRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  troefBadge: troefStyles.badge,
  troefSymbol: { fontSize: 24 },
  troefCount: { ...Typography.bodyBold, color: Palette.black },
  troefName: { fontSize: 11, color: Palette.greyMid },
});
