import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BorderRadius, Colors, FontSize, Spacing, UserTheme } from '@/constants/theme';
import { ServiceType } from '@/data/types';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

function parseTimeToDate(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(isNaN(h) ? 9 : h, isNaN(m) ? 0 : m, 0, 0);
  return d;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

type PickerMode = 'date' | 'startTime' | 'endTime' | null;

export default function TaskForm({ onSubmit, initialAddress = '', initialValues, submitLabel = 'Post Task' }: TaskFormProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(initialValues?.serviceType ?? 'regular_cleaning');
  const [address, setAddress] = useState(initialValues?.serviceAddress ?? initialAddress);

  const initDate = initialValues?.scheduledDate
    ? new Date(initialValues.scheduledDate)
    : new Date(Date.now() + 86400000);
  const [selectedDate, setSelectedDate] = useState<Date>(initDate);

  const parseSlot = (slot?: string) => {
    const parts = slot?.split('-') ?? [];
    return {
      start: parseTimeToDate(parts[0] ?? '09:00'),
      end: parseTimeToDate(parts[1] ?? '11:00'),
    };
  };
  const initSlot = parseSlot(initialValues?.timeSlot);
  const [startTime, setStartTime] = useState<Date>(initSlot.start);
  const [endTime, setEndTime] = useState<Date>(initSlot.end);

  // Temp values while picker modal is open
  const [tempDate, setTempDate] = useState<Date>(initDate);
  const [tempStart, setTempStart] = useState<Date>(initSlot.start);
  const [tempEnd, setTempEnd] = useState<Date>(initSlot.end);

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const [budgetMin, setBudgetMin] = useState(initialValues?.budgetMin?.toString() ?? '');
  const [budgetMax, setBudgetMax] = useState(initialValues?.budgetMax?.toString() ?? '');
  const [specialReqs, setSpecialReqs] = useState(initialValues?.specialRequirements ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlotString = `${formatTime(startTime)}-${formatTime(endTime)}`;

  const openPicker = (mode: PickerMode) => {
    if (mode === 'date') setTempDate(selectedDate);
    if (mode === 'startTime') setTempStart(startTime);
    if (mode === 'endTime') setTempEnd(endTime);
    setPickerMode(mode);
  };

  const confirmPicker = () => {
    if (pickerMode === 'date') setSelectedDate(tempDate);
    if (pickerMode === 'startTime') setStartTime(tempStart);
    if (pickerMode === 'endTime') setEndTime(tempEnd);
    setPickerMode(null);
  };

  const onPickerChange = (_: DateTimePickerEvent, date?: Date) => {
    if (!date) return;
    if (pickerMode === 'date') setTempDate(date);
    if (pickerMode === 'startTime') setTempStart(date);
    if (pickerMode === 'endTime') setTempEnd(date);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!address.trim()) e.address = 'Address is required';
    if (startTime >= endTime) e.timeSlot = 'End time must be after start time';
    if (!budgetMin.trim()) e.budgetMin = 'Budget min is required';
    if (!budgetMax.trim()) e.budgetMax = 'Budget max is required';
    const min = parseFloat(budgetMin);
    const max = parseFloat(budgetMax);
    if (!isNaN(min) && !isNaN(max) && min > max) e.budgetMax = 'Budget max must be ≥ budget min';
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
        scheduledDate: formatDate(selectedDate),
        timeSlot: timeSlotString,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        specialRequirements: specialReqs.trim() || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const pickerValue = pickerMode === 'date' ? tempDate : pickerMode === 'startTime' ? tempStart : tempEnd;
  const pickerType = pickerMode === 'date' ? 'date' : 'time';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
        <Pressable style={styles.pickerBtn} onPress={() => openPicker('date')}>
          <Text style={styles.pickerBtnText}>{formatDateDisplay(selectedDate)}</Text>
          <Text style={styles.pickerIcon}>📅</Text>
        </Pressable>

        <Text style={styles.label}>Time Slot</Text>
        <View style={styles.timeRow}>
          <View style={styles.halfField}>
            <Text style={styles.subLabel}>Start</Text>
            <Pressable style={styles.pickerBtn} onPress={() => openPicker('startTime')}>
              <Text style={styles.pickerBtnText}>{formatTime(startTime)}</Text>
              <Text style={styles.pickerIcon}>🕐</Text>
            </Pressable>
          </View>
          <View style={styles.halfField}>
            <Text style={styles.subLabel}>End</Text>
            <Pressable style={[styles.pickerBtn, errors.timeSlot && styles.inputError]} onPress={() => openPicker('endTime')}>
              <Text style={styles.pickerBtnText}>{formatTime(endTime)}</Text>
              <Text style={styles.pickerIcon}>🕐</Text>
            </Pressable>
          </View>
        </View>
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

      {/* Picker Modal */}
      <Modal visible={pickerMode !== null} transparent animationType="slide" onRequestClose={() => setPickerMode(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerMode(null)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setPickerMode(null)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {pickerMode === 'date' ? 'Select Date' : pickerMode === 'startTime' ? 'Start Time' : 'End Time'}
              </Text>
              <TouchableOpacity onPress={confirmPicker}>
                <Text style={styles.modalConfirm}>Confirm</Text>
              </TouchableOpacity>
            </View>
            {pickerMode !== null && (
              <DateTimePicker
                value={pickerValue!}
                mode={pickerType}
                display={pickerMode === 'date' ? 'inline' : 'spinner'}
                minimumDate={pickerMode === 'date' ? new Date() : undefined}
                is24Hour
                onChange={onPickerChange}
                style={styles.picker}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  subLabel: { fontSize: FontSize.xs, color: Colors.gray500, marginBottom: 4 },
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
  typeBtnActive: { backgroundColor: UserTheme.primary, borderColor: UserTheme.primary },
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
  pickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  pickerBtnText: { fontSize: FontSize.md, color: Colors.gray800 },
  pickerIcon: { fontSize: FontSize.md },
  timeRow: { flexDirection: 'row', gap: Spacing.sm },
  inputError: { borderColor: Colors.error },
  multiline: { height: 80, textAlignVertical: 'top' },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginBottom: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfField: { flex: 1 },
  submitBtn: {
    backgroundColor: UserTheme.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800 },
  modalCancel: { fontSize: FontSize.md, color: Colors.gray500 },
  modalConfirm: { fontSize: FontSize.md, fontWeight: '700', color: UserTheme.primary },
  picker: { alignSelf: 'center' },
});
