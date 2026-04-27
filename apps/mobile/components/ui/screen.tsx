import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { Palette, Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: string;
  edges?: Edge[];
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  background = Palette.white,
  edges = ['top', 'left', 'right'],
  contentStyle,
}: Props) {
  const containerStyle = [styles.container, { backgroundColor: background }];
  const innerStyle = [padded && styles.padded, contentStyle];

  if (scroll) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, innerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={edges}>
      <View style={[styles.flex, innerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  padded: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg },
  scrollContent: { flexGrow: 1, gap: Spacing.lg },
});
