import { markActivityCompleted } from "@/services/challengeService";
import { saveFullResultLocal } from "@/services/resultService";
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { colors } from '@/constants/Colors';

type HandType = 'dominant' | 'nonDominant';

const TRACE_AREA_SIZE = 280;
const TARGET_RADIUS = 18;
const TRACE_DURATION_SECONDS = 10;
const TARGET_MOVE_INTERVAL_MS = 1800;
const CLOSE_DISTANCE = 45;

function getRandomPosition() {
  const padding = TARGET_RADIUS + 12;

  return {
    x: Math.floor(Math.random() * (TRACE_AREA_SIZE - padding * 2) + padding),
    y: Math.floor(Math.random() * (TRACE_AREA_SIZE - padding * 2) + padding),
  };
}

export default function ReactionScreen() {
  const [isWaiting, setIsWaiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const [dominantTime, setDominantTime] = useState<number | null>(null);
  const [nonDominantTime, setNonDominantTime] = useState<number | null>(null);
  const [currentHand, setCurrentHand] = useState<HandType>('dominant');

  const [memberName, setMemberName] = useState('');
  const [reflection, setReflection] = useState('');

  const reactionInstruction = require("@/assets/images/reaction-instruction.png");

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [traceHand, setTraceHand] = useState<HandType>('dominant');
  const [isTracing, setIsTracing] = useState(false);
  const [targetPosition, setTargetPosition] = useState(getRandomPosition());
  const [traceSecondsLeft, setTraceSecondsLeft] = useState(
    TRACE_DURATION_SECONDS
  );

  const [tracePoints, setTracePoints] = useState(0);
  const [goodTracePoints, setGoodTracePoints] = useState(0);
  const [liveDelayMs, setLiveDelayMs] = useState(0);

  const [dominantTraceAccuracy, setDominantTraceAccuracy] = useState<
    number | null
  >(null);
  const [nonDominantTraceAccuracy, setNonDominantTraceAccuracy] = useState<
    number | null
  >(null);

  const [dominantTraceDelayMs, setDominantTraceDelayMs] = useState<
    number | null
  >(null);
  const [nonDominantTraceDelayMs, setNonDominantTraceDelayMs] = useState<
    number | null
  >(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointsRef = useRef(0);
  const goodPointsRef = useRef(0);
  const delayTotalRef = useRef(0);
  const delayCountRef = useRef(0);
  const targetRef = useRef(targetPosition);
  const traceHandRef = useRef(traceHand);
  const lastMoveTimestampRef = useRef(Date.now());
  const hasCapturedThisTargetRef = useRef(false);

  const liveAccuracy = useMemo(() => {
    if (tracePoints === 0) return 0;
    return Math.round((goodTracePoints / tracePoints) * 100);
  }, [goodTracePoints, tracePoints]);

  useEffect(() => {
    targetRef.current = targetPosition;
  }, [targetPosition]);

  useEffect(() => {
    traceHandRef.current = traceHand;
  }, [traceHand]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startReactionTest = (hand: HandType) => {
    setCurrentHand(hand);
    setIsReady(false);
    setIsWaiting(true);

    const randomDelay = Math.floor(Math.random() * 3000) + 2000;

    setTimeout(() => {
      setIsWaiting(false);
      setIsReady(true);
      setStartTime(Date.now());
    }, randomDelay);
  };

  const tapTarget = () => {
    if (!isReady || startTime === null) return;

    const time = Date.now() - startTime;

    if (currentHand === 'dominant') {
      setDominantTime(time);
    } else {
      setNonDominantTime(time);
    }

    setIsReady(false);
    setStartTime(null);
  };

  const finishTracing = () => {
    const accuracy =
      pointsRef.current === 0
        ? 0
        : Math.round((goodPointsRef.current / pointsRef.current) * 100);

    const averageDelay =
      delayCountRef.current === 0
        ? 0
        : Math.round(delayTotalRef.current / delayCountRef.current);

    if (traceHandRef.current === 'dominant') {
      setDominantTraceAccuracy(accuracy);
      setDominantTraceDelayMs(averageDelay);
    } else {
      setNonDominantTraceAccuracy(accuracy);
      setNonDominantTraceDelayMs(averageDelay);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setLiveDelayMs(averageDelay);
    setIsTracing(false);
    setScrollEnabled(true);
  };

  const moveTarget = () => {
    const nextPosition = getRandomPosition();

    targetRef.current = nextPosition;
    hasCapturedThisTargetRef.current = false;
    lastMoveTimestampRef.current = Date.now();

    setTargetPosition(nextPosition);
  };

  const startTracingChallenge = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    pointsRef.current = 0;
    goodPointsRef.current = 0;
    delayTotalRef.current = 0;
    delayCountRef.current = 0;
    hasCapturedThisTargetRef.current = false;
    lastMoveTimestampRef.current = Date.now();

    setTracePoints(0);
    setGoodTracePoints(0);
    setLiveDelayMs(0);
    setTraceSecondsLeft(TRACE_DURATION_SECONDS);
    setIsTracing(true);
    setScrollEnabled(false);

    moveTarget();

    let millisecondsLeft = TRACE_DURATION_SECONDS * 1000;

    timerRef.current = setInterval(() => {
      millisecondsLeft -= TARGET_MOVE_INTERVAL_MS;

      setTraceSecondsLeft(Math.max(0, Math.ceil(millisecondsLeft / 1000)));
      moveTarget();

      if (millisecondsLeft <= 0) {
        finishTracing();
      }
    }, TARGET_MOVE_INTERVAL_MS);
  };

  const handleTraceMove = (locationX: number, locationY: number) => {
    if (!isTracing) return;

    const target = targetRef.current;

    const distance = Math.sqrt(
      Math.pow(locationX - target.x, 2) + Math.pow(locationY - target.y, 2)
    );

    pointsRef.current += 1;
    setTracePoints(pointsRef.current);

    if (distance <= CLOSE_DISTANCE) {
      goodPointsRef.current += 1;
      setGoodTracePoints(goodPointsRef.current);

      if (!hasCapturedThisTargetRef.current) {
        const delayForThisTarget = Date.now() - lastMoveTimestampRef.current;

        delayTotalRef.current += delayForThisTarget;
        delayCountRef.current += 1;

        const averageDelay = Math.round(
          delayTotalRef.current / delayCountRef.current
        );

        setLiveDelayMs(averageDelay);
        hasCapturedThisTargetRef.current = true;
      }
    }
  };

  const saveResult = async () => {
    const result = {
      activityId: 'reaction',
      activityName: 'Reaction Board Challenge',
      memberName,

      dominantHandReactionMs: dominantTime,
      nonDominantHandReactionMs: nonDominantTime,

      dominantTraceAccuracyPercent: dominantTraceAccuracy,
      dominantTraceDelayMs,

      nonDominantTraceAccuracyPercent: nonDominantTraceAccuracy,
      nonDominantTraceDelayMs,

      reflection,
      createdAt: new Date().toISOString(),
    };

    await saveFullResultLocal(result);

    await markActivityCompleted("reacction");
    Alert.alert('Saved Result', JSON.stringify(result, null, 2));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      scrollEnabled={scrollEnabled}
    >
      <Text style={styles.title}>Reaction Board</Text>

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>Experiment Equipment</Text>

        <Text style={styles.instructionText}>
          •	Mobile phone with STEMM Lab app
        </Text>

        <Text style={styles.instructionText}>
          •	Clear working space
        </Text>

        <Text style={styles.sectionTitle}>Experiment Instruction</Text>

        <Text style={styles.instructionText}>
          Phase 1 – Tap Reaction
        </Text>

        <Text style={styles.instructionText}>
          1.	Tap the screen as soon as the hidden button appears.
        </Text>

        <Text style={styles.instructionText}>
          2.	Record reaction time.
        </Text>

        <Text style={styles.instructionText}>
          Phase 2 – Swap Hands
        </Text>

        <Text style={styles.instructionText}>
          3. Repeat using the non-dominant hand.
        </Text>

        <Text style={styles.instructionText}>
          4. Compare results.
        </Text>

        <Text style={styles.instructionText}>
          Phase 3 – Tracing Challenge
        </Text>

        <Text style={styles.instructionText}>
          5. Trace a moving shape on the screen.
        </Text>

        <Text style={styles.instructionText}>
          6. Review accuracy and delay.
        </Text>

        <Text style={styles.instructionText}>
          Rotate through each team member
        </Text>

        <Image
          source={reactionInstruction}
          style={styles.sketchImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.subtitle}>
        Test reaction time, compare both hands, and follow a randomly moving
        circle to measure tracing accuracy and delay time.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Phase 1 & 2: Reaction Test</Text>

        <View
          style={[
            styles.targetBox,
            isReady && styles.readyBox,
            isWaiting && styles.waitingBox,
          ]}
        >
          {isWaiting && <Text style={styles.targetText}>Wait...</Text>}

          {isReady && (
            <Pressable style={styles.tapArea} onPress={tapTarget}>
              <Text style={styles.tapText}>TAP NOW!</Text>
            </Pressable>
          )}

          {!isWaiting && !isReady && (
            <Text style={styles.targetText}>Choose a hand test</Text>
          )}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => startReactionTest('dominant')}
          >
            <Text style={styles.buttonText}>Dominant Hand</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButtonFilled}
            onPress={() => startReactionTest('nonDominant')}
          >
            <Text style={styles.buttonText}>Non-Dominant</Text>
          </Pressable>
        </View>

        <Text style={styles.result}>
          Dominant: {dominantTime !== null ? `${dominantTime} ms` : '--'}
        </Text>

        <Text style={styles.result}>
          Non-dominant:{' '}
          {nonDominantTime !== null ? `${nonDominantTime} ms` : '--'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Phase 3: Random Circle Trace</Text>

        <Text style={styles.helperText}>
          Select a hand, press start, then follow the randomly moving circle
          with your finger. Delay time is measured when your finger first reaches
          each new circle position.
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            style={[
              styles.shapeButton,
              traceHand === 'dominant' && styles.selectedShapeButton,
            ]}
            onPress={() => setTraceHand('dominant')}
            disabled={isTracing}
          >
            <Text style={styles.shapeButtonText}>Dominant Trace</Text>
          </Pressable>

          <Pressable
            style={[
              styles.shapeButton,
              traceHand === 'nonDominant' && styles.selectedShapeButton,
            ]}
            onPress={() => setTraceHand('nonDominant')}
            disabled={isTracing}
          >
            <Text style={styles.shapeButtonText}>Non-Dominant Trace</Text>
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.startTraceButton,
            isTracing && styles.disabledTraceButton,
          ]}
          onPress={startTracingChallenge}
          disabled={isTracing}
        >
          <Text style={styles.buttonText}>
            Start {traceHand === 'dominant' ? 'Dominant' : 'Non-Dominant'} Trace
          </Text>
        </Pressable>

        <View
          style={styles.traceArea}
          onTouchStart={(event) =>
            handleTraceMove(
              event.nativeEvent.locationX,
              event.nativeEvent.locationY
            )
          }
          onTouchMove={(event) =>
            handleTraceMove(
              event.nativeEvent.locationX,
              event.nativeEvent.locationY
            )
          }
        >
          <View
            style={[
              styles.movingCircle,
              {
                left: targetPosition.x - TARGET_RADIUS,
                top: targetPosition.y - TARGET_RADIUS,
              },
            ]}
          />

          <Text style={styles.traceInstruction}>
            {isTracing
              ? `Follow the circle: ${traceSecondsLeft}s`
              : 'Press Start first'}
          </Text>
        </View>

        <Text style={styles.result}>Live Accuracy: {liveAccuracy}%</Text>
        <Text style={styles.result}>Live Delay Time: {liveDelayMs} ms</Text>

        <Text style={styles.result}>
          Dominant Trace:{' '}
          {dominantTraceAccuracy !== null
            ? `${dominantTraceAccuracy}% / ${dominantTraceDelayMs} ms delay`
            : '--'}
        </Text>

        <Text style={styles.result}>
          Non-Dominant Trace:{' '}
          {nonDominantTraceAccuracy !== null
            ? `${nonDominantTraceAccuracy}% / ${nonDominantTraceDelayMs} ms delay`
            : '--'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experiment Notes</Text>

        <Text style={styles.label}>Team Member Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Trang"
          placeholderTextColor={colors.mutedText}
          value={memberName}
          onChangeText={setMemberName}
        />

        <Text style={styles.label}>Reflection</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Which hand was faster or more accurate?"
          placeholderTextColor={colors.mutedText}
          value={reflection}
          onChangeText={setReflection}
          multiline
        />

        <Pressable style={styles.saveButton} onPress={saveResult}>
          <Text style={styles.saveButtonText}>Save Reaction Result</Text>
        </Pressable>
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

  targetBox: {
    height: 220,
    borderRadius: 22,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  waitingBox: {
    borderColor: colors.warning,
  },

  readyBox: {
    borderColor: colors.success,
    backgroundColor: '#052e16',
  },

  targetText: {
    color: colors.mutedText,
    fontSize: 22,
    fontWeight: '800',
  },

  tapArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tapText: {
    color: colors.success,
    fontSize: 34,
    fontWeight: '900',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryButtonFilled: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: '900',
  },

  result: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },

  helperText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },

  shapeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },

  selectedShapeButton: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },

  shapeButtonText: {
    color: colors.text,
    fontWeight: '800',
  },

  startTraceButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },

  disabledTraceButton: {
    backgroundColor: colors.card,
  },

  traceArea: {
    width: TRACE_AREA_SIZE,
    height: TRACE_AREA_SIZE,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 18,
    position: 'relative',
    overflow: 'hidden',
  },

  movingCircle: {
    position: 'absolute',
    width: TARGET_RADIUS * 2,
    height: TARGET_RADIUS * 2,
    borderRadius: TARGET_RADIUS,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.text,
  },

  traceInstruction: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    color: colors.mutedText,
    fontSize: 13,
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