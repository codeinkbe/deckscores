import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BoompjeFormat, Op16eActie } from '@cardapp/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  format: BoompjeFormat;
  onChangeFormat: (format: BoompjeFormat) => void;
  op16e: Op16eActie;
  onChangeOp16e: (action: Op16eActie) => void;
};

const FORMAT_OPTIONS: { value: BoompjeFormat; label: string }[] = [
  { value: '16_giffies', label: '16 Giffies' },
  { value: '1500_punten', label: '1500 Punten' },
  { value: '1000_punten', label: '1000 Punten' },
];

export function FormatToggle({ format, onChangeFormat, op16e, onChangeOp16e }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.optionsList}>
        {FORMAT_OPTIONS.map((option) => {
          const selected = format === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChangeFormat(option.value)}
              style={({ pressed }) => [
                styles.optionRow,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {format === '16_giffies' ? (
        <View style={styles.makenDraaien}>
          <KlaverjasButton
            label="Maken"
            variant={op16e === 'maken' ? 'success' : 'outline'}
            onPress={() => onChangeOp16e('maken')}
          />
          <Text style={styles.helper}>Of</Text>
          <KlaverjasButton
            label="Draaien"
            variant={op16e === 'draaien' ? 'danger' : 'outline'}
            onPress={() => onChangeOp16e('draaien')}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  optionsList: {
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Palette.blueDark,
    overflow: 'hidden',
  },
  optionRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Palette.white,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Palette.blueLight,
  },
  optionPressed: { opacity: 0.85 },
  optionSelected: { backgroundColor: Palette.blueVeryLight },
  optionLabel: { ...Typography.subheading, color: Palette.greyMid },
  optionLabelSelected: { color: Palette.blueDark, fontWeight: '700' },
  makenDraaien: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  helper: { color: Palette.greyDark, fontWeight: '600' },
});
