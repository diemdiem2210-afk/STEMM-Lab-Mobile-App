import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "@/constants/Colors";
import { getChallengeState } from "@/services/challengeService";
import { getTeamProfile } from "@/services/teamProfileService";

type TeamLeaderboardRow = {
  teamName: string;
  teamDiscriminator: string;
  completedCount: number;
  totalActivities: number;
  totalTimeSeconds: number | null;
};

export default function LeaderboardScreen() {
  const [rows, setRows] = useState<TeamLeaderboardRow[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const profile = await getTeamProfile();
    const challenge = await getChallengeState();

    if (!profile) {
      setRows([]);
      return;
    }

    const totalTimeSeconds =
      challenge.startedAt && challenge.completedAt
        ? Math.floor(
            (new Date(challenge.completedAt).getTime() -
              new Date(challenge.startedAt).getTime()) /
              1000
          )
        : null;

    const currentTeamRow: TeamLeaderboardRow = {
      teamName: profile.teamName,
      teamDiscriminator: profile.teamDiscriminator,
      completedCount: challenge.completedActivityIds.length,
      totalActivities: 7,
      totalTimeSeconds,
    };

    setRows([currentTeamRow]);
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }

      if (a.totalTimeSeconds === null && b.totalTimeSeconds === null) {
        return 0;
      }

      if (a.totalTimeSeconds === null) {
        return 1;
      }

      if (b.totalTimeSeconds === null) {
        return -1;
      }

      return a.totalTimeSeconds - b.totalTimeSeconds;
    });
  }, [rows]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) {
      return "--";
    }

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}m ${secs}s`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>STEMM Challenge Leaderboard</Text>

      <Text style={styles.subtitle}>
        Teams are ranked by how many activities they completed. If teams finish
        the same number of activities, the shortest completion time wins.
      </Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.rankColumn]}>Rank</Text>
        <Text style={[styles.headerText, styles.teamColumn]}>Team</Text>
        <Text style={[styles.headerText, styles.completedColumn]}>
          Completed
        </Text>
        <Text style={[styles.headerText, styles.timeColumn]}>Time</Text>
      </View>

      {sortedRows.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No team challenge result found yet.
          </Text>
        </View>
      ) : (
        sortedRows.map((row, index) => (
          <View key={row.teamDiscriminator} style={styles.rowCard}>
            <Text style={[styles.rankText, styles.rankColumn]}>
              #{index + 1}
            </Text>

            <View style={styles.teamColumn}>
              <Text style={styles.teamName}>{row.teamName}</Text>
              <Text style={styles.teamCode}>{row.teamDiscriminator}</Text>
            </View>

            <Text style={[styles.completedText, styles.completedColumn]}>
              {row.completedCount}/{row.totalActivities}
            </Text>

            <Text style={[styles.timeText, styles.timeColumn]}>
              {formatTime(row.totalTimeSeconds)}
            </Text>
          </View>
        ))
      )}

      <Pressable style={styles.refreshButton} onPress={loadLeaderboard}>
        <Text style={styles.refreshButtonText}>Refresh Leaderboard</Text>
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
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 10,
  },

  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },

  headerText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },

  rankColumn: {
    width: "14%",
  },

  teamColumn: {
    width: "42%",
  },

  completedColumn: {
    width: "22%",
    textAlign: "center",
  },

  timeColumn: {
    width: "22%",
    textAlign: "right",
  },

  rankText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  teamName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  teamCode: {
    color: colors.mutedText,
    fontSize: 12,
    marginTop: 4,
  },

  completedText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },

  timeText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  emptyText: {
    color: colors.mutedText,
    fontSize: 15,
  },

  refreshButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
  },

  refreshButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "900",
  },
});