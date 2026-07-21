import type { Metadata } from "next";
import RegisterPageContent from "@/components/public/RegisterPageContent";

export const metadata: Metadata = {
  title: "Register | CLA Learning",
  description: "Register as a student, applicant, or instructor at CLA Learning.",
};

export default function RegisterPage() {
  return <RegisterPageContent />;
}
