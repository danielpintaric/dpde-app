"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type ProjectEditorSessionValue = {
  projectDirty: boolean;
  imageDetailsDirty: boolean;
  projectSaving: boolean;
  imageDetailsSaving: boolean;
  setProjectDirty: Dispatch<SetStateAction<boolean>>;
  setImageDetailsDirty: Dispatch<SetStateAction<boolean>>;
  setProjectSaving: Dispatch<SetStateAction<boolean>>;
  setImageDetailsSaving: Dispatch<SetStateAction<boolean>>;
};

const ProjectEditorSessionContext = createContext<ProjectEditorSessionValue | null>(null);

export function ProjectEditorSessionProvider({ children }: { children: ReactNode }) {
  const [projectDirty, setProjectDirty] = useState(false);
  const [imageDetailsDirty, setImageDetailsDirty] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [imageDetailsSaving, setImageDetailsSaving] = useState(false);

  const value = useMemo(
    () => ({
      projectDirty,
      imageDetailsDirty,
      projectSaving,
      imageDetailsSaving,
      setProjectDirty,
      setImageDetailsDirty,
      setProjectSaving,
      setImageDetailsSaving,
    }),
    [projectDirty, imageDetailsDirty, projectSaving, imageDetailsSaving],
  );

  return (
    <ProjectEditorSessionContext.Provider value={value}>{children}</ProjectEditorSessionContext.Provider>
  );
}

export function useProjectEditorSession(): ProjectEditorSessionValue | null {
  return useContext(ProjectEditorSessionContext);
}
