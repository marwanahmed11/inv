/** Ornate hand-drawn divider: mirrored scrolls around a small heart. Uses currentColor. */
export default function Flourish({ className = "", width = 220 }: { className?: string; width?: number }) {
  return (
    <svg
      aria-hidden
      className={className}
      width={width}
      height={width * 0.12}
      viewBox="0 0 220 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
    >
      <g>
        <path d="M96 13 C80 13 74 4 62 6 C52 8 54 20 63 18 C70 16 67 9 61 11" />
        <path d="M62 6 C46 2 30 14 4 13" opacity="0.7" />
        <path d="M40 10 C44 6 50 6 52 9" opacity="0.6" />
      </g>
      <g transform="translate(220 0) scale(-1 1)">
        <path d="M96 13 C80 13 74 4 62 6 C52 8 54 20 63 18 C70 16 67 9 61 11" />
        <path d="M62 6 C46 2 30 14 4 13" opacity="0.7" />
        <path d="M40 10 C44 6 50 6 52 9" opacity="0.6" />
      </g>
      <path d="M110 20s-6-3.8-6-8a3.2 3.2 0 0 1 6-1.8A3.2 3.2 0 0 1 116 12c0 4.2-6 8-6 8z" />
    </svg>
  );
}
