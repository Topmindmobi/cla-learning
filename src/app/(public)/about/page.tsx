import type { Metadata } from "next";
import AboutPageContent from "@/components/public/AboutPageContent";

export const metadata: Metadata = {
  title: "About | CLA Learning",
  description: "Learn about Cornerstone & Luthien Advisory — professional training and consultancy in East Africa.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
