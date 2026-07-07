import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Linking as RNLinking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { colors, radius, font, shadow } from "@/src/theme";
import { useAuth } from "@/src/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { user, signInAsGuest, processGoogleSessionToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.replace("/(tabs)");
  }, [user, router]);

  const handleGoogle = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const redirectUrl =
        Platform.OS === "web"
          ? (typeof window !== "undefined" ? window.location.origin + "/" : "")
          : Linking.createURL("auth");
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === "web") {
        if (typeof window !== "undefined") window.location.href = authUrl;
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      if (result.type !== "success" || !result.url) {
        setBusy(false);
        return;
      }
      // Parse session_id from URL (hash or query)
      const url = result.url;
      const match =
        url.match(/[#?&]session_id=([^&]+)/) ||
        url.match(/[#?]session_id=([^&]+)/);
      const sessionId = match ? decodeURIComponent(match[1]) : null;
      if (!sessionId) {
        setError("Google sign-in failed. Please try again.");
        setBusy(false);
        return;
      }
      await processGoogleSessionToken(sessionId);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message ?? "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }, [processGoogleSessionToken, router]);

  const handleGuest = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInAsGuest();
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message ?? "Guest sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🌳</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.h1}>Welcome back</Text>
        <Text style={styles.h1Sub}>Sign in to continue your journey with LEGACY.</Text>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogle}
          activeOpacity={0.9}
          disabled={busy}
          testID="google-signin-btn"
        >
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.googleTxt}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.appleBtn}
          activeOpacity={0.9}
          disabled={busy}
          onPress={handleGoogle}
          testID="apple-signin-btn"
        >
          <Ionicons name="logo-apple" size={20} color="#fff" />
          <Text style={styles.appleTxt}>Continue with Apple</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity
          style={styles.guestBtn}
          onPress={handleGuest}
          disabled={busy}
          activeOpacity={0.9}
          testID="guest-signin-btn"
        >
          {busy ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color={colors.primary} />
              <Text style={styles.guestTxt}>Try Demo (Vidhi Sharma)</Text>
            </>
          )}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to LEGACY's Terms & Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: "center", paddingTop: 40 },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 34 },
  body: { flex: 1, paddingHorizontal: 32, paddingTop: 40 },
  h1: { ...font.h1, textAlign: "center" },
  h1Sub: {
    ...font.body,
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 32,
  },
  googleBtn: {
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    ...shadow.soft,
    marginBottom: 12,
  },
  googleTxt: { fontSize: 16, fontWeight: "600", color: colors.text },
  appleBtn: {
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  appleTxt: { fontSize: 16, fontWeight: "600", color: "#fff" },
  divider: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { paddingHorizontal: 14, color: colors.textSecondary, fontSize: 13 },
  guestBtn: {
    height: 54,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  guestTxt: { fontSize: 16, fontWeight: "700", color: colors.primary },
  error: { color: colors.red, textAlign: "center", marginTop: 16 },
  footer: { padding: 24, alignItems: "center" },
  footerText: { fontSize: 12, color: colors.textMuted, textAlign: "center" },
});
