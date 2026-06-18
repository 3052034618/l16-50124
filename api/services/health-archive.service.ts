import { DataRepository } from '../data/repository.js';
import type { HealthArchive, TrendData, ReportIndicator } from '../../shared/types.js';

export const HealthArchiveService = {
  getArchive(employeeId: string): HealthArchive | null {
    const employee = DataRepository.findUserById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return null;
    }

    const reports = DataRepository.getReportsByEmployee(employeeId)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

    const years = [...new Set(reports.map(r => new Date(r.examDate).getFullYear()))];

    const yearlyReports = reports.map(report => ({
      year: new Date(report.examDate).getFullYear(),
      reportId: report.id,
      examDate: report.examDate,
      overallStatus: report.overallStatus,
      indicators: report.indicators,
    }));

    return {
      employeeId,
      employeeName: employee.name,
      years,
      yearlyReports,
    };
  },

  getTrendData(employeeId: string, indicatorName: string): TrendData | null {
    const reports = DataRepository.getReportsByEmployee(employeeId)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());

    const dataPoints: { year: number; value: number; status: ReportIndicator['status'] }[] = [];
    let unit = '';
    let referenceRange = '';

    reports.forEach(report => {
      const indicator = report.indicators.find(i => i.name === indicatorName);
      if (indicator) {
        const numValue = parseFloat(indicator.value);
        if (!isNaN(numValue)) {
          dataPoints.push({
            year: new Date(report.examDate).getFullYear(),
            value: numValue,
            status: indicator.status,
          });
        }
        if (!unit) unit = indicator.unit;
        if (!referenceRange) referenceRange = indicator.referenceRange;
      }
    });

    if (dataPoints.length === 0) {
      return null;
    }

    return {
      indicatorName,
      unit,
      referenceRange,
      dataPoints,
    };
  },

  getAvailableIndicators(employeeId: string): string[] {
    const reports = DataRepository.getReportsByEmployee(employeeId);
    const indicatorSet = new Set<string>();

    reports.forEach(report => {
      report.indicators.forEach(indicator => {
        indicatorSet.add(indicator.name);
      });
    });

    return Array.from(indicatorSet).sort();
  },
};
