"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";

type Mode = "signin" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
      if (event === "SIGNED_IN" && mode !== "reset") window.location.assign("/?studio=1");
    });
    return () => data.subscription.unsubscribe();
  }, [mode, supabase]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const redirectTo = `${window.location.origin}/auth`;

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo, data: { full_name: name } },
      });
      setMessage(error ? error.message : "Check your email to confirm your Veya account.");
    } else if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "Signed in. Opening Business Studio…");
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      setMessage(error ? error.message : "Password recovery instructions were sent to your email.");
    } else {
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error ? error.message : "Password updated. You can now use Business Studio.");
      if (!error) setTimeout(() => window.location.assign("/?studio=1"), 700);
    }
    setBusy(false);
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" href="/"><span>V</span> veya</Link>
      <section className="auth-card">
        <span className="eyebrow">SECURE VEYA ACCOUNT</span>
        <h1>{mode === "signup" ? "Create your business account." : mode === "forgot" ? "Recover your account." : mode === "reset" ? "Choose a new password." : "Welcome back."}</h1>
        <p>{mode === "signup" ? "Your business, staff, clients, appointments, and money stay separated from every other Veya business." : "Sign in securely to manage your business."}</p>
        <form onSubmit={submit}>
          {mode === "signup" && <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>}
          {mode !== "reset" && <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>}
          {mode !== "forgot" && <label>{mode === "reset" ? "New password" : "Password"}<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></label>}
          <button disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send recovery email" : mode === "reset" ? "Update password" : "Sign in"}</button>
        </form>
        {message && <div className="auth-message" role="status">{message}</div>}
        <div className="auth-switches">
          {mode !== "signin" && <button onClick={() => setMode("signin")}>Back to sign in</button>}
          {mode === "signin" && <><button onClick={() => setMode("forgot")}>Forgot password?</button><button onClick={() => setMode("signup")}>Create account</button></>}
        </div>
        <small>Protected by encrypted sessions and Veya’s tenant-separated production database.</small>
      </section>
    </main>
  );
}
