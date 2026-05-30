"use client";

import { useEffect } from "react";
import { setStoredCreatorReferralCode } from "@/lib/authSession";

const REFERRAL_KEYS = ["ref", "referral", "creator"];

export default function ReferralCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    for (const key of REFERRAL_KEYS) {
      const code = params.get(key)?.trim();
      if (code) {
        setStoredCreatorReferralCode(code);
        break;
      }
    }
  }, []);

  return null;
}
