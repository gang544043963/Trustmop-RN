import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useProviderStore } from '@/stores/provider.store';
import { useUserStore } from '@/stores/user.store';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { role, phone } = useLocalSearchParams<{ role: 'user' | 'provider'; phone: string }>();

  const [displayName, setDisplayName] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [governmentIdPhoto, setGovernmentIdPhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setSession } = useAuthStore();
  const { createProfile } = useUserStore();
  const { createProvider } = useProviderStore();

  const fullPhone = `+63${phone}`;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setGovernmentIdPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }
    if (role === 'user' && !serviceAddress.trim()) {
      setError('Service address is required');
      return;
    }
    if (role === 'provider' && !governmentIdPhoto) {
      setError('Government ID photo is required');
      return;
    }

    setLoading(true);
    try {
      if (role === 'user') {
        await createProfile({
          phone: fullPhone,
          displayName: displayName.trim(),
          serviceAddress: serviceAddress.trim(),
        });
        const user = useUserStore.getState().user;
        const current = useAuthStore.getState().session;
        if (current && user) {
          setSession({ ...current, userId: user.id });
        }
        router.replace('/user/home' as any);
      } else {
        await createProvider({
          phone: fullPhone,
          displayName: displayName.trim(),
          governmentIdPhoto,
        });
        const provider = useProviderStore.getState().provider;
        const current = useAuthStore.getState().session;
        if (current && provider) {
          setSession({ ...current, providerId: provider.id, activeIdentity: 'provider' });
        }
        router.replace('/provider/task-hall' as any);
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>
          {role === 'provider'
            ? 'Tell clients a bit about yourself'
            : 'Just a few details to get started'}
        </Text>

        <Text style={styles.label}>Display Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          placeholderTextColor={Colors.gray400}
          value={displayName}
          onChangeText={(t) => {
            setError('');
            setDisplayName(t);
          }}
        />

        {role === 'user' && (
          <>
            <Text style={styles.label}>Service Address *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="e.g. Unit 12B Ayala Tower, Makati City"
              placeholderTextColor={Colors.gray400}
              value={serviceAddress}
              onChangeText={(t) => {
                setError('');
                setServiceAddress(t);
              }}
              multiline
              numberOfLines={3}
            />
          </>
        )}

        {role === 'provider' && (
          <>
            <Text style={styles.label}>Government ID Photo *</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage} activeOpacity={0.8}>
              {governmentIdPhoto ? (
                <Image source={{ uri: governmentIdPhoto }} style={styles.idPreview} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Text style={styles.uploadIcon}>📷</Text>
                  <Text style={styles.uploadText}>Tap to upload ID photo</Text>
                  <Text style={styles.uploadHint}>JPEG or PNG, clear and readable</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}

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
            <Text style={styles.buttonText}>Create Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
    paddingBottom: 60,
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
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.gray900,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderWidth: 1.5,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.lg,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  uploadIcon: {
    fontSize: 32,
  },
  uploadText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  uploadHint: {
    fontSize: FontSize.sm,
    color: Colors.gray400,
  },
  idPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
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
