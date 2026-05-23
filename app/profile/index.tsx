import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/Colors";
import { TeamProfile } from "@/models/teamProfileModel";
import {
  deleteFullResultLocal,
  getFullResultsLocal,
} from "@/services/resultService";
import {
  clearTeamProfile,
  getTeamProfile,
} from "@/services/teamProfileService";

type SavedResult = {
  id: number;
  activityId: string;
  activityName: string;
  createdAt: string;
  [key: string]: any;
};

const hiddenKeys = ["id", "activityId"];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [results, setResults] = useState<SavedResult[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const savedProfile = await getTeamProfile();
    const savedResults = await getFullResultsLocal();

    setProfile(savedProfile);
    setResults(savedResults as SavedResult[]);
  };

  const resetProfile = async () => {
    await clearTeamProfile();
    router.replace("/startup");
  };

  const deleteAttempt = async (id: number) => {
    await deleteFullResultLocal(id);
    await loadProfile();
  };

  const formatKey = (key: string) => {
    if (key === "createdAt") return "Created At";

    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (text) => text.toUpperCase());
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "--";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    if (
      typeof value === "string" &&
      value.includes("T") &&
      value.includes(":")
    ) {
      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleString();
      }
    }

    return String(value);
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Team Profile</Text>

        <Text style={styles.emptyText}>No team profile found.</Text>

        <Pressable style={styles.button} onPress={() => router.push("/startup")}>
          <Text style={styles.buttonText}>Set Up Team</Text>
        </Pressable>
      </View>
    );
  }

  const completedActivityIds = new Set(
    results.map((result) => result.activityId)
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Team Profile</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Team Information</Text>

        <Text style={styles.label}>Team Name</Text>
        <Text style={styles.value}>{profile.teamName}</Text>

        <Text style={styles.label}>Team Members</Text>
        {profile.members.map((member, index) => (
          <Text key={index} style={styles.memberText}>
            {index + 1}. {member}
          </Text>
        ))}

        <Text style={styles.label}>Grade / Year Level</Text>
        <Text style={styles.value}>{profile.yearLevel}</Text>

        <Text style={styles.label}>Team Discriminator</Text>
        <Text style={styles.discriminator}>{profile.teamDiscriminator}</Text>

        <Text style={styles.label}>Created At</Text>
        <Text style={styles.value}>
          {new Date(profile.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Activity Progress</Text>

        <Text style={styles.value}>
          Completed Activities: {completedActivityIds.size} / 7
        </Text>

        <Text style={styles.value}>Total Saved Attempts: {results.length}</Text>
      </View>

      <Text style={styles.historyTitle}>Saved Activity Attempts</Text>

      {results.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>No saved activity attempts yet.</Text>
        </View>
      ) : (
        results.map((attempt, index) => (
          <View key={attempt.id} style={styles.card}>
            <View style={styles.attemptHeader}>
              <Text style={styles.attemptNumber}>Attempt #{index + 1}</Text>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  Alert.alert(
                    "Delete Attempt",
                    "Are you sure you want to delete this saved result?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteAttempt(attempt.id),
                      },
                    ]
                  )
                }
              >
                <Text style={styles.deleteText}>🗑</Text>
              </Pressable>
            </View>

            <Text style={styles.activityName}>{attempt.activityName}</Text>

            {Object.entries(attempt)
              .filter(([key]) => !hiddenKeys.includes(key))
              .map(([key, value]) => (
                <View key={key} style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{formatKey(key)}</Text>
                  <Text style={styles.resultValue}>{formatValue(value)}</Text>
                </View>
              ))}
          </View>
        ))
      )}

      <Pressable style={styles.button} onPress={resetProfile}>
        <Text style={styles.buttonText}>Reset Team Profile</Text>
      </Pressable>
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
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  historyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 14,
    marginTop: 8,
  },

  label: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 6,
  },

  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },

  memberText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  discriminator: {
    color: colors.success,
    fontSize: 22,
    fontWeight: "900",
  },

  emptyText: {
    color: colors.mutedText,
    fontSize: 16,
    margin: 20,
  },

  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  attemptNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  activityName: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 12,
  },

  deleteButton: {
    padding: 8,
  },

  deleteText: {
    fontSize: 22,
  },

  resultRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
  },

  resultLabel: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  resultValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },

  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 20,
  },

  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "900",
  },
});