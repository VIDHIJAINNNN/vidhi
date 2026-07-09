import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, font, shadow } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";

const MOODS = [
  { id: "amazing", emoji: "😁", label: "Amazing", color: "#10B981" },
  { id: "good", emoji: "😊", label: "Good", color: "#34D399" },
  { id: "okay", emoji: "😐", label: "Okay", color: "#A78BFA" },
  { id: "stressed", emoji: "😟", label: "Stressed", color: "#F59E0B" },
  { id: "overwhelmed", emoji: "😞", label: "Overwhelmed", color: "#F97316" },
  { id: "burnt_out", emoji: "😴", label: "Burnt Out", color: "#EF4444" },
];

const CALM_RESOURCES = [
  { id: "breathe", emoji: "🫁", title: "2-Minute Breathing", bg: "#DBEAFE" },
  { id: "focus", emoji: "🎵", title: "Focus Music", bg: "#EDE9FE" },
  { id: "nature", emoji: "🌧️", title: "Nature Sounds", bg: "#DCFCE7" },
  { id: "pomodoro", emoji: "⏳", title: "Pomodoro Timer", bg: "#FFEDD5" },
  { id: "hydrate", emoji: "💧", title: "Hydration Reminder", bg: "#CFFAFE" },
  { id: "sleep", emoji: "😴", title: "Sleep Tips", bg: "#E0E7FF" },
];

const ENCOURAGEMENTS = [
  "🌸 You've got this!",
  "🌸 Best of luck!",
  "🌸 Keep believing in yourself.",
  "🌸 You're doing great.",
  "🌸 Take a break — you deserve it.",
];

const MOOD_MESSAGE: Record<string, string> = {
  amazing: "Keep up the great energy! Why not help a junior today?",
  good: "Lovely — a great day to review or start something new.",
  okay: "Steady wins. Try a 25-min focus block.",
  stressed: "Breathe. Here's a 2-min exercise + Study Planner to help.",
  overwhelmed: "Pause. Talk to a Peer Support Circle mentor. You're not alone.",
  burnt_out: "Rest is productive. Sleep tips + Reflection Journal are yours today.",
};

type Story = { id: string; title: string; author: string; avatar: string; badge: string; read_min: number; body: string };
type Group = { id: string; icon: string; name: string; members: number; status: string; next: string };
type Challenge = { id: string; icon: string; title: string; color: string; done: boolean };

