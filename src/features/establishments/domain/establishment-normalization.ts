export function normalizeEstablishmentName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeComuna(value: string | null | undefined) {
  const comuna = value?.trim();
  return comuna ? comuna : null;
}