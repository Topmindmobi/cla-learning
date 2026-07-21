import type { Metadata } from "next";
import AccaPageContent from "@/components/public/AccaPageContent";

export const metadata: Metadata = {
  title: "ACCA Programmes | CLA Learning",
  description: "ACCA qualifications from Applied Knowledge to Strategic Professional at CLA.",
};

export default function AccaPage() {
  return <AccaPageContent />;
}
