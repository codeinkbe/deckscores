import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Boompje, ScoreBucket } from '@deckscores/shared';
import { displayScore } from '@deckscores/shared';
import { Palette, Spacing, Typography } from '@/constants/theme';

type Props = {
  boompje: Boompje;
};

export function TeamHeader({ boompje }: Props) {
  const [showNames, setShowNames] = useState(false);
  const toggle = () => setShowNames((v) => !v);

  return (
    <View style={styles.row}>
      {boompje.buckets.map((bucket, index) => (
        <Fragment key={bucket.id}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <BucketColumn
            label={bucket.label}
            names={namesForBucket(boompje, bucket)}
            score={displayScore(boompje.totals[bucket.id] ?? 0, {
              afronden: boompje.settings.afronden,
              format: boompje.format,
            })}
            showNames={showNames}
            onToggle={toggle}
          />
        </Fragment>
      ))}
    </View>
  );
}

const namesForBucket = (boompje: Boompje, bucket: ScoreBucket): string[] => {
  if (bucket.seats.length === 1 && boompje.buckets.length !== 2) {
    return [bucket.label];
  }
  return bucket.seats
    .map((seat) => boompje.participants.find((p) => p.seat === seat)?.player.display_name)
    .filter((name): name is string => Boolean(name));
};

type ColProps = {
  label: string;
  names: string[];
  score: number;
  showNames: boolean;
  onToggle: () => void;
};

function BucketColumn({ label, names, score, showNames, onToggle }: ColProps) {
  return (
    <Pressable onPress={onToggle} style={styles.col}>
      {showNames ? (
        <View style={styles.nameStack}>
          {names.map((name) => (
            <Text key={name} style={styles.name} numberOfLines={1}>
              {name}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      )}
      <Text style={styles.score}>{score}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: Palette.blueDark,
  },
  col: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.sm, gap: Spacing.xs },
  divider: { width: 2, backgroundColor: Palette.blueDark },
  label: { fontSize: 26, fontWeight: '700', color: Palette.blueDark, letterSpacing: 1 },
  nameStack: { alignItems: 'center' },
  name: { ...Typography.bodyBold, color: Palette.blueDark },
  score: { fontSize: 36, fontWeight: '700', color: Palette.blueDark },
});
