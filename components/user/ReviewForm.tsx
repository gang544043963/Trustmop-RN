import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { createReview } from '@/data/services/review.service';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

interface ReviewFormProps {
  orderId: string;
  providerId: string;
  userId: string;
  onSubmit: () => void;
}

export default function ReviewForm({ orderId, providerId, userId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createReview({ orderId, providerId, userId, rating, comment: comment.trim() || undefined });
      setSubmitted(true);
      onSubmit();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.successBox}>
        <Text style={styles.successText}>✅ Review submitted. Thank you!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Rating</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)} style={styles.starBtn}>
            <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Comment (optional)</Text>
      <TextInput
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder="Share your experience..."
        placeholderTextColor={Colors.gray400}
        multiline
        numberOfLines={3}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.submitBtnText}>Submit Review</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  starsRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm },
  starBtn: { padding: 4 },
  star: { fontSize: 32, color: Colors.gray300 },
  starActive: { color: Colors.accent },
  input: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.gray800,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.xs,
  },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginBottom: Spacing.xs },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
  successBox: {
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  successText: { fontSize: FontSize.md, color: Colors.success, fontWeight: '600' },
});
