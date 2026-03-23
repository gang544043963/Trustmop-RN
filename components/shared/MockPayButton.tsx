import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { mockPay, mockRelease } from '@/data/services/order.service';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

interface MockPayButtonProps {
  orderId: string;
  onSuccess: () => void;
}

type State = 'idle' | 'loading' | 'success';

export default function MockPayButton({ orderId, onSuccess }: MockPayButtonProps) {
  const [state, setState] = useState<State>('idle');

  const handlePress = async () => {
    if (state !== 'idle') return;
    setState('loading');
    try {
      await mockPay(orderId);
      await mockRelease(orderId);
      setState('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch {
      setState('idle');
    }
  };

  const isDisabled = state !== 'idle';

  return (
    <Pressable
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      onPress={handlePress}
      disabled={isDisabled}
    >
      {state === 'loading' && <ActivityIndicator color={Colors.white} style={styles.icon} />}
      <Text style={styles.text}>
        {state === 'success' ? '✓ Payment Successful' : 'Pay Now'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: '600',
  },
});
