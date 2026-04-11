"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

function selectionStorageKey(token: string, projectSlug: string): string {
  return `dpde:client-selection:${token}:${projectSlug}`;
}

function readStoredSelectionIds(token: string, projectSlug: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(selectionStorageKey(token, projectSlug));
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
}

function mergeInitialSelection(serverIds: string[], token: string, projectSlug: string): Set<string> {
  const fromServer = new Set(serverIds);
  const fromLocal = readStoredSelectionIds(token, projectSlug);
  if (fromLocal.length === 0) {
    return fromServer;
  }
  return new Set([...fromServer, ...fromLocal]);
}

type ClientSelectionContextValue = {
  token: string;
  projectSlug: string;
  selected: ReadonlySet<string>;
  toggle: (imageId: string) => void;
  selectedCount: number;
};

const ClientSelectionContext = createContext<ClientSelectionContextValue | null>(null);

export function useOptionalClientSelection(): ClientSelectionContextValue | null {
  return useContext(ClientSelectionContext);
}

export function ClientSelectionProvider({
  token,
  projectSlug,
  initialSelectedIds,
  children,
}: {
  token: string;
  projectSlug: string;
  initialSelectedIds: string[];
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(
    () => mergeInitialSelection(initialSelectedIds, token, projectSlug),
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        selectionStorageKey(token, projectSlug),
        JSON.stringify([...selected]),
      );
    } catch {
      /* ignore quota / private mode */
    }
  }, [token, projectSlug, selected]);

  const toggle = useCallback(
    (imageId: string) => {
      let hadSelected = false;
      setSelected((prev) => {
        hadSelected = prev.has(imageId);
        const next = new Set(prev);
        if (hadSelected) {
          next.delete(imageId);
        } else {
          next.add(imageId);
        }
        return next;
      });

      void (async () => {
        try {
          const res = await fetch("/api/client/selection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token,
              project: projectSlug,
              imageId,
              action: "toggle",
            }),
          });
          const data: { selected?: boolean; error?: string } = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(typeof data.error === "string" ? data.error : "request failed");
          }
          if (typeof data.selected === "boolean") {
            setSelected((prev) => {
              const next = new Set(prev);
              if (data.selected) {
                next.add(imageId);
              } else {
                next.delete(imageId);
              }
              return next;
            });
          }
        } catch {
          setSelected((prev) => {
            const next = new Set(prev);
            if (hadSelected) {
              next.add(imageId);
            } else {
              next.delete(imageId);
            }
            return next;
          });
        }
      })();
    },
    [token, projectSlug],
  );

  const value = useMemo(
    (): ClientSelectionContextValue => ({
      token,
      projectSlug,
      selected,
      toggle,
      selectedCount: selected.size,
    }),
    [token, projectSlug, selected, toggle],
  );

  return (
    <ClientSelectionContext.Provider value={value}>{children}</ClientSelectionContext.Provider>
  );
}
