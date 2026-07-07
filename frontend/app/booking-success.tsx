import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { colors, radius, font, shadow } from "@/src/theme";

export default function BookingSuccess() {
  const params = useLocalSearchParams<{
    mentor?: string;
    date?: string;
    time?: string;
    amount?: string;
  }>();
  const router = useRouter();

  const scale = useSharedValue(0);
  const fade = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.15, { duration: 350 }),
      withTiming(1, { duration: 250 }),
    );
    fade.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, [scale, fade]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bodyStyle = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ translateY: (1 - fade.value) * 12 }] }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Animated.View style={[styles.iconWrap, iconStyle]}>
          <LinearGradient colors={["#10B981", "#34D399"]} style={styles.iconGrad}>
            <Ionicons name="checkmark" size={54} color="#fff" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[{ alignItems: "center" }, bodyStyle]}>
          <Text style={styles.title}>Booking Confirmed!</Text>
          <Text style={styles.desc}>Your session is locked in. We've sent a confirmation to your email.</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Mentor</Text>
              <Text style={styles.rowValue}>{params.mentor}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>
                {params.date && new Date(String(params.date)).toLocaleDateString(undefined, {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Time</Text>
              <Text style={styles.rowValue}>{params.time}</Text>
            </View>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.rowLabel}>Amount</Text>
              <Text style={[styles.rowValue, { color: colors.green, fontWeight: "700" }]}>₹{params.amount} paid</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 20, gap: 10 }}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/(tabs)/bookings")}
          activeOpacity={0.9}
          testID="view-bookings-btn"
        >
          <Text style={styles.primaryTxt}>View My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryTxt}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  iconWrap: { marginBottom: 32 },
  iconGrad: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", ...shadow.medium },
  title: { ...font.h1, textAlign: "center" },
  desc: { ...font.body, color: colors.textSecondary, textAlign: "center", marginTop: 10, paddingHorizontal: 20 },
  card: {
    marginTop: 32,
    width: "100%",
    backgroundColor: colors.bg2,
    borderRadius: radius.xl,
    padding: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 13, color: colors.textSecondary },
  rowValue: { fontSize: 13, color: colors.text, fontWeight: "600" },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, height: 54, alignItems: "center", justifyContent: "center" },
  primaryTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: { height: 54, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  secondaryTxt: { color: colors.text, fontSize: 15, fontWeight: "600" },
});
