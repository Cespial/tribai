export function normalizeForSearch(input: string): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeSlugLike(input: string): string {
  return normalizeForSearch(input)
    .replace(/[^a-z0-9- ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ");
}
