import * as Battery from "expo-battery";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TestBatteryScreen() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const level = await Battery.getBatteryLevelAsync();

      setBatteryLevel(level);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Battery Test</Text>

      {batteryLevel !== null ? (
        <Text style={styles.text}>
          Battery Level: {(batteryLevel * 100).toFixed(0)}%
        </Text>
      ) : (
        <Text>Loading battery info...</Text>
      )}
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

  text: {
    fontSize: 20,
  },
});