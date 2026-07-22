"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signOut, updatePassword, type AccountState } from "@/app/auth/actions";

const initial: AccountState = {};

export default function SettingsForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initial);

  return (
    <>
      <span className="mono eyebrow">Account</span>
      <h1>Settings</h1>
      <p className="lede">Update your password or sign out of CLA Learning.</p>

      <form action={formAction}>
        <label>
          New password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm password
          <input
            name="confirm_password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        {state.error ? <p className="flash-err">{state.error}</p> : null}
        {state.message ? <p className="flash-ok">{state.message}</p> : null}
        <div className="actions">
          <button type="submit" className="cla-btn primary" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </button>
          <Link href="/account" className="cla-btn">
            Back to profile
          </Link>
        </div>
      </form>

      <form action={signOut} style={{ marginTop: 32 }}>
        <button type="submit" className="cla-btn">
          Log out
        </button>
      </form>
    </>
  );
}
