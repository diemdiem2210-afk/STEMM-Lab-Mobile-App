import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

const BACKGROUND_SYNC_TASK = "background-sync-task";

if (Platform.OS !== "web") {
  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      console.log("Background sync task running...");

      // Future improvement:
      // SQLite local results can be synced to Firestore here.

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
      console.error("Background sync failed:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

export const registerBackgroundSync = async () => {
  if (Platform.OS === "web") {
    console.log("Background sync simulated on web.");
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_SYNC_TASK
  );

  if (isRegistered) {
    console.log("Background sync task already registered");
    return;
  }

  await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  console.log("Background sync task registered");
};

export const unregisterBackgroundSync = async () => {
  if (Platform.OS === "web") {
    console.log("Background sync unregister simulated on web.");
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_SYNC_TASK
  );

  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    console.log("Background sync task unregistered");
  }
};