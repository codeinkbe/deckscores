import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { KlaverjasInput } from '@/components/ui/klaverjas-input';
import { Screen } from '@/components/ui/screen';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const isFetching = fetchStatus === 'fetching';

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress, password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace('/');
        },
      });
    }
  };

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <Screen scroll>
        <Text style={styles.title}>Verifieer je e-mail</Text>
        <Text style={styles.helper}>We hebben een code gestuurd naar {emailAddress}.</Text>
        <KlaverjasInput
          label="Verificatiecode"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          placeholder="123456"
          error={errors?.fields.code?.message}
        />
        <KlaverjasButton
          label="Verifieer"
          variant="success"
          fullWidth
          size="lg"
          onPress={handleVerify}
          disabled={isFetching || code.length === 0}
        />
        <KlaverjasButton
          label="Stuur nieuwe code"
          variant="ghost"
          onPress={() => signUp.verifications.sendEmailCode()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Registreren</Text>
      <Text style={styles.subtitle}>Wie ben je?</Text>

      <KlaverjasInput
        label="E-mail"
        value={emailAddress}
        onChangeText={setEmailAddress}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="naam@email.nl"
        error={errors?.fields.emailAddress?.message}
      />
      <KlaverjasInput
        label="Wachtwoord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Minimaal 8 tekens"
        error={errors?.fields.password?.message}
      />

      <KlaverjasButton
        label="Volgende"
        variant="success"
        size="lg"
        fullWidth
        onPress={handleSubmit}
        disabled={isFetching || !emailAddress || !password}
      />

      <View style={styles.linkRow}>
        <Text style={styles.helper}>Al een account?</Text>
        <Link href="/(auth)/sign-in" replace>
          <Text style={styles.link}>Inloggen</Text>
        </Link>
      </View>

      <View nativeID="clerk-captcha" />
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
