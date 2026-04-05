export function supabaseReadError(
  context: string,
  message: string,
  code?: string,
): Error {
  const codePart = code ? ` [${code}]` : "";
  return new Error(`Supabase ${context} failed:${codePart} ${message}`);
}
