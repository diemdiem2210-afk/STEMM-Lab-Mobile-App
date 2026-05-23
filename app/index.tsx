import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { colors } from "@/constants/Colors";
import { getTeamProfile } from "@/services/teamProfileService";

export default function IndexScreen() {
  const [checking, setChecking] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const profile = await getTeamProfile();

      setHasProfile(Boolean(profile));
      setChecking(false);
    };

    checkProfile();
  }, []);

  if (checking) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!hasProfile) {
    return <Redirect href="/startup" />;
  }

  return <Redirect href="/home" />;
}