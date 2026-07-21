"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClaLogoLight } from "@/components/brand/ClaLogo";

type NavItem = { href: string; label: string; badge?: string; warn?: boolean };

type NavGroup = { label?: string; items: NavItem[] };

const ADMIN_NAV: NavGroup[] = [
  { items: [{ href: "/admin", label: "Today" }] },
  {
    label: "Learners",
    items: [
      { href: "/admin/students", label: "Students", badge: "2,041", warn: true },
      { href: "/admin/cohorts", label: "Cohorts & timetable" },
      { href: "/admin/attendance", label: "Attendance" },
      { href: "/admin/at-risk", label: "At risk", badge: "37", warn: true },
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
      { href: "/admin/payments", label: "Payments", badge: "18", warn: true },
      { href: "/admin/revenue", label: "Revenue" },
      { href: "/admin/invoices", label: "Invoices & plans" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/users", label: "Users & roles" },
      { href: "/admin/content", label: "Site content" },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="cla-dash">
      <div className="app">
        <aside>
          <div className="brand">
            <ClaLogoLight />
            <div><b>CLA Admin</b><span>Cornerstone &amp; Luthien</span></div>
          </div>
          <div className="navsearch">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="7" cy="7" r="5" /><path d="M11 11l4 4" /></svg>
            <input placeholder="Jump to… ⌘K" aria-label="Search admin" />
          </div>
          {ADMIN_NAV.map((group, i) => (
            <div key={i} className="group">
              {group.label && <span className="mono">{group.label}</span>}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${pathname === item.href ? " on" : ""}${item.warn ? " warn" : ""}`}
                >
                  {item.label}
                  {item.badge && <span className="badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
