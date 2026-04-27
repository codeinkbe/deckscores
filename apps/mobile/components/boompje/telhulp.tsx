import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  type CardCode,
  type CardCount,
  type ScoreBucket,
  NORMAAL_VALUES,
  TROEF_VALUES,
  calculateTelhulpPunten,
} from '@deckscores/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const TROEF_CARDS: { code: CardCode; label: string }[] = [
  { code: 'B', label: 'B' },
  { code: '9', label: '9' },
  { code: 'A', label: 'A' },
  { code: '10', label: '10' },
  { code: 'H', label: 'H' },
  { code: 'V', label: 'V' },
  { code: '8', label: '8' },
  { code: '7', label: '7' },
];

const NORMAAL_CARDS: { code: CardCode; label: string }[] = [
  { code: 'A', label: 'A' },
  { code: '10', label: '10' },
  { code: 'H', label: 'H' },
  { code: 'V', label: 'V' },
  { code: 'B', label: 'B' },
  { code: '9', label: '9' },
  { code: '8', label: '8' },
  { code: '7', label: '7' },
];

type Props = {
  buckets: ScoreBucket[];
  onApply: (punten: number, bucketId: string) => void;
  onCancel: () => void;
};

export function Telhulp({ buckets, onApply, onCancel }: Props) {
  const [troef, setTroef] = useState<CardCount>({});
  const [normaal, setNormaal] = useState<CardCount>({});
  const [laatsteSlag, setLaatsteSlag] = useState(false);

  const punten = useMemo(
    () =>
      calculateTelhulpPunten({
        troef_counts: troef,
        normaal_counts: normaal,
        laatste_slag: laatsteSlag,
      }),
    [troef, normaal, laatsteSlag],
  );

  const tap = (set: (cb: (prev: CardCount) => CardCount) => void, code: CardCode, max: number) =>
    set((prev) => {
      const current = prev[code] ?? 0;
      const next = (current + 1) % (max + 1);
      return { ...prev, [code]: next };
    });

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Telhulp</Text>
      <Text style={styles.helper}>Tik op een kaart om te tellen (cycle 0→max).</Text>

      <View style={styles.columns}>
        <Column
          title="Troef"
          cards={TROEF_CARDS}
          values={TROEF_VALUES}
          counts={troef}
          highlight={Palette.pinkAccent}
          onTap={(code) => tap(setTroef, code, code === 'B' || code === '9' ? 1 : 1)}
        />
        <Column
          title="Normaal"
          cards={NORMAAL_CARDS}
          values={NORMAAL_VALUES}
          counts={normaal}
          highlight={Palette.blueLight}
          onTap={(code) => tap(setNormaal, code, 3)}
        />
      </View>

      <Pressable
        onPress={() => setLaatsteSlag((v) => !v)}
        style={({ pressed }) => [
          styles.laatsteSlag,
          laatsteSlag && styles.laatsteSlagSelected,
          pressed && styles.optionPressed,
        ]}
      >
        <Text style={[styles.laatsteSlagText, laatsteSlag && styles.laatsteSlagTextSelected]}>
          Laatste slag (+10)
        </Text>
      </Pressable>

      <Text style={styles.totals}>Punten: {punten}</Text>

      <View style={styles.actions}>
        {buckets.map((bucket) => (
          <KlaverjasButton
            key={bucket.id}
            label={`Voor ${bucket.label}`}
            variant="primary"
            onPress={() => onApply(punten, bucket.id)}
            disabled={punten === 0}
          />
        ))}
        <KlaverjasButton label="Sluit" variant="ghost" onPress={onCancel} />
      </View>
    </View>
  );
}

type ColumnProps = {
  title: string;
  cards: { code: CardCode; label: string }[];
  values: Record<CardCode, number>;
  counts: CardCount;
  highlight: string;
  onTap: (code: CardCode) => void;
};

function Column({ title, cards, values, counts, highlight, onTap }: ColumnProps) {
  return (
    <View style={styles.col}>
      <Text style={styles.colTitle}>{title}</Text>
      {cards.map(({ code, label }) => {
        const count = counts[code] ?? 0;
        const value = values[code];
        return (
          <Pressable
            key={`${title}-${code}`}
            onPress={() => onTap(code)}
            style={({ pressed }) => [
              styles.cardRow,
              count > 0 && { backgroundColor: highlight, borderColor: highlight },
              pressed && styles.optionPressed,
            ]}
          >
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>{value || '-'}</Text>
            <Text style={styles.cardCount}>{count > 0 ? `x${count}` : ''}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md, padding: Spacing.md },
  title: { ...Typography.subheading, color: Palette.blueDark, textAlign: 'center' },
  helper: { color: Palette.greyMid, fontSize: 12, textAlign: 'center' },
  columns: { flexDirection: 'row', gap: Spacing.md },
  col: { flex: 1, gap: 4 },
  colTitle: { ...Typography.bodyBold, color: Palette.greyDark, textAlign: 'center' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Palette.greyLight,
    backgroundColor: Palette.white,
  },
  optionPressed: { opacity: 0.85 },
  cardLabel: { fontWeight: '700', color: Palette.black, width: 24 },
  cardValue: { color: Palette.greyDark, fontSize: 12 },
  cardCount: { color: Palette.greyDark, fontSize: 12, width: 28, textAlign: 'right' },
  laatsteSlag: {
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.greyLight,
    alignItems: 'center',
  },
  laatsteSlagSelected: { backgroundColor: Palette.blueLight, borderColor: Palette.blueDark },
  laatsteSlagText: { color: Palette.greyDark, fontWeight: '600' },
  laatsteSlagTextSelected: { color: Palette.blueDark },
  totals: {
    ...Typography.subheading,
    textAlign: 'center',
    color: Palette.blueDark,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-around', flexWrap: 'wrap' },
});
