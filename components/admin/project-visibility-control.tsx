"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { updateProjectVisibilityAction } from "@/lib/actions/admin-project-actions";
import type { ProjectVisibility } from "@/types/project";

type Props = {
  projectId: string;
  initialVisibility: ProjectVisibility;
  /** Tighter control for compact cards */
  dense?: boolean;
};

const OPTIONS: { value: ProjectVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "unlisted", label: "Unlisted" },
  { value: "private", label: "Private" },
];

function Chevron({ className, open }: { className?: string; open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className ?? ""}`}
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

type MenuRect = { top: number; left: number; width: number };

function measureTrigger(el: HTMLButtonElement | null): MenuRect | null {
  if (!el) {
    return null;
  }
  const r = el.getBoundingClientRect();
  return { top: r.bottom + 4, left: r.left, width: r.width };
}

export function ProjectVisibilityControl({ projectId, initialVisibility, dense }: Props) {
  const router = useRouter();
  const id = useId();
  const listboxId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const [value, setValue] = useState(initialVisibility);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setValue(initialVisibility);
  }, [initialVisibility]);

  useEffect(() => {
    if (!isPending) {
      return;
    }
    setOpen(false);
    setMenuRect(null);
  }, [isPending]);

  const close = () => {
    setOpen(false);
    setMenuRect(null);
  };

  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const update = () => {
      setMenuRect(measureTrigger(triggerRef.current));
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || menuRef.current?.contains(t)) {
        return;
      }
      close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
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
    ? "flex w-full min-w-[8.25rem] max-w-[9.5rem] cursor-pointer items-center justify-between gap-1 rounded border border-zinc-700/55 bg-zinc-900/90 px-2 py-1 text-left text-[10px] font-medium text-zinc-300 outline-none transition-[border-color,background-color,color] hover:border-zinc-600/70 hover:bg-zinc-900 hover:text-zinc-200 focus-visible:border-zinc-500/70 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-45"
    : "flex w-full min-w-[9.5rem] max-w-[12rem] cursor-pointer items-center justify-between gap-2 rounded-md border border-zinc-700/55 bg-zinc-900/90 px-2.5 py-1.5 text-left text-[11px] font-medium text-zinc-300 outline-none transition-[border-color,background-color,color] hover:border-zinc-600/70 hover:bg-zinc-900 hover:text-zinc-200 focus-visible:border-zinc-500/70 focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-45";

  const optionClass = (selected: boolean) =>
    [
      "cursor-pointer px-2.5 py-1.5 text-left transition-colors duration-100",
      dense ? "text-[10px]" : "text-[11px]",
      selected
        ? "bg-zinc-800/80 text-zinc-100"
        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
    ].join(" ");

  const listboxClass =
    "max-h-[min(12rem,calc(100vh-2rem))] overflow-y-auto overflow-x-hidden rounded-md border border-zinc-700/75 bg-zinc-950 py-1 shadow-xl shadow-black/50 ring-1 ring-zinc-800/90";

  const runSave = (next: ProjectVisibility) => {
    if (next === value) return;
    setError(null);
    const previous = value;
    setValue(next);
    startTransition(async () => {
      const result = await updateProjectVisibilityAction(projectId, next);
      if (!result.ok) {
        setValue(previous);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const currentLabel = OPTIONS.find((o) => o.value === value)?.label ?? value;

  const openMenu = () => {
    setMenuRect(measureTrigger(triggerRef.current));
    setOpen(true);
  };

  const toggleMenu = () => {
    if (open) {
      close();
    } else {
      openMenu();
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
        {OPTIONS.map((o) => (
          <li
            key={o.value}
            role="option"
            aria-selected={value === o.value}
            id={`${id}-opt-${o.value}`}
            className={optionClass(value === o.value)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              close();
              runSave(o.value);
            }}
          >
            {o.label}
          </li>
        ))}
      </ul>,
      document.body,
    );

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 ${dense ? "max-w-[9.5rem]" : "max-w-[12rem]"}`}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={isPending}
        aria-busy={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`Visibility: ${currentLabel}`}
        onClick={toggleMenu}
        className={triggerClass}
      >
        <span className="min-w-0 truncate">{currentLabel}</span>
        <Chevron open={open} />
      </button>

      {menuPortal}

      {isPending || error ? (
        <p
          className={`mt-1 text-[10px] leading-snug ${error ? "text-red-400/85" : "text-zinc-500"}`}
          role={error ? "alert" : "status"}
        >
          {error ?? "Saving…"}
        </p>
      ) : null}
    </div>
  );
}
