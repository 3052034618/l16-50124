import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  Package,
  Institution,
  Appointment,
  Report,
} from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function readJSONFile<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function writeJSONFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const DataRepository = {
  getUsers(): User[] {
    return readJSONFile<User[]>('users.json');
  },

  findUserByUsername(username: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.username === username);
  },

  findUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  },

  getEmployees(): User[] {
    const users = this.getUsers();
    return users.filter(u => u.role === 'employee');
  },

  getPackages(): Package[] {
    return readJSONFile<Package[]>('packages.json');
  },

  getPackageById(id: string): Package | undefined {
    const packages = this.getPackages();
    return packages.find(p => p.id === id);
  },

  addPackage(pkg: Package): void {
    const packages = this.getPackages();
    packages.push(pkg);
    writeJSONFile('packages.json', packages);
  },

  updatePackage(id: string, pkg: Partial<Package>): void {
    const packages = this.getPackages();
    const index = packages.findIndex(p => p.id === id);
    if (index !== -1) {
      packages[index] = { ...packages[index], ...pkg };
      writeJSONFile('packages.json', packages);
    }
  },

  deletePackage(id: string): void {
    const packages = this.getPackages().filter(p => p.id !== id);
    writeJSONFile('packages.json', packages);
  },

  getInstitutions(): Institution[] {
    return readJSONFile<Institution[]>('institutions.json');
  },

  getInstitutionById(id: string): Institution | undefined {
    const institutions = this.getInstitutions();
    return institutions.find(i => i.id === id);
  },

  addInstitution(institution: Institution): void {
    const institutions = this.getInstitutions();
    institutions.push(institution);
    writeJSONFile('institutions.json', institutions);
  },

  updateInstitution(id: string, data: Partial<Institution>): void {
    const institutions = this.getInstitutions();
    const index = institutions.findIndex(i => i.id === id);
    if (index !== -1) {
      institutions[index] = { ...institutions[index], ...data };
      writeJSONFile('institutions.json', institutions);
    }
  },

  deleteInstitution(id: string): void {
    const institutions = this.getInstitutions().filter(i => i.id !== id);
    writeJSONFile('institutions.json', institutions);
  },

  getAppointments(): Appointment[] {
    return readJSONFile<Appointment[]>('appointments.json');
  },

  getAppointmentById(id: string): Appointment | undefined {
    const appointments = this.getAppointments();
    return appointments.find(a => a.id === id);
  },

  getAppointmentsByEmployee(employeeId: string): Appointment[] {
    return this.getAppointments().filter(a => a.employeeId === employeeId);
  },

  getAppointmentsByInstitution(institutionId: string): Appointment[] {
    return this.getAppointments().filter(a => a.institutionId === institutionId);
  },

  addAppointment(appointment: Appointment): void {
    const appointments = this.getAppointments();
    appointments.push(appointment);
    writeJSONFile('appointments.json', appointments);
  },

  updateAppointment(id: string, data: Partial<Appointment>): void {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...data };
      writeJSONFile('appointments.json', appointments);
    }
  },

  getReports(): Report[] {
    return readJSONFile<Report[]>('reports.json');
  },

  getReportById(id: string): Report | undefined {
    const reports = this.getReports();
    return reports.find(r => r.id === id);
  },

  getReportsByEmployee(employeeId: string): Report[] {
    return this.getReports().filter(r => r.employeeId === employeeId);
  },

  getReportsByInstitution(institutionId: string): Report[] {
    return this.getReports().filter(r => r.institutionId === institutionId);
  },

  addReport(report: Report): void {
    const reports = this.getReports();
    reports.push(report);
    writeJSONFile('reports.json', reports);
  },

  updateReport(id: string, data: Partial<Report>): void {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...data };
      writeJSONFile('reports.json', reports);
    }
  },
};
