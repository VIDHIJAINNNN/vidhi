import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { api } from "@/src/lib/api";

const { width } = Dimensions.get("window");

type Mentor = {
  mentor_id: string;
  name: string;
  avatar: string;
  cover: string;
  headline: string;
  verified: boolean;
  achievements: string[];
  subjects: string[];
  bio: string;
  rating: number;
  reviews_count: number;
  sessions: number;
  price: number;
  grade_taught: string;
  years: number;
  languages: string[];
};

type Review = { user: string; avatar: string; rating: number; text: string };

export default function MentorProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Mentor>(`/mentors/${id}`),
      api.get<Review[]>(`/mentors/${id}/reviews`),
    ])
      .then(([m, r]) => {
        setMentor(m);
        setReviews(r);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !mentor) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero */}
        <View style={styles.heroWrap}>
          <Image source={{ uri: mentor.cover }} style={styles.hero} />
          <LinearGradient
            colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.55)"]}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} testID="mentor-back">
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.backBtn, { right: 20, left: undefined }]}>
            <Ionicons name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Image source={{ uri: mentor.avatar }} style={styles.avatar} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{mentor.name}</Text>
            {mentor.verified && (
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={12} color="#fff" />
                <Text style={styles.verifiedTxt}>Verified Mentor</Text>
              </View>
            )}
          </View>
          <Text style={styles.headline}>{mentor.headline}</Text>

          {/* Achievements */}
          <View style={styles.chipRow}>
            {mentor.achievements.map((a) => (
              <View key={a} style={styles.achievementChip}>
                <Ionicons name="trophy" size={11} color={colors.gold} />
                <Text style={styles.achievementTxt}>{a}</Text>
              </View>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={14} color={colors.gold} />
              <Text style={styles.statNum}>{mentor.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>({mentor.reviews_count})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{mentor.sessions}</Text>
              <Text style={styles.statLabel}>sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{mentor.years}y</Text>
              <Text style={styles.statLabel}>experience</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{mentor.bio}</Text>

          {/* Subjects */}
          <Text style={styles.sectionTitle}>Subjects</Text>
          <View style={styles.chipRow}>
            {mentor.subjects.map((s) => (
              <View key={s} style={styles.subjectChip}>
                <Text style={styles.subjectTxt}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingRight: 20 }}
              >
                {reviews.map((r, idx) => (
                  <View key={idx} style={styles.reviewCard}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewUser}>{r.user}</Text>
                        <View style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Ionicons
                              key={n}
                              name={n <= r.rating ? "star" : "star-outline"}
                              size={11}
                              color={colors.gold}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{r.text}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.stickyCta}>
        <View>
          <Text style={styles.priceBig}>₹{mentor.price}</Text>
          <Text style={styles.priceUnit}>per session</Text>
        </View>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push(`/book/${mentor.mentor_id}` as any)}
          activeOpacity={0.9}
          testID="book-session-btn"
        >
          <Text style={styles.bookTxt}>Book Session</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HERO_H = 280;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroWrap: { width, height: HERO_H },
  hero: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute",
    left: 20,
    top: 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginTop: -40,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: radius.xxl,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    ...shadow.medium,
  },
  avatar: {
    position: "absolute",
    top: -44,
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: "#fff",
    left: "50%",
    marginLeft: -48,
    backgroundColor: colors.bg2,
  },
  nameRow: { alignItems: "center", gap: 6 },
  name: { ...font.h2, textAlign: "center" },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.green,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  verifiedTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
  headline: { textAlign: "center", color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  achievementChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  achievementTxt: { fontSize: 11, color: colors.gold, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    marginTop: 18,
    backgroundColor: colors.bg2,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 },
  statNum: { fontSize: 15, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 11, color: colors.textSecondary },
  statDivider: { width: 1, height: 24, backgroundColor: colors.border },
  sectionTitle: { ...font.h4, marginTop: 20, marginBottom: 8 },
  bio: { ...font.body, color: colors.textSecondary },
  subjectChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  subjectTxt: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  reviewCard: {
    width: 260,
    backgroundColor: colors.bg2,
    padding: 14,
    borderRadius: radius.lg,
    gap: 10,
  },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16 },
  reviewUser: { fontSize: 13, fontWeight: "700", color: colors.text },
  reviewText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  stickyCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow.medium,
  },
  priceBig: { fontSize: 22, fontWeight: "700", color: colors.text },
  priceUnit: { fontSize: 11, color: colors.textSecondary },
  bookBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
