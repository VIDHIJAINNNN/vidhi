import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, font, shadow } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";
import { storage } from "@/src/utils/storage";

const { width } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);
  const brandOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) });
    logoOpacity.value = withTiming(1, { duration: 500 });
    brandOpacity.value = withDelay(280, withTiming(1, { duration: 500 }));
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    ctaOpacity.value = withDelay(750, withTiming(1, { duration: 500 }));
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [logoScale, logoOpacity, brandOpacity, taglineOpacity, ctaOpacity, glow]);

  // Auto-route logged-in users to the app; only show splash CTA for new/anonymous users
  useEffect(() => {
    if (loading) return;
    (async () => {
      if (user) {
        router.replace("/(tabs)");
        return;
      }
      setReady(true);
    })();
  }, [loading, user, router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: (1 - brandOpacity.value) * 8 }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: (1 - taglineOpacity.value) * 8 }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: (1 - ctaOpacity.value) * 12 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.45,
    transform: [{ scale: 1 + glow.value * 0.08 }],
  }));

  const handleContinue = async () => {
    const done = await storage.getItem("onboarding_done", false);
    router.replace(done ? "/login" : "/onboarding");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F8F9FA", "#FFFFFF", "#EFF6FF"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <View style={styles.logoWrap}>
            <Animated.View style={[styles.glowRing, glowStyle]}>
              <LinearGradient
                colors={["rgba(37,99,235,0.28)", "rgba(37,99,235,0.06)", "transparent"]}
                style={{ flex: 1, borderRadius: 999 }}
              />
            </Animated.View>
            <Animated.View style={[styles.logoCircle, logoStyle]}>
              <Text style={styles.logoEmoji}>🌳</Text>
            </Animated.View>
          </View>

          <Animated.Text style={[styles.brand, brandStyle]} testID="splash-brand">
            LEGACY
          </Animated.Text>
          <Animated.Text style={[styles.tagline, taglineStyle]} testID="splash-tagline">
            Knowledge Never Graduates.
          </Animated.Text>
          <Animated.Text style={[styles.subline, taglineStyle]}>
            A Student Knowledge Ecosystem
          </Animated.Text>
        </View>

        <Animated.View style={[styles.bottom, ctaStyle]}>
          {ready ? (
            <>
              <TouchableOpacity
                style={styles.cta}
                onPress={handleContinue}
                activeOpacity={0.9}
                testID="splash-get-started-btn"
              >
                <Text style={styles.ctaTxt}>Get Started</Text>
              </TouchableOpacity>
              <Text style={styles.footer}>Learn. Mentor. Inspire.</Text>
            </>
          ) : (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  logoWrap: { alignItems: "center", justifyContent: "center", marginBottom: 32 },
  glowRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    overflow: "hidden",
  },
  logoCircle: {
    width: 116,
    height: 116,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary + "22",
    ...shadow.medium,
  },
  logoEmoji: { fontSize: 62 },
  brand: {
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: 6,
    color: colors.text,
    textAlign: "center",
  },
  tagline: {
    marginTop: 14,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  subline: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    textAlign: "center",
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 20 },
  cta: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.medium,
  },
  ctaTxt: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.4 },
  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    letterSpacing: 1,
  },
  loadingRow: { height: 56, alignItems: "center", justifyContent: "center" },
});
