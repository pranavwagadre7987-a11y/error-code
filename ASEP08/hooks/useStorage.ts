import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveData(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) { console.error('Save error:', e); }
}

export async function loadData<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) { return fallback; }
}

export async function clearData(key: string) {
  try { await AsyncStorage.removeItem(key); }
  catch (e) { console.error('Clear error:', e); }
}