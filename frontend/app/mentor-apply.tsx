import { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";
import { useAuth } from "@/src/context/AuthContext";

const SUBJECT_OPTIONS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Business Studies", "Economics", "Accountancy", "Computer Science",
  "Public Speaking", "MUN", "Debate", "Design", "Music", "Sports",
  "Photography", "Content Creation", "Entrepreneurship",
];

export default function MentorApply() {
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [grade, setGrade] = useState("Class 12");
  const [school, setSchool] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [achievements, setAchievements] = useState("");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("299");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (s: string) => {
    setSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const submit = async () => {
    if (!fullName || !school || subjects.length === 0 || !bio || !achievements) return;
    setSubmitting(true);
    try {
      await api.post("/mentor-applications", {
        full_name: fullName,
        grade,
        school,
        subjects,
        achievements,
        bio,
        hourly_rate: Number(rate) || 299,
      });
      setDone(true);
    } catch {
      // error - keep on form
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={44} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successDesc}>
            Our team will review your application within 48 hours and email you at{" "}
            <Text style={{ fontWeight: "700", color: colors.text }}>{user?.email}</Text>.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.replace("/(tabs)")}
            testID="apply-done-btn"
          >
            <Text style={styles.doneBtnTxt}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = fullName && school && subjects.length > 0 && bio.length > 30 && achievements.length > 10;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="apply-back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Mentor Application</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.section}>Basics</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your name" placeholderTextColor={colors.textMuted} testID="apply-name" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.chipRow}>
              {["Class 10", "Class 11", "Class 12", "College"].map((g) => (
                <TouchableOpacity key={g} onPress={() => setGrade(g)} style={[styles.chip, grade === g && styles.chipActive]}>
                  <Text style={[styles.chipTxt, grade === g && styles.chipTxtActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>School / College</Text>
            <TextInput style={styles.input} value={school} onChangeText={setSchool} placeholder="Delhi Public School" placeholderTextColor={colors.textMuted} testID="apply-school" />
          </View>

          <Text style={styles.section}>What can you teach?</Text>
          <Text style={styles.hint}>Select all that apply.</Text>
          <View style={styles.chipRow}>
            {SUBJECT_OPTIONS.map((s) => {
              const active = subjects.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => toggle(s)}
                  style={[styles.chip, active && styles.chipActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.section}>Your Story</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Achievements</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={achievements}
              onChangeText={setAchievements}
              placeholder="e.g. IMO Silver, IIT AIR 89, National Debate Winner"
              placeholderTextColor={colors.textMuted}
              multiline
              testID="apply-achievements"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.multilineTall]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell juniors why they should learn from you. What makes your teaching style unique?"
              placeholderTextColor={colors.textMuted}
              multiline
              testID="apply-bio"
            />
            <Text style={styles.counter}>{bio.length} / 400</Text>
          </View>

          <Text style={styles.section}>Pricing</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Your rate per session (₹)</Text>
            <TextInput
              style={styles.input}
              value={rate}
              onChangeText={(t) => setRate(t.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              testID="apply-rate"
            />
            <Text style={styles.hint}>Most peer mentors charge ₹199–₹499. You can change this anytime.</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, (!canSubmit || submitting) && { opacity: 0.5 }]}
            disabled={!canSubmit || submitting}
            onPress={submit}
            activeOpacity={0.9}
            testID="apply-submit-btn"
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitTxt}>Submit Application</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  topTitle: { ...font.h4 },
  section: { ...font.h4, marginTop: 20, marginBottom: 10 },
  hint: { fontSize: 12, color: colors.textSecondary, marginBottom: 10 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.text, backgroundColor: "#fff" },
  multiline: { minHeight: 60, textAlignVertical: "top" },
  multilineTall: { minHeight: 100, textAlignVertical: "top" },
  counter: { alignSelf: "flex-end", fontSize: 11, color: colors.textMuted, marginTop: 4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg2 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontSize: 12, color: colors.text, fontWeight: "500" },
  chipTxtActive: { color: "#fff", fontWeight: "700" },
  submitBtn: { marginTop: 20, height: 56, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, ...shadow.soft },
  submitTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  successWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", ...shadow.medium },
  successTitle: { ...font.h1, textAlign: "center", marginTop: 20 },
  successDesc: { ...font.body, color: colors.textSecondary, textAlign: "center", marginTop: 6 },
  doneBtn: { marginTop: 20, height: 54, paddingHorizontal: 40, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  doneBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
