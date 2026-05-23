import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { colors } from "@/constants/Colors";
import { createTeamProfile } from "@/models/teamProfileModel";
import { saveTeamProfile } from "@/services/teamProfileService";

export default function StartupScreen() {
  const [teamName, setTeamName] = useState("");
  const [memberOne, setMemberOne] = useState("");
  const [memberTwo, setMemberTwo] = useState("");
  const [memberThree, setMemberThree] = useState("");
  const [yearLevel, setYearLevel] = useState("");

  const saveSetup = async () => {
    const members = [memberOne, memberTwo, memberThree].filter(
      (name) => name.trim().length > 0
    );

    if (!teamName.trim() || members.length === 0 || !yearLevel.trim()) {
      Alert.alert(
        "Missing details",
        "Please enter team name, at least one member, and year level."
      );
      return;
    }

    const profile = createTeamProfile(teamName, members, yearLevel);

    await saveTeamProfile(profile);

    Alert.alert(
      "Team Created",
      `Your team discriminator is ${profile.teamDiscriminator}`,
      [
        {
          text: "Continue",
          onPress: () => router.replace("/home"),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>STEMM Lab Setup</Text>

      <Text style={styles.subtitle}>
        Enter your team details before starting activities.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Team Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: STEMM Stars"
          placeholderTextColor={colors.mutedText}
          value={teamName}
          onChangeText={setTeamName}
        />

        <Text style={styles.label}>Team Member 1</Text>
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={colors.mutedText}
          value={memberOne}
          onChangeText={setMemberOne}
        />

        <Text style={styles.label}>Team Member 2</Text>
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor={colors.mutedText}
          value={memberTwo}
          onChangeText={setMemberTwo}
        />

        <Text style={styles.label}>Team Member 3</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional"
          placeholderTextColor={colors.mutedText}
          value={memberThree}
          onChangeText={setMemberThree}
        />

        <Text style={styles.label}>Grade / Year Level</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: Year 6"
          placeholderTextColor={colors.mutedText}
          value={yearLevel}
          onChangeText={setYearLevel}
        />

        <Pressable style={styles.saveButton} onPress={saveSetup}>
          <Text style={styles.saveButtonText}>Create Team</Text>
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
    fontSize: 32,
    fontWeight: "900",
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
  },

  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
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

  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
  },

  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "900",
  },
});