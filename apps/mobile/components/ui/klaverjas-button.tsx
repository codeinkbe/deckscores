import { Pressable, StyleSheet, Text, type PressableProps, type ViewStyle } from 'react-native';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export type KlaverjasButtonVariant = 'primary' | 'success' | 'danger' | 'ghost' | 'outline';
export type KlaverjasButtonSize = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: KlaverjasButtonVariant;
  size?: KlaverjasButtonSize;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const VARIANT_STYLES: Record<KlaverjasButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: Palette.blueDark, fg: Palette.white },
  success: { bg: Palette.greenAction, fg: Palette.white },
  danger: { bg: Palette.redAction, fg: Palette.white },
  ghost: { bg: 'transparent', fg: Palette.blueDark },
  outline: { bg: 'transparent', fg: Palette.blueDark, border: Palette.blueDark },
};

const SIZE_STYLES: Record<KlaverjasButtonSize, { padV: number; padH: number; font: number }> = {
  sm: { padV: Spacing.xs, padH: Spacing.md, font: 13 },
  md: { padV: Spacing.sm + 2, padH: Spacing.lg, font: 16 },
  lg: { padV: Spacing.md + 2, padH: Spacing.xl, font: 18 },
};

export function KlaverjasButton({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  style,
  ...rest
}: Props) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          paddingVertical: sizeStyle.padV,
          paddingHorizontal: sizeStyle.padH,
          borderWidth: variantStyle.border ? 2 : 0,
          borderColor: variantStyle.border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={[
          { color: variantStyle.fg, fontSize: sizeStyle.font, fontWeight: Typography.bodyBold.fontWeight },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
