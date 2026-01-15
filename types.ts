
export interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface Training {
  id: string;
  title: string;
  links: LinkItem[];
}

export interface Company {
  id: string;
  name: string;
  cuit: string;
}

export interface InstructorProfile {
  name: string;
  role: string;
  signature: string; // Base64 Data URL
}

export interface AttendanceRecord {
  id: string;
  trainingId: string;
  companyId: string;
  employeeName: string;
  employeeDni: string;
  signature: string; // Base64 Data URL
  timestamp: number;
}

export interface AppState {
  instructor: InstructorProfile | null;
  companies: Company[];
  trainings: Training[];
  attendances: AttendanceRecord[];
}
