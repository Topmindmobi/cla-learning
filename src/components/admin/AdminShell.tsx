"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClaLogoLight } from "@/components/brand/ClaLogo";
import { signOut } from "@/app/auth/actions";

type NavItem = { href: string; label: string; badge?: string; warn?: boolean };
type NavGroup = { label?: string; items: NavItem[] };

/** Restored from Base44 navConfig + CLA admin design shell. */
const ADMIN_NAV: NavGroup[] = [
  { items: [{ href: "/admin", label: "Today" }] },
  {
    label: "Learners",
    items: [
      { href: "/admin/students", label: "Students" },
      { href: "/admin/cohorts", label: "Cohorts & timetable" },
      { href: "/admin/attendance", label: "Attendance" },
      { href: "/admin/at-risk", label: "At risk", warn: true },
    ],
  },
  {
    label: "Teaching",
    items: [
      { href: "/admin/courses", label: "Courses & syllabus" },
      { href: "/admin/assessments", label: "Assessments & banks" },
      { href: "/admin/sessions", label: "Live sessions" },
      { href: "/admin/instructors", label: "Instructors" },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/admin/payments", label: "Payments", warn: true },
      { href: "/admin/revenue", label: "Revenue" },
      { href: "/admin/invoices", label: "Invoices & plans" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/account", label: "My profile" },
      { href: "/account/settings", label: "Account settings" },
      { href: "/admin/users", label: "Users & roles" },
      { href: "/admin/content", label: "Site content" },
    ],
  },
];

export default function AdminShell({
  children,
  initials = "CL",
  name = "Admin",
  roleLabel = "Admin",
}: {
  children: React.ReactNode;
  initials?: string;
  name?: string;
  roleLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="cla-dash">
      <div className="app">
        <aside>
          <div className="brand">
            <ClaLogoLight />
            <div><b>CLA Admin</b><span>Cornerstone &amp; Luthien</span></div>
          </div>
          {ADMIN_NAV.map((group, i) => (
            <div key={i} className="group">
              {group.label && <span className="mono">{group.label}</span>}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)) ? " on" : ""}${item.warn ? " warn" : ""}`}
                >
                  {item.label}
                  {item.badge && <span className="badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
          <div className="me">
            <div className="av">{initials}</div>
            <div>
              <p>{name}</p>
              <span>{roleLabel}</span>
              <div className="me-actions">
                <Link href="/account">Profile</Link>
                <Link href="/account/settings">Settings</Link>
                <form action={signOut}>
                  <button type="submit">Log out</button>
                </form>
              </div>
            </div>
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
