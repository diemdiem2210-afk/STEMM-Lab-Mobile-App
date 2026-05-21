import {
    AudioModule,
    RecordingPresets,
    useAudioRecorder,
    useAudioRecorderState,
} from 'expo-audio';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { colors } from '@/constants/Colors';

type SoundRisk = {
  label: string;
  color: string;
  advice: string;
};

function getSoundRisk(db: number): SoundRisk {
  if (db < 60) {
    return {
      label: 'Safe',
      color: colors.success,
      advice: 'This level is generally safe for normal classroom activity.',
    };
  }

  if (db < 85) {
    return {
      label: 'Moderate',
      color: colors.warning,
      advice:
        'This level may affect concentration if it continues for a long time.',
    };
  }

  return {
    label: 'High Risk',
    color: colors.error,
    advice:
      'This level may be unsafe for long exposure. Consider reducing noise.',
  };
}

export default function SoundHunterScreen() {
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.LOW_QUALITY,
    isMeteringEnabled: true,
  });

  const recorderState = useAudioRecorderState(audioRecorder, 500);

  const [manualSoundLevel, setManualSoundLevel] = useState('');
  const [locationNote, setLocationNote] = useState('');
  const [reflection, setReflection] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const metering = recorderState.metering;

  const estimatedDb = useMemo(() => {
    if (typeof metering === 'number') {
      return Math.max(0, Math.round(100 + metering));
    }

    const manual = Number(manualSoundLevel);

    if (!Number.isNaN(manual) && manual > 0) {
      return manual;
    }

    return 0;
  }, [metering, manualSoundLevel]);

  const risk = getSoundRisk(estimatedDb);

  useEffect(() => {
    return () => {
      if (isRecording) {
        audioRecorder.stop();
      }
    };
  }, [audioRecorder, isRecording]);

  const requestLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      Alert.alert(
        'Location permission needed',
        'Please allow location access to tag the experiment location.'
      );
      return;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});

    setLatitude(currentLocation.coords.latitude);
    setLongitude(currentLocation.coords.longitude);
  };

  const startRecording = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Microphone permission needed',
        'Please allow microphone access to measure sound level.'
      );
      return;
    }

    await AudioModule.setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await audioRecorder.prepareToRecordAsync({
      ...RecordingPresets.LOW_QUALITY,
      isMeteringEnabled: true,
    });

    await audioRecorder.record();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    setIsRecording(false);
  };

  const saveResult = () => {
    if (!estimatedDb || estimatedDb <= 0) {
      Alert.alert(
        'Missing sound level',
        'Please record sound or enter a manual dB value first.'
      );
      return;
    }

    const result = {
      activityId: 'sound-hunter',
      activityName: 'Sound Pollution Hunter',
      soundLevelDb: estimatedDb,
      riskLevel: risk.label,
      locationNote,
      latitude,
      longitude,
      reflection,
      createdAt: new Date().toISOString(),
    };

    Alert.alert(
        'Saved Result',
        JSON.stringify(result, null, 2)
    );

    
  };

  const openMap = () => {
    if (!latitude || !longitude) {
      return;
    }

    const url =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?ll=${latitude},${longitude}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(Sound Measurement Location)`;

    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sound Pollution Hunter</Text>

      <Text style={styles.subtitle}>
        Measure classroom noise, tag the location, and reflect on whether the
        sound level is safe.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Live Sound Reading</Text>

        <View style={styles.meterBox}>
          <Text style={styles.dbNumber}>{estimatedDb || '--'}</Text>
          <Text style={styles.dbUnit}>dB estimate</Text>
        </View>

        <View style={[styles.riskBadge, { borderColor: risk.color }]}>
          <Text style={[styles.riskText, { color: risk.color }]}>
            {risk.label}
          </Text>
        </View>

        <Text style={styles.advice}>{risk.advice}</Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.button,
              isRecording ? styles.disabledButton : styles.primaryButton,
            ]}
            onPress={startRecording}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>Start Meter</Text>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              isRecording ? styles.stopButton : styles.disabledButton,
            ]}
            onPress={stopRecording}
            disabled={!isRecording}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </Pressable>
        </View>

        <Text style={styles.helperText}>
          If the live meter does not work on your device, enter a manual dB
          value below. This still supports the classroom experiment.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experiment Details</Text>

        <Text style={styles.label}>Manual Sound Level (dB)</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 65"
          placeholderTextColor={colors.mutedText}
          keyboardType="numeric"
          value={manualSoundLevel}
          onChangeText={setManualSoundLevel}
        />

        <Text style={styles.label}>Activity / Location Note</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Dropping a book near classroom table"
          placeholderTextColor={colors.mutedText}
          value={locationNote}
          onChangeText={setLocationNote}
        />

        <Pressable style={styles.secondaryButton} onPress={requestLocation}>
          <Text style={styles.secondaryButtonText}>Tag GPS Location</Text>
        </Pressable>

        <Text style={styles.locationText}>
          {latitude && longitude
            ? `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
            : 'GPS not tagged yet'}
        </Text>

        {latitude && longitude && (
          <Pressable style={styles.mapFallback} onPress={openMap}>
            <Text style={styles.mapTitle}>Open Location in Maps</Text>

            <Text style={styles.mapText}>
              Tap to view this sound measurement location on the map.
            </Text>
          </Pressable>
        )}

        <Text style={styles.label}>Reflection</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Was your prediction correct? Any surprise?"
          placeholderTextColor={colors.mutedText}
          value={reflection}
          onChangeText={setReflection}
          multiline
        />

        <Pressable style={styles.saveButton} onPress={saveResult}>
          <Text style={styles.saveButtonText}>Save Sound Result</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sound Risk Guide</Text>
        <Text style={styles.infoText}>0–60 dB: usually safe</Text>
        <Text style={styles.infoText}>60–85 dB: moderate classroom noise</Text>
        <Text style={styles.infoText}>85+ dB: long exposure may be unsafe</Text>
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

  dbNumber: {
    color: colors.text,
    fontSize: 52,
    fontWeight: '900',
  },

  dbUnit: {
    color: colors.mutedText,
    fontSize: 15,
    marginTop: 4,
  },

  riskBadge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 16,
  },

  riskText: {
    fontWeight: '800',
    fontSize: 15,
  },

  advice: {
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

  helperText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
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

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },

  locationText: {
    color: colors.mutedText,
    marginTop: 10,
  },

  mapFallback: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    marginTop: 14,
  },

  mapTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  mapText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
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