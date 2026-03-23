import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface OtpInputProps {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
}

export default function OtpInput({ value, onChangeText, length = 6 }: OtpInputProps) {
  const handleChange = (text: string) => {
    onChangeText(text.replace(/\D/g, '').slice(0, length));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        textAlign="center"
        autoFocus
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  input: {
    width: '100%',
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    letterSpacing: 16,
    textAlign: 'center',
    color: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
  },
});
