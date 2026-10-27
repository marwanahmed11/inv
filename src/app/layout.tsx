import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { invitation } from "@/config/invitation";

// Self-hosted Google Fonts (SIL Open Font License), so builds never depend on the network.
const serif = localFont({
  src: [
    { path: "../fonts/CormorantGaramond-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/CormorantGaramond-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/CormorantGaramond-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/CormorantGaramond-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/CormorantGaramond-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/CormorantGaramond-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/CormorantGaramond-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/CormorantGaramond-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});
const script = localFont({
  src: "../fonts/PinyonScript-400-normal.woff2",
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const { couple, event, venue } = invitation;

export const metadata: Metadata = {
  title: `${couple.first} & ${couple.second} | Engagement Invitation`,
  description: `You are invited to the engagement celebration of ${couple.first} & ${couple.second}, ${event.dateLabel}, ${event.timeLabel}, ${venue.name}, ${venue.area}.`,
};

export const viewport: Viewport = {
  themeColor: invitation.palette.wine,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
