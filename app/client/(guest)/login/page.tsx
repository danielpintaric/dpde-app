"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/db/supabase-browser";

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signError) {
        setError(signError.message);
        return;
      }
      router.refresh();
      router.push("/client");
    } catch {
      setError("Sign-in failed. Check Supabase configuration.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-serif text-2xl tracking-tight text-zinc-100">Client area</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Sign in to access private projects shared with you. Unlisted work uses a direct link on the main site.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {error ? (
          <p className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <div>
          <label htmlFor="client-login-email" className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
            Email
          </label>
          <input
            id="client-login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="client-login-password" className="mb-1 block text-xs uppercase tracking-wider text-zinc-500">
            Password
          </label>
          <input
            id="client-login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full cursor-pointer rounded bg-zinc-100 py-2 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Enter"}
        </button>
      </form>
      <p className="mt-8 text-center text-xs text-zinc-600">
        <Link href="/" className="text-zinc-500 underline-offset-4 hover:text-zinc-400 hover:underline">
          Back to site
        </Link>
        <span className="mx-2 text-zinc-700">·</span>
        <Link href="/contact" className="text-zinc-500 underline-offset-4 hover:text-zinc-400 hover:underline">
          Contact
        </Link>
      </p>
    </div>
  );
}
