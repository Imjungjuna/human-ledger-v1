export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number | null;
  dischargingTime: number | null;
}

export interface GpsInfo {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  city?: string;
  administrativeArea?: string;
  country?: string;
  nearestPlace?: string;
  nearestPlaceDetails?: unknown;
}

export interface CollectedMetadata {
  userAgent?: string;
  os?: string;
  browser?: string;
  deviceMemory?: number | string;
  battery?: BatteryInfo | { error: string };
  screen?: {
    width: number;
    height: number;
    availWidth?: number;
    availHeight?: number;
    colorDepth?: number;
    pixelDepth?: number;
  };
  language?: string;
  languages?: readonly string[];
  timezone?: string;
  timezoneOffset?: number;
  ip?: string;
  region?: string;
  city?: string;
  isp?: string;
  gps?: GpsInfo | { error: string };
}
