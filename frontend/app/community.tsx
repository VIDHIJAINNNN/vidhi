import { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type EventItem = {
  event_id: string;
  title: string;
  kind: string;
  cover: string;
  host: string;
  host_avatar: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  description: string;
};

const FILTERS = [
  { id: "all", name: "All", icon: "sparkles" },
  { id: "workshops", name: "Workshops", icon: "easel" },
  { id: "hackathons", name: "Hackathons", icon: "code-slash" },
  { id: "competitions", name: "Competitions", icon: "trophy" },
  { id: "discussions", name: "Discussions", icon: "chatbubbles" },
] as const;

export default function Community() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = filter === "all" ? "" : `?kind=${filter}`;
    api.get<EventItem[]>(`/community/events${q}`)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.overline}>Community</Text>
        <Text style={styles.h1}>Learn together. Win together.</Text>
        <Text style={styles.h1Sub}>Workshops, hackathons, and student clubs curated for you.</Text>
      </View>

      <View style={styles.chipRowContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id)}
                activeOpacity={0.9}
                style={[styles.chip, active && styles.chipActive]}
                testID={`community-filter-${f.id}`}
              >
                <Ionicons name={f.icon as any} size={13} color={active ? "#fff" : colors.textSecondary} />
                <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{f.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60, gap: 14 }} showsVerticalScrollIndicator={false}>
          {events.map((e) => (
            <TouchableOpacity
              key={e.event_id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/event/${e.event_id}` as any)}
              testID={`event-${e.event_id}`}
            >
              <Image source={{ uri: e.cover }} style={styles.cover} />
              <View style={styles.body}>
                <View style={styles.kindPill}>
                  <Text style={styles.kindTxt}>{e.kind}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>{e.title}</Text>
                <Text style={styles.desc} numberOfLines={2}>{e.description}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.meta}>{new Date(e.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.meta}>{e.time}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
                    <Text style={styles.meta}>{e.attendees}</Text>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <View style={styles.hostRow}>
                    <Image source={{ uri: e.host_avatar }} style={styles.hostAvatar} />
                    <Text style={styles.hostTxt}>Hosted by <Text style={{ fontWeight: "700", color: colors.text }}>{e.host}</Text></Text>
                  </View>
                  <View style={styles.joinBtn}>
                    <Text style={styles.joinTxt}>Register</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 12, paddingTop: 4 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  header: { paddingHorizontal: 24 },
  overline: { ...font.overline, color: colors.primary },
  h1: { ...font.h1, marginTop: 4 },
  h1Sub: { ...font.caption, marginTop: 6 },
  chipRowContainer: { height: 56, justifyContent: "center", marginTop: 4 },
  chipRow: { paddingHorizontal: 20, gap: 8, alignItems: "center" },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTxtActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  cover: { width: "100%", height: 140 },
  body: { padding: 16 },
  kindPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  kindTxt: { fontSize: 10, color: colors.primary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { ...font.h4 },
  desc: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  metaRow: { flexDirection: "row", gap: 14, marginTop: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 12, color: colors.textSecondary },
  footerRow: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  hostAvatar: { width: 24, height: 24, borderRadius: 12 },
  hostTxt: { fontSize: 12, color: colors.textSecondary, flex: 1 },
  joinBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  joinTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
