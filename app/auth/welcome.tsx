import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>TrustMop</Text>
        <Text style={styles.tagline}>Professional cleaning services,{'\n'}right at your doorstep</Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.prompt}>How would you like to continue?</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/auth/phone?role=user')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>I am a User</Text>
          <Text style={styles.buttonSubtext}>Book cleaning services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/phone?role=provider')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>I am a Provider</Text>
          <Text style={styles.secondaryButtonSubtext}>Offer cleaning services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingTop: 100,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -1,
    marginBottom: Spacing.md,
  },
  tagline: {
    fontSize: FontSize.lg,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 26,
  },
  actions: {
    gap: Spacing.md,
  },
  prompt: {
    fontSize: FontSize.md,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
  },
  buttonSubtext: {
    fontSize: FontSize.sm,
    color: Colors.primaryLight,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.primary,
  },
  secondaryButtonSubtext: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    marginTop: 4,
  },
});
