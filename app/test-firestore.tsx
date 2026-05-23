import { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { createResult } from "../models/resultModel";
import { saveResultToFirestore } from "../services/resultService";

export default function TestFirestoreScreen() {
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    console.log("BUTTON CLICKED");
    setMessage("Saving...");

    try {
      const result = createResult(
        "reaction",
        "Reaction Test",
        "user123",
        "Tony",
        95,
        "Great reaction speed"
      );

      const docId = await saveResultToFirestore(result);

      console.log("Saved with ID:", docId);
      setMessage(`Success! Saved with ID: ${docId}`);
    } catch (error: any) {
      console.error("Firestore Error:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firestore Test</Text>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Result</Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}
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
    marginBottom: 20,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 12,
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