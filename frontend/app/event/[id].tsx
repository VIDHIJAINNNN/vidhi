import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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
  long_description?: string;
  agenda?: string[];
  location?: string;
  price?: number;
};

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [ev, setEv] = useState<EventItem | null>(null);
  const [registered, setRegistered] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<EventItem>(`/community/events/${id}`).then(setEv).catch(() => {});
    api.get<string[]>("/community/my-rsvps")
      .then((list) => setRegistered(list.includes(String(id))))
      .catch(() => {});
  }, [id]);

  const toggleRsvp = async () => {
    if (!ev) return;
    setBusy(true);
    try {
      const r = await api.post<{ registered: boolean }>(`/community/events/${ev.event_id}/rsvp`);
      setRegistered(r.registered);
      // refresh event to update attendees count
      const fresh = await api.get<EventItem>(`/community/events/${ev.event_id}`);
      setEv(fresh);
    } finally {
      setBusy(false);
    }
  };

  if (!ev) return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={styles.heroWrap}>
            <Image source={{ uri: ev.cover }} style={styles.hero} />
            <View style={styles.heroOverlay} />
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="event-detail-back">
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.kindPill}><Text style={styles.kindTxt}>{ev.kind}</Text></View>
            <Text style={styles.title}>{ev.title}</Text>
            <Text style={styles.desc}>{ev.description}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoCell}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                <Text style={styles.infoNum}>{new Date(ev.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</Text>
                <Text style={styles.infoLbl}>Date</Text>
              </View>
              <View style={styles.infoCell}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={styles.infoNum}>{ev.time}</Text>
                <Text style={styles.infoLbl}>{ev.duration}</Text>
              </View>
              <View style={styles.infoCell}>
                <Ionicons name="people-outline" size={16} color={colors.primary} />
                <Text style={styles.infoNum}>{ev.attendees}</Text>
                <Text style={styles.infoLbl}>Attending</Text>
              </View>
            </View>

            <View style={styles.hostRow}>
              <Image source={{ uri: ev.host_avatar }} style={styles.hostAvatar} />
              <View>
                <Text style={styles.hostLbl}>Hosted by</Text>
                <Text style={styles.hostName}>{ev.host}</Text>
              </View>
            </View>

            {ev.location && (
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.locTxt}>{ev.location}</Text>
              </View>
            )}

            {ev.long_description && (
              <>
                <Text style={styles.sectionTitle}>About this event</Text>
                <Text style={styles.body}>{ev.long_description}</Text>
              </>
            )}

            {ev.agenda && ev.agenda.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Agenda</Text>
                {ev.agenda.map((a, i) => (
                  <View key={a} style={styles.agendaRow}>
                    <View style={styles.agendaDot}><Text style={styles.agendaDotTxt}>{i + 1}</Text></View>
                    <Text style={styles.agendaTxt}>{a}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.stickyCta}>
          <View>
            <Text style={styles.priceLbl}>{ev.price ? `₹${ev.price}` : "Free"}</Text>
            <Text style={styles.priceSub}>{registered ? "You're going!" : "Reserve your spot"}</Text>
          </View>
          <TouchableOpacity
            style={[styles.rsvpBtn, registered && { backgroundColor: colors.green }]}
            onPress={toggleRsvp}
            disabled={busy}
            activeOpacity={0.9}
            testID="event-rsvp-btn"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name={registered ? "checkmark-circle" : "sparkles"} size={16} color="#fff" />
                <Text style={styles.rsvpTxt}>{registered ? "Registered" : "Register"}</Text>
              </>
            )}
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
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  backBtn: { position: "absolute", left: 20, top: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  card: { marginTop: -30, marginHorizontal: 20, backgroundColor: "#fff", borderRadius: radius.xxl, padding: 20, ...shadow.medium },
  kindPill: { alignSelf: "flex-start", backgroundColor: colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  kindTxt: { fontSize: 10, color: colors.primary, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { ...font.h2, marginTop: 10 },
  desc: { ...font.body, color: colors.textSecondary, marginTop: 8 },
  infoGrid: { flexDirection: "row", marginTop: 18, backgroundColor: colors.bg2, borderRadius: radius.lg, padding: 14 },
  infoCell: { flex: 1, alignItems: "center", gap: 4 },
  infoNum: { fontSize: 13, fontWeight: "700", color: colors.text, marginTop: 2 },
  infoLbl: { fontSize: 10, color: colors.textSecondary },
  hostRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  hostAvatar: { width: 44, height: 44, borderRadius: 22 },
  hostLbl: { fontSize: 10, color: colors.textSecondary, fontWeight: "700", letterSpacing: 1 },
  hostName: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 2 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  locTxt: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { ...font.h4, marginTop: 22, marginBottom: 8 },
  body: { ...font.body, color: colors.textSecondary },
  agendaRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  agendaDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  agendaDotTxt: { color: colors.primary, fontWeight: "800", fontSize: 12 },
  agendaTxt: { fontSize: 14, color: colors.text, flex: 1 },
  stickyCta: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", ...shadow.medium },
  priceLbl: { fontSize: 20, fontWeight: "700", color: colors.text },
  priceSub: { fontSize: 11, color: colors.textSecondary },
  rsvpBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 24, paddingVertical: 14 },
  rsvpTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
