import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';

import { API_URL } from '@/lib/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      username.trim().length >= 2 &&
      password.length >= 4 &&
      confirm === password &&
      !loading
    );
  }, [username, password, confirm, loading]);

  const onSubmit = async () => {
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!canSubmit) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        Alert.alert(
          'Registration failed',
          data?.detail || 'Try another username'
        );
        return;
      }

      Alert.alert('Success', 'Account created');
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'Backend not reachable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.badge}>Math Coach AI</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          Register to use the mobile predictor.
        </Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Choose a username"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Confirm password</Text>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Re-enter password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          style={[styles.primaryBtn, !canSubmit && styles.disabledBtn]}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? 'Creating...' : 'Create account'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/login')}>
          <Text style={styles.link}>Back to login</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 22,
  },
  badge: {
    color: 'white',
    fontWeight: '800',
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: '#cbd5e1',
    marginBottom: 18,
  },
  label: {
    color: 'white',
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: 12,
    borderRadius: 12,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: 'white',
    padding: 13,
    borderRadius: 14,
  },
  disabledBtn: {
    opacity: 0.55,
  },
  primaryBtnText: {
    textAlign: 'center',
    fontWeight: '900',
    color: 'black',
  },
  link: {
    marginTop: 14,
    color: 'white',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
