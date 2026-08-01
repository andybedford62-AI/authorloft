"use client";

import { useState, useEffect } from "react";

export interface SupportEmailOption {
  id:    string;
  label: string;
  email: string;
}

// Active-only Support Emails (Settings → Email Addresses), for reply-to pickers.
export function useActiveSupportEmails() {
  const [emails,  setEmails]  = useState<SupportEmailOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/super-admin/support-emails")
      .then(r => r.json())
      .then((all: (SupportEmailOption & { isActive: boolean })[]) => {
        setEmails(all.filter(e => e.isActive).map(({ id, label, email }) => ({ id, label, email })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { emails, loading };
}
