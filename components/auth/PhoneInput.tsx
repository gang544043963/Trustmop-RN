import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export default function PhoneInput({ value, onChangeText, error }: PhoneInputProps) {
  const handleChange = (text: string) => {
    onChangeText(text.replace(/\D/g, ''));
  };

  return (
    <View>
      <View style={[styles.row, error ? styles.rowError : null]}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+63</Text>
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          keyboardType="phone-pad"
          maxLength={10}
          placeholder="9XXXXXXXXX"
          placeholderTextColor={Colors.gray400}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  rowError: {
    borderColor: Colors.error,
  },
  prefix: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.gray300,
  },
  prefixText: {
    fontSize: FontSize.md,
    color: Colors.gray700,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.gray900,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
});
