import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, font, shadow } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";

const MENU = [
  { icon: "calendar-outline", label: "My Bookings", route: "/(tabs)/bookings" },
  { icon: "school-outline", label: "My Mentorships", route: "/(tabs)/bookings" },
  { icon: "bookmark-outline", label: "Saved Resources", route: "/(tabs)/vault" },
  { icon: "library-outline", label: "Legacy Vault", route: "/(tabs)/vault" },
  { icon: "compass-outline", label: "Career Compass", route: "/career" },
  { icon: "ribbon-outline", label: "Become a Mentor", route: "/become-mentor" },
  { icon: "trophy-outline", label: "Achievements", route: "/legacy" },
  { icon: "settings-outline", label: "Settings", route: null },
  { icon: "help-circle-outline", label: "Help & Support", route: null },
] as const;

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const doSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.header}>
          {user?.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{(user?.name ?? "L")[0]}</Text>
            </View>
          )}
          <Text style={styles.name} testID="profile-username">{user?.name ?? "Guest"}</Text>
          <Text style={styles.subline}>{user?.grade ?? "Class 11"} • {user?.school ?? "LEGACY Academy"}</Text>
          <TouchableOpacity style={styles.editBtn} testID="edit-profile-btn">
            <Text style={styles.editTxt}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>48</Text>
            <Text style={styles.statLabel}>Resources</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>156</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Impact Card */}
        <TouchableOpacity
          style={styles.impactCard}
          activeOpacity={0.9}
          onPress={() => router.push("/legacy")}
          testID="profile-legacy-card"
        >
          <View style={styles.impactIcon}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactTitle}>Your Legacy So Far</Text>
            <Text style={styles.impactDesc}>See the impact you've made this year</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => item.route && router.push(item.route as any)}
              testID={`menu-${item.label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon as any} size={20} color={colors.text} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={doSignOut} testID="sign-out-btn">
          <Ionicons name="log-out-outline" size={18} color={colors.red} />
          <Text style={styles.signOutTxt}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>LEGACY v1.0 • Knowledge Never Graduates.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: "center", paddingTop: 20, paddingHorizontal: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 36, fontWeight: "700", color: "#fff" },
  name: { ...font.h2, marginTop: 14 },
  subline: { ...font.caption, marginTop: 2 },
  editBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editTxt: { fontSize: 13, fontWeight: "600", color: colors.text },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    paddingVertical: 18,
    alignItems: "center",
  },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border },
  impactCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + "30",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  impactIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  impactTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  impactDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  menu: { marginHorizontal: 24, marginTop: 24, backgroundColor: "#fff", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  menuIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.bg2, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.text },
  signOut: { marginTop: 24, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
  signOutTxt: { color: colors.red, fontWeight: "600", fontSize: 14 },
  footer: { textAlign: "center", fontSize: 11, color: colors.textMuted, marginTop: 20 },
});
