import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, font, shadow, spacing } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";

type Mentor = {
  mentor_id: string;
  name: string;
  avatar: string;
  headline: string;
  verified: boolean;
  rating: number;
  reviews_count: number;
  sessions: number;
  price: number;
  achievements: string[];
};

type VaultItem = {
  vault_id: string;
  title: string;
  cover: string;
  author: string;
  year: string;
};

type CareerItem = {
  career_id: string;
  name: string;
  icon: string;
  color: string;
};

type EventItem = {
  event_id: string;
  title: string;
  date: string;
  time: string;
  cover: string;
  host: string;
  attendees: number;
};

const PILLARS = [
  {
    key: "learn",
    title: "Learn",
    desc: "Find mentors, book\nsessions, ask questions.",
    icon: "book" as const,
    bg: "#2563EB",
    route: "/(tabs)/search",
  },
  {
    key: "vault",
    title: "Legacy Vault",
    desc: "Access winning\nresources from batches.",
    icon: "trophy" as const,
    bg: "#10B981",
    route: "/(tabs)/vault",
  },
  {
    key: "career",
    title: "Career Compass",
    desc: "Explore careers, roadmaps\nfrom seniors.",
    icon: "compass" as const,
    bg: "#F59E0B",
    route: "/career",
  },
  {
    key: "community",
    title: "Community",
    desc: "Workshops, competitions,\nstudy groups.",
    icon: "people" as const,
    bg: "#8B5CF6",
    route: "/community",
  },
] as const;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const load = async () => {
    try {
      const [m, v, c, e] = await Promise.all([
        api.get<Mentor[]>("/mentors"),
        api.get<VaultItem[]>("/vault"),
        api.get<CareerItem[]>("/careers"),
        api.get<EventItem[]>("/community/events"),
      ]);
      setMentors(m);
      setVault(v);
      setCareers(c);
      setEvents(e);
    } catch (err) {
      // Silent for now
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName} testID="home-username">
              {user?.name?.split(" ")[0] ?? "Friend"}
              <Text style={{ fontSize: 26 }}> 👋</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push("/notifications")}
            testID="home-notifications"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            <View style={styles.dot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} testID="home-avatar">
            {user?.picture ? (
              <Image source={{ uri: user.picture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{(user?.name ?? "L")[0]}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
          testID="home-search-bar"
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <Text style={styles.searchPlaceholder}>What would you like to learn today?</Text>
        </TouchableOpacity>

        {/* Pillars */}
        <Text style={styles.section}>The Legacy Ecosystem</Text>
        <View style={styles.pillarGrid}>
          {PILLARS.map((p) => (
            <TouchableOpacity
              key={p.key}
              activeOpacity={0.9}
              onPress={() => router.push(p.route as any)}
              style={[styles.pillar, { backgroundColor: p.bg }]}
              testID={`home-pillar-${p.key}`}
            >
              <View style={styles.pillarIconBg}>
                <Ionicons name={p.icon} size={22} color="#fff" />
              </View>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.pillarDesc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Thrive quick check-in */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.thriveWidget}
          onPress={() => router.push("/(tabs)/thrive")}
          testID="home-thrive-widget"
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="leaf" size={14} color="#059669" />
              <Text style={styles.thriveKicker}>TODAY'S CHECK-IN</Text>
            </View>
            <Text style={styles.thriveTitle}>How are you feeling today?</Text>
            <View style={styles.thriveEmojiRow}>
              {["😁", "😊", "😐", "😟", "😞", "😴"].map((e) => (
                <Text key={e} style={styles.thriveEmoji}>{e}</Text>
              ))}
            </View>
          </View>
        </TouchableOpacity>

        {/* Become a Mentor Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.mentorBanner}
          onPress={() => router.push("/become-mentor")}
          testID="become-mentor-banner"
        >
          <LinearGradient
            colors={["#1E3A8A", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGrad}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Become a Mentor</Text>
              <Text style={styles.bannerDesc}>Share your knowledge. Earn. Leave a Legacy.</Text>
              <View style={styles.bannerCta}>
                <Text style={styles.bannerCtaText}>Apply Now</Text>
                <Ionicons name="arrow-forward" size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.bannerIcon}>
              <Text style={{ fontSize: 44 }}>🌟</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Featured Mentors */}
        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Featured Mentors</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/search")}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
        >
          {mentors.slice(0, 5).map((m) => (
            <TouchableOpacity
              key={m.mentor_id}
              activeOpacity={0.9}
              style={styles.mentorCard}
              onPress={() => router.push(`/mentor/${m.mentor_id}` as any)}
              testID={`mentor-card-${m.mentor_id}`}
            >
              <Image source={{ uri: m.avatar }} style={styles.mentorImg} />
              <View style={{ padding: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.mentorName} numberOfLines={1}>{m.name}</Text>
                  {m.verified && <Ionicons name="checkmark-circle" size={14} color={colors.green} />}
                </View>
                <Text style={styles.mentorHeadline} numberOfLines={2}>{m.headline}</Text>
                <View style={styles.mentorStats}>
                  <Ionicons name="star" size={12} color={colors.gold} />
                  <Text style={styles.mentorStat}>{m.rating.toFixed(1)}</Text>
                  <Text style={styles.mentorStatSep}>•</Text>
                  <Text style={styles.mentorStat}>{m.sessions} sessions</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{m.price}<Text style={styles.priceUnit}>/session</Text></Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Legacy Vault preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Legacy Vault Preview</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/vault")}>
            <Text style={styles.viewAll}>Explore</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>Handpicked resources from high achievers.</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {vault.slice(0, 6).map((v) => (
            <TouchableOpacity
              key={v.vault_id}
              activeOpacity={0.9}
              style={styles.vaultCard}
              onPress={() => router.push(`/vault/${v.vault_id}` as any)}
              testID={`vault-card-${v.vault_id}`}
            >
              <Image source={{ uri: v.cover }} style={styles.vaultCover} />
              <View style={styles.vaultBody}>
                <Text style={styles.vaultTitle} numberOfLines={2}>{v.title}</Text>
                <Text style={styles.vaultAuthor} numberOfLines={1}>{v.author} • {v.year}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Career Compass Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Career Compass</Text>
          <TouchableOpacity onPress={() => router.push("/career")}>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>Explore. Plan. Achieve.</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {careers.slice(0, 6).map((c) => (
            <TouchableOpacity
              key={c.career_id}
              activeOpacity={0.9}
              onPress={() => router.push(`/career/${c.career_id}` as any)}
              style={styles.careerCard}
              testID={`career-card-${c.career_id}`}
            >
              <View style={[styles.careerIcon, { backgroundColor: c.color + "20" }]}>
                <Ionicons name={c.icon as any} size={20} color={c.color} />
              </View>
              <Text style={styles.careerName}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Workshops */}
        <View style={styles.sectionHeader}>
          <Text style={styles.section}>Upcoming Workshops</Text>
          <TouchableOpacity onPress={() => router.push("/community")}>
            <Text style={styles.viewAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          {events.slice(0, 2).map((e) => (
            <TouchableOpacity
              key={e.event_id}
              style={styles.workshopCard}
              activeOpacity={0.9}
              onPress={() => router.push(`/event/${e.event_id}` as any)}
              testID={`workshop-${e.event_id}`}
            >
              <Image source={{ uri: e.cover }} style={styles.workshopImg} />
              <View style={{ flex: 1, padding: 12 }}>
                <Text style={styles.workshopTitle} numberOfLines={2}>{e.title}</Text>
                <View style={styles.workshopMeta}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.workshopMetaText}>
                    {new Date(e.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} • {e.time}
                  </Text>
                </View>
                <View style={styles.workshopMeta}>
                  <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.workshopMetaText}>{e.attendees} registered</Text>
                </View>
              </View>
              <View style={styles.joinBtn}>
                <Text style={styles.joinTxt}>Join</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Student Journey */}
        <Text style={[styles.section, { marginTop: 32 }]}>Student Journey</Text>
        <Text style={styles.sectionSub}>Your growth. Your impact. Your legacy.</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 4 }}
        >
          {[
            { icon: "book", label: "Learn", color: colors.primary },
            { icon: "trophy", label: "Achieve", color: colors.gold },
            { icon: "person", label: "Mentor", color: colors.green },
            { icon: "share-social", label: "Share", color: colors.orange },
            { icon: "leaf", label: "Legacy", color: colors.purple },
          ].map((j) => (
            <View key={j.label} style={styles.journeyCard}>
              <View style={[styles.journeyIcon, { backgroundColor: j.color + "20" }]}>
                <Ionicons name={j.icon as any} size={22} color={j.color} />
              </View>
              <Text style={styles.journeyLabel}>{j.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Impact CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/legacy")}
          style={styles.impactCta}
          testID="home-view-legacy"
        >
          <LinearGradient colors={["#0A0F24", "#1E3A8A"]} style={styles.impactGrad}>
            <View style={{ flex: 1 }}>
              <Text style={styles.impactCaption}>YOUR LEGACY</Text>
              <Text style={styles.impactTitle}>See the impact you've made</Text>
              <Text style={styles.impactDesc}>Sessions mentored • Resources shared • Lives impacted</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={38} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greeting: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
  userName: { fontSize: 24, fontWeight: "700", color: colors.text, marginTop: 2 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
    position: "absolute",
    top: 10,
    right: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    marginHorizontal: 24,
    marginTop: 4,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.bg2,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: { color: colors.textMuted, fontSize: 15 },
  section: {
    ...font.h3,
    marginTop: 28,
    marginHorizontal: 24,
    marginBottom: 4,
  },
  sectionSub: {
    ...font.caption,
    marginHorizontal: 24,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 4,
    marginHorizontal: 24,
  },
  viewAll: { color: colors.primary, fontSize: 13, fontWeight: "600" },
  pillarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 12,
    gap: 12,
  },
  pillar: {
    width: "48%",
    borderRadius: radius.xxl,
    padding: 18,
    minHeight: 160,
    justifyContent: "space-between",
    ...shadow.soft,
  },
  pillarIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillarTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 12 },
  pillarDesc: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 6, lineHeight: 16 },
  mentorBanner: { marginHorizontal: 24, marginTop: 24, borderRadius: radius.xxl, overflow: "hidden", ...shadow.medium },
  bannerGrad: {
    padding: 20,
    minHeight: 130,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  bannerDesc: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4, lineHeight: 18 },
  bannerCta: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  bannerCtaText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  bannerIcon: { width: 70, alignItems: "center" },
  mentorCard: {
    width: 240,
    borderRadius: radius.xl,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.soft,
  },
  mentorImg: { width: "100%", height: 140 },
  mentorName: { fontSize: 15, fontWeight: "700", color: colors.text, flexShrink: 1 },
  mentorHeadline: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 16, minHeight: 32 },
  mentorStats: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  mentorStat: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },
  mentorStatSep: { color: colors.textMuted, fontSize: 10 },
  priceRow: { marginTop: 8 },
  price: { fontSize: 14, fontWeight: "700", color: colors.text },
  priceUnit: { fontSize: 11, color: colors.textSecondary, fontWeight: "500" },
  vaultCard: {
    width: 160,
    borderRadius: radius.lg,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  vaultCover: { width: "100%", height: 100 },
  vaultBody: { padding: 10 },
  vaultTitle: { fontSize: 13, fontWeight: "600", color: colors.text, minHeight: 34 },
  vaultAuthor: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  careerCard: {
    width: 96,
    height: 108,
    borderRadius: radius.lg,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  careerIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  careerName: { fontSize: 12, fontWeight: "600", color: colors.text, marginTop: 10, textAlign: "center" },
  workshopCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 12,
    alignItems: "center",
  },
  workshopImg: { width: 88, height: 88 },
  workshopTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  workshopMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  workshopMetaText: { fontSize: 12, color: colors.textSecondary },
  joinBtn: {
    marginRight: 12,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  joinTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  journeyCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: 90,
  },
  journeyIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  journeyLabel: { marginTop: 8, fontSize: 12, fontWeight: "600", color: colors.text },
  impactCta: {
    marginHorizontal: 24,
    marginTop: 28,
    borderRadius: radius.xxl,
    overflow: "hidden",
    ...shadow.medium,
  },
  impactGrad: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  impactCaption: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  impactTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 },
  impactDesc: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4 },
  thriveWidget: {
    marginHorizontal: 24,
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  thriveKicker: { fontSize: 10, fontWeight: "700", color: "#059669", letterSpacing: 1.2 },
  thriveTitle: { fontSize: 15, fontWeight: "700", color: "#065F46", marginTop: 6 },
  thriveEmojiRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  thriveEmoji: { fontSize: 26 },
});
