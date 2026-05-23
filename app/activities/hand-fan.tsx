import { markActivityCompleted } from "@/services/challengeService";
import { saveFullResultLocal } from "@/services/resultService";
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/constants/Colors';

type MaterialOption = {
  id: string;
  name: string;
  thicknessMm: number;
  stiffness: number;
  note: string;
};

const materials: MaterialOption[] = [
  {
    id: 'thin-printer-paper',
    name: 'Thin printer paper',
    thicknessMm: 0.1,
    stiffness: 0.05,
    note: 'Bends very easily',
  },
  {
    id: 'card-stock',
    name: 'Standard card stock',
    thicknessMm: 0.25,
    stiffness: 0.2,
    note: 'Moderate bend',
  },
  {
    id: 'thin-cardboard',
    name: 'Thin cardboard',
    thicknessMm: 0.5,
    stiffness: 0.5,
    note: 'Much harder to bend',
  },
  {
    id: 'corrugated-cardboard',
    name: 'Corrugated cardboard',
    thicknessMm: 3,
    stiffness: 2.5,
    note: 'Very stiff, almost no bend',
  },
];

const distances = ['15', '30', '45'];

export default function HandFanScreen() {
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    'thin-printer-paper'
  );
  const [distanceCm, setDistanceCm] = useState('30');
  const [fanDesign, setFanDesign] = useState('');
  const [predictedAngle, setPredictedAngle] = useState('');
  const [actualAngle, setActualAngle] = useState('');
  const [observation, setObservation] = useState('');

  const fanInstruction = require("@/assets/images/fan-instruction.png");

  const selectedMaterial = useMemo(() => {
    return (
      materials.find((material) => material.id === selectedMaterialId) ??
      materials[0]
    );
  }, [selectedMaterialId]);

  const calculation = useMemo(() => {
    const angleDegrees = Number(actualAngle);

    if (Number.isNaN(angleDegrees) || angleDegrees <= 0) {
      return {
        radians: 0,
        force: 0,
      };
    }

    const radians = angleDegrees * (Math.PI / 180);
    const force = selectedMaterial.stiffness * radians;

    return {
      radians,
      force,
    };
  }, [actualAngle, selectedMaterial]);

  const predictionResult = useMemo(() => {
    const predicted = Number(predictedAngle);
    const actual = Number(actualAngle);

    if (
      Number.isNaN(predicted) ||
      Number.isNaN(actual) ||
      predicted <= 0 ||
      actual <= 0
    ) {
      return 'Enter prediction and outcome to compare.';
    }

    const difference = Math.abs(predicted - actual);

    if (difference <= 5) {
      return `Very close prediction. Difference: ${difference.toFixed(1)}°`;
    }

    if (difference <= 15) {
      return `Partly correct prediction. Difference: ${difference.toFixed(1)}°`;
    }

    return `Prediction was not close. Difference: ${difference.toFixed(1)}°`;
  }, [predictedAngle, actualAngle]);

  const saveResult = async () => {
    if (!actualAngle) {
      Alert.alert('Missing result', 'Please enter the actual bend angle first.');
      return;
    }

    const result = {
      activityId: 'hand-fan',
      activityName: 'Hand Fan Challenge',
      material: selectedMaterial.name,
      thicknessMm: selectedMaterial.thicknessMm,
      stiffness: selectedMaterial.stiffness,
      distanceCm,
      fanDesign,
      predictedAngleDegrees: predictedAngle,
      actualAngleDegrees: actualAngle,
      angleRadians: Number(calculation.radians.toFixed(3)),
      estimatedForceN: Number(calculation.force.toFixed(3)),
      predictionResult,
      observation,
      createdAt: new Date().toISOString(),
    };
    await saveFullResultLocal(result);
    await markActivityCompleted("hand-fan");
    Alert.alert('Saved Result', JSON.stringify(result, null, 2));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hand Fan Challenge</Text>

      <View style={styles.card}>
      
        <Text style={styles.sectionTitle}>Experiment Equipment</Text>
      
          <Text style={styles.instructionText}>
                •	Paper and cardboard
          </Text>

          <Text style={styles.instructionText}>
                •	Scissors
          </Text>

          <Text style={styles.instructionText}>
                •	Mobile phone
          </Text>

          <Text style={styles.instructionText}>
                •	Sticky Tape
          </Text>

          <Text style={styles.instructionText}>
                •	STEMM Mobile App
          </Text>
      
      
        <Text style={styles.sectionTitle}>Experiment Instructions</Text>
      
          <Text style={styles.instructionText}>
                1.	Stand paper upright on a table.
          </Text>
      
          <Text style={styles.instructionText}>
                2.	Fan air from 30 cm away.
          </Text>
      
          <Text style={styles.instructionText}>
                3.	Observe and record movement.
          </Text>

          <Text style={styles.instructionText}>
                4.	Repeat with different fan designs and fan distance (15cm, 30, 45cm)
          </Text>
      
          <Text style={styles.instructionText}>
                5.	Repeat with a cardboard instead of a paper vertical.
          </Text>

          <Image
                source={fanInstruction}
                style={styles.sketchImage}
                resizeMode="contain"
          />
      </View>

      <Text style={styles.subtitle}>
        Test how air movement affects paper and cardboard. Select the material,
        record the bend angle, and estimate force using F ≈ k × θ.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Material</Text>

        {materials.map((material) => (
          <Pressable
            key={material.id}
            style={[
              styles.optionCard,
              selectedMaterialId === material.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedMaterialId(material.id)}
          >
            <Text style={styles.optionTitle}>{material.name}</Text>

            <Text style={styles.optionText}>
              Thickness: {material.thicknessMm} mm
            </Text>

            <Text style={styles.optionText}>
              Stiffness k: {material.stiffness} N/rad
            </Text>

            <Text style={styles.optionNote}>{material.note}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Fan Test Setup</Text>

        <Text style={styles.label}>Fan Design Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 1cm back and forward folds"
          placeholderTextColor={colors.mutedText}
          value={fanDesign}
          onChangeText={setFanDesign}
        />

        <Text style={styles.label}>Distance from fan</Text>

        <View style={styles.buttonRow}>
          {distances.map((distance) => (
            <Pressable
              key={distance}
              style={[
                styles.distanceButton,
                distanceCm === distance && styles.selectedDistance,
              ]}
              onPress={() => setDistanceCm(distance)}
            >
              <Text style={styles.distanceText}>{distance} cm</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Predicted Bend Angle (degrees)</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 30"
          placeholderTextColor={colors.mutedText}
          keyboardType="numeric"
          value={predictedAngle}
          onChangeText={setPredictedAngle}
        />

        <Text style={styles.label}>Actual Bend Angle / Outcome (degrees)</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: 45"
          placeholderTextColor={colors.mutedText}
          keyboardType="numeric"
          value={actualAngle}
          onChangeText={setActualAngle}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Force Calculation</Text>

        <View style={styles.resultBox}>
          <Text style={styles.resultNumber}>
            {calculation.force > 0 ? calculation.force.toFixed(3) : '--'}
          </Text>

          <Text style={styles.resultLabel}>Estimated Force (N)</Text>
        </View>

        <Text style={styles.formulaText}>
          θ = {actualAngle || '--'}° × π / 180 ={' '}
          {calculation.radians > 0 ? calculation.radians.toFixed(3) : '--'} rad
        </Text>

        <Text style={styles.formulaText}>
          F ≈ k × θ = {selectedMaterial.stiffness} ×{' '}
          {calculation.radians > 0 ? calculation.radians.toFixed(3) : '--'} ={' '}
          {calculation.force > 0 ? calculation.force.toFixed(3) : '--'} N
        </Text>

        <Text style={styles.predictionText}>{predictionResult}</Text>

        <Text style={styles.helperText}>
          Higher stiffness means the material needs more force to bend. This
          helps compare paper, card stock, and cardboard fairly.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Observation Notes</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Were you right? Any surprises? How did material, fan design, or distance affect bending?"
          placeholderTextColor={colors.mutedText}
          value={observation}
          onChangeText={setObservation}
          multiline
        />

        <Pressable style={styles.saveButton} onPress={saveResult}>
          <Text style={styles.saveButtonText}>Save Hand Fan Result</Text>
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Science Explanation</Text>

        <Text style={styles.infoText}>
          Moving air applies force to flexible materials. A larger bend angle
          usually means stronger airflow or lower material stiffness. Shorter
          distances, such as 15 cm, usually create stronger movement than 45 cm.
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

  optionCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },

  selectedOption: {
    borderColor: colors.primary,
  },

  optionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  optionText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },

  optionNote: {
    color: colors.primary,
    marginTop: 6,
    fontWeight: '700',
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

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },

  distanceButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  selectedDistance: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },

  distanceText: {
    color: colors.text,
    fontWeight: '800',
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

  formulaText: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },

  predictionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginTop: 14,
  },

  helperText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },

  textArea: {
    minHeight: 130,
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