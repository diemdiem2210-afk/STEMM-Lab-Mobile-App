import { loginUser } from "@/services/authService";
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
import {
  getTeamProfileFromFirestore,
  saveTeamProfileToFirestore,
} from "../services/teamFirestoreService";

import { colors } from "@/constants/Colors";
import { createTeamProfile } from "@/models/teamProfileModel";
import { registerUser } from "@/services/authService";
import { saveTeamProfile } from "@/services/teamProfileService";

export default function StartupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [teamName, setTeamName] = useState("");
  const [memberOne, setMemberOne] = useState("");
  const [memberTwo, setMemberTwo] = useState("");
  const [memberThree, setMemberThree] = useState("");
  const [yearLevel, setYearLevel] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const saveSetup = async () => {
    const members = [memberOne, memberTwo, memberThree]
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (
      !email.trim() ||
      !password.trim() ||
      !teamName.trim() ||
      members.length === 0 ||
      !yearLevel.trim()
    ) {
      Alert.alert(
        "Missing details",
        "Please enter email, password, team name, at least one member, and year level."
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak password",
        "Firebase requires passwords to be at least 6 characters."
      );
      return;
    }

    try {
      setIsSaving(true);

      const user = await registerUser(email.trim(), password);

      const profile = createTeamProfile(
        user.uid,
        email.trim(),
        teamName.trim(),
        members,
        yearLevel.trim()
      );

      await saveTeamProfile(profile);
      await saveTeamProfileToFirestore(profile);

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
    } catch (error: any) {
      Alert.alert(
        "Setup failed",
        error?.message ?? "Could not create team account."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const loginExistingTeam = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(
        "Missing details",
        "Please enter email and password."
      );
      return;
    }

    try {
      setIsSaving(true);

      const user = await loginUser(
        email.trim(),
        password
      );

      const cloudProfile =
        await getTeamProfileFromFirestore(user.uid);

      if (!cloudProfile) {
        Alert.alert(
          "No team profile",
          "This account has no saved team profile."
        );
        return;
      }

      await saveTeamProfile(cloudProfile);

      router.replace("/home");
    } catch (error: any) {
      Alert.alert(
        "Login failed",
        error?.message ?? "Could not log in to existing team."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>STEMM Lab Setup</Text>

      <Text style={styles.subtitle}>
        Create a Firebase account and set up your team profile.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="team@email.com"
          placeholderTextColor={colors.mutedText}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Minimum 6 characters"
          placeholderTextColor={colors.mutedText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.sectionTitle}>Team Details</Text>

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

        <Pressable
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={saveSetup}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Creating..." : "Create Team Account"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={loginExistingTeam}
          disabled={isSaving}
        >
          <Text style={styles.secondaryButtonText}>
            Login Existing Team
          </Text>
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

  sectionTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 12,
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

  disabledButton: {
    backgroundColor: colors.card,
  },

  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryButton: {
  borderWidth: 1,
  borderColor: colors.primary,
  paddingVertical: 15,
  borderRadius: 14,
  alignItems: "center",
  marginTop: 12,
},

secondaryButtonText: {
  color: colors.primary,
  fontSize: 16,
  fontWeight: "900",
},
});