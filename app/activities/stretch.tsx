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

export default function StretchScreen() {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [attemptName, setAttemptName] = useState('Attempt 1');
  const [prediction, setPrediction] = useState('');
  const [reflection, setReflection] = useState('');
  
  const [targetDuration, setTargetDuration] = useState(20);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [currentVibrationMm, setCurrentVibrationMm] = useState(0);
  const [maxVibrationMm, setMaxVibrationMm] = useState(0);
  const [averageVibrationMm, setAverageVibrationMm] = useState(0);

  const vibrationSamplesRef = useRef<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const testDurations = [5, 10, 15, 20, 25, 30];

  const controlLevel = useMemo(() => {
    if (averageVibrationMm === 0) return 'Not measured yet';
    if (averageVibrationMm <= 5) return 'Smooth Control';
    if (averageVibrationMm <= 10) return 'Moderate Control';
    return 'Shaky Movement';
  }, [averageVibrationMm]);

  const controlColor = useMemo(() => {
    if (controlLevel === 'Smooth Control') return colors.success;
    if (controlLevel === 'Moderate Control') return colors.warning;
    if (controlLevel === 'Shaky Movement') return colors.error;
    return colors.mutedText;
  }, [controlLevel]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    if (isMeasuring) {
      Accelerometer.setUpdateInterval(250);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);

        const estimatedVibrationMm = Math.abs(magnitude - 1) * 8;
        const rounded = Number(estimatedVibrationMm.toFixed(1));

        vibrationSamplesRef.current.push(rounded);

        setCurrentVibrationMm(rounded);
        setMaxVibrationMm((previous) => Math.max(previous, rounded));

        const average =
          vibrationSamplesRef.current.reduce((sum, value) => sum + value, 0) /
          vibrationSamplesRef.current.length;

        setAverageVibrationMm(Number(average.toFixed(1)));
      });
    }

    return () => {
      subscription?.remove();
    };
  }, [isMeasuring]);

  const startMeasurement = () => {
    vibrationSamplesRef.current = [];

    setDurationSeconds(0);
    setCurrentVibrationMm(0);
    setMaxVibrationMm(0);
    setAverageVibrationMm(0);
    setIsMeasuring(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setDurationSeconds((previous) => {
        const next = previous + 1;

        if (next >= targetDuration) {
          stopMeasurement();
        }

        return next;
      });
    }, 1000);
  };

  const stopMeasurement = () => {
    setIsMeasuring(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const saveResult = () => {
    if (durationSeconds === 0) {
      Alert.alert('No result', 'Please start and stop a movement test first.');
      return;
    }

    const result = {
      activityId: 'stretch',
      activityName: 'Human Performance Lab - Stretch Speed & Gracefulness',
      attemptName,
      predictedVibration: prediction,
      outcome: `${averageVibrationMm} mm in ${durationSeconds} seconds`,
      averageVibrationMm,
      maxVibrationMm,
      durationSeconds,
      controlLevel,
      reflection,
      createdAt: new Date().toISOString(),
    };

    Alert.alert('Saved Result', JSON.stringify(result, null, 2));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Stretch Performance Lab</Text>

      <Text style={styles.subtitle}>
        Hold the phone during a stretching movement. The app estimates vibration
        from the accelerometer and records the outcome as movement over time.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Vibration Sensor</Text>

        <View style={styles.resultBox}>
          <Text style={styles.resultNumber}>
            {averageVibrationMm || '--'}
          </Text>
          <Text style={styles.resultLabel}>Average Vibration (mm)</Text>
        </View>

        <View style={[styles.badge, { borderColor: controlColor }]}>
          <Text style={[styles.badgeText, { color: controlColor }]}>
            {controlLevel}
          </Text>
        </View>

        <Text style={styles.liveText}>
          Current Vibration: {currentVibrationMm || '--'} mm
        </Text>

        <Text style={styles.liveText}>
          Max Vibration: {maxVibrationMm || '--'} mm
        </Text>

        <Text style={styles.liveText}>
          Time: {durationSeconds} seconds
        </Text>

        <Text style={styles.outcomeText}>
          Outcome:{' '}
          {durationSeconds > 0
            ? `${averageVibrationMm} mm in ${durationSeconds} seconds`
            : '--'}
        </Text>
        

        <Text style={styles.label}>Test Duration</Text>

        <View style={styles.durationGrid}>
          {testDurations.map((seconds) => (
            <Pressable
              key={seconds}
              style={[
                styles.durationButton,
                targetDuration === seconds && styles.selectedDurationButton,
              ]}
              onPress={() => setTargetDuration(seconds)}
              disabled={isMeasuring}
            >
              <Text style={styles.durationText}>{seconds}s</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              isMeasuring ? styles.disabledButton : styles.primaryButton,
            ]}
            onPress={startMeasurement}
            disabled={isMeasuring}
          >
            <Text style={styles.buttonText}>Start Test</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button,
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

        <Text style={styles.label}>Attempt Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Attempt 1"
          placeholderTextColor={colors.mutedText}
          value={attemptName}
          onChangeText={setAttemptName}
        />

        <Text style={styles.label}>Prediction</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: +/- 1 cm or low vibration"
          placeholderTextColor={colors.mutedText}
          value={prediction}
          onChangeText={setPrediction}
        />

        <Text style={styles.label}>Reflection</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Which movement was hardest to keep vibration low?"
          placeholderTextColor={colors.mutedText}
          value={reflection}
          onChangeText={setReflection}
          multiline
        />

        <Pressable style={styles.saveButton} onPress={saveResult}>
          <Text style={styles.saveButtonText}>Save Stretch Result</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Science Explanation</Text>
        <Text style={styles.infoText}>
          Faster or less controlled movements usually create higher vibration.
          Smoother movement shows better coordination and body control.
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
  resultBox: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultNumber: {
    color: colors.text,
    fontSize: 52,
    fontWeight: '900',
  },
  resultLabel: {
    color: colors.mutedText,
    marginTop: 6,
  },
  badge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 18,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 15,
  },
  liveText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  outcomeText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
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
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },

  durationButton: {
    width: '30%',
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  selectedDurationButton: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },

  durationText: {
    color: colors.text,
    fontWeight: '800',
  },
});