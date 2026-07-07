import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type VaultItem = {
  vault_id: string;
  title: string;
  cover: string;
  author: string;
  author_avatar: string;
  downloads: number;
  rating: number;
  year: string;
  description: string;
};

type Collection = { title: string; items: VaultItem[] };

export default function Vault() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Collection[]>("/vault/collections")
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.overline}>The Legacy Vault</Text>
          <Text style={styles.h1}>Where knowledge lives forever</Text>
          <Text style={styles.h1Sub}>
            Winning presentations, speeches, essays, and notes contributed by past batches.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
          {collections.map((col) => (
            <View key={col.title} style={{ marginTop: 24 }}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowTitle}>{col.title}</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              >
                {col.items.map((v) => (
                  <TouchableOpacity
                    key={v.vault_id}
                    style={styles.card}
                    activeOpacity={0.9}
                    testID={`vault-item-${v.vault_id}`}
                  >
                    <Image source={{ uri: v.cover }} style={styles.cover} />
                    <View style={styles.overlay}>
                      <View style={styles.tag}>
                        <Ionicons name="star" size={10} color={colors.gold} />
                        <Text style={styles.tagTxt}>{v.rating.toFixed(1)}</Text>
                      </View>
                    </View>
                    <View style={styles.body}>
                      <Text style={styles.title} numberOfLines={2}>{v.title}</Text>
                      <View style={styles.authorRow}>
                        <Image source={{ uri: v.author_avatar }} style={styles.authorAvatar} />
                        <Text style={styles.author} numberOfLines={1}>{v.author}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="download-outline" size={11} color={colors.textMuted} />
                        <Text style={styles.meta}>{v.downloads.toLocaleString()}</Text>
                        <Text style={styles.metaSep}>•</Text>
                        <Text style={styles.meta}>{v.year}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  overline: { ...font.overline, color: colors.primary },
  h1: { ...font.h1, marginTop: 4 },
  h1Sub: { ...font.body, color: colors.textSecondary, marginTop: 6 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  rowTitle: { ...font.h4 },
  viewAll: { fontSize: 13, color: colors.primary, fontWeight: "600" },
  card: {
    width: 200,
    borderRadius: radius.xl,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.soft,
  },
  cover: { width: "100%", height: 130 },
  overlay: { position: "absolute", top: 10, right: 10 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tagTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
  body: { padding: 12 },
  title: { fontSize: 14, fontWeight: "700", color: colors.text, minHeight: 38 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  authorAvatar: { width: 20, height: 20, borderRadius: 10 },
  author: { fontSize: 12, color: colors.textSecondary, fontWeight: "500", flex: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  meta: { fontSize: 11, color: colors.textMuted },
  metaSep: { color: colors.textMuted },
});
