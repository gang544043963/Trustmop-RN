import { BorderRadius, Colors, FontSize, Spacing, ProviderTheme } from '@/constants/theme';
import { PricingUnit, Service, ServiceType } from '@/data/types';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ServiceFormProps {
  initialValues?: Partial<Service>;
  onSubmit: (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export default function ServiceForm({ initialValues, onSubmit }: ServiceFormProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(
    initialValues?.serviceType ?? 'regular_cleaning'
  );
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [price, setPrice] = useState(initialValues?.price?.toString() ?? '');
  const [pricingUnit, setPricingUnit] = useState<PricingUnit>(
    initialValues?.pricingUnit ?? 'per_hour'
  );
  const [coverageAreas, setCoverageAreas] = useState(
    initialValues?.coverageAreas?.join(', ') ?? ''
  );
  const [photos, setPhotos] = useState<string[]>(initialValues?.photos ?? []);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    if (!description.trim()) return 'Description is required.';
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) return 'Price must be greater than 0.';
    const areas = coverageAreas.split(',').map((a) => a.trim()).filter(Boolean);
    if (areas.length === 0) return 'At least one coverage area is required.';
    if (photos.length === 0) return 'At least one photo is required.';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) { Alert.alert('Validation Error', error); return; }

    const areas = coverageAreas.split(',').map((a) => a.trim()).filter(Boolean);
    setSubmitting(true);
    try {
      await onSubmit({
        providerId: initialValues?.providerId ?? '',
        serviceType,
        description: description.trim(),
        price: parseFloat(price),
        pricingUnit,
        coverageAreas: areas,
        photos,
        isActive,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Service type */}
      <Text style={styles.label}>Service Type</Text>
      <View style={styles.toggleRow}>
        {(['regular_cleaning', 'deep_cleaning'] as ServiceType[]).map((type) => (
          <Pressable
            key={type}
            style={[styles.typeBtn, serviceType === type && styles.typeBtnActive]}
            onPress={() => setServiceType(type)}
          >
            <Text style={[styles.typeBtnText, serviceType === type && styles.typeBtnTextActive]}>
              {type === 'regular_cleaning' ? 'Regular' : 'Deep'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your service..."
        placeholderTextColor={Colors.gray400}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Price */}
      <Text style={styles.label}>Price</Text>
      <View style={styles.priceRow}>
        <TextInput
          style={[styles.input, styles.priceInput]}
          value={price}
          onChangeText={setPrice}
          placeholder="0"
          placeholderTextColor={Colors.gray400}
          keyboardType="numeric"
        />
        <View style={styles.unitToggle}>
          {(['per_hour', 'per_session'] as PricingUnit[]).map((unit) => (
            <Pressable
              key={unit}
              style={[styles.unitBtn, pricingUnit === unit && styles.unitBtnActive]}
              onPress={() => setPricingUnit(unit)}
            >
              <Text style={[styles.unitBtnText, pricingUnit === unit && styles.unitBtnTextActive]}>
                {unit === 'per_hour' ? 'Per Hour' : 'Per Session'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Coverage areas */}
      <Text style={styles.label}>Coverage Areas (comma-separated)</Text>
      <TextInput
        style={styles.input}
        value={coverageAreas}
        onChangeText={setCoverageAreas}
        placeholder="e.g. Makati, BGC, Pasig"
        placeholderTextColor={Colors.gray400}
      />

      {/* Photos */}
      <Text style={styles.label}>Photos (min 1 required)</Text>
      <View style={styles.photosRow}>
        {photos.map((uri, i) => (
          <View key={i} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photo} />
            <Pressable style={styles.removePhoto} onPress={() => handleRemovePhoto(i)}>
              <Text style={styles.removePhotoText}>✕</Text>
            </Pressable>
          </View>
        ))}
        <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickPhoto}>
          <Text style={styles.addPhotoBtnText}>+ Add Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Active toggle */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>Active</Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
          trackColor={{ true: ProviderTheme.primary, false: Colors.gray300 }}
          thumbColor={Colors.white}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.submitBtnText}>Save Service</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  content: { padding: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.gray800,
    backgroundColor: Colors.white,
  },
  multiline: { minHeight: 100 },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm },
  typeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  typeBtnActive: { backgroundColor: ProviderTheme.primary, borderColor: ProviderTheme.primary },
  typeBtnText: { fontSize: FontSize.sm, color: Colors.gray600, fontWeight: '600' },
  typeBtnTextActive: { color: Colors.white },
  priceRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  priceInput: { flex: 1 },
  unitToggle: { flexDirection: 'row', gap: Spacing.xs },
  unitBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  unitBtnActive: { backgroundColor: ProviderTheme.primary, borderColor: ProviderTheme.primary },
  unitBtnText: { fontSize: FontSize.xs, color: Colors.gray600 },
  unitBtnTextActive: { color: Colors.white, fontWeight: '600' },
  photosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.xs },
  photoWrapper: { position: 'relative' },
  photo: { width: 80, height: 80, borderRadius: BorderRadius.md },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: { color: Colors.white, fontSize: 10, fontWeight: '700' },
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  addPhotoBtnText: { fontSize: FontSize.xs, color: Colors.gray500, textAlign: 'center' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtn: {
    backgroundColor: ProviderTheme.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  btnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});
