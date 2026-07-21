"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClaLogo } from "@/components/brand/ClaLogo";

const NAV = [
  { href: "/dashboard", label: "Dashboard", match: (p: string) => p === "/dashboard" },
  { href: "/dashboard/catalog", label: "Catalog", match: (p: string) => p.startsWith("/dashboard/catalog") },
  { href: "/dashboard/course", label: "My course", match: (p: string) => p.startsWith("/dashboard/course") },
];

export default function StudentShell({
  children,
  initials = "FK",
}: {
  children: React.ReactNode;
  initials?: string;
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
          <div className="avatar">{initials}</div>
        </div>
      </header>
      <div className="student-main">{children}</div>
      <footer>
        <div className="wrap">Cornerstone is a learning platform by Luthien Advisory · Nairobi</div>
      </footer>
    </div>
  );
}
