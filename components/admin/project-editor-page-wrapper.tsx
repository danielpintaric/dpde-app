"use client";

import type { ReactNode } from "react";
import { ProjectEditorSaveShortcut } from "@/components/admin/project-editor-save-shortcut";
import { ProjectEditorSessionProvider } from "@/components/admin/project-editor-session-context";

export function ProjectEditorPageWrapper({ children }: { children: ReactNode }) {
  return (
    <ProjectEditorSessionProvider>
      <ProjectEditorSaveShortcut />
      {children}
    </ProjectEditorSessionProvider>
  );
}
