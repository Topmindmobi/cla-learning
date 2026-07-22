"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClaLogo } from "@/components/brand/ClaLogo";
import AccountMenu from "@/components/auth/AccountMenu";

const NAV = [
  { href: "/dashboard", label: "Dashboard", match: (p: string) => p === "/dashboard" },
  { href: "/dashboard/catalog", label: "Catalog", match: (p: string) => p.startsWith("/dashboard/catalog") },
  {
    href: "/dashboard/course",
    label: "My learning",
    match: (p: string) => p.startsWith("/dashboard/course") || p.startsWith("/dashboard/learn"),
  },
  {
    href: "/dashboard/quizzes",
    label: "Quizzes",
    match: (p: string) => p.startsWith("/dashboard/quizzes"),
  },
  {
    href: "/dashboard/schedule",
    label: "Schedule",
    match: (p: string) => p.startsWith("/dashboard/schedule"),
  },
  {
    href: "/dashboard/more",
    label: "More",
    match: (p: string) =>
      p.startsWith("/dashboard/more") ||
      p.startsWith("/dashboard/grades") ||
      p.startsWith("/dashboard/assignments") ||
      p.startsWith("/dashboard/billing") ||
      p.startsWith("/dashboard/certificates") ||
      p.startsWith("/dashboard/notifications") ||
      p.startsWith("/dashboard/analytics") ||
      p.startsWith("/dashboard/library"),
  },
];

export default function StudentShell({
  children,
  initials = "CL",
  name = "Learner",
  email = "",
  roleLabel = "Student",
  homeHref,
  homeLabel,
}: {
  children: React.ReactNode;
  initials?: string;
  name?: string;
  email?: string;
  roleLabel?: string;
  homeHref?: string;
  homeLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="cla-student">
      <header>
        <div className="wrap bar">
          <Link href="/dashboard" className="logo">
            <ClaLogo />
            <div>
              <b>Cornerstone</b>
              <span>Luthien Advisory</span>
            </div>
          </Link>
          <nav className="main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.match(pathname) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="search">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l4 4" />
            </svg>
            <input placeholder="Search courses, skills, instructors" aria-label="Search" />
          </div>
          <button type="button" className="icon-btn" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 8a4 4 0 118 0c0 4 1.5 5 1.5 5h-11S6 12 6 8z" />
              <path d="M8.5 16a1.8 1.8 0 003 0" />
            </svg>
            <i className="dot" />
          </button>
          <AccountMenu
            initials={initials}
            name={name}
            email={email}
            roleLabel={roleLabel}
            homeHref={homeHref}
            homeLabel={homeLabel}
          />
        </div>
      </header>
      <div className="student-main">{children}</div>
      <footer>
        <div className="wrap">Cornerstone is a learning platform by Luthien Advisory · Nairobi</div>
      </footer>
    </div>
  );
}
