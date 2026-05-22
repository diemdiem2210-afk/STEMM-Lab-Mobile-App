import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function TestLocationScreen() {
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      let { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMsg("Permission denied");
        return;
      }

      let currentLocation =
        await Location.getCurrentPositionAsync({});

      setLocation(currentLocation);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GPS Test</Text>

      {errorMsg ? <Text>{errorMsg}</Text> : null}

      {location ? (
        <>
          <Text style={styles.text}>
            Latitude: {location.coords.latitude}
          </Text>

          <Text style={styles.text}>
            Longitude: {location.coords.longitude}
          </Text>
        </>
      ) : (
        <Text>Loading location...</Text>
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
    fontSize: 18,
    marginBottom: 10,
  },
});