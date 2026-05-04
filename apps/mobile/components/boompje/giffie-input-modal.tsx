import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Boompje, ScoreBucket, Seat, Troef } from '@deckscores/shared';
import {
  ALL_TROEVEN,
  bucketForSeat,
  calculateGiffie,
  PUNTEN_TE_GAAN_DREMPEL,
  TOTAAL_PUNTEN_PER_GIFFIE,
} from '@deckscores/shared';
import { TROEF_COLOR, TROEF_LABEL, TROEF_NAME } from '@/constants/troef';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KEYBOARD_DONE_ACCESSORY_ID } from '@/components/ui/keyboard-done-accessory';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  visible: boolean;
  boompje: Boompje;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: SubmitInput) => void;
};

export type SubmitInput = {
  gegaan_seat: Seat;
  troef: Troef;
  raw_scores: Record<string, { punten: number; roem: number }>;
  pit: string | null;
  verzaakt: string | null;
};

const ROEM_QUICK: number[] = [20, 50];

const computeNextMakerSeat = (boompje: Boompje): Seat =>
  ((boompje.dealer_seat + 1 + boompje.giffies.length) % boompje.settings.num_players) as Seat;

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
  saving,
  onClose,
  onSubmit,
}: Props) {
  const buckets = boompje.buckets;
  const isTwoBuckets = buckets.length === 2;

  const [gegaanSeat, setGegaanSeat] = useState<Seat>(() => computeNextMakerSeat(boompje));
  const [troef, setTroef] = useState<Troef | null>(null);
  const [puntenByBucket, setPuntenByBucket] = useState<Record<string, string>>(() =>
    initialPunten(buckets),
  );
  const [roemByBucket, setRoemByBucket] = useState<Record<string, number>>(() =>
    initialRoem(buckets),
  );
  const [pit, setPit] = useState<string | null>(null);
  const [verzaakt, setVerzaakt] = useState<string | null>(null);
  const [nat, setNat] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setGegaanSeat(computeNextMakerSeat(boompje));
    setTroef(null);
    setPuntenByBucket(initialPunten(buckets));
    setRoemByBucket(initialRoem(buckets));
    setPit(null);
    setVerzaakt(null);
    setNat(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, boompje.id, boompje.giffies.length]);

  const gegaanBucket = bucketForSeat(buckets, gegaanSeat);

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
    : nat
    ? true
    : buckets.every((bucket) => puntenByBucket[bucket.id] !== '');

  const calculation = useMemo(() => {
    if (!troef || !inputComplete) return null;
    return calculateGiffie(
      { gegaan_seat: gegaanSeat, troef, raw_scores: rawScores, pit, verzaakt },
      buckets,
    );
  }, [troef, inputComplete, gegaanSeat, rawScores, pit, verzaakt, buckets]);

  const canSubmit = !saving && Boolean(calculation);

  const handleSubmit = () => {
    if (!troef || !calculation) return;
    onSubmit({
      gegaan_seat: gegaanSeat,
      troef,
      raw_scores: rawScores,
      pit,
      verzaakt,
    });
  };

  const handlePickBucket = (bucket: ScoreBucket) => {
    if (bucket.seats.includes(gegaanSeat)) return;
    const rotation = computeNextMakerSeat(boompje);
    setGegaanSeat(bucket.seats.includes(rotation) ? rotation : bucket.seats[0]);
  };

  const setPuntenForBucket = (bucketId: string, value: string) =>
    setPuntenByBucket((prev) => ({ ...prev, [bucketId]: value }));

  const handlePuntenChange = (bucketId: string, value: string) => {
    if (!isTwoBuckets) {
      setPuntenForBucket(bucketId, value);
      return;
    }
    const other = buckets.find((bucket) => bucket.id !== bucketId);
    if (!other) {
      setPuntenForBucket(bucketId, value);
      return;
    }
    if (value === '') {
      setPuntenByBucket((prev) => ({ ...prev, [bucketId]: '', [other.id]: '' }));
      return;
    }
    const entered = Number(value);
    const remaining = Math.max(0, TOTAAL_PUNTEN_PER_GIFFIE - entered);
    setPuntenByBucket((prev) => ({
      ...prev,
      [bucketId]: value,
      [other.id]: String(remaining),
    }));
  };

  const addRoem = (bucketId: string, amount: number) =>
    setRoemByBucket((prev) => ({ ...prev, [bucketId]: (prev[bucketId] ?? 0) + amount }));

  const resetRoem = (bucketId: string) =>
    setRoemByBucket((prev) => ({ ...prev, [bucketId]: 0 }));

  const handleNat = () => {
    const nextNat = !nat;
    setNat(nextNat);
    if (nextNat) {
      const next = initialPunten(buckets);
      next[gegaanBucket.id] = '0';
      if (isTwoBuckets) {
        const tegen = buckets.find((bucket) => bucket.id !== gegaanBucket.id);
        if (tegen) next[tegen.id] = String(TOTAAL_PUNTEN_PER_GIFFIE);
      }
      setPuntenByBucket(next);
    }
  };

  const togglePit = (bucketId: string) =>
    setPit((current) => (current === bucketId ? null : bucketId));

  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={Keyboard.dismiss}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Giffie {boompje.giffies.length + 1}</Text>
              {troef ? (
                <Text style={[styles.troef, { color: TROEF_COLOR[troef] }]}>
                  {TROEF_LABEL[troef]}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Palette.greyDark} />
            </Pressable>
          </View>

          <Text style={styles.subTitle}>
            {gegaanBucket.label} {isTwoBuckets ? 'gaan' : 'gaat'}
            {troef ? ` op ${TROEF_NAME[troef]}` : ''}
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Section title="Wie gaat?">
              <View style={styles.bucketPickerRow}>
                {buckets.map((bucket) => {
                  const isSelected = bucket.seats.includes(gegaanSeat);
                  return (
                    <Pressable
                      key={bucket.id}
                      onPress={() => handlePickBucket(bucket)}
                      style={({ pressed }) => [
                        styles.bucketPickerBtn,
                        isSelected && styles.bucketPickerBtnSelected,
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.bucketPickerText,
                          isSelected && styles.bucketPickerTextSelected,
                        ]}
                      >
                        {bucket.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Section>

            <Section title="Op welke kleur?">
              <View style={styles.troefRow}>
                {ALL_TROEVEN.map((t) => {
                  const isSelected = troef === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTroef(t)}
                      style={({ pressed }) => [
                        styles.troefBtn,
                        isSelected && styles.troefBtnSelected,
                        pressed && styles.optionPressed,
                      ]}
                    >
                      <Text style={[styles.troefSymbol, { color: TROEF_COLOR[t] }]}>
                        {TROEF_LABEL[t]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Section>

            <View style={styles.divider} />

            <View style={styles.columns}>
              {buckets.map((bucket) => {
                const isGegaan = bucket.id === gegaanBucket.id;
                return (
                  <BucketColumn
                    key={bucket.id}
                    label={bucket.label}
                    isGegaan={isGegaan}
                    punten={puntenByBucket[bucket.id] ?? ''}
                    onPuntenChange={(v) => handlePuntenChange(bucket.id, v)}
                    roem={roemByBucket[bucket.id] ?? 0}
                    onAddRoem={(amount) => addRoem(bucket.id, amount)}
                    onResetRoem={() => resetRoem(bucket.id)}
                    natActive={nat && isGegaan}
                    onNat={isGegaan ? handleNat : undefined}
                    pitActive={pit === bucket.id}
                    onPit={() => togglePit(bucket.id)}
                  />
                );
              })}
            </View>

            <View style={styles.verzaaktRow}>
              <Pressable
                onPress={() =>
                  setVerzaakt((current) => cycleBucket(buckets, current, buckets[0].id))
                }
                style={({ pressed }) => [
                  styles.verzaaktBtn,
                  verzaakt !== null && styles.verzaaktBtnActive,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text
                  style={[
                    styles.verzaaktText,
                    verzaakt !== null && styles.verzaaktTextActive,
                  ]}
                >
                  {verzaakt === null
                    ? 'VERZAAKT'
                    : `VERZAAKT (${labelForBucket(buckets, verzaakt)})`}
                </Text>
              </Pressable>
            </View>

            {calculation && calculation.warnings.length > 0 ? (
              <View style={styles.warnings}>
                {calculation.warnings.map((warning) => (
                  <Text key={warning} style={styles.warning}>
                    {warning}
                  </Text>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <KlaverjasButton
            label={
              !troef
                ? 'Kies eerst een troef'
                : saving
                ? 'Opslaan...'
                : 'Opslaan giffie'
            }
            variant="success"
            size="lg"
            fullWidth
            disabled={!canSubmit}
            onPress={handleSubmit}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const labelForBucket = (buckets: ScoreBucket[], id: string) =>
  buckets.find((bucket) => bucket.id === id)?.label ?? id;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

type BucketColumnProps = {
  label: string;
  isGegaan: boolean;
  punten: string;
  onPuntenChange: (value: string) => void;
  roem: number;
  onAddRoem: (amount: number) => void;
  onResetRoem: () => void;
  natActive: boolean;
  onNat?: () => void;
  pitActive: boolean;
  onPit: () => void;
};

function BucketColumn({
  label,
  isGegaan,
  punten,
  onPuntenChange,
  roem,
  onAddRoem,
  onResetRoem,
  natActive,
  onNat,
  pitActive,
  onPit,
}: BucketColumnProps) {
  const puntenNum = Number(punten || '0');
  const totaal = puntenNum + roem;
  const teGaan = Math.max(0, PUNTEN_TE_GAAN_DREMPEL - totaal);
  const gemaakt = totaal >= PUNTEN_TE_GAAN_DREMPEL;

  return (
    <View style={[styles.col, isGegaan && styles.colGegaan]}>
      <View style={styles.colHeader}>
        <Text style={[styles.colTitle, isGegaan && styles.colTitleGegaan]}>
          {label.toUpperCase()}
        </Text>
        {isGegaan ? <Text style={styles.gegaanTag}>GAAT</Text> : null}
      </View>

      <TextInput
        keyboardType="number-pad"
        inputAccessoryViewID={
          Platform.OS === 'ios' ? KEYBOARD_DONE_ACCESSORY_ID : undefined
        }
        value={punten}
        onChangeText={(text) => onPuntenChange(text.replace(/[^0-9]/g, ''))}
        style={styles.puntenInput}
        placeholder="0"
        placeholderTextColor={Palette.greyMid}
      />

      {isGegaan ? (
        <Text
          style={[styles.teGaanText, gemaakt ? styles.teGaanGemaakt : styles.teGaanOpen]}
        >
          {gemaakt ? 'Gemaakt' : `Nog ${teGaan} om te maken`}
        </Text>
      ) : (
        <View style={styles.teGaanFiller} />
      )}

      <View style={styles.roemHeader}>
        <Text style={styles.roemValue}>Roem: {roem}</Text>
        {roem > 0 ? (
          <Pressable onPress={onResetRoem} hitSlop={6} style={styles.roemReset}>
            <Ionicons name="refresh" size={14} color={Palette.greyDark} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.roemRow}>
        {ROEM_QUICK.map((amount) => (
          <Pressable
            key={amount}
            onPress={() => onAddRoem(amount)}
            style={({ pressed }) => [styles.roemBtn, pressed && styles.optionPressed]}
          >
            <Text style={styles.roemBtnNumber}>+{amount}</Text>
            <Text style={styles.roemBtnUnit}>roem</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        {onNat ? (
          <ActionButton label="NAT" active={natActive} tone="danger" onPress={onNat} />
        ) : (
          <View style={styles.actionFiller} />
        )}
        <ActionButton label="PIT" active={pitActive} tone="success" onPress={onPit} />
      </View>
    </View>
  );
}

function ActionButton({
  label,
  active,
  tone,
  onPress,
}: {
  label: string;
  active: boolean;
  tone: 'danger' | 'success';
  onPress: () => void;
}) {
  const activeBg = tone === 'danger' ? Palette.redAction : Palette.greenAction;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        active && { backgroundColor: activeBg, borderColor: activeBg },
        pressed && styles.optionPressed,
      ]}
    >
      <Text style={[styles.actionText, active && styles.actionTextActive]}>{label}</Text>
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
    maxHeight: '94%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { ...Typography.heading, color: Palette.blueDark },
  troef: { fontSize: 24, fontWeight: '700' },
  subTitle: { ...Typography.bodyBold, color: Palette.greyDark },
  scroll: { maxHeight: '80%' },
  scrollContent: { gap: Spacing.md, paddingBottom: Spacing.lg },
  section: { gap: Spacing.xs },
  sectionTitle: {
    ...Typography.label,
    color: Palette.greyMid,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bucketPickerRow: { flexDirection: 'row', gap: Spacing.sm },
  bucketPickerBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Palette.greyLight,
    backgroundColor: Palette.white,
    alignItems: 'center',
  },
  bucketPickerBtnSelected: {
    borderColor: Palette.blueDark,
    backgroundColor: Palette.blueVeryLight,
  },
  bucketPickerText: { ...Typography.subheading, color: Palette.greyDark },
  bucketPickerTextSelected: { color: Palette.blueDark, fontWeight: '800' },
  troefRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'space-between' },
  troefBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Palette.greyLight,
    backgroundColor: Palette.white,
    alignItems: 'center',
  },
  troefBtnSelected: {
    borderColor: Palette.blueDark,
    backgroundColor: Palette.blueVeryLight,
  },
  troefSymbol: { fontSize: 28 },
  divider: {
    height: 1,
    backgroundColor: Palette.greyLight,
    marginVertical: Spacing.xs,
  },
  columns: { flexDirection: 'row', gap: Spacing.sm },
  col: {
    flex: 1,
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Palette.greyVeryLight,
  },
  colGegaan: {
    backgroundColor: Palette.blueVeryLight,
    borderWidth: 2,
    borderColor: Palette.blueDark,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  colTitle: {
    ...Typography.subheading,
    color: Palette.greyDark,
    letterSpacing: 1,
  },
  colTitleGegaan: { color: Palette.blueDark },
  gegaanTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.white,
    backgroundColor: Palette.blueDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    letterSpacing: 1,
  },
  puntenInput: {
    borderWidth: 1,
    borderColor: Palette.greyLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: Palette.white,
    color: Palette.black,
  },
  teGaanText: { textAlign: 'center', fontSize: 12, fontWeight: '700' },
  teGaanOpen: { color: Palette.redAction },
  teGaanGemaakt: { color: Palette.greenAction },
  teGaanFiller: { height: 18 },
  roemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  roemValue: { ...Typography.label, color: Palette.greyDark },
  roemReset: {
    padding: 2,
    borderRadius: Radius.sm,
    backgroundColor: Palette.white,
  },
  roemRow: { flexDirection: 'row', gap: Spacing.xs },
  roemBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.blueLight,
    alignItems: 'center',
  },
  roemBtnNumber: { fontSize: 18, fontWeight: '800', color: Palette.blueDark },
  roemBtnUnit: { fontSize: 10, color: Palette.greyMid, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Palette.greyLight,
    backgroundColor: Palette.white,
    alignItems: 'center',
  },
  actionFiller: { flex: 1 },
  actionText: { fontWeight: '800', color: Palette.greyDark, fontSize: 13, letterSpacing: 1 },
  actionTextActive: { color: Palette.white },
  optionPressed: { opacity: 0.85 },
  verzaaktRow: { alignItems: 'center' },
  verzaaktBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Palette.greyLight,
    backgroundColor: Palette.white,
  },
  verzaaktBtnActive: {
    borderColor: Palette.redAction,
    backgroundColor: Palette.redAction,
  },
  verzaaktText: {
    fontWeight: '800',
    color: Palette.greyDark,
    fontSize: 13,
    letterSpacing: 1,
  },
  verzaaktTextActive: { color: Palette.white },
  warnings: { gap: 4 },
  warning: { color: Palette.redAction, fontSize: 12, textAlign: 'center' },
});
