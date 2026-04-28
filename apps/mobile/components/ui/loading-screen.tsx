import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.center}>
        <ActivityIndicator color={Palette.blueDark} size="large" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
