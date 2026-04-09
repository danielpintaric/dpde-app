/**
 * Returns true when ArrowLeft/ArrowRight should not drive batch image navigation
 * (e.g. user is typing in a text field or using a select).
 */
export function isArrowNavBlockedForBatch(): boolean {
  const el = document.activeElement;
  if (!el || !(el instanceof HTMLElement)) {
    return false;
  }
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  if (el.getAttribute("contenteditable") === "true") {
    return true;
  }
  if (tag === "INPUT") {
    const t = (el as HTMLInputElement).type;
    if (
      t === "button" ||
      t === "submit" ||
      t === "reset" ||
      t === "checkbox" ||
      t === "radio" ||
      t === "file" ||
      t === "hidden"
    ) {
      return false;
    }
    return true;
  }
  return false;
}
