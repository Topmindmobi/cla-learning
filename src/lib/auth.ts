import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile, UserRole } from "@/types/database";

export type SessionProfile = {
  userId: string;
  email: string;
  profile: Profile;
};

export function initialsFromName(name: string | null | undefined, email?: string | null): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "CL";
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "Super admin";
    case "admin":
      return "Admin";
    case "finance":
      return "Finance";
    case "instructor":
      return "Instructor";
    default:
      return "Student";
  }
}

export function homePathForRole(role: UserRole): string {
  if (role === "admin" || role === "super_admin" || role === "finance") return "/admin";
  if (role === "instructor") return "/instructor";
  return "/dashboard";
}

/** Prefer the highest-privilege role from `role` + `roles`. */
export function effectiveRole(profile: Pick<Profile, "role" | "roles">): UserRole {
  const roles = new Set<UserRole>([
    profile.role,
    ...((profile.roles?.length ? profile.roles : []) as UserRole[]),
  ]);
  if (roles.has("super_admin")) return "super_admin";
  if (roles.has("admin")) return "admin";
  if (roles.has("finance")) return "finance";
  if (roles.has("instructor")) return "instructor";
  return "user";
}

/** Human-readable label including secondary roles (e.g. Super admin · Admin). */
export function rolesLabel(profile: Pick<Profile, "role" | "roles">): string {
  const primary = effectiveRole(profile);
  const extras = new Set(
    (profile.roles?.length ? profile.roles : [profile.role]).filter((r) => r !== primary && r !== "user"),
  );
  if (primary === "super_admin") extras.add("admin");
  const parts = [roleLabel(primary), ...Array.from(extras).map(roleLabel)];
  return [...new Set(parts)].join(" · ");
}

export function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "super_admin" || role === "finance" || role === "instructor";
}

export function hasRole(profile: Pick<Profile, "role" | "roles">, role: UserRole): boolean {
  if (profile.role === role) return true;
  return Boolean(profile.roles?.includes(role));
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, roles, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const fallback: Profile = {
    id: user.id,
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    role: "user",
    roles: ["user"],
    avatar_url: null,
  };

  const resolved: Profile = (profile as Profile | null) ?? fallback;
  // Keep primary role aligned with the highest privilege in `roles`.
  resolved.role = effectiveRole(resolved);
  const roleSet = new Set<UserRole>(
    resolved.roles?.length ? resolved.roles : [resolved.role],
  );
  roleSet.add(resolved.role);
  // Super admins always also carry the admin capability.
  if (roleSet.has("super_admin")) roleSet.add("admin");
  resolved.roles = Array.from(roleSet);

  return {
    userId: user.id,
    email: user.email ?? resolved.email ?? "",
    profile: resolved,
  };
}

export async function requireSession(options?: {
  roles?: UserRole[];
  loginRedirect?: string;
}): Promise<SessionProfile> {
  const session = await getSessionProfile();
  if (!session) {
    redirect(options?.loginRedirect ?? "/login");
  }

  if (options?.roles?.length) {
    const allowed = new Set(options.roles);
    const roles = session.profile.roles?.length
      ? session.profile.roles
      : [session.profile.role];
    const effective = effectiveRole(session.profile);
    if (!roles.some((role) => allowed.has(role)) && !allowed.has(effective)) {
      redirect(homePathForRole(effective));
    }
  }

  return session;
}
