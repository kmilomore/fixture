import { normalizeText } from "@/shared/domain/text-normalization";

export function normalizeEstablishmentName(value: string) {
  return normalizeText(value);
}

export function normalizeComuna(value: string | null | undefined) {
  const comuna = value?.trim();
  return comuna ? comuna : null;
}
