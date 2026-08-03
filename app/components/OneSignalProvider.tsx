"use client";

import { useEffect } from "react";

const ONESIGNAL_APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ??
  "31a09366-031c-48bb-bc53-38bbada03669";

type OneSignalSdk = {
  init(options: {
    appId: string;
    serviceWorkerPath: string;
    serviceWorkerParam: { scope: string };
  }): Promise<void>;
};

declare global {
  interface Window {
    OneSignalDeferred?: Array<(oneSignal: OneSignalSdk) => void | Promise<void>>;
  }
}

export function OneSignalProvider() {
  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (oneSignal) => {
      await oneSignal.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
        serviceWorkerParam: { scope: "/" },
      });
    });

    if (document.querySelector('script[data-bookkit-onesignal="true"]')) return;

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.dataset.bookkitOnesignal = "true";
    document.head.appendChild(script);
  }, []);

  return null;
}
