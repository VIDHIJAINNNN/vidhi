import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { storage } from "@/src/utils/storage";
import { colors } from "@/src/theme";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    (async () => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        const done = await storage.getItem("onboarding_done", false);
        router.replace(done ? "/login" : "/onboarding");
      }
    })();
  }, [loading, user, router]);

  return (
    <View style={styles.container} testID="splash-screen">
      <View style={styles.logoWrap}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌳</Text>
        </View>
        <Text style={styles.brand}>LEGACY</Text>
        <Text style={styles.tagline}>Knowledge Never Graduates.</Text>
      </View>
      <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoWrap: { alignItems: "center" },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 44 },
  brand: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: 4,
    color: colors.text,
  },
  tagline: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
});
