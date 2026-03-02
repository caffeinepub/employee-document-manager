import { useCallback, useEffect, useState } from "react";

interface AdminProfile {
  name: string;
  email: string;
}

function profileKey(email: string) {
  return `adminProfile:${email}`;
}

function loadProfile(email: string): AdminProfile {
  if (!email) return { name: "", email: "" };
  try {
    const raw = localStorage.getItem(profileKey(email));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminProfile>;
      if (parsed.name && parsed.email) {
        return { name: parsed.name, email: parsed.email };
      }
    }
  } catch {
    // ignore malformed JSON
  }
  // Default: derive name from email prefix, use actual login email
  const namePart = email.split("@")[0].replace(/[._-]/g, " ");
  const name = namePart
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { name, email };
}

export function useProfile(loginEmail: string) {
  const [profile, setProfile] = useState<AdminProfile>(() =>
    loadProfile(loginEmail),
  );

  // Re-load profile whenever the logged-in account changes
  useEffect(() => {
    setProfile(loadProfile(loginEmail));
  }, [loginEmail]);

  const updateProfile = useCallback(
    (name: string, email: string) => {
      const next: AdminProfile = { name, email };
      // Store under the current login email key
      localStorage.setItem(profileKey(loginEmail), JSON.stringify(next));
      setProfile(next);
    },
    [loginEmail],
  );

  return { profile, updateProfile };
}
