import { StyleSheet, Text, View } from "react-native";

export default function TestAdMobScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AdMob Test</Text>

      <View style={styles.banner}>
        <Text>Sample Banner Advertisement</Text>
      </View>

      <Text style={styles.note}>
        AdMob placeholder integration for testing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  banner: {
    width: 320,
    height: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  note: {
    textAlign: "center",
  },
});