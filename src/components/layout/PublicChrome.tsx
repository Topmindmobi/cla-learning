import Link from "next/link";
import { ClaLogo, CheckIcon } from "@/components/brand/ClaLogo";

const navLinks = [
  { href: "/#programmes", label: "Programmes" },
  { href: "/catalog", label: "Courses" },
  { href: "/#about", label: "About" },
  { href: "/#why", label: "Why CLA" },
  { href: "/#contact", label: "Contact" },
];

export default function PublicHeader() {
  return (
    <header>
      <div className="cla-wrap bar">
        <Link href="/" className="logo">
          <ClaLogo />
          <div>
            <b>CLA Learning</b>
            <span>Cornerstone &amp; Luthien Advisory</span>
          </div>
        </Link>
        <nav>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="right">
          <Link href="/login" className="cla-btn">
            Sign in
          </Link>
          <Link href="/#contact" className="cla-btn primary">
            Enrol now
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer>
      <div className="cla-wrap">
        <div className="fgrid">
          <div>
            <div className="logo" style={{ marginBottom: 12 }}>
              <ClaLogo />
              <div>
                <b style={{ fontFamily: "var(--font-instrument-serif)", fontSize: 21, color: "var(--ink)" }}>
                  CLA Learning
                </b>
                <span style={{ display: "block", fontSize: "9.5px", letterSpacing: "0.13em", textTransform: "uppercase" }}>
                  Cornerstone &amp; Luthien Advisory
                </span>
              </div>
            </div>
            <p style={{ maxWidth: "30ch" }}>
              Accredited professional education for procurement, finance and leadership across Africa.
            </p>
          </div>
          <div>
            <h5>Platform</h5>
            <ul>
              <li><Link href="/catalog">Browse courses</Link></li>
              <li><Link href="/dashboard">My learning</Link></li>
              <li><Link href="/login">Student login</Link></li>
            </ul>
          </div>
          <div>
            <h5>Programmes</h5>
            <ul>
              <li><Link href="/cips">CIPS</Link></li>
              <li><Link href="/acca">ACCA</Link></li>
              <li><Link href="/catalog">Short courses</Link></li>
            </ul>
          </div>
          <div>
            <h5>Legal</h5>
            <ul>
              <li><Link href="/privacy">Privacy policy</Link></li>
              <li><Link href="/terms">Terms &amp; conditions</Link></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li>KN 2 Ave, Kigali, Rwanda</li>
              <li><a href="tel:+250788924490">+250 788 924 490</a></li>
              <li><a href="mailto:info@cornerstoneluthien.com">info@cornerstoneluthien.com</a></li>
            </ul>
          </div>
        </div>
        <div className="fbot">
          <span>© 2026 Cornerstone &amp; Luthien Advisory (CLA). All rights reserved.</span>
          <span>Facebook · LinkedIn · Instagram</span>
        </div>
      </div>
    </footer>
  );
}

export { CheckIcon };
