import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  ViewToken,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, font, shadow } from "@/src/theme";
import { storage } from "@/src/utils/storage";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Every Student Has\nSomething to Learn.",
    subtitle:
      "Learn directly from students who've already achieved what you aspire to.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
  },
  {
    title: "Every Student Has\nSomething to Teach.",
    subtitle:
      "Turn your experience into mentorship, leadership, and income.",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
  },
  {
    title: "Leave a Legacy.",
    subtitle:
      "Connecting minds, creating futures.",
    image:
      "https://images.unsplash.com/photo-1509909756405-be0199881695?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  const finish = async () => {
    await storage.setItem("onboarding_done", true);
    router.replace("/login");
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>LEGACY</Text>
        <TouchableOpacity onPress={finish} testID="onboarding-skip">
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.imageOverlay} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.cta}
          onPress={next}
          activeOpacity={0.9}
          testID="onboarding-continue"
        >
          <Text style={styles.ctaText}>
            {index === SLIDES.length - 1 ? "Get Started" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  brand: { fontSize: 16, fontWeight: "800", letterSpacing: 3, color: colors.primary },
  skip: { fontSize: 15, color: colors.textSecondary, fontWeight: "500" },
  imageWrap: {
    width: width - 48,
    height: width - 48,
    borderRadius: 32,
    overflow: "hidden",
    marginHorizontal: 24,
    marginTop: 10,
    backgroundColor: colors.bg2,
  },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(37,99,235,0.05)",
  },
  textBlock: { paddingHorizontal: 32, paddingTop: 36 },
  title: { ...font.h1, fontSize: 30, lineHeight: 38 },
  subtitle: {
    ...font.body,
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: { width: 20, backgroundColor: colors.primary },
  bottom: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  cta: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
});
