import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { API_URL } from '@/lib/api';

type PredictResponse = {
  prediction: number;
  feedback: string[];
  saved_id?: number;
};

type PresetKey = 'Low' | 'Average' | 'High';

type StudyTimeOption = {
  value: string;
  label: string;
  hint: string;
};

const STUDYTIME_OPTIONS: StudyTimeOption[] = [
  { value: '1', label: '1', hint: 'Under 2 hours/week' },
  { value: '2', label: '2', hint: '2 to 5 hours/week' },
  { value: '3', label: '3', hint: '5 to 10 hours/week' },
  { value: '4', label: '4', hint: 'Over 10 hours/week' },
];

const PRESETS: Record<PresetKey, Record<string, string>> = {
  Low: { studytime: '1', failures: '2', absences: '25', g1: '8', g2: '9' },
  Average: { studytime: '2', failures: '1', absences: '10', g1: '11', g2: '12' },
  High: { studytime: '3', failures: '0', absences: '2', g1: '15', g2: '16' },
};

export default function PredictScreen() {
  const [studytime, setStudytime] = useState('3');
  const [failures, setFailures] = useState('0');
  const [absences, setAbsences] = useState('4');
  const [g1, setG1] = useState('12');
  const [g2, setG2] = useState('14');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);

  const studytimeHint = useMemo(() => {
    return (
      STUDYTIME_OPTIONS.find((option) => option.value === studytime)?.hint ?? ''
    );
  }, [studytime]);

  const gradeMeta = useMemo(() => {
    if (!result) return null;

    const x = result.prediction;
    if (x >= 16) return { text: 'Excellent', color: '#16a34a' };
    if (x >= 12) return { text: 'Good', color: '#2563eb' };
    if (x >= 8) return { text: 'Average', color: '#f59e0b' };
    return { text: 'Needs work', color: '#dc2626' };
  }, [result]);

  const { improve, helps } = useMemo(() => {
    const msgs = result?.feedback ?? [];
    const improveWords = [
      'increase',
      'improving',
      'improve',
      'reduce',
      'try',
      'focus',
      'practice',
      'review',
      'redo',
      'catch up',
      'aim',
    ];

    const improveList: string[] = [];
    const helpsList: string[] = [];

    for (const msg of msgs) {
      const lower = msg.toLowerCase();
      const isImprove = improveWords.some((word) => lower.includes(word));
      if (isImprove) improveList.push(msg);
      else helpsList.push(msg);
    }

    return { improve: improveList, helps: helpsList };
  }, [result]);

  const applyPreset = (key: PresetKey) => {
    const preset = PRESETS[key];
    setStudytime(preset.studytime);
    setFailures(preset.failures);
    setAbsences(preset.absences);
    setG1(preset.g1);
    setG2(preset.g2);
    setResult(null);
  };

  const onPredict = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studytime: Number(studytime),
          failures: Number(failures),
          absences: Number(absences),
          G1: Number(g1),
          G2: Number(g2),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        Alert.alert('Prediction failed', data?.detail || 'Check your inputs');
        return;
      }

      setResult(data);
    } catch {
      Alert.alert('Error', 'Backend not reachable');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.heroGlow} />

      <View style={styles.topbar}>
        <View style={styles.topbarTextWrap}>
          <Text style={styles.title}>Math Coach AI</Text>
          <Text style={styles.subtitle}>
            Enter your info to estimate your final grade, then read what to
            improve.
          </Text>
        </View>

        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Student Inputs</Text>
        <Text style={styles.cardHint}>
          Pick values that match your current situation.
        </Text>

        <View style={styles.presetRow}>
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => applyPreset(key)}
              style={styles.presetBtn}
            >
              <Text style={styles.presetBtnText}>{key}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.fieldHeader}>
            <View style={styles.fieldCopy}>
              <Text style={styles.fieldLabel}>Weekly study time</Text>
              <Text style={styles.helperText}>{studytimeHint}</Text>
            </View>
          </View>

          <View style={styles.studyOptionRow}>
            {STUDYTIME_OPTIONS.map((option) => {
              const active = option.value === studytime;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setStudytime(option.value)}
                  style={[styles.studyOption, active && styles.studyOptionActive]}
                >
                  <Text
                    style={[
                      styles.studyOptionValue,
                      active && styles.studyOptionValueActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.studyOptionHint,
                      active && styles.studyOptionHintActive,
                    ]}
                  >
                    {option.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Field
          label="Past failures"
          helper="How many times you failed a class previously (0-4)."
          value={failures}
          onChange={setFailures}
        />
        <Field
          label="Absences"
          helper="How many classes you missed (0-93). Lower is better."
          value={absences}
          onChange={setAbsences}
        />
        <Field
          label="First test score (G1)"
          helper="Your first test grade (0-20)."
          value={g1}
          onChange={setG1}
        />
        <Field
          label="Second test score (G2)"
          helper="Your second test grade (0-20)."
          value={g2}
          onChange={setG2}
        />

        <Pressable onPress={onPredict} style={styles.predictBtn}>
          <Text style={styles.predictText}>
            {loading ? 'Predicting...' : 'Predict'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Results</Text>
        <Text style={styles.cardHint}>Prediction + simple feedback.</Text>

        {!result && !loading ? (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateText}>
              No prediction yet. Enter values and press Predict.
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateText}>Running model...</Text>
          </View>
        ) : null}

        {result ? (
          <>
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Predicted final grade (0-20)</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultValue}>
                  {result.prediction.toFixed(2)}
                </Text>
                {gradeMeta ? (
                  <View
                    style={[styles.gradeBadge, { backgroundColor: gradeMeta.color }]}
                  >
                    <Text style={styles.gradeBadgeText}>{gradeMeta.text}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.smallText}>
                Saved prediction ID: {result.saved_id ?? '-'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>What to improve</Text>
            {improve.length ? (
              improve.map((line, index) => (
                <View key={`improve-${index}`} style={styles.feedbackBox}>
                  <Text style={styles.feedbackText}>{line}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.smallText}>
                No clear improvements detected from your inputs.
              </Text>
            )}

            <Text style={styles.sectionTitle}>What is helping</Text>
            {helps.length ? (
              helps.map((line, index) => (
                <View key={`helps-${index}`} style={styles.feedbackBox}>
                  <Text style={styles.feedbackText}>{line}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.smallText}>
                Nothing strongly positive stood out this time.
              </Text>
            )}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldCopy}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.helperText}>{helper}</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
          style={styles.numberInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    minHeight: '100%',
    padding: 20,
    paddingBottom: 36,
    backgroundColor: '#0b1220',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    left: -10,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: 'rgba(37,99,235,0.10)',
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 16,
  },
  topbarTextWrap: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    lineHeight: 22,
    maxWidth: 720,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logoutText: {
    color: 'white',
    fontWeight: '800',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  cardHint: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    fontSize: 14,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  presetBtnText: {
    color: 'white',
    fontWeight: '800',
  },
  fieldBlock: {
    marginTop: 14,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  fieldCopy: {
    flex: 1,
  },
  fieldLabel: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '800',
  },
  helperText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  studyOptionRow: {
    gap: 10,
    marginTop: 10,
  },
  studyOption: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  studyOptionActive: {
    borderColor: 'rgba(255,255,255,0.42)',
    backgroundColor: 'rgba(37,99,235,0.20)',
  },
  studyOptionValue: {
    color: 'white',
    fontWeight: '900',
    fontSize: 15,
  },
  studyOptionValueActive: {
    color: '#dbeafe',
  },
  studyOptionHint: {
    color: 'rgba(255,255,255,0.72)',
    marginTop: 4,
    fontSize: 12,
  },
  studyOptionHintActive: {
    color: '#dbeafe',
  },
  numberInput: {
    width: 92,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  predictBtn: {
    width: '100%',
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: 'white',
  },
  predictText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 17,
  },
  emptyStateBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  resultBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
  },
  resultLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '800',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  resultValue: {
    color: 'white',
    fontSize: 34,
    fontWeight: '900',
  },
  gradeBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  gradeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  feedbackBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  feedbackText: {
    color: 'white',
    lineHeight: 20,
  },
  smallText: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
});
