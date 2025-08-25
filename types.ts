// This tells TypeScript that the XLSX global variable exists,
// as it's loaded from a CDN script in index.html.
declare var XLSX: any;

export interface ApiKey {
  id: string;
  value: string;
}

export interface Reference {
  id: string;
  name: string;
  imageBase64: string;
}

export interface AttendanceEntry {
  referenceId: string;
  timestamp: number; // Unix timestamp
}

export interface SessionRecord {
  id: string;
  name: string;
  date: number; // Unix timestamp
  attendance: AttendanceEntry[];
}

export interface ClassRecord {
  id:string;
  name: string;
  references: Reference[];
  sessions: SessionRecord[];
}

export enum ComparisonStatus {
  Idle = 'IDLE',
  Checking = 'CHECKING',
  Match = 'MATCH',
  NoMatch = 'NO_MATCH',
  Error = 'ERROR',
}
