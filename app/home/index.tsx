import { useEffect, useState } from 'react';

import {
  ChallengeState,
  getChallengeState,
  startChallenge,
  TOTAL_ACTIVITIES,
} from '@/services/challengeService';
import { Link } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/constants/Colors';

export default function HomeScreen() {
  const [challenge, setChallenge] =
    useState<ChallengeState | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    loadChallenge();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!challenge?.startedAt || challenge.completedAt) {
        return;
      }

      const start = new Date(challenge.startedAt).getTime();

      setElapsedSeconds(
        Math.floor((Date.now() - start) / 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge]);

  const loadChallenge = async () => {
    const state = await getChallengeState();

    setChallenge(state);

    if (state.startedAt) {
      const end = state.completedAt
        ? new Date(state.completedAt).getTime()
        : Date.now();

      setElapsedSeconds(
        Math.floor(
          (end - new Date(state.startedAt).getTime()) / 1000
        )
      );
    }
  };

  const acceptChallenge = async () => {
    const state = await startChallenge();

    setChallenge(state);
    setElapsedSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}m ${secs}s`;
  };

  const completedCount =
    challenge?.completedActivityIds.length ?? 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>STEMM Lab</Text>

        <Text style={styles.subtitle}>
          Real-world STEMM challenges using sensors, GPS,
          teamwork and scientific experiments.
        </Text>
      </View>

      {!challenge?.accepted && (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>STEMM Challenge Available</Text>

          <Text style={styles.bannerText}>
            Accept the challenge and complete all 7 activities as fast as possible.
          </Text>

          <Pressable style={styles.acceptButton} onPress={acceptChallenge}>
            <Text style={styles.acceptButtonText}>Accept STEMM Challenge</Text>
          </Pressable>
        </View>
      )}

      {challenge?.accepted && (
        <View style={styles.timerCard}>
          <Text style={styles.sectionTitle}>STEMM Challenge Timer</Text>
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>

          <Text style={styles.progressText}>
            Completed: {completedCount} / {TOTAL_ACTIVITIES}
          </Text>

          <Text style={styles.statusText}>
            {challenge.completedAt ? "Challenge completed!" : "Timer is running..."}
          </Text>
        </View>
      )}
      <View style={styles.mainCard}>
        <Text style={styles.cardTitle}>
          Start Activities
        </Text>

        <Text style={styles.cardText}>
          Complete engineering, physics, and medical science
          challenges with your team.
        </Text>

        <Link href="/activities" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.buttonText}>
              View Activities
            </Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.grid}>
        <Link href="/leaderboard" asChild>
          <Pressable style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>
              Activity Results
            </Text>

            <Text style={styles.smallCardText}>
              View saved reaction and trace attempts
            </Text>
          </Pressable>
        </Link>

        <Link href="/profile" asChild>
          <Pressable style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>
              Profile
            </Text>

            <Text style={styles.smallCardText}>
              Team information
            </Text>
          </Pressable>
        </Link>

        <Link href="/settings" asChild>
          <Pressable style={styles.smallCard}>
            <Text style={styles.smallCardTitle}>
              Settings
            </Text>

            <Text style={styles.smallCardText}>
              Notifications & preferences
            </Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },

  header: {
    marginTop: 20,
    marginBottom: 24,
  },

  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
  },

  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
  },

  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },

  cardTitle: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },

  cardText: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },

  grid: {
    gap: 16,
    marginBottom: 40,
  },

  smallCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  smallCardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },

  smallCardText: {
    color: colors.mutedText,
    fontSize: 14,
  },

  banner: {
  backgroundColor: colors.primary,
  borderRadius: 20,
  padding: 18,
  marginBottom: 20,
},

bannerTitle: {
  color: colors.background,
  fontSize: 22,
  fontWeight: '800',
  marginBottom: 8,
},

bannerText: {
  color: colors.background,
  fontSize: 15,
  lineHeight: 22,
  marginBottom: 14,
},

acceptButton: {
  backgroundColor: colors.background,
  borderRadius: 14,
  paddingVertical: 13,
  alignItems: 'center',
},

acceptButtonText: {
  color: colors.primary,
  fontWeight: '900',
  fontSize: 15,
},

timerCard: {
  backgroundColor: colors.surface,
  borderRadius: 22,
  padding: 20,
  borderWidth: 1,
  borderColor: colors.border,
  marginBottom: 20,
},

sectionTitle: {
  color: colors.primary,
  fontSize: 20,
  fontWeight: '800',
  marginBottom: 12,
},

timerText: {
  color: colors.text,
  fontSize: 42,
  fontWeight: '900',
},

progressText: {
  color: colors.text,
  fontSize: 17,
  fontWeight: '700',
  marginTop: 10,
},

statusText: {
  color: colors.mutedText,
  fontSize: 15,
  marginTop: 6,
},
});