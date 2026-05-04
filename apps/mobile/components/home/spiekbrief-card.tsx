import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type CardRow = { card: string; troef: string; normaal: string };

const CARDS: CardRow[] = [
  { card: 'Boer', troef: '20', normaal: '2' },
  { card: 'Negen', troef: '14', normaal: '0' },
  { card: 'Aas', troef: '11', normaal: '11' },
  { card: 'Tien', troef: '10', normaal: '10' },
  { card: 'Heer', troef: '4', normaal: '4' },
  { card: 'Vrouw', troef: '3', normaal: '3' },
];

const ROEM_ROWS: { label: string; value: string }[] = [
  { label: '3-kaart', value: '20' },
  { label: '4-kaart', value: '50' },
  { label: 'Stuk (H+V troef)', value: '20' },
  { label: '4 gelijken', value: '100' },
  { label: '4 boeren', value: '200' },
  { label: 'Pit', value: '+100' },
];

type Props = {
  onPress: () => void;
};

export function SpiekbriefCard({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Spiekbrief</Text>
          <Text style={styles.subtitle}>Snelle puntentabel — tik voor volledige spelregels</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={Palette.blueDark} />
      </View>

      <View style={styles.grid}>
        <View style={styles.column}>
          <Text style={styles.colTitle}>Kaarten</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.cellLabel}>Kaart</Text>
            <Text style={styles.cellValue}>Troef</Text>
            <Text style={styles.cellValue}>Normaal</Text>
          </View>
          {CARDS.map((row) => (
            <View key={row.card} style={styles.tableRow}>
              <Text style={styles.cellLabel}>{row.card}</Text>
              <Text style={styles.cellValue}>{row.troef}</Text>
              <Text style={styles.cellValue}>{row.normaal}</Text>
            </View>
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.colTitle}>Roem</Text>
          {ROEM_ROWS.map((row) => (
            <View key={row.label} style={styles.tableRow}>
              <Text style={[styles.cellLabel, { flex: 1 }]} numberOfLines={1}>
                {row.label}
              </Text>
              <Text style={styles.cellValue}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.totaalRow}>
            <Text style={styles.totaalLabel}>Totaal per giffie</Text>
            <Text style={styles.totaalValue}>162</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.blueVeryLight,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  pressed: { opacity: 0.85 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerText: { flex: 1, gap: 2 },
  title: { ...Typography.subheading, color: Palette.blueDark, fontWeight: '700' },
  subtitle: { color: Palette.greyDark, fontSize: 12 },
  grid: { flexDirection: 'row', gap: Spacing.md },
  column: { flex: 1, gap: 2 },
  colTitle: { ...Typography.label, color: Palette.blueDark, marginBottom: 2 },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: Palette.blueLight,
    marginBottom: 2,
  },
  tableRow: { flexDirection: 'row', paddingVertical: 1 },
  cellLabel: { color: Palette.greyDark, fontSize: 12, flex: 1 },
  cellValue: {
    color: Palette.black,
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  totaalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: Palette.blueLight,
  },
  totaalLabel: { color: Palette.greyDark, fontSize: 12, fontWeight: '700' },
  totaalValue: { color: Palette.blueDark, fontSize: 14, fontWeight: '800' },
});
