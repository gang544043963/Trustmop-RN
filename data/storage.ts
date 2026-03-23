import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`storage.getItem failed for key "${key}": ${err}`);
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    throw new Error(`storage.setItem failed for key "${key}": ${err}`);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    throw new Error(`storage.removeItem failed for key "${key}": ${err}`);
  }
}

export async function mergeItem<T extends object>(
  key: string,
  partial: Partial<T>
): Promise<void> {
  try {
    const existing = await getItem<T>(key);
    const merged = { ...(existing ?? {}), ...partial } as T;
    await setItem<T>(key, merged);
  } catch (err) {
    throw new Error(`storage.mergeItem failed for key "${key}": ${err}`);
  }
}
