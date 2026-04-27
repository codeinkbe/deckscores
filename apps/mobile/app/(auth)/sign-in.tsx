import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Screen } from '@/components/ui/screen';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  const isFetching = fetchStatus === 'fetching';

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) return;

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace('/');
        },
      });
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Inloggen</Text>
      <Text style={styles.subtitle}>Welkom terug</Text>

      <KlaverjasInput
        label="E-mail"
        value={emailAddress}
        onChangeText={setEmailAddress}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="naam@email.nl"
        error={errors?.fields.identifier?.message}
      />
      <KlaverjasInput
        label="Wachtwoord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
        error={errors?.fields.password?.message}
      />

      <KlaverjasButton
        label="Inloggen"
        variant="primary"
        size="lg"
        fullWidth
        onPress={handleSubmit}
        disabled={isFetching || !emailAddress || !password}
      />

      <View style={styles.linkRow}>
        <Text style={styles.helper}>Nog geen account?</Text>
        <Link href="/(auth)/sign-up" replace>
          <Text style={styles.link}>Registreren</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...Typography.title, color: Palette.blueDark },
  subtitle: { ...Typography.subheading, color: Palette.greyDark },
  helper: { color: Palette.greyMid },
  link: { color: Palette.blueDark, fontWeight: '700' },
  linkRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
});
