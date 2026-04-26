// This file is needed so Expo Router doesn't error on the "add" tab
// The actual Add screen is in app/modal.tsx
import { Redirect } from 'expo-router';
export default function AddTab() {
  return <Redirect href="/modal" />;
}