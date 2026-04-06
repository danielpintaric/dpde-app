"use client";

import { flushSync, useFormStatus } from "react-dom";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type AdminSelectOption = { value: string; label: string };

type Props = {
  id: string;
  name: string;
  defaultValue: string;
  options: AdminSelectOption[];
  /** Matches compact editor typography (e.g. sidebar + inspector) */
  dense?: boolean;
  disabled?: boolean;
  className?: string;
};

type MenuRect = { top: number; left: number; width: number };

function measureTrigger(el: HTMLButtonElement | null): MenuRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.bottom + 4, left: r.left, width: r.width };
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Form-native select replacement: custom zinc dropdown + hidden input, portal menu
 * (aligned with {@link ProjectVisibilityControl}). Bubbles input/change for form onChange handlers.
 */
export function AdminSelect({
  id,
  name,
  defaultValue,
  options,
  dense = false,
  disabled: disabledProp = false,
  className = "",
}: Props) {
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const { pending: formPending } = useFormStatus();
  const disabled = disabledProp || formPending;

  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const close = () => {
    setOpen(false);
    setMenuRect(null);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => setMenuRect(measureTrigger(triggerRef.current));
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const triggerClass = dense
    ? "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded border border-zinc-700/85 bg-zinc-900/75 px-2 py-1 text-left text-[11px] font-medium leading-snug text-zinc-100 outline-none transition-[border-color,background-color,color] hover:border-zinc-600/80 hover:bg-zinc-900/90 focus-visible:border-zinc-500/80 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-45"
    : "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-sm font-medium text-zinc-100 outline-none transition-[border-color,background-color,color] hover:border-zinc-600 hover:bg-zinc-900/95 focus-visible:border-zinc-500 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-45";

  const optionClass = (selected: boolean) =>
    [
      "cursor-pointer px-2.5 py-1.5 text-left transition-colors duration-100",
      dense ? "text-[11px] leading-snug" : "text-sm",
      selected ? "bg-zinc-800/80 text-zinc-100" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
    ].join(" ");

  const listboxClass =
    "max-h-[min(16rem,calc(100vh-2rem))] overflow-y-auto overflow-x-hidden rounded-md border border-zinc-700/75 bg-zinc-950 py-1 shadow-xl shadow-black/50 ring-1 ring-zinc-800/90";

  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  const pick = (next: string) => {
    close();
    if (next === value) return;
    flushSync(() => {
      setValue(next);
    });
    const h = hiddenRef.current;
    if (h) {
      h.dispatchEvent(new Event("input", { bubbles: true }));
      h.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const toggle = () => {
    if (disabled) return;
    if (open) close();
    else {
      setMenuRect(measureTrigger(triggerRef.current));
      setOpen(true);
    }
  };

  const menuPortal =
    mounted &&
    open &&
    menuRect &&
    createPortal(
      <ul
        ref={menuRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={id}
        style={{
          position: "fixed",
          top: menuRect.top,
          left: menuRect.left,
          width: menuRect.width,
          zIndex: 9999,
        }}
        className={listboxClass}
      >
        {options.map((o) => (
          <li
            key={o.value}
            role="option"
            aria-selected={value === o.value}
            className={optionClass(value === o.value)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(o.value)}
          >
            {o.label}
          </li>
        ))}
      </ul>,
      document.body,
    );

  return (
    <div ref={rootRef} className={`min-w-0 ${className}`}>
      <input ref={hiddenRef} type="hidden" name={name} value={value} readOnly tabIndex={-1} aria-hidden />
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={toggle}
        className={triggerClass}
      >
        <span className="min-w-0 truncate text-left">{currentLabel}</span>
        <Chevron open={open} />
      </button>
      {menuPortal}
    </div>
  );
}
