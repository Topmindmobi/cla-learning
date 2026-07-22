import Link from "next/link";

const LINKS = [
  { href: "/dashboard/grades", label: "Grades", desc: "Quiz and assignment scores" },
  { href: "/dashboard/assignments", label: "Assignments", desc: "Submit and review coursework" },
  { href: "/dashboard/certificates", label: "Certificates", desc: "Claim completed credentials" },
  { href: "/dashboard/billing", label: "Billing", desc: "Payments and invoices" },
  { href: "/dashboard/notifications", label: "Notifications", desc: "Alerts and reminders" },
  { href: "/dashboard/wishlist", label: "Wishlist", desc: "Saved courses on this device" },
  { href: "/dashboard/analytics", label: "Analytics", desc: "Personal learning stats" },
  { href: "/dashboard/library", label: "Library", desc: "Programme resources" },
  { href: "/help", label: "Help", desc: "Support and FAQs" },
  { href: "/account", label: "Profile", desc: "Account and settings" },
];

export default function MoreHubPage() {
  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Learner hub</div>
          <h1>
            More <span className="serif">tools</span>
          </h1>
        </div>
      </div>
      <div className="grid3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="cla-card"
            style={{ padding: 20, textDecoration: "none", color: "inherit", display: "block" }}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{l.label}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "var(--muted)" }}>{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
