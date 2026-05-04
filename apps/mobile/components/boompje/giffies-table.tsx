import { useEffect, useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { Boompje, Giffie, ScoreBucket } from '@deckscores/shared';
import { displayScore } from '@deckscores/shared';
import { TROEF_COLOR, TROEF_LABEL } from '@/constants/troef';
import { Palette, Spacing, Typography } from '@/constants/theme';

const ROW_HEIGHT = 32;

type Props = {
  boompje: Boompje;
  onTapGiffie?: (giffie: Giffie) => void;
};

export function GiffiesTable({ boompje, onTapGiffie }: Props) {
  const isTwoBucket = boompje.buckets.length === 2;
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  // Make sure last row is always visible: scroll to bottom on new giffies.
  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(id);
  }, [boompje.giffies.length]);

  // Reserve enough vertical space to fit 16 rows (target) within remaining viewport.
  const targetRows = boompje.format === '16_giffies' ? 16 : Math.max(8, boompje.giffies.length);
  const desiredHeight = targetRows * ROW_HEIGHT + ROW_HEIGHT;
  const maxHeight = Math.min(desiredHeight, height * 0.55);

  return (
    <View style={[styles.table, { maxHeight }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.tableContent}
        showsVerticalScrollIndicator
      >
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
      </ScrollView>

      {boompje.giffies.length > 0 ? <TotalsRow boompje={boompje} /> : null}
    </View>
  );
}

type RowProps = { boompje: Boompje; giffie: Giffie };

const FLAG_LABEL = (giffie: Giffie, isThisBucket: boolean): string | null => {
  if (giffie.nat && isThisBucket) return 'NAT';
  if (giffie.pit && giffie.pit && isThisBucket) {
    // pit shown on the bucket that scored pit
  }
  return null;
};

function TwoBucketRow({ boompje, giffie }: RowProps) {
  const [left, right] = boompje.buckets;
  const gegaanBucket = bucketOfSeat(boompje, giffie.gegaan_seat);
  const leftGaat = gegaanBucket?.id === left.id;
  const leftScore = giffie.scores[left.id];
  const rightScore = giffie.scores[right.id];

  const leftDisplay = displayScore(leftScore?.score ?? 0, {
    afronden: boompje.settings.afronden,
    format: boompje.format,
  });
  const rightDisplay = displayScore(rightScore?.score ?? 0, {
    afronden: boompje.settings.afronden,
    format: boompje.format,
  });

  const leftFlag = flagFor(giffie, left.id, leftGaat);
  const rightFlag = flagFor(giffie, right.id, !leftGaat);

  return (
    <>
      <View style={styles.scoreCol}>
        <Text style={[styles.roem, !leftScore?.roem && styles.muted]}>
          {leftScore?.roem || '-'}
        </Text>
        <ScoreOrFlag
          score={leftDisplay}
          flag={leftFlag}
          bold={leftGaat}
        />
      </View>

      <Text style={[styles.troef, { color: TROEF_COLOR[giffie.troef] }]}>
        {TROEF_LABEL[giffie.troef]}
      </Text>

      <View style={styles.scoreCol}>
        <ScoreOrFlag
          score={rightDisplay}
          flag={rightFlag}
          bold={!leftGaat}
        />
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
        const display = displayScore(score?.score ?? 0, {
          afronden: boompje.settings.afronden,
          format: boompje.format,
        });
        const flag = flagFor(giffie, bucket.id, isGegaan);
        return (
          <View key={bucket.id} style={styles.compactCol}>
            {flag ? (
              <FlagBadge label={flag} />
            ) : (
              <Text style={[styles.compactScore, isGegaan && styles.scoreBold]}>
                {display}
              </Text>
            )}
          </View>
        );
      })}
    </>
  );
}

const flagFor = (
  giffie: Giffie,
  bucketId: string,
  isGegaanBucket: boolean,
): 'NAT' | 'PIT' | 'VRZ' | null => {
  if (giffie.verzaakt === bucketId) return 'VRZ';
  if (giffie.nat && isGegaanBucket) return 'NAT';
  if (giffie.pit === bucketId) return 'PIT';
  return null;
};

function ScoreOrFlag({
  score,
  flag,
  bold,
}: {
  score: number;
  flag: 'NAT' | 'PIT' | 'VRZ' | null;
  bold: boolean;
}) {
  if (flag) {
    return <FlagBadge label={flag} />;
  }
  return <Text style={[styles.score, bold && styles.scoreBold]}>{score}</Text>;
}

function FlagBadge({ label }: { label: 'NAT' | 'PIT' | 'VRZ' }) {
  const palette =
    label === 'NAT'
      ? { bg: Palette.redAction, fg: Palette.white }
      : label === 'PIT'
      ? { bg: Palette.greenAction, fg: Palette.white }
      : { bg: Palette.greyDark, fg: Palette.white };
  return (
    <View style={[styles.flagBadge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.flagText, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

function TotalsRow({ boompje }: { boompje: Boompje }) {
  const isTwoBucket = boompje.buckets.length === 2;

  if (isTwoBucket) {
    const [left, right] = boompje.buckets;
    return (
      <View style={styles.totalsRow}>
        <Text style={styles.numberCol}>=</Text>
        <View style={styles.scoreCol}>
          <Text style={styles.totalScore}>
            {displayScore(boompje.totals[left.id] ?? 0, {
              afronden: boompje.settings.afronden,
              format: boompje.format,
            })}
          </Text>
        </View>
        <Text style={styles.totalDivider}>•</Text>
        <View style={styles.scoreCol}>
          <Text style={styles.totalScore}>
            {displayScore(boompje.totals[right.id] ?? 0, {
              afronden: boompje.settings.afronden,
              format: boompje.format,
            })}
          </Text>
        </View>
        <Text style={styles.suffix}> </Text>
      </View>
    );
  }

  return (
    <View style={styles.totalsRow}>
      <Text style={styles.numberCol}>=</Text>
      <Text style={styles.troef}> </Text>
      {boompje.buckets.map((bucket) => (
        <View key={bucket.id} style={styles.compactCol}>
          <Text style={styles.totalScore}>
            {displayScore(boompje.totals[bucket.id] ?? 0, {
              afronden: boompje.settings.afronden,
              format: boompje.format,
            })}
          </Text>
        </View>
      ))}
      <Text style={styles.suffix}> </Text>
    </View>
  );
}

const bucketOfSeat = (boompje: Boompje, seat: number): ScoreBucket | undefined =>
  boompje.buckets.find((bucket) => bucket.seats.includes(seat));

const initialFor = (giffie: Giffie, boompje: Boompje) => {
  const participant = boompje.participants.find((p) => p.seat === giffie.gegaan_seat);
  return (participant?.player.display_name[0] ?? '?').toUpperCase();
};

const styles = StyleSheet.create({
  table: { paddingTop: Spacing.sm },
  tableContent: { gap: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT,
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
  flagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 48,
    alignItems: 'center',
  },
  flagText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ROW_HEIGHT + 4,
    borderTopWidth: 2,
    borderTopColor: Palette.blueDark,
    backgroundColor: Palette.blueVeryLight,
  },
  totalDivider: {
    color: Palette.blueDark,
    fontWeight: '700',
    paddingHorizontal: Spacing.sm,
  },
  totalScore: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.blueDark,
    textAlign: 'center',
    minWidth: 48,
  },
});
