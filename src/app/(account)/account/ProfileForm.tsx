"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateProfile, type AccountState } from "@/app/auth/actions";

const initial: AccountState = {};

export default function ProfileForm({
  fullName,
  email,
  roleLabel,
}: {
  fullName: string;
  email: string;
  roleLabel: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initial);

  return (
    <>
      <span className="mono eyebrow">Account</span>
      <h1>Profile</h1>
      <p className="lede">Your name and contact details for CLA Learning.</p>

      <form action={formAction}>
        <label>
          Full name
          <input name="full_name" defaultValue={fullName} required autoComplete="name" />
        </label>
        <label>
          Email
          <input value={email} disabled readOnly />
        </label>
        <label>
          Role
          <input value={roleLabel} disabled readOnly />
        </label>
        {state.error ? <p className="flash-err">{state.error}</p> : null}
        {state.message ? <p className="flash-ok">{state.message}</p> : null}
        <div className="actions">
          <button type="submit" className="cla-btn primary" disabled={pending}>
            {pending ? "Saving…" : "Save profile"}
          </button>
          <Link href="/account/settings" className="cla-btn">
            Settings
          </Link>
        </div>
      </form>
    </>
  );
}
