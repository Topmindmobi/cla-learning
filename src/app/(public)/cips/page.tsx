import type { Metadata } from "next";
import CipsPageContent from "@/components/public/CipsPageContent";

export const metadata: Metadata = {
  title: "CIPS Programmes | CLA Learning",
  description: "CIPS qualifications from Level 2 to Level 6 at Cornerstone & Luthien Advisory.",
};

export default function CipsPage() {
  return <CipsPageContent />;
}
