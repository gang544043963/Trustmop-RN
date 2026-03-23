import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';

export default function IndexScreen() {
  const session = useAuthStore((s) => s.session);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Wait for zustand to rehydrate from AsyncStorage before redirecting
  if (!hasHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/welcome" />;
  }

  if (session.activeIdentity === 'provider') {
    return <Redirect href="/provider/task-hall" />;
  }

  return <Redirect href="/user/home" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});
