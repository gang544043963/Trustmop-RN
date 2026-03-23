import ServiceForm from '@/components/provider/ServiceForm';
import { Colors } from '@/constants/theme';
import { Service } from '@/data/types';
import { useAuthStore } from '@/stores/auth.store';
import { useProviderStore } from '@/stores/provider.store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

export default function ServiceEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { services, createService, updateService } = useProviderStore();

  const isNew = id === 'new';
  const existing = isNew ? undefined : services.find((s) => s.id === id);
  const providerId = session?.providerId ?? '';

  if (!isNew && !existing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const handleSubmit = async (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isNew) {
        await createService({ ...data, providerId });
      } else {
        await updateService(id!, data);
      }
      router.replace('/provider/services' as any);
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to save service.');
    }
  };

  return (
    <ServiceForm
      initialValues={isNew ? { providerId } : existing}
      onSubmit={handleSubmit}
    />
  );
}
