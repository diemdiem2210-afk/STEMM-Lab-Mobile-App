import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    requestNotificationPermission,
    sendActivityNotification,
} from "../services/notificationService";

export default function TestNotificationScreen() {
  const [message, setMessage] = useState("");

  const handleNotification = async () => {
    const granted = await requestNotificationPermission();

    if (!granted) {
      setMessage("Notification permission denied");
      return;
    }

    await sendActivityNotification();
    setMessage("Notification sent");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test</Text>

      <TouchableOpacity style={styles.button} onPress={handleNotification}>
        <Text style={styles.buttonText}>Send Notification</Text>
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
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  message: {
    marginTop: 20,
    fontSize: 16,
  },
});