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
import { useAuthStore } from '@/stores/auth.store';

export default function OtpScreen() {
  const router = useRouter();
  const { role, phone } = useLocalSearchParams<{ role: 'user' | 'provider'; phone: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuthStore();

  const handleSubmit = async () => {
    setError('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    const fullPhone = `+63${phone}`;
    setLoading(true);
    try {
      await login(fullPhone, code, role as 'user' | 'provider');

      const current = useAuthStore.getState().session;
      if (role === 'user') {
        if (!current?.userId) {
          router.replace(`/auth/profile-setup?role=user&phone=${phone}`);
        } else {
          router.replace('/user/home' as any);
        }
      } else {
        if (!current?.providerId) {
          router.replace(`/auth/profile-setup?role=provider&phone=${phone}`);
        } else {
          router.replace('/provider/task-hall' as any);
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Invalid code. Please try again.');
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

        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          We sent a code to <Text style={styles.phoneHighlight}>+63{phone}</Text>
        </Text>
        <Text style={styles.hint}>(Use 123456 for testing)</Text>

        <TextInput
          style={styles.otpInput}
          placeholder="------"
          placeholderTextColor={Colors.gray300}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={(t) => {
            setError('');
            setCode(t.replace(/\D/g, ''));
          }}
          textAlign="center"
        />

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
            <Text style={styles.buttonText}>Verify</Text>
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
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  phoneHighlight: {
    fontWeight: '600',
    color: Colors.gray700,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.gray400,
    marginBottom: Spacing.xl,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gray900,
    letterSpacing: 12,
    marginBottom: Spacing.md,
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
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
