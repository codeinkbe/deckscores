import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Boompje, Giffie, ScoreBucket } from '@deckscores/shared';
import { TROEF_COLOR, TROEF_LABEL } from '@/constants/troef';
import { Palette, Spacing, Typography } from '@/constants/theme';

type Props = {
  boompje: Boompje;
  onTapGiffie?: (giffie: Giffie) => void;
};

export function GiffiesTable({ boompje, onTapGiffie }: Props) {
  const isTwoBucket = boompje.buckets.length === 2;

  return (
    <View style={styles.table}>
      {boompje.giffies.map((giffie) => {
        const initialChar = initialFor(giffie, boompje);
        return (
          <Pressable
            key={giffie.number}
            onPress={onTapGiffie ? () => onTapGiffie(giffie) : undefined}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <Text style={styles.numberCol}>{giffie.number}</Text>

            {isTwoBucket ? (
              <TwoBucketRow boompje={boompje} giffie={giffie} />
            ) : (
              <MultiBucketRow boompje={boompje} giffie={giffie} />
            )}

            <Text style={styles.suffix}>{initialChar}</Text>
          </Pressable>
        );
      })}
      {boompje.giffies.length === 0 ? (
        <Text style={styles.empty}>
          Nog geen giffies. Druk hieronder op &quot;Score&quot; om te starten.
        </Text>
      ) : null}
    </View>
  );
}

type RowProps = { boompje: Boompje; giffie: Giffie };

function TwoBucketRow({ boompje, giffie }: RowProps) {
  const [left, right] = boompje.buckets;
  const gegaanBucket = bucketOfSeat(boompje, giffie.gegaan_seat);
  const leftGaat = gegaanBucket?.id === left.id;
  const leftScore = giffie.scores[left.id];
  const rightScore = giffie.scores[right.id];

  return (
    <>
      <View style={styles.scoreCol}>
        <Text style={[styles.roem, !leftScore?.roem && styles.muted]}>
          {leftScore?.roem || '-'}
        </Text>
        <Text style={[styles.score, leftGaat && styles.scoreBold]}>
          {leftScore?.score ?? 0}
        </Text>
        {giffie.nat && leftGaat ? <NatBadge /> : null}
      </View>

      <Text style={[styles.troef, { color: TROEF_COLOR[giffie.troef] }]}>
        {TROEF_LABEL[giffie.troef]}
      </Text>

      <View style={styles.scoreCol}>
        {giffie.nat && !leftGaat ? <NatBadge /> : null}
        <Text style={[styles.score, !leftGaat && styles.scoreBold]}>
          {rightScore?.score ?? 0}
        </Text>
        <Text style={[styles.roem, !rightScore?.roem && styles.muted]}>
          {rightScore?.roem || '-'}
        </Text>
      </View>
    </>
  );
}

function MultiBucketRow({ boompje, giffie }: RowProps) {
  const gegaanBucket = bucketOfSeat(boompje, giffie.gegaan_seat);
  return (
    <>
      <Text style={[styles.troef, { color: TROEF_COLOR[giffie.troef] }]}>
        {TROEF_LABEL[giffie.troef]}
      </Text>
      {boompje.buckets.map((bucket) => {
        const score = giffie.scores[bucket.id];
        const isGegaan = gegaanBucket?.id === bucket.id;
        return (
          <View key={bucket.id} style={styles.compactCol}>
            <Text style={[styles.compactScore, isGegaan && styles.scoreBold]}>
              {score?.score ?? 0}
            </Text>
            {giffie.nat && isGegaan ? <NatBadge /> : null}
          </View>
        );
      })}
    </>
  );
}

const NatBadge = () => (
  <View style={styles.natBadge}>
    <Text style={styles.natBadgeText}>NAT</Text>
  </View>
);

const bucketOfSeat = (boompje: Boompje, seat: number): ScoreBucket | undefined =>
  boompje.buckets.find((bucket) => bucket.seats.includes(seat));

const initialFor = (giffie: Giffie, boompje: Boompje) => {
  const participant = boompje.participants.find((p) => p.seat === giffie.gegaan_seat);
  return (participant?.player.display_name[0] ?? '?').toUpperCase();
};

const styles = StyleSheet.create({
  table: { paddingTop: Spacing.sm, gap: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  rowPressed: { backgroundColor: Palette.blueVeryLight },
  numberCol: { width: 24, textAlign: 'center', color: Palette.greyDark, fontStyle: 'italic' },
  scoreCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  compactCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  compactScore: { ...Typography.bodyBold, color: Palette.black, textAlign: 'center' },
  roem: {
    ...Typography.body,
    fontStyle: 'italic',
    color: Palette.greyDark,
    minWidth: 36,
    textAlign: 'right',
  },
  score: { ...Typography.bodyBold, color: Palette.black, minWidth: 48, textAlign: 'center' },
  scoreBold: { fontSize: 18, fontWeight: '800' },
  muted: { color: Palette.greyMid },
  troef: { fontSize: 18, paddingHorizontal: Spacing.sm },
  suffix: { width: 24, textAlign: 'center', color: Palette.greyDark, fontWeight: '600' },
  empty: { color: Palette.greyMid, padding: Spacing.lg, textAlign: 'center', fontStyle: 'italic' },
  natBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Palette.redAction,
  },
  natBadgeText: { color: Palette.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
