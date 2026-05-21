import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    registerBackgroundSync,
    unregisterBackgroundSync,
} from "../services/backgroundSyncService";

export default function TestBackgroundSyncScreen() {
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      await registerBackgroundSync();
      setMessage("Background sync task registered");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleUnregister = async () => {
    try {
      await unregisterBackgroundSync();
      setMessage("Background sync task unregistered");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Background Sync Test</Text>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register Background Sync</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleUnregister}>
        <Text style={styles.buttonText}>Unregister Background Sync</Text>
      </TouchableOpacity>

      <Text style={styles.message}>{message}</Text>
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

  button: {
    backgroundColor: "#007AFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },

  secondaryButton: {
    backgroundColor: "#FF9500",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  message: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
});