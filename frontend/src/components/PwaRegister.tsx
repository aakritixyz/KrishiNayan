"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    const offlineEnabled =
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_ENABLE_OFFLINE_SW === "true";

    if (
      "serviceWorker" in navigator &&
      offlineEnabled
    ) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
