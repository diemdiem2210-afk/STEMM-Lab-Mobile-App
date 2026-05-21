import { Accelerometer } from 'expo-sensors';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/constants/Colors';

const TEST_DURATION_SECONDS = 60;

export default function BreathingScreen() {
  const [isMeasuring, setIsMeasuring] = useState(false);

  const [testType, setTestType] = useState<
    'resting' | 'jogging' | 'jumping'
  >('resting');

  const [durationSeconds, setDurationSeconds] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [breathCount, setBreathCount] = useState(0);
  const [breathsPerMinute, setBreathsPerMinute] = useState(0);
  const [reflection, setReflection] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPeakTimeRef = useRef(0);
  const wasHighRef = useRef(false);
  const breathCountRef = useRef(0);

  const diagnosis = useMemo(() => {
    if (breathsPerMinute === 0) {
      return 'Not measured yet';
    }

    if (testType === 'resting') {
      if (breathsPerMinute < 12) {
        return 'Slow breathing';
      }

      if (breathsPerMinute <= 20) {
        return 'Normal breathing';
      }

      return 'Heavy breathing';
    }

    if (testType === 'jogging') {
      if (breathsPerMinute < 18) {
        return 'Low recovery breathing';
      }

      if (breathsPerMinute <= 30) {
        return 'Normal after jogging';
      }

      return 'Heavy breathing';
    }

    if (breathsPerMinute < 25) {
      return 'Low recovery breathing';
    }

    if (breathsPerMinute <= 40) {
      return 'Normal after jumping';
    }

    return 'Heavy breathing';
  }, [breathsPerMinute, testType]);

  const diagnosisColor = useMemo(() => {
    if (diagnosis.includes('Normal')) return colors.success;
    if (diagnosis.includes('Slow') || diagnosis.includes('Low')) return colors.primary;
    if (diagnosis.includes('Heavy')) return colors.error;

    return colors.mutedText;
  }, [diagnosis]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    if (isMeasuring) {
      Accelerometer.setUpdateInterval(250);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const chestMovement = Math.abs(magnitude - 1);

        const isBreathPeak = chestMovement > 0.008;
        const now = Date.now();
        const enoughGap = now - lastPeakTimeRef.current > 1200;

        if (isBreathPeak && !wasHighRef.current && enoughGap) {
          wasHighRef.current = true;
          lastPeakTimeRef.current = now;

          breathCountRef.current += 1;

          setBreathCount(breathCountRef.current);

          const currentDuration = Math.max(durationSeconds, 1);
          const bpm = Math.round(
            (breathCountRef.current / currentDuration) * 60
          );

          setBreathsPerMinute(bpm);
        }

        if (!isBreathPeak) {
          wasHighRef.current = false;
        }
      });
    }

    return () => {
      subscription?.remove();
    };
  }, [isMeasuring, durationSeconds]);

  const stopMeasurement = () => {
    setIsMeasuring(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalDuration = Math.max(durationSeconds, 1);

    setBreathsPerMinute(
      Math.round((breathCountRef.current / finalDuration) * 60)
    );
  };

  const startMeasurement = () => {
    setDurationSeconds(0);
    setBreathCount(0);
    setBreathsPerMinute(0);

    breathCountRef.current = 0;
    lastPeakTimeRef.current = 0;
    wasHighRef.current = false;

    setIsMeasuring(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setDurationSeconds((previous) => {
        const next = previous + 1;

        if (breathCountRef.current > 0) {
          setBreathsPerMinute(
            Math.round((breathCountRef.current / next) * 60)
          );
        }

        if (next >= TEST_DURATION_SECONDS) {
          setTimeout(stopMeasurement, 0);
        }

        return next;
      });
    }, 1000);
  };

  const saveResult = () => {
    if (durationSeconds === 0) {
      Alert.alert('No result', 'Please complete a breathing test first.');
      return;
    }

    const result = {
      activityId: 'breathing',
      activityName: 'Breathing Pace Trainer',
      testType,
      predictedBreathsPerMinute: prediction,
      breathCount,
      durationSeconds,
      breathsPerMinute,
      diagnosis,
      outcome: `${breathsPerMinute} breaths per minute`,
      reflection,
      createdAt: new Date().toISOString(),
    };

    Alert.alert('Saved Result', JSON.stringify(result, null, 2));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Breathing Pace Trainer</Text>

      <Text style={styles.subtitle}>
        Place the phone gently on the chest. The app counts breathing movement
        for 60 seconds and estimates breaths per minute.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Test Type</Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.modeButton,
              testType === 'resting' && styles.selectedMode,
            ]}
            onPress={() => setTestType('resting')}
            disabled={isMeasuring}
          >
            <Text style={styles.modeText}>Resting</Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              testType === 'jogging' && styles.selectedMode,
            ]}
            onPress={() => setTestType('jogging')}
            disabled={isMeasuring}
          >
            <Text style={styles.modeText}>Jogging</Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              testType === 'jumping' && styles.selectedMode,
            ]}
            onPress={() => setTestType('jumping')}
            disabled={isMeasuring}
          >
            <Text style={styles.modeText}>Jumping</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Breathing Result</Text>

        <View style={[styles.levelBadge, { borderColor: diagnosisColor }]}>
          <Text style={[styles.levelText, { color: diagnosisColor }]}>
            {diagnosis}
          </Text>
        </View>

        <Text style={styles.liveText}>Breath Count: {breathCount}</Text>

        <Text style={styles.liveText}>
          Time: {durationSeconds} / {TEST_DURATION_SECONDS} seconds
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.actionButton,
              isMeasuring ? styles.disabledButton : styles.primaryButton,
            ]}
            onPress={startMeasurement}
            disabled={isMeasuring}
          >
            <Text style={styles.buttonText}>Start 60s Test</Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionButton,
              isMeasuring ? styles.stopButton : styles.disabledButton,
            ]}
            onPress={stopMeasurement}
            disabled={!isMeasuring}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experiment Notes</Text>

        <Text style={styles.label}>Predicted Breaths Per Minute</Text>

        <TextInput
          style={styles.input}
          placeholder="Example: 12"
          placeholderTextColor={colors.mutedText}
          keyboardType="numeric"
          value={prediction}
          onChangeText={setPrediction}
        />

        <Text style={styles.label}>Reflection</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Were you right? Did breathing increase after exercise?"
          placeholderTextColor={colors.mutedText}
          value={reflection}
          onChangeText={setReflection}
          multiline
        />

        <Pressable style={styles.saveButton} onPress={saveResult}>
          <Text style={styles.saveButtonText}>Save Breathing Result</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Science Explanation</Text>

        <Text style={styles.infoText}>
          Breathing rate increases during exercise to supply more oxygen to the
          muscles. The phone accelerometer detects repeated chest movement and
          estimates breaths per minute.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },

  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 22,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  modeButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  selectedMode: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },

  modeText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },

  levelBadge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 18,
  },

  levelText: {
    fontWeight: '800',
    fontSize: 15,
  },

  liveText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },

  stopButton: {
    backgroundColor: colors.error,
  },

  disabledButton: {
    backgroundColor: colors.card,
  },

  buttonText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 15,
  },

  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor: colors.success,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '900',
  },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  infoTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },

  infoText: {
    color: colors.mutedText,
    lineHeight: 22,
  },
});