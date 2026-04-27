import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function RegelSectie({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((value) => !value);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={Palette.blueDark}
        />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Palette.greyVeryLight,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  headerPressed: { backgroundColor: Palette.blueVeryLight },
  title: { ...Typography.subheading, color: Palette.blueDark, flex: 1, marginRight: Spacing.sm },
  body: {
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.sm,
  },
});
