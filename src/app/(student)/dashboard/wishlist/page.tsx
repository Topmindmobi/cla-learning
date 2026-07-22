"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Wish = { id: string; title: string; href: string };

export default function WishlistPage() {
  const [items, setItems] = useState<Wish[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cla-wishlist");
      setItems(raw ? (JSON.parse(raw) as Wish[]) : []);
    } catch {
      setItems([]);
    }
  }, []);

  function clear() {
    localStorage.removeItem("cla-wishlist");
    setItems([]);
  }

  return (
    <div className="wrap">
      <div className="hello" style={{ marginBottom: 22 }}>
        <div>
          <div className="mono eyebrow">Saved</div>
          <h1>
            My <span className="serif">wishlist</span>
          </h1>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="cla-card" style={{ padding: 24 }}>
          <p style={{ margin: "0 0 14px", color: "var(--muted)" }}>
            Saved courses appear here on this device. Browse the catalog to find programmes.
          </p>
          <Link href="/dashboard/catalog" className="cla-btn primary">
            Browse catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="grid3" style={{ marginBottom: 16 }}>
            {items.map((w) => (
              <Link
                key={w.id}
                href={w.href}
                className="cla-card"
                style={{ padding: 18, textDecoration: "none", color: "inherit" }}
              >
                <h3 style={{ margin: 0, fontSize: 16 }}>{w.title}</h3>
              </Link>
            ))}
          </div>
          <button type="button" className="cla-btn" onClick={clear}>
            Clear wishlist
          </button>
        </>
      )}
    </div>
  );
}
