import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  withDelay,
} from "react-native-reanimated";
import { colors, radius, font } from "@/src/theme";
import { api } from "@/src/lib/api";

const { width } = Dimensions.get("window");

type Impact = {
  students_mentored: number;
  resources_uploaded: number;
  competitions_won: number;
  lives_impacted: number;
};

export default function LegacyImpact() {
  const router = useRouter();
  const [impact, setImpact] = useState<Impact | null>(null);

  const glow = useSharedValue(0);
  const rise = useSharedValue(0);

  useEffect(() => {
    api.get<Impact>("/impact")
      .then(setImpact)
      .catch(() =>
        setImpact({
          students_mentored: 47,
          resources_uploaded: 23,
          competitions_won: 5,
          lives_impacted: 120,
        }),
      );

    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    rise.value = withDelay(180, withTiming(1, { duration: 900, easing: Easing.out(Easing.exp) }));
  }, [glow, rise]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glow.value * 0.5,
    transform: [{ scale: 1 + glow.value * 0.06 }],
  }));
  const riseStyle = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: [{ translateY: (1 - rise.value) * 24 }],
  }));

  const stats = impact ?? { students_mentored: 47, resources_uploaded: 23, competitions_won: 5, lives_impacted: 120 };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0F24", "#0B1437", "#1E3A8A"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="legacy-back">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
          <View style={styles.treeWrap}>
            <Animated.View style={[styles.glowRing, glowStyle]}>
              <LinearGradient
                colors={["rgba(96,165,250,0.55)", "rgba(37,99,235,0.15)", "transparent"]}
                style={{ flex: 1, borderRadius: 200 }}
              />
            </Animated.View>
            <View style={styles.treeCircle}>
              <Text style={{ fontSize: 120 }}>🌳</Text>
            </View>
          </View>

          <Animated.View style={[styles.hero, riseStyle]}>
            <Text style={styles.title}>You Left a Legacy.</Text>
            <Text style={styles.subtitle}>Congratulations, your knowledge lives on.</Text>
          </Animated.View>

          <Animated.View style={[styles.statsGrid, riseStyle]}>
            <StatCard num={stats.students_mentored} label="Students Mentored" />
            <StatCard num={stats.resources_uploaded} label="Resources Uploaded" />
            <StatCard num={stats.competitions_won} label="Competitions Won" />
            <StatCard num={stats.lives_impacted} label="Lives Impacted" isLarge />
          </Animated.View>

          <Text style={styles.thanks}>
            Thank you for making a difference.{"\n"}The next generation is because of you.
          </Text>
        </ScrollView>

        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.cta}
            activeOpacity={0.9}
            onPress={() => router.push("/(tabs)")}
            testID="view-your-legacy-btn"
          >
            <Text style={styles.ctaTxt}>View Your Legacy</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatCard({ num, label, isLarge }: { num: number; label: string; isLarge?: boolean }) {
  return (
    <View style={[styles.statCard, isLarge && styles.statCardLarge]}>
      <Text style={[styles.statNum, isLarge && { fontSize: 44 }]}>{isLarge ? `${num}+` : num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0F24" },
  topBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 4 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  shareBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  treeWrap: { alignItems: "center", justifyContent: "center", marginTop: 30, height: 260 },
  glowRing: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 200,
    overflow: "hidden",
  },
  treeCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { alignItems: "center", paddingHorizontal: 24, marginTop: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#fff", textAlign: "center", letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 10, textAlign: "center" },
  statsGrid: {
    marginTop: 32,
    marginHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (width - 40 - 12) / 2,
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(96,165,250,0.15)",
    alignItems: "center",
  },
  statCardLarge: { width: width - 40, backgroundColor: "rgba(37,99,235,0.15)", borderColor: "rgba(96,165,250,0.35)" },
  statNum: { fontSize: 36, fontWeight: "800", color: "#fff", letterSpacing: -1 },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6, fontWeight: "500" },
  thanks: {
    marginTop: 32,
    paddingHorizontal: 32,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
  },
  ctaRow: { padding: 24 },
  cta: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  ctaTxt: { color: colors.dark, fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
});
