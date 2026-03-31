"use client";

import { useState, useEffect, useRef } from "react";

type Metadata = Record<string, unknown>;

export function useMetadataCollector(onLog?: (message: string, type?: "warning") => void) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const hasCollected = useRef(false);

  useEffect(() => {
    if (hasCollected.current) return;

    const collectMetadata = async () => {
      hasCollected.current = true;
      const data: Metadata = {};

      if (typeof navigator === "undefined") {
        setMetadata(data);
        return;
      }

      data.userAgent = navigator.userAgent;

      const osMatch = navigator.userAgent.match(/(Windows|Mac|Linux|Android|iOS|iPhone|iPad)/i);
      data.os = osMatch ? osMatch[1] : "Unknown";

      const browserMatch = navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera|Brave)/i);
      data.browser = browserMatch ? browserMatch[1] : "Unknown";

      data.deviceMemory =
        "deviceMemory" in navigator ? (navigator as unknown as { deviceMemory: number }).deviceMemory : "Not available";

      if ("getBattery" in navigator) {
        try {
          const battery = await (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean; chargingTime: number; dischargingTime: number }> }).getBattery();
          data.battery = {
            level: Math.round(battery.level * 100),
            charging: battery.charging,
            chargingTime: battery.chargingTime !== Infinity ? battery.chargingTime : null,
            dischargingTime: battery.dischargingTime !== Infinity ? battery.dischargingTime : null,
          };
        } catch {
          data.battery = { error: "Failed to get battery info" };
        }
      } else {
        data.battery = { error: "Battery API not supported" };
      }

      if (typeof window !== "undefined") {
        data.screen = {
          width: window.screen.width,
          height: window.screen.height,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth,
        };
      }

      data.language = navigator.language;
      data.languages = navigator.languages;
      data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      data.timezoneOffset = new Date().getTimezoneOffset();
      data.ip = "Unknown";
      data.region = "Unknown";
      data.city = "Unknown";
      data.isp = "Unknown";

      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            });
          });

          const { latitude, longitude, accuracy } = position.coords;
          const gps: Record<string, unknown> = { latitude, longitude, accuracy };

          try {
            const reverseGeoResponse = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ko`
            );
            const reverseGeoData = await reverseGeoResponse.json();

            const address = reverseGeoData.locality
              ? `${reverseGeoData.principalSubdivision || ""} ${reverseGeoData.locality || ""} ${reverseGeoData.localityInfo?.administrative?.[0]?.name || ""}`.trim()
              : reverseGeoData.formatted || "Unknown";

            gps.address = address;
            gps.city = reverseGeoData.locality || "Unknown";
            gps.administrativeArea = reverseGeoData.principalSubdivision || "Unknown";
            gps.country = reverseGeoData.countryName || "Unknown";
          } catch {
            gps.address = "Failed to reverse geocode";
          }

          try {
            const placeResponse = await fetch("/api/trace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ latitude, longitude }),
            });
            if (placeResponse.ok) {
              const placeData = await placeResponse.json();
              gps.nearestPlace = placeData.place;
              gps.nearestPlaceDetails = placeData.details;
            }
          } catch {
            gps.nearestPlace = "지하 은신처";
          }

          data.gps = gps;
        } catch (geoError: unknown) {
          const err = geoError as GeolocationPositionError;
          if (err.code === 1) {
            const warningMsg = "[WARNING] 피험자 위치 은폐 시도 감지. IP 기반 광역 추적 모드로 전환.";
            onLog?.(warningMsg, "warning");
          }
          data.gps = { error: "Location access denied or failed" };
        }
      } else {
        data.gps = { error: "Geolocation not supported" };
      }

      setMetadata(data);
    };

    collectMetadata();
  }, [onLog]);

  return metadata;
}
