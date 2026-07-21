import type { Metadata } from "next";
import { PrivacyPageContent } from "@/components/public/LegalPageContent";

export const metadata: Metadata = {
  title: "Privacy Policy | CLA Learning",
};

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}
