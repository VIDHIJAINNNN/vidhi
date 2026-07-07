import React from "react";
import Svg, { Path, Circle, G, Ellipse } from "react-native-svg";

type Props = {
  size?: number;
  primary?: string;   // color of the "L" trunk
  leaf?: string;      // color of leaves
  leafAlt?: string;   // optional accent color
};

/**
 * LEGACY logo — a stylized "L" whose top serif transforms into a
 * gentle branch bearing 5 leaves. Each leaf represents a student
 * whose knowledge continues to grow across generations.
 */
export default function LegacyLogo({
  size = 120,
  primary = "#111827",
  leaf = "#10B981",
  leafAlt = "#34D399",
}: Props) {
  // ViewBox: 100 x 100
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        {/* Trunk of the L (vertical) — thick, rounded */}
        <Path
          d="M 30 18 Q 30 15 33 15 L 40 15 Q 43 15 43 18 L 43 75 L 78 75 Q 82 75 82 79 L 82 84 Q 82 88 78 88 L 33 88 Q 30 88 30 85 Z"
          fill={primary}
        />

        {/* Branch curving upward-right out of the top of the L */}
        <Path
          d="M 36 22 C 42 12, 55 6, 72 8"
          stroke={primary}
          strokeWidth={3.6}
          strokeLinecap="round"
          fill="none"
        />

        {/* Small twig branches */}
        <Path
          d="M 47 14 C 50 11, 54 10, 58 11"
          stroke={primary}
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M 60 10 C 63 6, 67 5, 70 4"
          stroke={primary}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />

        {/* Leaf 1 — largest, at the tip */}
        <G>
          <Ellipse cx="78" cy="6" rx="7.5" ry="4.5" fill={leaf} transform="rotate(-38 78 6)" />
          <Path
            d="M 72 8 Q 78 4 84 3"
            stroke={leafAlt}
            strokeWidth={0.6}
            strokeLinecap="round"
            fill="none"
            opacity={0.55}
          />
        </G>

        {/* Leaf 2 — mid branch, upper */}
        <G>
          <Ellipse cx="60" cy="4" rx="6" ry="3.6" fill={leafAlt} transform="rotate(-52 60 4)" />
        </G>

        {/* Leaf 3 — twig middle */}
        <G>
          <Ellipse cx="52" cy="9" rx="5.4" ry="3.2" fill={leaf} transform="rotate(-22 52 9)" />
        </G>

        {/* Leaf 4 — small, at the branch start */}
        <G>
          <Ellipse cx="44" cy="10" rx="4.6" ry="2.8" fill={leafAlt} transform="rotate(-15 44 10)" />
        </G>

        {/* Leaf 5 — accent below main branch */}
        <G>
          <Ellipse cx="66" cy="16" rx="4.2" ry="2.6" fill={leaf} transform="rotate(-6 66 16)" opacity={0.9} />
        </G>

        {/* A subtle seed/dot at the base — knowledge planted */}
        <Circle cx="36.5" cy="93.5" r="1.2" fill={primary} opacity={0.5} />
      </G>
    </Svg>
  );
}
