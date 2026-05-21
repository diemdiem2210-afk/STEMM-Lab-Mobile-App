import { Link } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { colors } from '@/constants/Colors';

const engineeringActivities = [
  {
    title: 'Parachute Drop',
    description: 'Record fall time and calculate landing speed.',
    href: '/activities/parachute',
    accent: '#38BDF8',
  },
  {
    title: 'Sound Pollution Hunter',
    description: 'Measure noise levels with location tagging.',
    href: '/activities/sound-hunter',
    accent: '#22C55E',
  },
  {
    title: 'Hand Fan Challenge',
    description: 'Compare fan designs and paper movement.',
    href: '/activities/hand-fan',
    accent: '#F59E0B',
  },
  {
    title: 'Earthquake Structure',
    description: 'Use motion sensors to test structure stability.',
    href: '/activities/earthquake',
    accent: '#EF4444',
  },
];

const medicalActivities = [
  {
    title: 'Stretch Performance',
    description: 'Measure movement smoothness using sensors.',
    href: '/activities/stretch',
    accent: '#EC4899',
  },
  {
    title: 'Reaction Board',
    description: 'Test reaction time and coordination.',
    href: '/activities/reaction',
    accent: '#8B5CF6',
  },
  {
    title: 'Breathing Trainer',
    description: 'Track breathing pace before and after exercise.',
    href: '/activities/breathing',
    accent: '#14B8A6',
  },
];

export default function ActivitiesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Activities</Text>

      <Text style={styles.subtitle}>
        Choose a STEMM challenge to complete with your team.
      </Text>

      <Section title="Engineering Challenges" activities={engineeringActivities} />

      <Section title="Health & Medical Sciences" activities={medicalActivities} />
    </ScrollView>
  );
}

type Activity = {
  title: string;
  description: string;
  href: string;
  accent: string;
};

function Section({
  title,
  activities,
}: {
  title: string;
  activities: Activity[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {activities.map((activity) => (
        <Link key={activity.title} href={activity.href as never} asChild>
          <Pressable style={styles.card}>
            <View
              style={[
                styles.accentBar,
                { backgroundColor: activity.accent },
              ]}
            />

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{activity.title}</Text>
              <Text style={styles.cardText}>{activity.description}</Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </Link>
      ))}
    </View>
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
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 8,
  },

  subtitle: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },

  section: {
    marginBottom: 26,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },

  accentBar: {
    width: 6,
    height: '100%',
  },

  cardContent: {
    flex: 1,
    padding: 16,
  },

  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  cardText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },

  arrow: {
    color: colors.primary,
    fontSize: 34,
    paddingRight: 16,
  },
});