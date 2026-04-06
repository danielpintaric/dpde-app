"use client";

import { useEffect, useRef } from "react";
import { useProjectEditorSession } from "@/components/admin/project-editor-session-context";

function findTaggedForm(role: "project" | "image-details"): HTMLFormElement | null {
  return document.querySelector<HTMLFormElement>(`form[data-editor-save="${role}"]`);
}

/**
 * Cmd+S / Ctrl+S: speichert das Projekt- oder Inspector-Formular (je nach Fokus bzw. Fallback).
 * Nur aktiv, wenn {@link ProjectEditorSessionProvider} vorhanden ist.
 */
export function ProjectEditorSaveShortcut() {
  const session = useProjectEditorSession();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        return;
      }
      if (e.key.toLowerCase() !== "s") {
        return;
      }
      e.preventDefault();

      if (e.repeat) {
        return;
      }

      const s = sessionRef.current;
      if (!s) {
        return;
      }

      const {
        projectSaving,
        imageDetailsSaving,
        projectDirty,
        imageDetailsDirty,
      } = s;

      const active = document.activeElement;
      const hostForm =
        active instanceof HTMLElement ? active.closest<HTMLFormElement>("form[data-editor-save]") : null;
      const tag = hostForm?.dataset.editorSave;

      const tryProject = () => {
        if (projectSaving) {
          return;
        }
        findTaggedForm("project")?.requestSubmit();
      };

      const tryImageDetails = () => {
        if (!imageDetailsDirty || imageDetailsSaving) {
          return;
        }
        findTaggedForm("image-details")?.requestSubmit();
      };

      if (tag === "project") {
        tryProject();
        return;
      }
      if (tag === "image-details") {
        tryImageDetails();
        return;
      }

      if (imageDetailsDirty && !imageDetailsSaving) {
        findTaggedForm("image-details")?.requestSubmit();
      } else if (projectDirty && !projectSaving) {
        findTaggedForm("project")?.requestSubmit();
      }
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, []);

  return null;
}
