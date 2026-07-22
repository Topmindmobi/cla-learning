import { requireSession, rolesLabel } from "@/lib/auth";
import ProfileForm from "./ProfileForm";

export default async function AccountProfilePage() {
  const session = await requireSession();
  const fullName = session.profile.full_name?.trim() || "";

  return (
    <ProfileForm
      fullName={fullName}
      email={session.email}
      roleLabel={rolesLabel(session.profile)}
    />
  );
}
