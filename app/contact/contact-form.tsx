"use client";

import { useState } from "react";
import { linkFocusVisible, tapSoft, transitionQuick } from "@/lib/editorial";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStatus("idle");
    setStatusMessage(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          project: String(fd.get("project") ?? ""),
          message: String(fd.get("message") ?? ""),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("err");
        setStatusMessage(data.error ?? "Could not send.");
        return;
      }

      setStatus("ok");
      setStatusMessage(null);
      form.reset();
    } catch {
      setStatus("err");
      setStatusMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldClass = `w-full border-0 border-b border-zinc-800/80 bg-transparent py-4 text-[13px] font-light tracking-[0.02em] text-zinc-300 outline-none ${transitionQuick} placeholder:text-zinc-600/90 focus:border-zinc-400/55 focus-visible:border-zinc-400/60 ${linkFocusVisible}`;

  const labelClass =
    "block text-[10px] font-medium uppercase tracking-[0.28em] text-zinc-500/90";

  return (
    <form onSubmit={handleSubmit} className="space-y-12" noValidate>
      <div className="space-y-3">
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" placeholder="" className={fieldClass} />
      </div>
      <div className="space-y-3">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder=""
          className={fieldClass}
        />
      </div>
      <div className="space-y-3">
        <label htmlFor="project" className={labelClass}>
          Brief
        </label>
        <input id="project" name="project" type="text" placeholder="" className={fieldClass} />
      </div>
      <div className="space-y-3">
        <label htmlFor="message" className={labelClass}>
          Note
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder=""
          className={`${fieldClass} resize-none leading-[1.75]`}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`cursor-pointer pt-1 text-[11px] font-normal tracking-[0.1em] text-zinc-400 underline decoration-zinc-600/40 underline-offset-[10px] ${transitionQuick} hover:text-zinc-200 hover:decoration-zinc-500/55 disabled:cursor-not-allowed disabled:opacity-45 ${linkFocusVisible} ${tapSoft}`}
      >
        Write the studio
      </button>
      {status === "err" && statusMessage ? (
        <p className="text-[12px] font-light tracking-[0.02em] text-zinc-600" role="alert">
          {statusMessage}
        </p>
      ) : null}
      {status === "ok" ? (
        <p className="text-[12px] font-light tracking-[0.02em] text-zinc-600" role="status">
          Sent.
        </p>
      ) : null}
    </form>
  );
}
