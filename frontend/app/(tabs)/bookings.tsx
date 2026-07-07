import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type Booking = {
  booking_id: string;
  mentor_id: string;
  mentor_name: string;
  mentor_avatar: string;
  date: string;
  time: string;
  session_type: string;
  amount: number;
  status: string;
};

export default function Bookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const b = await api.get<Booking[]>("/bookings");
      setBookings(b);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.h1}>My Bookings</Text>
        <Text style={styles.h1Sub}>Your upcoming and past sessions.</Text>
      </View>

      {!loading && bookings.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={38} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyDesc}>Book a session with a verified mentor to get started.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/(tabs)/search")} testID="find-mentor-cta">
            <Text style={styles.emptyBtnTxt}>Find a Mentor</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.booking_id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item: b }) => (
            <View style={styles.card} testID={`booking-${b.booking_id}`}>
              <Image source={{ uri: b.mentor_avatar }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.name}>{b.mentor_name}</Text>
                  <View style={styles.statusPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusTxt}>{b.status}</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                  <Text style={styles.meta}>{new Date(b.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })} • {b.time}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name={b.session_type === "video" ? "videocam-outline" : "location-outline"} size={12} color={colors.textSecondary} />
                  <Text style={styles.meta}>{b.session_type === "video" ? "Video call" : "In-person"}</Text>
                </View>
                <View style={styles.bottomRow}>
                  <Text style={styles.amount}>₹{b.amount}</Text>
                  <TouchableOpacity style={styles.joinBtn}>
                    <Ionicons name="videocam" size={14} color="#fff" />
                    <Text style={styles.joinTxt}>Join</Text>
                  </TouchableOpacity>
                </View>
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
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  h1: { ...font.h1 },
  h1Sub: { ...font.caption, marginTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 10 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  emptyTitle: { ...font.h3, marginTop: 12 },
  emptyDesc: { ...font.caption, textAlign: "center" },
  emptyBtn: { marginTop: 12, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnTxt: { color: "#fff", fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", gap: 12, ...shadow.soft },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  name: { fontSize: 15, fontWeight: "700", color: colors.text },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.greenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  statusTxt: { fontSize: 10, fontWeight: "700", color: colors.green, textTransform: "capitalize" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  meta: { fontSize: 12, color: colors.textSecondary },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  amount: { fontSize: 15, fontWeight: "700", color: colors.text },
  joinBtn: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
  joinTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
