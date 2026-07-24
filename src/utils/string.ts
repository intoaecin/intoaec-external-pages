export function toLowerNoSpace(word: string) {
  return word?.toLowerCase()?.replace(/\s+/g, "");
}

export function titleCase(word: string) {
  return word?.charAt(0).toUpperCase() + word?.slice(1).toLowerCase();
}

export function base64Encode(word?: string | null) {
  const safeWord = word ?? "";
  if (typeof window !== "undefined" && typeof btoa === "function") {
    const bytes = new TextEncoder().encode(safeWord);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  return Buffer.from(safeWord, "utf-8").toString("base64");
}

export function base64Decode(word?: string | null) {
  const safeWord = word ?? "";
  if (typeof window !== "undefined" && typeof atob === "function") {
    const binary = atob(safeWord);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(safeWord, "base64").toString("utf-8");
}

export function toCamelNoSpace(word: string): string {
  if(!word) return "";
  return word
    .toLowerCase()
    .split(/[_\s-/]+/) 
    .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}
