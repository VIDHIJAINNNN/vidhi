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
import { useFonts } from "expo-font";
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
import { colors, radius, shadow } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";
import { storage } from "@/src/utils/storage";
import LegacyLogo from "@/src/components/LegacyLogo";

const { width } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
  });

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const brandOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.exp) });
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

  // Only apply Poppins once loaded to avoid a flash of tofu
  const brandFontFamily = fontsLoaded ? "Poppins-ExtraBold" : undefined;
  const bodyFontFamily = fontsLoaded ? "Poppins-Medium" : undefined;
  const captionFontFamily = fontsLoaded ? "Poppins-Regular" : undefined;
  const ctaFontFamily = fontsLoaded ? "Poppins-SemiBold" : undefined;

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
                colors={["rgba(37,99,235,0.24)", "rgba(37,99,235,0.06)", "transparent"]}
                style={{ flex: 1, borderRadius: 999 }}
              />
            </Animated.View>
            <Animated.View style={[styles.logoCircle, logoStyle]} testID="splash-logo">
              <LegacyLogo size={78} primary="#0F172A" leaf="#10B981" leafAlt="#34D399" />
            </Animated.View>
          </View>

          <Animated.Text
            style={[styles.brand, brandStyle, { fontFamily: brandFontFamily }]}
            testID="splash-brand"
          >
            LEGACY
          </Animated.Text>
          <Animated.Text
            style={[styles.tagline, taglineStyle, { fontFamily: bodyFontFamily }]}
            testID="splash-tagline"
          >
            Knowledge Never Graduates.
          </Animated.Text>
          <Animated.Text style={[styles.subline, taglineStyle, { fontFamily: captionFontFamily }]}>
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
                <Text style={[styles.ctaTxt, { fontFamily: ctaFontFamily }]}>Get Started</Text>
              </TouchableOpacity>
              <Text style={[styles.footer, { fontFamily: captionFontFamily }]}>
                Learn. Mentor. Inspire.
              </Text>
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
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary + "22",
    ...shadow.medium,
  },
  brand: {
    fontSize: 46,
    color: colors.text,
    textAlign: "center",
    letterSpacing: 0.5,
    marginTop: 4,
    // fontFamily set inline once Poppins is loaded
  },
  tagline: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
    letterSpacing: 0.1,
    textAlign: "center",
  },
  subline: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.1,
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
  ctaTxt: { color: "#fff", fontSize: 16, letterSpacing: 0.2 },
  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  loadingRow: { height: 56, alignItems: "center", justifyContent: "center" },
});
