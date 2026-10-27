import type { Metadata } from "next";
import AdminWishes from "@/components/AdminWishes";

export const metadata: Metadata = {
  title: "Wishes | Private",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminWishes />;
}
