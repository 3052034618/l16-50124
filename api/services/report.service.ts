import { DataRepository } from '../data/repository.js';
import type { Report, ReportIndicator } from '../../shared/types.js';

export const ReportService = {
  getAll(filters?: {
    employeeId?: string;
    institutionId?: string;
    year?: number;
  }): Report[] {
    let reports = DataRepository.getReports();

    if (filters?.employeeId) {
      reports = reports.filter(r => r.employeeId === filters.employeeId);
    }
    if (filters?.institutionId) {
      reports = reports.filter(r => r.institutionId === filters.institutionId);
    }
    if (filters?.year) {
      reports = reports.filter(r => new Date(r.examDate).getFullYear() === filters.year);
    }

    return reports.sort((a, b) =>
      new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
    );
  },

  getById(id: string): Report | null {
    return DataRepository.getReportById(id) || null;
  },

  getByEmployee(employeeId: string): Report[] {
    return DataRepository.getReportsByEmployee(employeeId).sort((a, b) =>
      new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
    );
  },

  getByInstitution(institutionId: string): Report[] {
    return DataRepository.getReportsByInstitution(institutionId).sort((a, b) =>
      new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
    );
  },

  create(data: Omit<Report, 'id' | 'uploadDate' | 'indicators'> & { indicators: ReportIndicator[] }): Report {
    const newReport: Report = {
      ...data,
      id: `rpt-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    } as Report;
    DataRepository.addReport(newReport);
    return newReport;
  },
};
