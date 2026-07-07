import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
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
  categories: string[];
};

type Category = { id: string; name: string; icon: string };

export default function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Category[]>([]);
  const [selected, setSelected] = useState("all");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Category[]>("/categories").then(setCats).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selected !== "all") params.set("category", selected);
    if (q) params.set("q", q);
    const qs = params.toString() ? `?${params.toString()}` : "";
    api
      .get<Mentor[]>(`/mentors${qs}`)
      .then(setMentors)
      .catch(() => setMentors([]))
      .finally(() => setLoading(false));
  }, [selected, q]);

  const chips = useMemo(
    () => [{ id: "all", name: "All", icon: "sparkles" }, ...cats],
    [cats],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.h1}>Discover</Text>
        <Text style={styles.h1Sub}>Learn from students who've done it.</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Search mentors, subjects…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={q}
          onChangeText={setQ}
          testID="search-input"
          returnKeyType="search"
        />
        {q.length > 0 && (
          <TouchableOpacity onPress={() => setQ("")} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chipRowContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {chips.map((c) => {
            const active = selected === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelected(c.id)}
                activeOpacity={0.9}
                style={[styles.chip, active && styles.chipActive]}
                testID={`category-chip-${c.id}`}
              >
                <Ionicons
                  name={c.icon as any}
                  size={13}
                  color={active ? "#fff" : colors.textSecondary}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : mentors.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={44} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No mentors found</Text>
          <Text style={styles.emptyDesc}>Try a different category or search.</Text>
        </View>
      ) : (
        <FlatList
          data={mentors}
          keyExtractor={(m) => m.mentor_id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 40 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item: m }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => router.push(`/mentor/${m.mentor_id}` as any)}
              testID={`search-mentor-${m.mentor_id}`}
            >
              <Image source={{ uri: m.avatar }} style={styles.cardAvatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.cardName} numberOfLines={1}>{m.name}</Text>
                  {m.verified && <Ionicons name="checkmark-circle" size={14} color={colors.green} />}
                </View>
                <Text style={styles.cardHeadline} numberOfLines={1}>{m.headline}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={12} color={colors.gold} />
                  <Text style={styles.meta}>{m.rating.toFixed(1)}</Text>
                  <Text style={styles.metaMuted}>({m.reviews_count})</Text>
                  <Text style={styles.dotSep}>•</Text>
                  <Text style={styles.meta}>{m.sessions} sessions</Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.price}>₹{m.price}<Text style={styles.priceUnit}> /session</Text></Text>
                  <View style={styles.bookBtn}>
                    <Text style={styles.bookTxt}>Book</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  h1: { ...font.h1 },
  h1Sub: { ...font.caption, marginTop: 4 },
  searchWrap: {
    marginHorizontal: 24,
    marginTop: 14,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.bg2,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, fontSize: 15, color: colors.text },
  chipRowContainer: { height: 56, justifyContent: "center" },
  chipRow: { paddingHorizontal: 20, gap: 8, alignItems: "center" },
  chip: {
    height: 36,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    backgroundColor: colors.bg2,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    ...shadow.soft,
  },
  cardAvatar: { width: 72, height: 88, borderRadius: radius.lg, backgroundColor: colors.bg2 },
  cardName: { fontSize: 15, fontWeight: "700", color: colors.text, flexShrink: 1 },
  cardHeadline: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  meta: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },
  metaMuted: { fontSize: 11, color: colors.textMuted },
  dotSep: { color: colors.textMuted, marginHorizontal: 2 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  price: { fontSize: 15, fontWeight: "700", color: colors.text },
  priceUnit: { fontSize: 11, color: colors.textSecondary, fontWeight: "500" },
  bookBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  bookTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 6 },
  emptyTitle: { ...font.h4, marginTop: 10 },
  emptyDesc: { ...font.caption, textAlign: "center" },
});
