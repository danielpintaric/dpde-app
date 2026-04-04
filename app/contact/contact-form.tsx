"use client";

export function ContactForm() {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  const fieldClass =
    "w-full border-0 border-b border-zinc-800/80 bg-transparent py-4 text-[13px] font-light tracking-[0.02em] text-zinc-300 outline-none transition duration-300 ease-out placeholder:text-zinc-600 focus:border-zinc-500/50";

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
        className="pt-1 text-[11px] font-normal tracking-[0.1em] text-zinc-400 underline decoration-zinc-600/40 underline-offset-[10px] transition duration-300 ease-out hover:text-zinc-200 hover:decoration-zinc-500/50"
      >
        Write the studio
      </button>
    </form>
  );
}
