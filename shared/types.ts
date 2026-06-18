export type UserRole = 'hr' | 'employee' | 'institution';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  institutionId?: string;
  gender?: 'male' | 'female';
  age?: number;
}

export interface PackageItem {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  items: PackageItem[];
  applicableGender: 'all' | 'male' | 'female';
  minAge?: number;
  maxAge?: number;
  imageUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  businessHours: string;
  latitude?: number;
  longitude?: number;
  dates: { date: string; slots: TimeSlot[] }[];
}

export interface Institution {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  contactPhone: string;
  contactEmail?: string;
  stores: Store[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  packageId: string;
  packageName: string;
  institutionId: string;
  institutionName: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  createdAt: string;
  reportId?: string;
}

export type IndicatorStatus = 'normal' | 'low' | 'high' | 'abnormal';

export interface ReportIndicator {
  id: string;
  name: string;
  category: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: IndicatorStatus;
  description?: string;
}

export type ReportStatus = 'normal' | 'attention' | 'abnormal';

export interface Report {
  id: string;
  appointmentId: string;
  employeeId: string;
  employeeName: string;
  packageId: string;
  packageName: string;
  institutionId: string;
  institutionName: string;
  examDate: string;
  uploadDate: string;
  summary: string;
  overallStatus: ReportStatus;
  indicators: ReportIndicator[];
  pdfUrl?: string;
}

export interface ParticipationStats {
  totalEmployees: number;
  participatedCount: number;
  participationRate: number;
  byDepartment: { department: string; total: number; participated: number; rate: number }[];
  byAgeGroup: { ageGroup: string; total: number; participated: number; rate: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export interface AbnormalityStats {
  totalExamined: number;
  indicators: { name: string; abnormalCount: number; rate: number; rank: number }[];
  byDepartment: { department: string; indicator: string; rate: number }[];
  yearOverYear: { year: string; indicator: string; rate: number }[];
}

export interface HealthArchive {
  employeeId: string;
  employeeName: string;
  years: number[];
  yearlyReports: {
    year: number;
    reportId: string;
    examDate: string;
    overallStatus: ReportStatus;
    indicators: ReportIndicator[];
  }[];
}

export interface TrendData {
  indicatorName: string;
  unit: string;
  referenceRange: string;
  dataPoints: { year: number; value: number; status: IndicatorStatus }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}
