import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type VaultItem = {
  vault_id: string;
  title: string;
  collection: string;
  category: string;
  author: string;
  author_avatar: string;
  cover: string;
  downloads: number;
  rating: number;
  year: string;
  description: string;
  content?: string;
  pages?: number;
  duration_read?: string;
};

export default function VaultDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<VaultItem | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<VaultItem>(`/vault/${id}`).then(setItem).catch(() => {});
  }, [id]);

  const toggleBookmark = async () => {
    if (!id) return;
    try {
      const r = await api.post<{ bookmarked: boolean }>(`/vault/${id}/bookmark`);
      setBookmarked(r.bookmarked);
    } catch {}
  };

  if (!item) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <Image source={{ uri: item.cover }} style={styles.hero} />
            <View style={styles.heroOverlay} />
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="vault-detail-back">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleBookmark} style={[styles.backBtn, { right: 20, left: undefined }]} testID="vault-bookmark">
              <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.pillRow}>
              <View style={styles.chip}><Text style={styles.chipTxt}>{item.collection}</Text></View>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={11} color={colors.gold} />
                <Text style={styles.ratingTxt}>{item.rating.toFixed(1)}</Text>
              </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>

            <View style={styles.authorRow}>
              <Image source={{ uri: item.author_avatar }} style={styles.authorAvatar} />
              <View>
                <Text style={styles.authorLbl}>Author</Text>
                <Text style={styles.authorName}>{item.author}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={styles.metaGrp}>
                <Text style={styles.metaNum}>{item.pages ?? 0}</Text>
                <Text style={styles.metaLbl}>pages</Text>
              </View>
              <View style={styles.metaGrp}>
                <Text style={styles.metaNum}>{item.downloads.toLocaleString()}</Text>
                <Text style={styles.metaLbl}>downloads</Text>
              </View>
            </View>

            {item.content && (
              <>
                <Text style={styles.sectionTitle}>Read the Full Resource</Text>
                <View style={styles.paperWrap}>
                  <Text style={styles.paper} selectable>
                    {item.content}
                  </Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.stickyCta}>
          <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.9} testID="vault-download">
            <Ionicons name="download-outline" size={16} color="#fff" />
            <Text style={styles.downloadTxt}>Download PDF</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroWrap: { height: 220 },
  hero: { width: "100%", height: "100%" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  backBtn: {
    position: "absolute", left: 20, top: 12, width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },
  card: { marginTop: -30, marginHorizontal: 20, backgroundColor: "#fff", borderRadius: radius.xxl, padding: 20, ...shadow.medium },
  pillRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chip: { backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  chipTxt: { fontSize: 11, color: colors.primary, fontWeight: "700" },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.goldLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  ratingTxt: { fontSize: 12, fontWeight: "700", color: colors.gold },
  title: { ...font.h2, marginTop: 12 },
  desc: { ...font.body, color: colors.textSecondary, marginTop: 8 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  authorAvatar: { width: 40, height: 40, borderRadius: 20 },
  authorLbl: { fontSize: 10, color: colors.textSecondary, fontWeight: "700", letterSpacing: 1 },
  authorName: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 2 },
  metaGrp: { alignItems: "center", marginLeft: 16 },
  metaNum: { fontSize: 14, fontWeight: "700", color: colors.text },
  metaLbl: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { ...font.h4, marginTop: 24, marginBottom: 10 },
  paperWrap: { backgroundColor: colors.bg2, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: colors.border },
  paper: { fontSize: 14, lineHeight: 22, color: colors.text },
  stickyCta: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: colors.border, ...shadow.medium },
  downloadBtn: { height: 54, borderRadius: radius.pill, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  downloadTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
