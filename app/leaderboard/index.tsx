import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getTopResults } from "../../services/resultService";

export default function LeaderboardScreen() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await getTopResults();

      setResults(data as any[]);
    } catch (error) {
      console.error("Leaderboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Leaderboard
      </Text>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.rank}>
              #{index + 1}
            </Text>

            <View>
              <Text style={styles.name}>
                {item.username}
              </Text>

              <Text style={styles.activity}>
                {item.activityName}
              </Text>
            </View>

            <Text style={styles.score}>
              {item.score}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  rank: {
    fontSize: 20,
    fontWeight: "bold",
    width: 50,
  },

  name: {
    fontSize: 18,
    fontWeight: "600",
  },

  activity: {
    color: "gray",
  },

  score: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
});