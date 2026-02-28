import { useCallback, useState } from "react";

interface AdminProfile {
  name: string;
  email: string;
}

const STORAGE_KEY = "adminProfile";

function loadProfile(): AdminProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminProfile>;
      if (parsed.name && parsed.email) {
        return { name: parsed.name, email: parsed.email };
      }
    }
  } catch {
    // ignore
  }

  // Seed email from session (set at login time)
  const seedEmail = sessionStorage.getItem("loginEmail") ?? "";
  return { name: "Admin User", email: seedEmail || "admin@example.com" };
}

export function useProfile() {
  const [profile, setProfile] = useState<AdminProfile>(loadProfile);

  const updateProfile = useCallback((name: string, email: string) => {
    const next: AdminProfile = { name, email };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
  }, []);

  return { profile, updateProfile };
}
