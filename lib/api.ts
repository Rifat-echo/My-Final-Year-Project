import Constants from 'expo-constants';

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

function getDevHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(':')[0] || null;
}

const devHost = getDevHost();

export const API_URL =
  envApiUrl ||
  (devHost ? `http://${devHost}:8000` : 'http://localhost:8000');

