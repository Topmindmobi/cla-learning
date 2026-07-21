import type { Metadata } from "next";
import ContactPageContent from "@/components/public/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact | CLA Learning",
  description: "Get in touch with Cornerstone & Luthien Advisory in Kigali, Rwanda.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
