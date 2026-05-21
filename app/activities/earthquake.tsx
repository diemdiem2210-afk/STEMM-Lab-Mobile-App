import { Accelerometer } from 'expo-sensors';
import { useEffect, useMemo, useState } from 'react';
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

export default function EarthquakeScreen() {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [movement, setMovement] = useState(0);
  const [maxMovement, setMaxMovement] = useState(0);
  const [designNote, setDesignNote] = useState('');
  const [reflection, setReflection] = useState('');

  const stability = useMemo(() => {
    if (maxMovement < 1.2) return 'Very Stable';
    if (maxMovement < 1.8) return 'Stable';
    if (maxMovement < 2.5) return 'Moderate Movement';
    return 'Unstable';
  }, [maxMovement]);

  const stabilityColor = useMemo(() => {
    if (stability === 'Very Stable') return colors.success;
    if (stability === 'Stable') return colors.primary;
    if (stability === 'Moderate Movement') return colors.warning;
    return colors.error;
  }, [stability]);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    if (isMeasuring) {
      Accelerometer.setUpdateInterval(300);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const rounded = Number(magnitude.toFixed(2));

        setMovement(rounded);
        setMaxMovement((previous) => Math.max(previous, rounded));
      });
    }

    return () => {
      subscription?.remove();
    };
  }, [isMeasuring]);

  const startMeasuring = () => {
    setMovement(0);
    setMaxMovement(0);
    setIsMeasuring(true);
  };

  const stopMeasuring = () => {
    setIsMeasuring(false);
  };

  const saveResult = () => {
    if (maxMovement <= 0) {
      Alert.alert(
        'No sensor data',
        'Please start measuring before saving the result.'
      );
      return;
    }

    const result = {
      activityId: 'earthquake',
      activityName: 'Earthquake-Resistant Structure',
      currentMovement: movement,
      maxMovement,
      stability,
      designNote,
      reflection,
      createdAt: new Date().toISOString(),
    };

    Alert.alert('Saved Result', JSON.stringify(result, null, 2));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Earthquake Structure</Text>

      <Text style={styles.subtitle}>
        Place the phone on your structure and use the accelerometer to measure
        how much it moves during vibration testing.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Live Motion Sensor</Text>

        <View style={styles.meterBox}>
          <Text style={styles.number}>{movement || '--'}</Text>
          <Text style={styles.unit}>movement magnitude</Text>
        </View>

        <View style={[styles.badge, { borderColor: stabilityColor }]}>
          <Text style={[styles.badgeText, { color: stabilityColor }]}>
            {stability}
          </Text>
        </View>

        <Text style={styles.helperText}>
          Lower movement means the structure is more stable during vibration.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              isMeasuring ? styles.disabledButton : styles.primaryButton,
            ]}
            onPress={startMeasuring}
            disabled={isMeasuring}
          >
            <Text style={styles.buttonText}>Start Test</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              isMeasuring ? styles.stopButton : styles.disabledButton,
            ]}
            onPress={stopMeasuring}
            disabled={!isMeasuring}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experiment Notes</Text>

        <Text style={styles.label}>Structure Design</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 10 folds + 4 pillars"
          placeholderTextColor={colors.mutedText}
          value={designNote}
          onChangeText={setDesignNote}
        />

        <Text style={styles.label}>Maximum Movement</Text>
        <Text style={styles.resultText}>{maxMovement || '--'}</Text>

        <Text style={styles.label}>Reflection</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Was your prediction correct? What design was strongest?"
          placeholderTextColor={colors.mutedText}
          value={reflection}
          onChangeText={setReflection}
          multiline
        />

        <Pressable style={styles.saveButton} onPress={saveResult}>
          <Text style={styles.saveButtonText}>Save Earthquake Result</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Science Explanation</Text>
        <Text style={styles.infoText}>
          Earthquakes create vibrations. A better structure absorbs and spreads
          movement, so the phone sensor records lower motion values.
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
  meterBox: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  number: {
    color: colors.text,
    fontSize: 52,
    fontWeight: '900',
  },
  unit: {
    color: colors.mutedText,
    fontSize: 15,
    marginTop: 4,
  },
  badge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 16,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 15,
  },
  helperText: {
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  resultText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
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