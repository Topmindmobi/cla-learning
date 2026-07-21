import type { Metadata } from "next";
import { TermsPageContent } from "@/components/public/LegalPageContent";

export const metadata: Metadata = {
  title: "Terms & Conditions | CLA Learning",
};

export default function TermsPage() {
  return <TermsPageContent />;
}
