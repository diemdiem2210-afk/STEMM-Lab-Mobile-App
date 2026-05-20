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
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>STEMM Lab</Text>

        <Text style={styles.subtitle}>
          Real-world STEMM challenges using sensors, GPS,
          teamwork and scientific experiments.
        </Text>
      </View>

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
              Leaderboard
            </Text>

            <Text style={styles.smallCardText}>
              Compare team scores
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
});