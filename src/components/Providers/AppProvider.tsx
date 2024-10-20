"use client";

import React, { useEffect } from "react";
import { createInstance, useMatomo } from "@cesnow/matomo-next";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { setInstance } = useMatomo();

  useEffect(() => {
    const instance = createInstance({
      urlBase: "https://LINK.TO.DOMAIN",
      siteId: 3,
      userId: "UID76903202", // optional, default value: `undefined`.
      trackerUrl: "https://LINK.TO.DOMAIN/tracking.php", // optional, default value: `${urlBase}matomo.php`
      srcUrl: "https://LINK.TO.DOMAIN/tracking.js", // optional, default value: `${urlBase}matomo.js`
      permanentTitle: "My Awesome App", // optional, always use this title for tracking, ignores document.title. Useful for SPAs.
      permanentHref: "/", // optional, always use this href for tracking, ignores window.location.href. Useful for SPAs.
      disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
      heartBeat: {
        // optional, enabled by default
        active: true, // optional, default value: true
        seconds: 10, // optional, default value: 15
      },
      linkTracking: false, // optional, default value: true
      configurations: {
        // optional, default value: {}
        // any valid matomo configuration, all below are optional
        disableCookies: true,
        setSecureCookie: true,
        setRequestMethod: "POST",
      },
    });
    setInstance(instance);
  }, []);

  return <></>;
}
