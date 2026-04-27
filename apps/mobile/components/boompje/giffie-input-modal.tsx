import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Boompje, ScoreBucket, Troef } from '@deckscores/shared';
import { bucketForSeat, calculateGiffie, TOTAAL_PUNTEN_PER_GIFFIE } from '@deckscores/shared';
import { TROEF_COLOR, TROEF_LABEL, TROEF_NAME } from '@/constants/troef';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Telhulp } from '@/components/boompje/telhulp';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Seat = number;

type Props = {
  visible: boolean;
  boompje: Boompje;
  gegaanSeat: Seat;
  troef: Troef;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: SubmitInput) => void;
};

export type SubmitInput = {
  raw_scores: Record<string, { punten: number; roem: number }>;
  pit: string | null;
  verzaakt: string | null;
};

const ROEM_OPTIES: { label: string; punten: number }[] = [
  { label: 'Stuk', punten: 20 },
  { label: 'Drie', punten: 20 },
  { label: 'Vier', punten: 50 },
  { label: '4-gelijk', punten: 100 },
  { label: '4-boer', punten: 200 },
];

const initialPunten = (buckets: ScoreBucket[]): Record<string, string> =>
  Object.fromEntries(buckets.map((bucket) => [bucket.id, '']));

const initialRoem = (buckets: ScoreBucket[]): Record<string, number> =>
  Object.fromEntries(buckets.map((bucket) => [bucket.id, 0]));

const cycleBucket = (
  buckets: ScoreBucket[],
  current: string | null,
  preferred: string,
): string | null => {
  const ids = buckets.map((bucket) => bucket.id);
  if (current === null) return preferred;
  const next = ids.indexOf(current) + 1;
  return next >= ids.length ? null : ids[next];
};

