import { normalizeText } from "@/shared/domain/text-normalization";

export function normalizeCatalogName(value: string) {
  return normalizeText(value);
}
