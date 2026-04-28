import { useAuth } from '@clerk/expo';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const FOOTER_OVERLAY_OPACITY = 0.55;

export default function WelcomeScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingWrapper]} edges={['top', 'bottom', 'left', 'right']}>
        <ActivityIndicator color={Palette.blueDark} size="large" />
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ImageBackground
        source={require('@/assets/images/heroimage.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.bottomArea}>
          <View style={styles.footer}>
            <View style={styles.footerOverlay} />
            <View style={styles.footerContent}>
              <Text style={styles.title}>DeckScores</Text>
              <Text style={styles.tagline}>Klaverjas scores bijhouden</Text>
              <KlaverjasButton
                label="Inloggen"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.push('/(auth)/sign-in')}
              />
              <KlaverjasButton
                label="Registreren"
                variant="outline"
                size="lg"
                fullWidth
                onPress={() => router.push('/(auth)/sign-up')}
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.blueDark,
  },
  loadingWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.white,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  footer: {
    position: 'relative',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    overflow: 'hidden',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  footerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Palette.black,
    opacity: FOOTER_OVERLAY_OPACITY,
  },
  footerContent: {
    gap: Spacing.md,
    zIndex: 1,
  },
  title: {
    ...Typography.heading,
    color: Palette.white,
    textAlign: 'center',
  },
  tagline: {
    ...Typography.body,
    color: Palette.blueLight,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
});
