import { invitation } from "@/config/invitation";

/** Delicate rose monogram: thin double ring with laurel-like ticks. */
export default function Monogram({ size = 132 }: { size?: number }) {
  const g = invitation.palette.rose;
  return (
    <svg
      role="img"
      aria-label={`${invitation.couple.first} and ${invitation.couple.second} monogram`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
    >
      <circle cx="60" cy="60" r="56" stroke={g} strokeWidth="0.8" />
      <circle cx="60" cy="60" r="50" stroke={g} strokeWidth="0.5" strokeOpacity="0.7" />
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={60 + Math.cos(a) * 50}
            y1={60 + Math.sin(a) * 50}
            x2={60 + Math.cos(a) * 53}
            y2={60 + Math.sin(a) * 53}
            stroke={g}
            strokeWidth="0.5"
          />
        );
      })}
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fill={g}
        style={{ fontFamily: "var(--font-script), cursive", fontSize: 38 }}
      >
        M&amp;R
      </text>
    </svg>
  );
}
