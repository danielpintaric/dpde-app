/**
 * Stable serialization of `/admin/site` form values for dirty-state comparison.
 * Mirrors how the browser submits the form (checkboxes only when checked, etc.).
 */
export function serializeFormSnapshot(form: HTMLFormElement): string {
  const parts: [string, string][] = [];
  const elements = form.elements;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!(el instanceof HTMLElement)) {
      continue;
    }
    const name = el.getAttribute("name");
    if (!name) {
      continue;
    }
    if (el instanceof HTMLInputElement) {
      const t = el.type;
      if (t === "checkbox" || t === "radio") {
        if (el.checked) {
          parts.push([name, el.value]);
        }
      } else if (t !== "file" && t !== "submit" && t !== "button" && t !== "reset") {
        parts.push([name, el.value]);
      }
    } else if (el instanceof HTMLTextAreaElement) {
      parts.push([name, el.value]);
    } else if (el instanceof HTMLSelectElement) {
      parts.push([name, el.value]);
    }
  }
  parts.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
  return JSON.stringify(parts);
}
