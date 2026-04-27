import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function KlaverjasInput({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        {...rest}
        placeholderTextColor={Palette.greyMid}
        style={[styles.input, !!error && styles.inputError, style]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  label: {
    color: Palette.greyDark,
    fontWeight: Typography.label.fontWeight,
    fontSize: Typography.label.fontSize,
  },
  input: {
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.greyLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
    color: Palette.black,
  },
  inputError: { borderColor: Palette.redAction },
  errorText: { color: Palette.redAction, fontSize: Typography.caption.fontSize },
});
