import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type Mentor = {
  mentor_id: string;
  name: string;
  price: number;
  available_slots: string[];
};

function buildNextDays(n: number) {
  const arr: { key: string; day: string; date: string; weekday: string }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    arr.push({
      key: d.toISOString().slice(0, 10),
      day: String(d.getDate()).padStart(2, "0"),
      date: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      weekday: dayNames[d.getDay()],
    });
  }
  return arr;
}

export default function BookSession() {
  const { mentorId } = useLocalSearchParams<{ mentorId: string }>();
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [date, setDate] = useState(buildNextDays(1)[0].key);
  const [time, setTime] = useState<string | null>(null);
  const [type, setType] = useState<"video" | "in-person">("video");
  const [busy, setBusy] = useState(false);

  const days = buildNextDays(14);

  useEffect(() => {
    if (!mentorId) return;
    api.get<Mentor>(`/mentors/${mentorId}`).then(setMentor).catch(() => {});
  }, [mentorId]);

  if (!mentor) {
    return (
      <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
    );
  }

  const platformFee = 29;
  const total = mentor.price + platformFee;

  const confirm = async () => {
    if (!time) return;
    setBusy(true);
    try {
      const b = await api.post("/bookings", {
        mentor_id: mentor.mentor_id,
        date,
        time,
        session_type: type,
      });
      router.replace({
        pathname: "/booking-success",
        params: {
          mentor: mentor.name,
          date,
          time,
          amount: String(total),
        },
      } as any);
    } catch (e) {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="book-back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Book a Session</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Text style={styles.mentorLine}>with <Text style={{ fontWeight: "700", color: colors.text }}>{mentor.name}</Text></Text>
        </View>

        {/* Date */}
        <Text style={styles.section}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {days.map((d) => {
            const active = d.key === date;
            return (
              <TouchableOpacity
                key={d.key}
                onPress={() => setDate(d.key)}
                activeOpacity={0.9}
                style={[styles.dateChip, active && styles.dateChipActive]}
                testID={`date-${d.key}`}
              >
                <Text style={[styles.dateWeek, active && { color: "rgba(255,255,255,0.8)" }]}>{d.weekday}</Text>
                <Text style={[styles.dateDay, active && { color: "#fff" }]}>{d.day}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time */}
        <Text style={styles.section}>Select Time</Text>
        <View style={styles.timeGrid}>
          {mentor.available_slots.map((t) => {
            const active = t === time;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.timeChip, active && styles.timeChipActive]}
                onPress={() => setTime(t)}
                activeOpacity={0.9}
                testID={`time-${t}`}
              >
                <Text style={[styles.timeTxt, active && { color: "#fff" }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Type */}
        <Text style={styles.section}>Session Type</Text>
        <View style={styles.typeRow}>
          {(["video", "in-person"] as const).map((tp) => {
            const active = type === tp;
            return (
              <TouchableOpacity
                key={tp}
                style={[styles.typeCard, active && styles.typeCardActive]}
                onPress={() => setType(tp)}
                activeOpacity={0.9}
                testID={`type-${tp}`}
              >
                <Ionicons
                  name={tp === "video" ? "videocam" : "location"}
                  size={18}
                  color={active ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.typeTxt, active && { color: colors.primary, fontWeight: "700" }]}>
                  {tp === "video" ? "Video Call" : "In-Person"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment summary */}
        <Text style={styles.section}>Payment Summary</Text>
        <View style={styles.summary}>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Session Fee</Text>
            <Text style={styles.sumValue}>₹{mentor.price}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Platform Fee</Text>
            <Text style={styles.sumValue}>₹{platformFee}</Text>
          </View>
          <View style={[styles.sumRow, styles.sumTotal]}>
            <Text style={styles.sumTotalLabel}>Total</Text>
            <Text style={styles.sumTotalValue}>₹{total}</Text>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="shield-checkmark" size={16} color={colors.green} />
          <Text style={styles.noticeTxt}>
            Free cancellation up to 24 hours before the session. Instant refund.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.stickyCta}>
        <TouchableOpacity
          style={[styles.confirmBtn, (!time || busy) && { opacity: 0.5 }]}
          disabled={!time || busy}
          onPress={confirm}
          activeOpacity={0.9}
          testID="confirm-booking"
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.confirmTxt}>Confirm Booking · ₹{total}</Text>
              <Ionicons name="lock-closed" size={14} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  topTitle: { ...font.h4 },
  mentorLine: { fontSize: 14, color: colors.textSecondary },
  section: { ...font.h4, marginHorizontal: 24, marginTop: 24, marginBottom: 12 },
  dateChip: {
    width: 60,
    height: 76,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flexShrink: 0,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateWeek: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },
  dateDay: { fontSize: 18, color: colors.text, fontWeight: "700" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 24 },
  timeChip: {
    paddingHorizontal: 18,
    height: 42,
    justifyContent: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  timeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeTxt: { fontSize: 13, fontWeight: "600", color: colors.text },
  typeRow: { flexDirection: "row", paddingHorizontal: 24, gap: 12 },
  typeCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  typeTxt: { fontSize: 14, fontWeight: "500", color: colors.textSecondary },
  summary: { marginHorizontal: 24, backgroundColor: colors.bg2, borderRadius: radius.lg, padding: 16 },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  sumLabel: { fontSize: 13, color: colors.textSecondary },
  sumValue: { fontSize: 13, color: colors.text, fontWeight: "600" },
  sumTotal: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 12 },
  sumTotalLabel: { fontSize: 14, fontWeight: "700", color: colors.text },
  sumTotalValue: { fontSize: 16, fontWeight: "700", color: colors.text },
  noticeCard: {
    marginHorizontal: 24,
    marginTop: 14,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.greenLight,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  noticeTxt: { flex: 1, fontSize: 12, color: colors.text, lineHeight: 18 },
  stickyCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.medium,
  },
  confirmBtn: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  confirmTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
