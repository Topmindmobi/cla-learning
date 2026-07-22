"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClaLogoLight } from "@/components/brand/ClaLogo";
import { signOut } from "@/app/auth/actions";

type NavItem = { href: string; label: string; badge?: string; warn?: boolean };
type NavGroup = { label?: string; items: NavItem[] };

const INSTRUCTOR_NAV: NavGroup[] = [
  { items: [{ href: "/instructor", label: "Today" }] },
  {
    label: "Teaching",
    items: [
      { href: "/instructor/timetable", label: "My timetable" },
      { href: "/instructor/sessions", label: "Live sessions" },
      { href: "/instructor/materials", label: "Lesson materials" },
    ],
  },
  {
    label: "Assessment",
    items: [
      { href: "/instructor/marking", label: "Marking", badge: "23", warn: true },
      { href: "/instructor/questions", label: "Question bank" },
      { href: "/instructor/mocks", label: "Mock results" },
    ],
  },
  {
    label: "Students",
    items: [
      { href: "/instructor/cohorts", label: "My cohorts" },
      { href: "/instructor/attendance", label: "Attendance register" },
      { href: "/instructor/messages", label: "Messages", badge: "5", warn: true },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/account", label: "My profile" },
      { href: "/account/settings", label: "Settings" },
    ],
  },
];

export default function InstructorShell({
  children,
  initials = "CL",
  name = "Instructor",
  roleLabel = "Instructor",
}: {
  children: React.ReactNode;
  initials?: string;
  name?: string;
  roleLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="cla-dash instructor">
      <div className="app">
        <aside>
          <div className="brand">
            <ClaLogoLight />
            <div><b>Teach</b><span>CLA Learning</span></div>
          </div>
          {INSTRUCTOR_NAV.map((group, i) => (
            <div key={i} className="group">
              {group.label && <span className="mono">{group.label}</span>}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${pathname === item.href || (item.href !== "/instructor" && pathname.startsWith(item.href)) ? " on" : ""}${item.warn ? " warn" : ""}`}
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
