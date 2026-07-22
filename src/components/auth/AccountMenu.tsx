"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";

type AccountMenuProps = {
  initials: string;
  name: string;
  email: string;
  roleLabel: string;
  variant?: "light" | "dark";
  /** Optional staff home link (e.g. Admin console). */
  homeHref?: string;
  homeLabel?: string;
};

export default function AccountMenu({
  initials,
  name,
  email,
  roleLabel,
  variant = "light",
  homeHref,
  homeLabel = "Admin",
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`cla-account ${variant}`} ref={rootRef}>
      <button
        type="button"
        className="cla-account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="cla-account-av">{initials}</span>
      </button>
      {open ? (
        <div className="cla-account-menu" id={menuId} role="menu">
          <div className="cla-account-meta">
            <strong>{name}</strong>
            <span>{email}</span>
            <em>{roleLabel}</em>
          </div>
          {homeHref ? (
            <Link href={homeHref} role="menuitem" onClick={() => setOpen(false)}>
              {homeLabel}
            </Link>
          ) : null}
          <Link href="/account" role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <Link href="/account/settings" role="menuitem" onClick={() => setOpen(false)}>
            Settings
          </Link>
          <form action={signOut}>
            <button type="submit" role="menuitem">
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
