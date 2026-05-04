import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Palette, Spacing, Typography } from '@/constants/theme';

export const KEYBOARD_DONE_ACCESSORY_ID = 'klaverjasKeyboardDone';

export function KeyboardDoneAccessory() {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={KEYBOARD_DONE_ACCESSORY_ID}>
      <View style={styles.bar}>
        <Pressable onPress={Keyboard.dismiss} hitSlop={8} style={styles.btn}>
          <Text style={styles.btnText}>Klaar</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Palette.greyVeryLight,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.greyLight,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  btn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  btnText: {
    ...Typography.bodyBold,
    color: Palette.blueDark,
  },
});
