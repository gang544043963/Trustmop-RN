import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { sendOtp } from '@/data/services/auth.service';

export default function PhoneScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: 'user' | 'provider' }>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtitle =
    role === 'provider'
      ? 'Enter the phone number linked to your provider account'
      : 'Enter your phone number to get started';

  const handleSubmit = async () => {
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    const fullPhone = `+63${digits}`;
    setLoading(true);
    try {
      await sendOtp(fullPhone);
      router.push(`/auth/otp?role=${role}&phone=${digits}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Enter your phone number</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.inputRow}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+63</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="9XX XXX XXXX"
            placeholderTextColor={Colors.gray400}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => {
              setError('');
              setPhone(t.replace(/\D/g, ''));
            }}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Send Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: Spacing.xl,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.gray500,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  prefix: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1.5,
    borderRightColor: Colors.gray300,
  },
  prefixText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.gray700,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.gray900,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
});
