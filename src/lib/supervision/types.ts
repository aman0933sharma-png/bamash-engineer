export type Verdict = "Passed" | "Hold" | "Failed";
export type Severity = "Minor" | "Major" | "Critical";
export type CloseState = "Open" | "Closed";
export type SafetyLevel = "Low" | "Medium" | "High";
export type Weather = "Clear" | "Cloudy" | "Rain" | "Fog";
export type View = "desk" | "diary" | "inspect" | "ncr" | "measure" | "bridge" | "safety";

export type CheckKind =
  | "Reinforcement"
  | "Formwork"
  | "Concrete"
  | "Earthwork"
  | "Bituminous"
  | "Safety";

export type CheckItem = {
  id: string;
  label: string;
  ok: boolean | null;
};

export type DiaryEntry = {
  id: string;
  date: string;
  weather: Weather;
  tempC: number;
  labour: number;
  plant: string;
  fromCh: string;
  toCh: string;
  work: string;
  instructions: string;
  visitors: string;
};

export type Inspection = {
  id: string;
  no: string;
  date: string;
  kind: CheckKind;
  location: string;
  structure: string;
  status: Verdict;
  inspector: string;
  notes: string;
  checks: CheckItem[];
};

export type Ncr = {
  id: string;
  no: string;
  date: string;
  location: string;
  severity: Severity;
  title: string;
  description: string;
  action: string;
  status: CloseState;
  closedOn?: string;
};

export type BoqItem = {
  id: string;
  code: string;
  name: string;
  unit: string;
  boqQty: number;
  executed: number;
  rate: number;
};

export type Measurement = {
  id: string;
  date: string;
  itemId: string;
  qty: number;
  location: string;
  mbRef: string;
};

export type SafetyNote = {
  id: string;
  date: string;
  location: string;
  hazard: string;
  level: SafetyLevel;
  status: CloseState;
};

export type Structure = {
  id: string;
  short: string;
  name: string;
  kind: string;
  chainage: number;
  progress: number;
  stage: string;
  next: string;
};

export type DeskData = {
  diary: DiaryEntry[];
  inspections: Inspection[];
  ncrs: Ncr[];
  boq: BoqItem[];
  measurements: Measurement[];
  safety: SafetyNote[];
  structures: Structure[];
};
