import { resetChallenge } from "@/services/challengeService";
import { clearAllFullResultsLocal } from "@/services/resultService";
import {
  clearTeamProfile,
  getTeamProfile,
} from "@/services/teamProfileService";
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
import {
  deleteUserAndResultsFromFirestore,
  FirestoreTeamProfile,
  getAllTeamProfilesFromFirestore,
} from "@/services/teamFirestoreService";

const ADMIN_EMAIL = "admin@stemmlab.app";
const ADMIN_PASSWORD = "stemm123";

export default function SettingsScreen() {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [teams, setTeams] = useState<FirestoreTeamProfile[]>([]);

  const loginAsAdmin = async () => {
    if (!adminEmail.trim() || !adminPassword.trim()) {
      Alert.alert("Missing details", "Please enter admin email and password.");
      return;
    }

    try {

      if (
        adminEmail.trim() !== ADMIN_EMAIL ||
        adminPassword !== ADMIN_PASSWORD
      ) {
        Alert.alert(
          "Access denied",
          "Incorrect admin email or password."
        );
        return;
      }

      setIsAdmin(true);
      await loadTeams();

      Alert.alert("Admin login successful", "Admin dashboard unlocked.");
    } catch (error: any) {
      Alert.alert("Login failed", error?.message ?? "Could not log in.");
    }
  };

  const loadTeams = async () => {
    try {
      const allTeams = await getAllTeamProfilesFromFirestore();
      setTeams(allTeams);
    } catch (error: any) {
      Alert.alert("Load failed", error?.message ?? "Could not load teams.");
    }
  };

  const deleteTeam = async (team: FirestoreTeamProfile) => {
    Alert.alert(
      "Delete Client Account",
      `Delete ${team.teamName} and all related activity results from Firestore?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserAndResultsFromFirestore(team.uid);

              const localProfile = await getTeamProfile();

              if (localProfile?.uid === team.uid) {
                await clearTeamProfile();
                await clearAllFullResultsLocal();
                await resetChallenge();

                Alert.alert(
                  "Deleted",
                  "This team was deleted. Local profile, saved attempts, and STEMM challenge timer were reset.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.replace("/startup"),
                    },
                  ]
                );

                return;
              }

              await loadTeams();

              Alert.alert(
                "Deleted",
                "Client account record and related activity results were deleted from Firestore."
              );
            } catch (error: any) {
              Alert.alert(
                "Delete failed",
                error?.message ?? "Could not delete account data."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Admin Dashboard</Text>

        {!isAdmin ? (
          <>
            <Text style={styles.helperText}>
              Log in as admin to manage registered team accounts and delete
              their related activity results from Firestore.
            </Text>

            <Text style={styles.label}>Admin Email</Text>
            <TextInput
              style={styles.input}
              value={adminEmail}
              onChangeText={setAdminEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Admin email"
              placeholderTextColor={colors.mutedText}
            />

            <Text style={styles.label}>Admin Password</Text>
            <TextInput
              style={styles.input}
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry
              placeholder="Admin password"
              placeholderTextColor={colors.mutedText}
            />

            <Pressable style={styles.primaryButton} onPress={loginAsAdmin}>
              <Text style={styles.primaryButtonText}>Log In as Admin</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.adminBadge}>Admin Access Enabled</Text>

            <Pressable style={styles.secondaryButton} onPress={loadTeams}>
              <Text style={styles.secondaryButtonText}>Refresh Users</Text>
            </Pressable>

            {teams.length === 0 ? (
              <Text style={styles.emptyText}>No registered teams found.</Text>
            ) : (
              teams.map((team) => (
                <View key={team.uid} style={styles.teamCard}>
                  <Text style={styles.teamName}>{team.teamName}</Text>

                  <Text style={styles.teamText}>
                    Team Code: {team.teamDiscriminator}
                  </Text>

                  <Text style={styles.teamText}>
                    Year Level: {team.yearLevel}
                  </Text>

                  <Text style={styles.teamText}>
                    Members: {team.members?.join(", ")}
                  </Text>

                  <Text style={styles.teamText}>Email: {team.email}</Text>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteTeam(team)}
                  >
                    <Text style={styles.deleteButtonText}>
                      Delete Account + Results
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Admin Note</Text>
        <Text style={styles.infoText}>
          This deletes the user profile and linked activity results from
          Firestore. Full Firebase Authentication account deletion requires a
          secure backend using Firebase Admin SDK.
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
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 20,
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
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 12,
  },

  helperText: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },

  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
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

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
  },

  primaryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "900",
  },

  adminBadge: {
    color: colors.success,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 14,
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 16,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },

  emptyText: {
    color: colors.mutedText,
    fontSize: 15,
    marginTop: 12,
  },

  teamCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
  },

  teamName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

  teamText: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 5,
  },

  deleteButton: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  deleteButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
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
    fontWeight: "900",
    marginBottom: 8,
  },

  infoText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
  },
});