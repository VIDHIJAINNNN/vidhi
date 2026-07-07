import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, font, shadow } from "@/src/theme";

const BENEFITS = [
  { icon: "school", title: "Share your knowledge", desc: "Turn your wins into structured 1:1 sessions." },
  { icon: "cash", title: "Earn income", desc: "Set your own rate — most mentors earn ₹8-25k/month." },
  { icon: "trophy", title: "Build your leadership", desc: "Boost your profile with verified mentorship credits." },
  { icon: "ribbon", title: "Leave a Legacy", desc: "Your knowledge lives on for the next batch." },
];

const STEPS = [
  { n: 1, title: "Apply", desc: "Tell us about your achievements and subjects." },
  { n: 2, title: "Get Verified", desc: "Our team verifies your school & achievements in 48 hrs." },
  { n: 3, title: "Set Availability", desc: "Choose slots, rate, and start mentoring." },
  { n: 4, title: "Grow your Legacy", desc: "Reviews and earnings compound with every session." },
];

export default function BecomeMentor() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="mentor-apply-back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <LinearGradient colors={["#1E3A8A", "#2563EB"]} style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 44 }}>🌟</Text>
          </View>
          <Text style={styles.heroTitle}>Become a Mentor.</Text>
          <Text style={styles.heroSub}>
            Share your knowledge. Earn income. Leave a Legacy.
          </Text>
        </LinearGradient>

        <Text style={styles.section}>Why Mentor with LEGACY</Text>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={styles.benefitCard}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.section}>How it Works</Text>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {STEPS.map((s) => (
            <View key={s.n} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeTxt}>{s.n}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.testimonialCard}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&w=200&q=80" }}
            style={styles.testimonialAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.testimonialQuote}>
              "I earned ₹22,000 last month while sharpening my own subject mastery. LEGACY changed my confidence."
            </Text>
            <Text style={styles.testimonialAuthor}>— Ananya Jain, Class 12</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyCta}>
        <TouchableOpacity
          style={styles.applyBtn}
          activeOpacity={0.9}
          onPress={() => router.push("/legacy")}
          testID="apply-now-btn"
        >
          <Text style={styles.applyTxt}>Apply Now</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 12, paddingTop: 4 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  hero: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: radius.xxl,
    alignItems: "center",
    ...shadow.medium,
  },
  heroIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 8, lineHeight: 20 },
  section: { ...font.h3, marginHorizontal: 24, marginTop: 32, marginBottom: 14 },
  benefitCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  benefitIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  benefitTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  benefitDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  stepRow: { flexDirection: "row", gap: 14, alignItems: "flex-start", padding: 14, backgroundColor: colors.bg2, borderRadius: radius.lg },
  stepBadge: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  stepBadgeTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
  stepTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  stepDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
  testimonialCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  testimonialAvatar: { width: 48, height: 48, borderRadius: 24 },
  testimonialQuote: { fontSize: 13, color: colors.text, fontStyle: "italic", lineHeight: 20 },
  testimonialAuthor: { fontSize: 12, color: colors.textSecondary, marginTop: 6, fontWeight: "600" },
  stickyCta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.medium,
  },
  applyBtn: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