export function GiffieInputModal({
  visible,
  boompje,
  gegaanSeat,
  troef,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const buckets = boompje.buckets;
  const gegaanBucket = bucketForSeat(buckets, gegaanSeat);
  const isTwoBuckets = buckets.length === 2;

  const [puntenByBucket, setPuntenByBucket] = useState<Record<string, string>>(() =>
    initialPunten(buckets),
  );
  const [roemByBucket, setRoemByBucket] = useState<Record<string, number>>(() =>
    initialRoem(buckets),
  );
  const [pit, setPit] = useState<string | null>(null);
  const [verzaakt, setVerzaakt] = useState<string | null>(null);
  const [showTelhulp, setShowTelhulp] = useState(false);

  const rawScores = useMemo(() => {
    const result: Record<string, { punten: number; roem: number }> = {};
    for (const bucket of buckets) {
      result[bucket.id] = {
        punten: Number(puntenByBucket[bucket.id] || '0'),
        roem: roemByBucket[bucket.id] ?? 0,
      };
    }
    return result;
  }, [buckets, puntenByBucket, roemByBucket]);

  const inputComplete = verzaakt
    ? true
    : buckets.every((bucket) => puntenByBucket[bucket.id] !== '');

  const preview = useMemo(() => {
    if (!inputComplete) return null;
    return calculateGiffie(
      { gegaan_seat: gegaanSeat, troef, raw_scores: rawScores, pit, verzaakt },
      buckets,
      { afronden: boompje.settings.afronden },
    );
  }, [
    inputComplete,
    gegaanSeat,
    troef,
    rawScores,
    pit,
    verzaakt,
    buckets,
    boompje.settings.afronden,
  ]);

  const reset = () => {
    setPuntenByBucket(initialPunten(buckets));
    setRoemByBucket(initialRoem(buckets));
    setPit(null);
    setVerzaakt(null);
    setShowTelhulp(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!preview) return;
    onSubmit({ raw_scores: rawScores, pit, verzaakt });
    reset();
  };

  const setPuntenForBucket = (bucketId: string, value: string) =>
    setPuntenByBucket((prev) => ({ ...prev, [bucketId]: value }));

  const setRoemForBucket = (bucketId: string, value: number) =>
    setRoemByBucket((prev) => ({ ...prev, [bucketId]: value }));

  const handleNat = () => {
    const next = initialPunten(buckets);
    next[gegaanBucket.id] = '0';
    if (isTwoBuckets) {
      const tegen = buckets.find((bucket) => bucket.id !== gegaanBucket.id);
      if (tegen) next[tegen.id] = String(TOTAAL_PUNTEN_PER_GIFFIE);
    }
    setPuntenByBucket(next);
  };

  const fillFromTelhulp = (punten: number, bucketId: string) => {
    if (isTwoBuckets) {
      const other = buckets.find((bucket) => bucket.id !== bucketId);
      const next = { ...puntenByBucket, [bucketId]: String(punten) };
      if (other) next[other.id] = String(TOTAAL_PUNTEN_PER_GIFFIE - punten);
      setPuntenByBucket(next);
    } else {
      setPuntenForBucket(bucketId, String(punten));
    }
    setShowTelhulp(false);
  };

  const pitLabel =
    pit === null ? 'PIT' : `PIT (${labelForBucket(buckets, pit)})`;
  const verzaaktLabel =
    verzaakt === null ? 'VERZAAKT' : `VERZAAKT (${labelForBucket(buckets, verzaakt)})`;

  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Giffie {boompje.giffies.length + 1}{' '}
              <Text style={[styles.troef, { color: TROEF_COLOR[troef] }]}>
                {TROEF_LABEL[troef]}
              </Text>
            </Text>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Palette.greyDark} />
            </Pressable>
          </View>
          <Text style={styles.subTitle}>
            {gegaanBucket.label} gaat op {TROEF_NAME[troef]}
          </Text>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.row}>
              {buckets.map((bucket) => (
                <PuntenColumn
                  key={bucket.id}
                  label={`${bucket.label} - punten`}
                  value={puntenByBucket[bucket.id] ?? ''}
                  onChangeText={(value) => setPuntenForBucket(bucket.id, value)}
                />
              ))}
            </View>

            <View style={styles.row}>
              {buckets.map((bucket) => (
                <RoemColumn
                  key={bucket.id}
                  label={`${bucket.label} - roem`}
                  value={roemByBucket[bucket.id] ?? 0}
                  onChange={(value) => setRoemForBucket(bucket.id, value)}
                />
              ))}
            </View>

            <View style={styles.specialButtons}>
              <SpecialButton label="NAT" active={false} onPress={handleNat} />
              <SpecialButton
                label={pitLabel}
                active={pit !== null}
                onPress={() => setPit((current) => cycleBucket(buckets, current, gegaanBucket.id))}
              />
              <SpecialButton
                label={verzaaktLabel}
                active={verzaakt !== null}
                onPress={() =>
                  setVerzaakt((current) => cycleBucket(buckets, current, buckets[0].id))
                }
              />
            </View>

            <Pressable
              onPress={() => setShowTelhulp((v) => !v)}
              style={styles.telhulpToggle}
            >
              <Ionicons
                name={showTelhulp ? 'chevron-up' : 'calculator-outline'}
                size={18}
                color={Palette.blueDark}
              />
              <Text style={styles.telhulpToggleText}>
                {showTelhulp ? 'Verberg telhulp' : 'Telhulp'}
              </Text>
            </Pressable>

            {showTelhulp ? (
              <View style={styles.telhulpBox}>
                <Telhulp
                  buckets={buckets}
                  onApply={fillFromTelhulp}
                  onCancel={() => setShowTelhulp(false)}
                />
              </View>
            ) : null}

            {preview ? (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>Resultaat</Text>
                {preview.warnings.map((warning) => (
                  <Text key={warning} style={styles.warning}>
                    {warning}
                  </Text>
                ))}
                {buckets.map((bucket) => (
                  <View key={bucket.id} style={styles.previewRow}>
                    <Text style={styles.previewLabel}>{bucket.label}</Text>
                    <Text style={styles.previewScore}>
                      {preview.scores[bucket.id]?.score ?? 0}
                    </Text>
                  </View>
                ))}
                {preview.nat ? (
                  <Text style={styles.flag}>
                    NAT! Tegenstanders krijgen alle punten + roem.
                  </Text>
                ) : null}
                {preview.pit ? (
                  <Text style={styles.flag}>
                    PIT! +100 voor {labelForBucket(buckets, preview.pit)}.
                  </Text>
                ) : null}
                {preview.verzaakt ? (
                  <Text style={styles.flag}>
                    VERZAAKT door {labelForBucket(buckets, preview.verzaakt)}.
                  </Text>
                ) : null}
              </View>
            ) : null}
          </ScrollView>

          <KlaverjasButton
            label={saving ? 'Opslaan...' : 'Opslaan giffie'}
            variant="success"
            size="lg"
            fullWidth
            disabled={saving || !preview}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
}

