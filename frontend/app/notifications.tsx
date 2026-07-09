import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type Notif = {
  notif_id: string;
  kind: string;
  message: string;
  cover?: string;
  read: boolean;
  created_at: string;
};

const KIND_ICON: Record<string, any> = {
  welcome: "sparkles",
  tip: "bulb",
  vault: "library",
  event_rsvp: "calendar",
  mentor_application: "ribbon",
  booking: "checkmark-circle",
};

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Notif[]>("/notifications")
      .then((list) => { setItems(list); api.post("/notifications/read-all").catch(() => {}); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="notif-back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTxt}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.notif_id}
          contentContainerStyle={{ padding: 20, gap: 10 }}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.read && styles.cardUnread]} testID={`notif-${item.notif_id}`}>
              <View style={styles.iconBox}>
                <Ionicons name={KIND_ICON[item.kind] ?? "information-circle-outline"} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.msg}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.created_at).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { ...font.h4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyTxt: { color: colors.textSecondary, fontSize: 14 },
  card: { flexDirection: "row", gap: 12, alignItems: "flex-start", backgroundColor: "#fff", borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.border, ...shadow.soft },
  cardUnread: { backgroundColor: colors.primaryLight, borderColor: colors.primary + "40" },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  msg: { fontSize: 14, color: colors.text, lineHeight: 20 },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
