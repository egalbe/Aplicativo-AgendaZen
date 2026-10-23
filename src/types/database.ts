export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MemberRole = "owner" | "admin" | "professional" | "receptionist" | "financial";
export type SlotStatus = "free" | "reserved" | "blocked";
export type ApptStatus =
  | "scheduled"
  | "confirmed"
  | "checked_in"
  | "in_progress"
  | "done"
  | "no_show"
  | "cancelled"
  | "rescheduled";
export type Specialty = "physio" | "acupuncture" | "both";

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  document?: string;
  phone?: string;
  address?: Json;
  logo_url?: string;
  trial_ends_at: string;
  created_at: string;
}

export interface ClinicMember {
  id: string;
  clinic_id: string;
  user_id: string;
  role: MemberRole;
}

export interface Professional {
  id: string;
  clinic_id: string;
  member_id?: string;
  name: string;
  specialty: Specialty;
  council_number?: string;
  color: string;
  active: boolean;
}

export interface PatientSegment {
  id: string;
  clinic_id: string;
  name: string;
  is_default: boolean;
}

export interface Patient {
  id: string;
  clinic_id: string;
  user_id?: string;
  full_name: string;
  cpf?: string;
  birth_date?: string;
  sex?: string;
  phone?: string;
  email?: string;
  address?: Json;
  segment_id?: string;
  lgpd_consent_at?: string;
  lgpd_consent_ip?: string;
  active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  clinic_id: string;
  name: string;
  specialty: Specialty;
  duration_min: number;
  active: boolean;
}

export interface ServicePrice {
  id: string;
  clinic_id: string;
  service_id: string;
  segment_id: string;
  mode: "single" | "package" | "loyalty";
  price: number;
  sessions?: number;
  valid_days?: number;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  professional_id: string;
  patient_id: string;
  service_id?: string;
  period: string; // tstzrange
  status: ApptStatus;
  notes?: string;
  created_at: string;
}

export interface BodyMarking {
  id: string;
  view: "front" | "back";
  x: number;
  y: number;
  kind: "dor" | "contratura" | "edema" | "limitacao" | "lesao";
  intensity: number;
  note?: string;
}

export interface AcupuncturePoint {
  code: string;
  pinyin?: string;
  name_pt?: string;
  meridian: string;
  location?: string;
  view?: "front" | "back" | "side";
  x?: number;
  y?: number;
  needs_review: boolean;
}
