export const ACADEMY_VIEWER_STORAGE_KEY = "cruisestack-academy-viewer";

export type AcademyViewerProfile = {
  name: string;
  email: string;
  mobile: string;
};

export function getAcademyViewerProfile(): AcademyViewerProfile | null {
  try {
    const value = localStorage.getItem(ACADEMY_VIEWER_STORAGE_KEY);
    if (!value) return null;

    const profile = JSON.parse(value);
    if (
      typeof profile?.name !== "string" ||
      typeof profile?.email !== "string" ||
      typeof profile?.mobile !== "string" ||
      !profile.name.trim() ||
      !profile.email.trim() ||
      !profile.mobile.trim()
    ) {
      return null;
    }

    return {
      name: profile.name.trim(),
      email: profile.email.trim(),
      mobile: profile.mobile.trim(),
    };
  } catch {
    return null;
  }
}

export function saveAcademyViewerProfile(profile: AcademyViewerProfile) {
  localStorage.setItem(ACADEMY_VIEWER_STORAGE_KEY, JSON.stringify(profile));
}

export function splitAcademyViewerPhone(mobile: string) {
  const codes = ["+971", "+91", "+65", "+61", "+49", "+44", "+1"];
  const normalized = mobile.trim().replace(/\s+/g, " ");
  const code = codes.find((value) => normalized.startsWith(value)) ?? "+91";

  return {
    code,
    number:
      code && normalized.startsWith(code)
        ? normalized.slice(code.length).trim()
        : normalized,
  };
}
