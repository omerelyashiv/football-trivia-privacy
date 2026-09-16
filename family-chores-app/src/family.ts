import AsyncStorage from '@react-native-async-storage/async-storage';

const FAMILY_CODE_KEY = 'family-chores-app-family-code-v1';
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)

export function generateFamilyCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function normalizeFamilyCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function getStoredFamilyCode(): Promise<string | null> {
  return AsyncStorage.getItem(FAMILY_CODE_KEY);
}

export async function storeFamilyCode(code: string): Promise<void> {
  await AsyncStorage.setItem(FAMILY_CODE_KEY, normalizeFamilyCode(code));
}

export async function clearStoredFamilyCode(): Promise<void> {
  await AsyncStorage.removeItem(FAMILY_CODE_KEY);
}