export default function Thrive() {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.name?.split(" ")[0] ?? "Friend";

  const [mood, setMood] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const [journalOpen, setJournalOpen] = useState(false);
  const [jWent, setJWent] = useState("");
  const [jChal, setJChal] = useState("");
  const [jGrat, setJGrat] = useState("");
  const [jTom, setJTom] = useState("");
  const [savingJournal, setSavingJournal] = useState(false);
  const [encourageOpen, setEncourageOpen] = useState(false);
  const [encourageSent, setEncourageSent] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, g, c] = await Promise.all([
        api.get<Story[]>("/thrive/stories"),
        api.get<Group[]>("/thrive/groups"),
        api.get<Challenge[]>("/thrive/challenges"),
      ]);
      setStories(s); setGroups(g); setChallenges(c);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pickMood = async (id: string) => {
    setMood(id);
    try { await api.post("/thrive/mood", { mood: id }); } catch {}
  };

  const toggleChallenge = async (id: string) => {
    setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, done: !c.done } : c));
    try { await api.post("/thrive/challenges/complete", { challenge_id: id }); } catch {}
  };

  const saveJournal = async () => {
    setSavingJournal(true);
    try {
      await api.post("/thrive/journal", { went_well: jWent, challenged: jChal, grateful: jGrat, tomorrow: jTom });
      setJournalOpen(false); setJWent(""); setJChal(""); setJGrat(""); setJTom("");
    } finally { setSavingJournal(false); }
  };

  const sendEncouragement = async (m: string) => {
    try { await api.post("/thrive/encourage", { message: m }); } catch {}
    setEncourageSent(true);
    setTimeout(() => { setEncourageSent(false); setEncourageOpen(false); }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient colors={["#ECFDF5", "#F0FDF4", "#FFFFFF"]} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={{ fontSize: 26 }}>🌿</Text>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.title}>Thrive</Text>
              <Text style={styles.subtitle}>Your safe space to learn, breathe & grow</Text>
            </View>
          </View>
          <Text style={styles.greeting}>Good vibes, {firstName} ✨</Text>
        </LinearGradient>

        {/* Mood Check-in */}
        <View style={styles.section}>
          <Text style={styles.h3}>How are you feeling today?</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => {
              const active = mood === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.85}
                  onPress={() => pickMood(m.id)}
                  style={[styles.moodCard, active && { borderColor: m.color, backgroundColor: m.color + "18" }]}
                  testID={`mood-${m.id}`}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, active && { color: m.color, fontWeight: "700" }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {mood && (
            <View style={styles.moodMsg}>
              <Ionicons name="heart" size={14} color="#059669" />
              <Text style={styles.moodMsgTxt}>{MOOD_MESSAGE[mood]}</Text>
            </View>
          )}
        </View>

        {/* Peer Support Circle */}
        <View style={styles.section}>
          <View style={styles.rowHead}>
            <Text style={styles.h3}>🤝 Peer Support Circle</Text>
          </View>
          <View style={styles.supportCard}>
            <Text style={styles.supportDesc}>
              Connect with verified senior students who have faced similar academic challenges.
            </Text>
            <View style={styles.tagRow}>
              {["Exam Stress", "Time Management", "Boards", "CUET", "IPMAT", "Fear of Failure"].map((t) => (
                <View key={t} style={styles.tag}><Text style={styles.tagTxt}>{t}</Text></View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.mentorBtn}
              onPress={() => router.push("/(tabs)/search")}
              testID="thrive-find-mentor"
            >
              <Text style={styles.mentorBtnTxt}>Find a Mentor</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Study Buddy Groups */}
        <View style={styles.section}>
          <Text style={styles.h3}>👥 Study Buddy Groups</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 6 }}>
            {groups.map((g) => (
              <View key={g.id} style={styles.groupCard} testID={`group-${g.id}`}>
                <Text style={{ fontSize: 26 }}>{g.icon}</Text>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupMeta}>{g.members.toLocaleString()} members</Text>
                <View style={styles.liveTag}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTxt}>{g.status}</Text>
                </View>
                <Text style={styles.nextTxt}>Next: {g.next}</Text>
                <TouchableOpacity style={styles.joinGroupBtn}>
                  <Text style={styles.joinGroupTxt}>Join</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Calm Corner */}
        <View style={styles.section}>
          <Text style={styles.h3}>🌬️ Calm Corner</Text>
          <View style={styles.calmGrid}>
            {CALM_RESOURCES.map((c) => (
              <TouchableOpacity key={c.id} activeOpacity={0.9} style={[styles.calmCard, { backgroundColor: c.bg }]} testID={`calm-${c.id}`}>
                <Text style={{ fontSize: 30 }}>{c.emoji}</Text>
                <Text style={styles.calmTitle}>{c.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* I've Been There */}
        <View style={styles.section}>
          <View style={styles.rowHead}>
            <Text style={styles.h3}>📖 I've Been There</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingTop: 4 }}>
            {stories.map((s) => (
              <TouchableOpacity key={s.id} style={styles.storyCard} activeOpacity={0.9} testID={`story-${s.id}`}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Image source={{ uri: s.avatar }} style={styles.storyAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storyAuthor}>{s.author}</Text>
                    <View style={styles.badgePill}><Text style={styles.badgeTxt}>{s.badge}</Text></View>
                  </View>
                </View>
                <Text style={styles.storyTitle} numberOfLines={2}>{s.title}</Text>
                <Text style={styles.storyBody} numberOfLines={3}>{s.body}</Text>
                <View style={styles.readRow}>
                  <Text style={styles.readTxt}>Read Story</Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.primary} />
                  <View style={{ flex: 1 }} />
                  <Text style={styles.readTime}>{s.read_min} min read</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reflection Journal */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.journalCard}
            onPress={() => setJournalOpen(true)}
            activeOpacity={0.9}
            testID="thrive-open-journal"
          >
            <View style={styles.journalIcon}><Text style={{ fontSize: 22 }}>📝</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.journalTitle}>Reflection Journal</Text>
              <Text style={styles.journalDesc}>4 quick prompts. Private & yours.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Wellness Challenges */}
        <View style={styles.section}>
          <Text style={styles.h3}>🌈 Today's Wellness Challenges</Text>
          <View style={{ gap: 10 }}>
            {challenges.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.challengeCard, c.done && styles.challengeDone]}
                onPress={() => toggleChallenge(c.id)}
                activeOpacity={0.85}
                testID={`challenge-${c.id}`}
              >
                <View style={[styles.challengeIcon, { backgroundColor: c.color + "20" }]}>
                  <Ionicons name={c.icon as any} size={18} color={c.color} />
                </View>
                <Text style={[styles.challengeTitle, c.done && { textDecorationLine: "line-through", color: colors.textMuted }]}>{c.title}</Text>
                {c.done ? (
                  <Ionicons name="checkmark-circle" size={22} color={colors.green} />
                ) : (
                  <View style={styles.emptyCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Kindness */}
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setEncourageOpen(true)}
            testID="thrive-open-encouragement"
          >
            <LinearGradient colors={["#FDF2F8", "#FCE7F3"]} style={styles.kindnessCard}>
              <Text style={{ fontSize: 30 }}>🫂</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.kindTitle}>Check on a friend</Text>
                <Text style={styles.kindDesc}>Send someone a little encouragement today.</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Help note */}
        <View style={styles.helpCard}>
          <Ionicons name="information-circle" size={16} color={colors.textSecondary} />
          <Text style={styles.helpTxt}>
            Thrive provides peer support and wellness resources. It is not a replacement for professional mental health care.
          </Text>
        </View>
      </ScrollView>

      {/* Journal Modal */}
      <Modal visible={journalOpen} animationType="slide" onRequestClose={() => setJournalOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
          <View style={styles.modalTop}>
            <TouchableOpacity onPress={() => setJournalOpen(false)} testID="journal-close">
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Reflection Journal</Text>
            <View style={{ width: 24 }} />
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={60}>
            <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
              {[
                { l: "What went well today?", v: jWent, s: setJWent, testID: "j-went" },
                { l: "What challenged you today?", v: jChal, s: setJChal, testID: "j-chal" },
                { l: "What are you grateful for?", v: jGrat, s: setJGrat, testID: "j-grat" },
                { l: "My goal for tomorrow", v: jTom, s: setJTom, testID: "j-tom" },
              ].map((p) => (
                <View key={p.l} style={{ marginBottom: 16 }}>
                  <Text style={styles.jLabel}>{p.l}</Text>
                  <TextInput
                    style={styles.jInput}
                    value={p.v}
                    onChangeText={p.s}
                    multiline
                    placeholder="Write freely…"
                    placeholderTextColor={colors.textMuted}
                    testID={p.testID}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.saveJournal}
                onPress={saveJournal}
                disabled={savingJournal}
                testID="journal-save"
              >
                {savingJournal ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveJournalTxt}>Save Journal</Text>}
              </TouchableOpacity>
              <Text style={styles.jPrivate}>🔒 Only you can see these entries.</Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Encouragement Modal */}
      <Modal visible={encourageOpen} animationType="slide" transparent onRequestClose={() => setEncourageOpen(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Send a little encouragement</Text>
            <Text style={styles.sheetDesc}>Choose a message — sent anonymously to the LEGACY community.</Text>
            {encourageSent ? (
              <View style={{ alignItems: "center", padding: 24 }}>
                <Ionicons name="heart" size={40} color={colors.green} />
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 10 }}>Sent with love ✨</Text>
              </View>
            ) : (
              <View style={{ gap: 8, marginTop: 8 }}>
                {ENCOURAGEMENTS.map((m) => (
                  <TouchableOpacity key={m} style={styles.encBtn} onPress={() => sendEncouragement(m)} testID={`enc-${m.slice(0, 6)}`}>
                    <Text style={styles.encTxt}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 32, fontWeight: "800", color: "#065F46", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: "#065F46", marginTop: 2, opacity: 0.75 },
  greeting: { fontSize: 15, color: "#065F46", fontWeight: "600", marginTop: 14 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  h3: { ...font.h4 },
  moodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  moodCard: { width: "31%", aspectRatio: 1, borderRadius: radius.lg, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", gap: 4 },
  moodEmoji: { fontSize: 32 },
  moodLabel: { fontSize: 11, color: colors.text, fontWeight: "500" },
  moodMsg: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, padding: 12, borderRadius: radius.lg, backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0" },
  moodMsgTxt: { flex: 1, fontSize: 13, color: "#065F46" },
  supportCard: { marginTop: 10, padding: 16, borderRadius: radius.xl, backgroundColor: "#F5F3FF", borderWidth: 1, borderColor: "#DDD6FE" },
  supportDesc: { fontSize: 13, color: colors.text, lineHeight: 18 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: "#fff" },
  tagTxt: { fontSize: 11, color: "#6D28D9", fontWeight: "600" },
  mentorBtn: { marginTop: 14, backgroundColor: "#7C3AED", borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 10, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6 },
  mentorBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  rowHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  groupCard: { width: 200, borderRadius: radius.xl, backgroundColor: "#fff", padding: 14, borderWidth: 1, borderColor: colors.border, gap: 4, ...shadow.soft },
  groupName: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 6 },
  groupMeta: { fontSize: 11, color: colors.textSecondary },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: "flex-start", marginTop: 6 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#F59E0B" },
  liveTxt: { fontSize: 10, color: "#B45309", fontWeight: "700" },
  nextTxt: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  joinGroupBtn: { marginTop: 10, backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: 8, alignItems: "center" },
  joinGroupTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  calmGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  calmCard: { width: "31%", aspectRatio: 1, borderRadius: radius.lg, alignItems: "center", justifyContent: "center", padding: 10, gap: 6 },
  calmTitle: { fontSize: 11, fontWeight: "600", textAlign: "center", color: colors.text },
  storyCard: { width: 260, borderRadius: radius.xl, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8, ...shadow.soft },
  storyAvatar: { width: 34, height: 34, borderRadius: 17 },
  storyAuthor: { fontSize: 12, fontWeight: "700", color: colors.text },
  badgePill: { backgroundColor: colors.goldLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill, alignSelf: "flex-start", marginTop: 2 },
  badgeTxt: { fontSize: 9, fontWeight: "800", color: colors.gold, letterSpacing: 0.4 },
  storyTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 4 },
  storyBody: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  readRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  readTxt: { fontSize: 11, color: colors.primary, fontWeight: "700" },
  readTime: { fontSize: 10, color: colors.textMuted },
  journalCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: "#FEF9C3", borderRadius: radius.xl, borderWidth: 1, borderColor: "#FDE68A" },
  journalIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  journalTitle: { fontSize: 15, fontWeight: "700", color: "#78350F" },
  journalDesc: { fontSize: 12, color: "#92400E", marginTop: 2 },
  challengeCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  challengeDone: { backgroundColor: colors.greenLight, borderColor: "#A7F3D0" },
  challengeIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  challengeTitle: { flex: 1, fontSize: 13, color: colors.text, fontWeight: "500" },
  emptyCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border },
  kindnessCard: { padding: 16, borderRadius: radius.xl, flexDirection: "row", alignItems: "center", gap: 14 },
  kindTitle: { fontSize: 15, fontWeight: "700", color: "#9F1239" },
  kindDesc: { fontSize: 12, color: "#BE185D", marginTop: 2 },
  helpCard: { marginTop: 20, marginHorizontal: 20, flexDirection: "row", gap: 8, padding: 12, backgroundColor: colors.bg2, borderRadius: radius.lg, alignItems: "flex-start" },
  helpTxt: { flex: 1, fontSize: 11, color: colors.textSecondary, lineHeight: 16 },
  modalTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalTitle: { ...font.h4 },
  jLabel: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 8 },
  jInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 12, minHeight: 80, textAlignVertical: "top", fontSize: 14, color: colors.text, backgroundColor: "#fff" },
  saveJournal: { marginTop: 10, height: 54, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  saveJournalTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  jPrivate: { textAlign: "center", fontSize: 11, color: colors.textMuted, marginTop: 12 },
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36 },
  sheetHandle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 14 },
  sheetTitle: { ...font.h3 },
  sheetDesc: { ...font.caption, marginTop: 4 },
  encBtn: { padding: 14, backgroundColor: "#FDF2F8", borderRadius: radius.lg, borderWidth: 1, borderColor: "#FBCFE8" },
  encTxt: { fontSize: 14, color: "#9F1239", fontWeight: "500" },
});
