import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const requestNotificationPermission = async () => {
  if (Platform.OS === "web") {
    console.log("Web platform: notification permission skipped.");
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const sendActivityNotification = async () => {
  if (Platform.OS === "web") {
    console.log("Web platform: notification simulated.");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "STEMM Lab Reminder",
      body: "Time to complete a STEMM activity!",
    },
    trigger: null,
  });
};