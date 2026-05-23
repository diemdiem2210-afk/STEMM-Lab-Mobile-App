import { markActivityCompleted } from "@/services/challengeService";
import { saveFullResultLocal } from "@/services/resultService";
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Image, Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { colors } from '@/constants/Colors';

type CalculationResult = {
  fallTime: number;
  contactTime: number;
  bounceUpTime: number;
  finalVelocity: number;
  upwardVelocity: number;
  deltaVelocity: number;
  acceleration: number;
  netForce: number;
  dragForce: number;
  gForce: number;
  rating: string;
};

export default function ParachuteScreen() {
  const [pendingVideoUri, setPendingVideoUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [dropStartTime, setDropStartTime] = useState<number | null>(null);
  const [firstHitTime, setFirstHitTime] = useState<number | null>(null);
  const [maxBounceTime, setMaxBounceTime] = useState<number | null>(null);
  const [stopMovingTime, setStopMovingTime] = useState<number | null>(null);

  const [massKg, setMassKg] = useState('0.20');
  const [dropHeightM, setDropHeightM] = useState('');
  const [designDescription, setDesignDescription] = useState('');
  const [prediction, setPrediction] = useState('');
  const [reflection, setReflection] = useState('');

  const parachuteInstruction = require("@/assets/images/parachute-instruction.png");

  const [calculatedResult, setCalculatedResult] =
    useState<CalculationResult | null>(null);

  const player = useVideoPlayer(videoUri ? { uri: videoUri } : null, (player) => {
    player.loop = false;
    player.muted = true;
    player.playbackRate = 0.35;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoUri) {
        setCurrentTime(player.currentTime ?? 0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [player, videoUri]);

  const canCalculate = useMemo(() => {
    return (
      dropStartTime !== null &&
      firstHitTime !== null &&
      maxBounceTime !== null &&
      stopMovingTime !== null &&
      Number(dropHeightM) > 0 &&
      Number(massKg) > 0
    );
  }, [
    dropStartTime,
    firstHitTime,
    maxBounceTime,
    stopMovingTime,
    dropHeightM,
    massKg,
  ]);

  const resetMarkers = () => {
    setCurrentTime(0);
    setDropStartTime(null);
    setFirstHitTime(null);
    setMaxBounceTime(null);
    setStopMovingTime(null);
    setCalculatedResult(null);
  };

  const pickVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow video library access to select a slow-motion video.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setPendingVideoUri(result.assets[0].uri);
      setVideoUri(null);
      resetMarkers();
    }
  };

  const recordVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Camera permission needed',
        'Please allow camera access to record the parachute drop video.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 30,
      quality: 1,
    });

    if (!result.canceled) {
      setPendingVideoUri(result.assets[0].uri);
      setVideoUri(null);
      resetMarkers();
    }
  };

  const playSlowMotion = async () => {
    if (!videoUri && pendingVideoUri) {
      setVideoUri(pendingVideoUri);
      return;
      }
      player.playbackRate = 0.35;
      player.play();
    
  };

  const pauseVideo = () => {
    if (videoUri) {
      player.pause();
    }
  };

  const markDropStart = () => {
    if (!videoUri) return;

    player.pause();
    setDropStartTime(currentTime);
    setCalculatedResult(null);
  };

  const markFirstHit = () => {
    if (!videoUri) return;

    player.pause();
    setFirstHitTime(currentTime);
    setCalculatedResult(null);
  };

  const markMaxBounce = () => {
    if (!videoUri) return;

    player.pause();
    setMaxBounceTime(currentTime);
    setCalculatedResult(null);
  };

  const markStopMoving = () => {
    if (!videoUri) return;

    player.pause();
    setStopMovingTime(currentTime);
    setCalculatedResult(null);
  };

  const calculateResult = () => {
    if (
      !canCalculate ||
      dropStartTime === null ||
      firstHitTime === null ||
      maxBounceTime === null ||
      stopMovingTime === null
    ) {
      Alert.alert(
        'Missing values',
        'Please mark drop start, first ground hit, max bounce height, stop moving time, and enter drop height.'
      );
      return;
    }

    const mass = Number(massKg);
    const height = Number(dropHeightM);
    const gravity = 9.8;

    const fallTime = firstHitTime - dropStartTime;
    const contactTime = stopMovingTime - firstHitTime;
    const bounceUpTime = maxBounceTime - firstHitTime;

    if (fallTime <= 0 || contactTime <= 0 || bounceUpTime <= 0) {
      Alert.alert(
        'Invalid timestamps',
        'Make sure the times are in order: drop start → first hit → max bounce → stop moving.'
      );
      return;
    }

    const finalVelocity = height / fallTime;
    const upwardVelocity = gravity * bounceUpTime;
    const deltaVelocity = finalVelocity + upwardVelocity;

    const acceleration = deltaVelocity / contactTime;
    const netForce = mass * acceleration;
    const weightForce = mass * gravity;
    const dragForce = Math.max(0, weightForce - netForce);
    const gForce = acceleration / gravity;

    let rating = 'Safe landing';

    if (gForce > 10 && gForce <= 30) {
      rating = 'Hard landing';
    } else if (gForce > 30) {
      rating = 'Very hard landing';
    }

    setCalculatedResult({
      fallTime,
      contactTime,
      bounceUpTime,
      finalVelocity,
      upwardVelocity,
      deltaVelocity,
      acceleration,
      netForce,
      dragForce,
      gForce,
      rating,
    });
  };

  const saveResult = async () => {
    if (!calculatedResult) {
      Alert.alert('No calculation', 'Please calculate the result first.');
      return;
    }

    const result = {
      activityId: 'parachute',
      activityName: 'Parachute Drop Challenge',
      videoSelected: Boolean(pendingVideoUri || videoUri),
      designDescription,
      prediction,
      massKg: Number(massKg),
      dropHeightM: Number(dropHeightM),

      dropStartTime,
      firstHitTime,
      maxBounceTime,
      stopMovingTime,


      fallTimeS: Number(calculatedResult.fallTime.toFixed(2)),
      finalSpeedMs: Number(calculatedResult.finalVelocity.toFixed(2)),


      finalVelocityMs: Number(calculatedResult.finalVelocity.toFixed(2)),
      accelerationMs2: Number(calculatedResult.acceleration.toFixed(2)),
      netForceN: Number(calculatedResult.netForce.toFixed(2)),
      dragForceN: Number(calculatedResult.dragForce.toFixed(2)),
      gForce: Number(calculatedResult.gForce.toFixed(2)),


      contactTimeS: Number(calculatedResult.contactTime.toFixed(2)),
      bounceUpTimeS: Number(calculatedResult.bounceUpTime.toFixed(2)),
      upwardVelocityMs: Number(calculatedResult.upwardVelocity.toFixed(2)),
      deltaVelocityMs: Number(calculatedResult.deltaVelocity.toFixed(2)),

      landingRating: calculatedResult.rating,
      reflection,
      createdAt: new Date().toISOString(),
    };

    await saveFullResultLocal(result);

    await markActivityCompleted("parachute");

    Alert.alert('Saved Result', JSON.stringify(result, null, 2));
  };

  const ratingColor = useMemo(() => {
    if (!calculatedResult) return colors.mutedText;
    if (calculatedResult.rating === 'Safe landing') return colors.success;
    if (calculatedResult.rating === 'Hard landing') return colors.warning;
    return colors.error;
  }, [calculatedResult]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Parachute Drop Challenge</Text>

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>Experiment Equipment</Text>

        <Text style={styles.instructionText}>
          •	Mobile phone with STEMM Lab app
        </Text>

        <Text style={styles.instructionText}>
          •	Small toy (e.g. army toy soldier)
        </Text>

        <Text style={styles.instructionText}>
          •	Table or elevated surface
        </Text>

        <Text style={styles.instructionText}>
          •	Paper or plastic
        </Text>

        <Text style={styles.instructionText}>
          •	String
        </Text>

        <Text style={styles.instructionText}>
          •	Scissors
        </Text>

        <Text style={styles.instructionText}>
          •	Tape
        </Text>

        <Text style={styles.sectionTitle}>Experiment Instruction</Text>

        <Text style={styles.instructionText}>
          1. Drop the toy without a parachute and record the fall (baseline test).
        </Text>

        <Text style={styles.instructionText}>
          2. Build a parachute using paper/plastic, string, tape and scissors.
        </Text>

        <Text style={styles.instructionText}>
          3. Drop the toy from the same height and record the slow-motion video.
        </Text>

        <Text style={styles.instructionText}>
          4. Mark drop, impact, bounce and stop timestamps in the app.
        </Text>

        <Text style={styles.instructionText}>
          5. Review final velocity, acceleration, drag force and landing g-force.
        </Text>

        <Text style={styles.instructionText}>
          6. Redesign and test up to three prototypes within 20 minutes.
        </Text>

        <Text style={styles.instructionText}>
          7. Upload results and write team reflections.
        </Text>

        <Image
          source={parachuteInstruction}
          style={styles.sketchImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>
        Upload a slow-motion video, press Play when ready, mark the drop,
        impact, max bounce and stop time, then calculate the result.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Slow-Motion Video</Text>

        {videoUri ? (
          <VideoView
            style={styles.video}
            player={player}
            nativeControls={false}
            contentFit="contain"
          />
        ) : (
          <View style={styles.emptyVideo}>
            <Text style={styles.emptyVideoText}>
              {pendingVideoUri ? 'Video selected. Press Play.' : 'No video selected'}
            </Text>
          </View>
        )}

        <Text style={styles.currentTime}>
          Current video time: {currentTime.toFixed(2)}s
        </Text>

        <View style={styles.smallButtonRow}>
          <Pressable style={styles.roundButton} onPress={pickVideo}>
            <Text style={styles.roundButtonText}>Upload</Text>
          </Pressable>

          <Pressable style={styles.roundButton} onPress={recordVideo}>
            <Text style={styles.roundButtonText}>Record</Text>
          </Pressable>

          <Pressable style={styles.roundButton} onPress={playSlowMotion}>
            <Text style={styles.roundButtonText}>Play</Text>
          </Pressable>

          <Pressable style={styles.roundButton} onPress={pauseVideo}>
            <Text style={styles.roundButtonText}>Pause</Text>
          </Pressable>
        </View>

        <View style={styles.smallButtonRow}>
          <Pressable style={styles.roundButtonAlt} onPress={markDropStart}>
            <Text style={styles.roundButtonText}>Drop</Text>
          </Pressable>

          <Pressable style={styles.roundButtonAlt} onPress={markFirstHit}>
            <Text style={styles.roundButtonText}>Hit</Text>
          </Pressable>

          <Pressable style={styles.roundButtonAlt} onPress={markMaxBounce}>
            <Text style={styles.roundButtonText}>Max</Text>
          </Pressable>

          <Pressable style={styles.roundButtonAlt} onPress={markStopMoving}>
            <Text style={styles.roundButtonText}>Stop</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Timestamp Results</Text>

        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>Drop Start</Text>
          <Text style={styles.timestampValue}>
            {dropStartTime !== null ? `${dropStartTime.toFixed(2)}s` : '--'}
          </Text>
        </View>

        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>First Ground Hit</Text>
          <Text style={styles.timestampValue}>
            {firstHitTime !== null ? `${firstHitTime.toFixed(2)}s` : '--'}
          </Text>
        </View>

        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>Max Bounce Height</Text>
          <Text style={styles.timestampValue}>
            {maxBounceTime !== null ? `${maxBounceTime.toFixed(2)}s` : '--'}
          </Text>
        </View>

        <View style={styles.timestampRow}>
          <Text style={styles.timestampLabel}>Stopped Moving</Text>
          <Text style={styles.timestampValue}>
            {stopMovingTime !== null ? `${stopMovingTime.toFixed(2)}s` : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experiment Values</Text>

        <Text style={styles.label}>Toy Mass (kg)</Text>
        <TextInput
          style={styles.input}
          value={massKg}
          onChangeText={setMassKg}
          keyboardType="decimal-pad"
          placeholder="Example: 0.20"
          placeholderTextColor={colors.mutedText}
        />

        <Text style={styles.label}>Drop Height (m)</Text>
        <TextInput
          style={styles.input}
          value={dropHeightM}
          onChangeText={setDropHeightM}
          keyboardType="decimal-pad"
          placeholder="Example: 1.5"
          placeholderTextColor={colors.mutedText}
        />

        <Text style={styles.label}>Parachute Design</Text>
        <TextInput
          style={[styles.input, styles.textAreaSmall]}
          value={designDescription}
          onChangeText={setDesignDescription}
          multiline
          placeholder="Example: plastic sheet with four strings"
          placeholderTextColor={colors.mutedText}
        />

        <Text style={styles.label}>Prediction</Text>
        <TextInput
          style={styles.input}
          value={prediction}
          onChangeText={setPrediction}
          placeholder="Example: larger parachute will fall slower"
          placeholderTextColor={colors.mutedText}
        />

        <Pressable style={styles.calculateButton} onPress={calculateResult}>
          <Text style={styles.calculateButtonText}>Calculate Result</Text>
        </Pressable>
      </View>

      {calculatedResult && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Calculated Results</Text>

          <View style={[styles.badge, { borderColor: ratingColor }]}>
            <Text style={[styles.badgeText, { color: ratingColor }]}>
              {calculatedResult.rating}
            </Text>
          </View>

          <Text style={styles.groupTitle}>Primary School Focus</Text>

          <Text style={styles.resultText}>
            Time: {calculatedResult.fallTime.toFixed(2)}s
          </Text>

          <Text style={styles.resultText}>
            Final Speed: {calculatedResult.finalVelocity.toFixed(2)} m/s
          </Text>

          <Text style={styles.groupTitle}>High School Focus</Text>

          <Text style={styles.resultText}>
            Final Velocity: {calculatedResult.finalVelocity.toFixed(2)} m/s
          </Text>

          <Text style={styles.resultText}>
            Acceleration: {calculatedResult.acceleration.toFixed(2)} m/s²
          </Text>

          <Text style={styles.resultText}>
            Net Force: {calculatedResult.netForce.toFixed(2)} N
          </Text>

          <Text style={styles.resultText}>
            Drag Force: {calculatedResult.dragForce.toFixed(2)} N
          </Text>

          <Text style={styles.resultText}>
            G-Force: {calculatedResult.gForce.toFixed(2)} g
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reflection</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={reflection}
          onChangeText={setReflection}
          multiline
          placeholder="Were you correct? Which design was safest?"
          placeholderTextColor={colors.mutedText}
        />

        <Pressable style={styles.saveButton} onPress={saveResult}>
          <Text style={styles.saveButtonText}>Save Parachute Result</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Science Explanation</Text>

        <Text style={styles.infoText}>
          Students mark four moments in slow-motion video. The app calculates
          fall time, final velocity, acceleration, net force, drag force and
          g-force. If the toy bounces, the app estimates rebound velocity from
          max bounce time using v_up = 9.8 × t_up.
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

  video: {
    width: '100%',
    height: 230,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  emptyVideo: {
    width: '100%',
    height: 230,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyVideoText: {
    color: colors.mutedText,
    fontWeight: '700',
    textAlign: 'center',
  },

  currentTime: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },

  smallButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
  },

  roundButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  roundButtonAlt: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  roundButtonText: {
    color: colors.background,
    fontWeight: '900',
    fontSize: 12,
    textAlign: 'center',
  },

  timestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    gap: 10,
  },

  timestampLabel: {
    color: colors.mutedText,
    fontWeight: '700',
    flex: 1,
  },

  timestampValue: {
    color: colors.text,
    fontWeight: '900',
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

  textAreaSmall: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  textArea: {
    minHeight: 130,
    textAlignVertical: 'top',
  },

  calculateButton: {
    backgroundColor: colors.warning,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },

  calculateButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '900',
  },

  badge: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 10,
  },

  badgeText: {
    fontWeight: '900',
  },

  groupTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 16,
  },

  resultText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
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

  instructionText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },

  sketchImage: {
    width: "100%",
    height: 240,
    marginTop: 16,
    borderRadius: 18,
  },
});