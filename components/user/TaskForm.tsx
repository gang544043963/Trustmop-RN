import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { ServiceType } from '@/data/types';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface TaskFormData {
  serviceType: ServiceType;
  serviceAddress: string;
  scheduledDate: string;
  timeSlot: string;
  budgetMin: number;
  budgetMax: number;
  specialRequirements?: string;
}

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialAddress?: string;
  initialValues?: Partial<TaskFormData>;
  submitLabel?: string;
}

export default function TaskForm({ onSubmit, initialAddress = '', initialValues, submitLabel = 'Post Task' }: TaskFormProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(initialValues?.serviceType ?? 'regular_cleaning');
  const [address, setAddress] = useState(initialValues?.serviceAddress ?? initialAddress);
  const [date, setDate] = useState(initialValues?.scheduledDate ?? '');
  const [timeSlot, setTimeSlot] = useState(initialValues?.timeSlot ?? '');
  const [budgetMin, setBudgetMin] = useState(initialValues?.budgetMin?.toString() ?? '');
  const [budgetMax, setBudgetMax] = useState(initialValues?.budgetMax?.toString() ?? '');
  const [specialReqs, setSpecialReqs] = useState(initialValues?.specialRequirements ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = 'Address is required';
    if (!date.trim()) e.date = 'Date is required';
    if (!timeSlot.trim()) e.timeSlot = 'Time slot is required';
    if (!budgetMin.trim()) e.budgetMin = 'Budget min is required';
    if (!budgetMax.trim()) e.budgetMax = 'Budget max is required';
    const min = parseFloat(budgetMin);
    const max = parseFloat(budgetMax);
    if (!isNaN(min) && !isNaN(max) && min > max) {
      e.budgetMax = 'Budget max must be ≥ budget min';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        serviceType,
        serviceAddress: address.trim(),
        scheduledDate: date.trim(),
        timeSlot: timeSlot.trim(),
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        specialRequirements: specialReqs.trim() || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Service Type</Text>
        <View style={styles.typeRow}>
          {(['regular_cleaning', 'deep_cleaning'] as ServiceType[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.typeBtn, serviceType === t && styles.typeBtnActive]}
              onPress={() => setServiceType(t)}
            >
              <Text style={[styles.typeBtnText, serviceType === t && styles.typeBtnTextActive]}>
                {t === 'regular_cleaning' ? 'Regular' : 'Deep'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, errors.address && styles.inputError]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter service address"
          placeholderTextColor={Colors.gray400}
        />
        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={[styles.input, errors.date && styles.inputError]}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.gray400}
        />
        {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}

        <Text style={styles.label}>Time Slot</Text>
        <TextInput
          style={[styles.input, errors.timeSlot && styles.inputError]}
          value={timeSlot}
          onChangeText={setTimeSlot}
          placeholder="e.g. 09:00-11:00"
          placeholderTextColor={Colors.gray400}
        />
        {errors.timeSlot ? <Text style={styles.errorText}>{errors.timeSlot}</Text> : null}

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Budget Min (₱)</Text>
            <TextInput
              style={[styles.input, errors.budgetMin && styles.inputError]}
              value={budgetMin}
              onChangeText={setBudgetMin}
              placeholder="500"
              placeholderTextColor={Colors.gray400}
              keyboardType="numeric"
            />
            {errors.budgetMin ? <Text style={styles.errorText}>{errors.budgetMin}</Text> : null}
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Budget Max (₱)</Text>
            <TextInput
              style={[styles.input, errors.budgetMax && styles.inputError]}
              value={budgetMax}
              onChangeText={setBudgetMax}
              placeholder="1500"
              placeholderTextColor={Colors.gray400}
              keyboardType="numeric"
            />
            {errors.budgetMax ? <Text style={styles.errorText}>{errors.budgetMax}</Text> : null}
          </View>
        </View>

        <Text style={styles.label}>Special Requirements (optional)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={specialReqs}
          onChangeText={setSpecialReqs}
          placeholder="Any special instructions..."
          placeholderTextColor={Colors.gray400}
          multiline
          numberOfLines={3}
        />

        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>{submitLabel}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeBtnText: { fontSize: FontSize.sm, color: Colors.gray600, fontWeight: '600' },
  typeBtnTextActive: { color: Colors.white },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.gray800,
    marginBottom: Spacing.xs,
  },
  inputError: { borderColor: Colors.error },
  multiline: { height: 80, textAlignVertical: 'top' },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginBottom: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfField: { flex: 1 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});
