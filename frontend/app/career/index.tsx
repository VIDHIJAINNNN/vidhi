import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type Career = { career_id: string; name: string; icon: string; color: string; tagline: string };

export default function CareerList() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Career[]>("/careers")
      .then(setCareers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={styles.overline}>Career Compass</Text>
          <Text style={styles.h1}>Your Career Journey Starts Here.</Text>
          <Text style={styles.h1Sub}>Explore real career paths from seniors — with roadmaps, colleges, skills, and a dedicated AI advisor.</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {careers.map((c) => (
              <TouchableOpacity
                key={c.career_id}
                style={[styles.card, { borderLeftColor: c.color }]}
                activeOpacity={0.9}
                onPress={() => router.push(`/career/${c.career_id}` as any)}
                testID={`career-tile-${c.career_id}`}
              >
                <View style={[styles.iconBox, { backgroundColor: c.color + "20" }]}>
                  <Ionicons name={c.icon as any} size={22} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{c.name}</Text>
                  <Text style={styles.cardTag} numberOfLines={1}>{c.tagline}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 12, paddingTop: 4 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  header: { paddingHorizontal: 24, paddingTop: 8 },
  overline: { ...font.overline, color: colors.primary },
  h1: { ...font.h1, marginTop: 4 },
  h1Sub: { ...font.body, color: colors.textSecondary, marginTop: 8 },
  grid: { paddingHorizontal: 20, marginTop: 24, gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow.soft,
  },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  cardTag: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
