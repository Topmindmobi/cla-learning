import Link from "next/link";

export function AdminTopBar({
  section,
  title,
  actions,
}: {
  section: string;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="topbar">
      <div className="crumbs">
        Admin / <b>{section}</b>
      </div>
      <div className="right">
        {actions}
        <Link href="/admin" className="cla-btn">
          Today
        </Link>
      </div>
    </div>
  );
}

export function AdminPageHead({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        <p>{lede}</p>
      </div>
    </div>
  );
}

export function ConfigBanner({ ok }: { ok: boolean }) {
  if (ok) return null;
  return (
    <div className="attention">
      <b>Service role key missing</b>
      <span>· Add SUPABASE_SERVICE_ROLE_KEY in Render Environment, then redeploy.</span>
    </div>
  );
}

export function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} style={{ color: "var(--muted)" }}>
        {message}
      </td>
    </tr>
  );
}
