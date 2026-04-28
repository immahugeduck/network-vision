export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ScanPhase = 'idle' | 'scanning' | 'complete';

export interface Tracker {
  id: string;
  name: string;
  company: string;
  detail: string;
  severity: SeverityLevel;
}

export interface SuspiciousFile {
  id: string;
  name: string;
  location: string;
  detail: string;
  severity: SeverityLevel;
}

export interface NetworkDevice {
  id: string;
  name: string;
  ipAddress: string;
  detail: string;
  severity: SeverityLevel;
}

export interface RFTower {
  id: string;
  carrier: string;
  band: string;
  signalStrength: number;
  status: string;
}

export interface ScanLogEntry {
  id: string;
  message: string;
  timestamp: Date;
}
