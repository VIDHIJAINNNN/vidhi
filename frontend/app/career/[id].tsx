import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

type Career = {
  career_id: string;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  top_colleges: string[];
  skills: string[];
  salary_range: string;
  roadmap: { stage: string; action: string }[];
  day_in_life: string;
};

type Msg = { id: string; role: "user" | "assistant"; text: string };

const TABS = ["Overview", "Roadmap", "AI Advisor"] as const;

export default function CareerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [career, setCareer] = useState<Career | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [chatting, setChatting] = useState(false);
  const chatRef = useRef<FlatList>(null);
  const sessionIdRef = useRef<string>(`chat_${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    if (!id) return;
    api.get<Career>(`/careers/${id}`).then(setCareer).catch(() => {});
  }, [id]);

  const send = async () => {
    if (!input.trim() || chatting || !career) return;
    const userMsg: Msg = { id: `u_${Date.now()}`, role: "user", text: input.trim() };
    const assistantId = `a_${Date.now()}`;
    setMessages((m) => [...m, userMsg, { id: assistantId, role: "assistant", text: "" }]);
    setInput("");
    setChatting(true);
    setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await api.streamCareerChat(
        {
          career_id: career.career_id,
          session_id: sessionIdRef.current,
          message: userMsg.text,
        },
        (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + delta } : m,
            ),
          );
          chatRef.current?.scrollToEnd({ animated: true });
        },
      );
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: m.text || `Sorry, something went wrong: ${e?.message ?? "network error"}` } : m,
        ),
      );
    } finally {
      setChatting(false);
    }
  };

  const suggested = [
    "What subjects should I take in Class 11?",
    "Top colleges in India?",
    "How much can I earn in this career?",
    "What competitions should I join?",
  ];

  if (!career) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="career-back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: career.color + "18" }]}>
        <View style={[styles.heroIcon, { backgroundColor: career.color + "30" }]}>
          <Ionicons name={career.icon as any} size={26} color={career.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.overline}>{career.tagline}</Text>
          <Text style={styles.heroTitle}>{career.name}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
            testID={`career-tab-${t}`}
          >
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "Overview" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <Text style={styles.section}>What does a {career.name.toLowerCase().replace(/s$/, "")} do?</Text>
          <Text style={styles.body}>{career.description}</Text>

          <Text style={styles.section}>Top Skills</Text>
          <View style={styles.pillRow}>
            {career.skills.map((s) => (
              <View key={s} style={styles.pill}>
                <Text style={styles.pillTxt}>{s}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Top Colleges</Text>
          {career.top_colleges.map((c) => (
            <View key={c} style={styles.rowItem}>
              <Ionicons name="school-outline" size={16} color={career.color} />
              <Text style={styles.rowItemTxt}>{c}</Text>
            </View>
          ))}

          <Text style={styles.section}>Salary Insights</Text>
          <View style={[styles.salaryCard, { backgroundColor: career.color + "10" }]}>
            <Ionicons name="trending-up" size={22} color={career.color} />
            <View>
              <Text style={styles.salaryLabel}>Expected range</Text>
              <Text style={styles.salaryValue}>{career.salary_range}</Text>
            </View>
          </View>

          <Text style={styles.section}>Day in the Life</Text>
          <Text style={styles.body}>{career.day_in_life}</Text>
        </ScrollView>
      )}

      {tab === "Roadmap" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 60 }}>
          {career.roadmap.map((r, i) => (
            <View key={r.stage} style={styles.stageRow}>
              <View style={styles.stageCol}>
                <View style={[styles.stageDot, { backgroundColor: career.color }]}>
                  <Text style={styles.stageDotTxt}>{i + 1}</Text>
                </View>
                {i < career.roadmap.length - 1 && <View style={[styles.stageLine, { backgroundColor: career.color + "40" }]} />}
              </View>
              <View style={styles.stageCard}>
                <Text style={styles.stageStage}>{r.stage}</Text>
                <Text style={styles.stageAction}>{r.action}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {tab === "AI Advisor" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={80}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.aiHeader}>
              <View style={[styles.aiAvatar, { backgroundColor: career.color + "20" }]}>
                <Ionicons name="sparkles" size={16} color={career.color} />
              </View>
              <View>
                <Text style={styles.aiName}>Career Compass AI</Text>
                <Text style={styles.aiStatus}>Personalized {career.name.toLowerCase()} advice</Text>
              </View>
            </View>

            <FlatList
              ref={chatRef}
              data={messages}
              keyExtractor={(m) => m.id}
              contentContainerStyle={{ padding: 20, gap: 12 }}
              ListEmptyComponent={
                <View style={{ padding: 16, gap: 16 }}>
                  <Text style={styles.body}>
                    Ask me anything about a career in {career.name}. I'll give you honest, practical advice.
                  </Text>
                  <View style={{ gap: 8 }}>
                    {suggested.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={styles.suggest}
                        onPress={() => setInput(s)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
                        <Text style={styles.suggestTxt}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bubble,
                    item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
                  ]}
                  testID={`chat-msg-${item.role}`}
                >
                  <Text style={item.role === "user" ? styles.bubbleUserTxt : styles.bubbleAiTxt}>
                    {item.text || (chatting ? "..." : "")}
                  </Text>
                </View>
              )}
              onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.composer}>
              <TextInput
                value={input}
                onChangeText={setInput}
                style={styles.composerInput}
                placeholder={`Ask about ${career.name.toLowerCase()}...`}
                placeholderTextColor={colors.textMuted}
                multiline
                testID="career-chat-input"
              />
              <TouchableOpacity
                style={[styles.sendBtn, (!input.trim() || chatting) && { opacity: 0.4 }]}
                onPress={send}
                disabled={!input.trim() || chatting}
                testID="career-chat-send"
              >
                {chatting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="arrow-up" size={18} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: { paddingHorizontal: 12, paddingTop: 4 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  hero: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  heroIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  overline: { ...font.caption },
  heroTitle: { ...font.h2, marginTop: 2 },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: colors.bg2,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  tabBtn: { flex: 1, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  tabActive: { backgroundColor: "#fff", ...shadow.soft },
  tabTxt: { fontSize: 13, color: colors.textSecondary, fontWeight: "600" },
  tabTxtActive: { color: colors.text },
  section: { ...font.h4, marginTop: 22, marginBottom: 8 },
  body: { ...font.body, color: colors.textSecondary },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.bg2 },
  pillTxt: { fontSize: 12, color: colors.text, fontWeight: "600" },
  rowItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  rowItemTxt: { fontSize: 14, color: colors.text },
  salaryCard: { borderRadius: radius.lg, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 },
  salaryLabel: { fontSize: 12, color: colors.textSecondary },
  salaryValue: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 2 },
  stageRow: { flexDirection: "row", alignItems: "stretch", gap: 14 },
  stageCol: { alignItems: "center" },
  stageDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stageDotTxt: { color: "#fff", fontSize: 12, fontWeight: "800" },
  stageLine: { width: 2, flex: 1, marginTop: 4 },
  stageCard: { flex: 1, marginBottom: 20, backgroundColor: colors.bg2, padding: 14, borderRadius: radius.lg },
  stageStage: { fontSize: 13, fontWeight: "700", color: colors.text },
  stageAction: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  aiAvatar: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  aiName: { fontSize: 14, fontWeight: "700", color: colors.text },
  aiStatus: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  suggest: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  suggestTxt: { fontSize: 13, color: colors.text, fontWeight: "500", flex: 1 },
  bubble: { maxWidth: "88%", padding: 12, borderRadius: 16 },
  bubbleUser: { backgroundColor: colors.primary, alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: colors.bg2, alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleUserTxt: { color: "#fff", fontSize: 14, lineHeight: 20 },
  bubbleAiTxt: { color: colors.text, fontSize: 14, lineHeight: 20 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 8,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: "#fff",
  },
  composerInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.bg2,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: colors.text,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