const labelForBucket = (buckets: ScoreBucket[], id: string) =>
  buckets.find((bucket) => bucket.id === id)?.label ?? id;

function PuntenColumn({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.col}>
      <Text style={styles.fieldLabel} numberOfLines={1}>
        {label}
      </Text>
      <TextInput
        keyboardType="number-pad"
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
        style={styles.puntenInput}
        placeholder="0"
        placeholderTextColor={Palette.greyMid}
      />
    </View>
  );
}

function RoemColumn({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.col}>
      <Text style={styles.fieldLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.roemTotalRow}>
        <Text style={styles.roemValue}>{value}</Text>
        <Pressable
          onPress={() => onChange(0)}
          style={({ pressed }) => [styles.roemClearBtn, pressed && styles.optionPressed]}
          hitSlop={6}
        >
          <Ionicons name="refresh" size={14} color={Palette.greyDark} />
        </Pressable>
      </View>
      <View style={styles.roemGrid}>
        {ROEM_OPTIES.map((optie) => (
          <RoemButton
            key={optie.label}
            label={`${optie.label} +${optie.punten}`}
            onPress={() => onChange(value + optie.punten)}
          />
        ))}
      </View>
    </View>
  );
}

function RoemButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.roemBtn, pressed && styles.optionPressed]}
    >
      <Text style={styles.roemBtnText}>{label}</Text>
    </Pressable>
  );
}

function SpecialButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.specialBtn,
        active && styles.specialBtnActive,
        pressed && styles.optionPressed,
      ]}
    >
      <Text style={[styles.specialBtnText, active && styles.specialBtnTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
    maxHeight: '90%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.heading, color: Palette.blueDark },
  troef: { fontSize: 24 },
  subTitle: { color: Palette.greyDark, fontSize: 14 },
  scroll: { maxHeight: '78%' },
  scrollContent: { gap: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  col: { flex: 1, minWidth: 90, gap: Spacing.xs },
  fieldLabel: { ...Typography.label, color: Palette.greyDark },
  puntenInput: {
    borderWidth: 1,
    borderColor: Palette.greyLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: Palette.white,
    color: Palette.black,
  },
  roemTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  roemValue: { fontSize: 22, fontWeight: '700', textAlign: 'center', color: Palette.black },
  roemClearBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.sm,
    backgroundColor: Palette.greyVeryLight,
  },
  roemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  roemBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Palette.greyVeryLight,
  },
  roemBtnText: { color: Palette.greyDark, fontWeight: '700', fontSize: 12 },
  optionPressed: { opacity: 0.85 },
  specialButtons: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  specialBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Palette.greyLight,
    alignItems: 'center',
  },
  specialBtnActive: {
    borderColor: Palette.redAction,
    backgroundColor: Palette.redAction,
  },
  specialBtnText: { fontWeight: '700', color: Palette.greyDark, fontSize: 12 },
  specialBtnTextActive: { color: Palette.white },
  telhulpToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  telhulpToggleText: { color: Palette.blueDark, fontWeight: '700' },
  telhulpBox: {
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.md,
  },
  preview: {
    backgroundColor: Palette.blueVeryLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  previewTitle: { ...Typography.bodyBold, color: Palette.blueDark },
  warning: { color: Palette.redAction, fontSize: 12 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  previewLabel: { color: Palette.greyDark, fontWeight: '600' },
  previewScore: { color: Palette.black, fontWeight: '700', fontSize: 18 },
  flag: { color: Palette.blueDark, fontStyle: 'italic' },
});
