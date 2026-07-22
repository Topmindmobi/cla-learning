import { requireSession } from "@/lib/auth";
import SettingsForm from "./SettingsForm";

export default async function AccountSettingsPage() {
  await requireSession();
  return <SettingsForm />;
}
