import { DataRepository } from '../data/repository.js';
import type { ParticipationStats, AbnormalityStats } from '../../shared/types.js';

export const StatisticsService = {
  getParticipationStats(): ParticipationStats {
    const employees = DataRepository.getEmployees();
    const appointments = DataRepository.getAppointments();
    const completedAppointments = appointments.filter(a => a.status !== 'cancelled');

    const participatedEmployeeIds = new Set(
      completedAppointments.map(a => a.employeeId)
    );
    const participatedCount = participatedEmployeeIds.size;
    const totalEmployees = employees.length;
    const participationRate = totalEmployees > 0
      ? Math.round((participatedCount / totalEmployees) * 1000) / 10
      : 0;

    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
    const byDepartment = departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptParticipated = deptEmployees.filter(e =>
        participatedEmployeeIds.has(e.id)
      ).length;
      return {
        department: dept || '未知',
        total: deptEmployees.length,
        participated: deptParticipated,
        rate: deptEmployees.length > 0
          ? Math.round((deptParticipated / deptEmployees.length) * 1000) / 10
          : 0,
      };
    });

    const ageGroups = ['20-29', '30-39', '40-49', '50+'];
    const byAgeGroup = ageGroups.map(ageGroup => {
      let minAge = 0, maxAge = 999;
      if (ageGroup === '20-29') { minAge = 20; maxAge = 29; }
      else if (ageGroup === '30-39') { minAge = 30; maxAge = 39; }
      else if (ageGroup === '40-49') { minAge = 40; maxAge = 49; }
      else if (ageGroup === '50+') { minAge = 50; maxAge = 999; }

      const ageEmployees = employees.filter(e => {
        const age = e.age || 30;
        return age >= minAge && age <= maxAge;
      });
      const ageParticipated = ageEmployees.filter(e =>
        participatedEmployeeIds.has(e.id)
      ).length;

      return {
        ageGroup,
        total: ageEmployees.length,
        participated: ageParticipated,
        rate: ageEmployees.length > 0
          ? Math.round((ageParticipated / ageEmployees.length) * 1000) / 10
          : 0,
      };
    });

    const monthMap = new Map<string, number>();
    completedAppointments.forEach(apt => {
      const month = apt.appointmentDate.slice(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
    const monthlyTrend = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    return {
      totalEmployees,
      participatedCount,
      participationRate,
      byDepartment,
      byAgeGroup,
      monthlyTrend,
    };
  },

  getAbnormalityStats(): AbnormalityStats {
    const reports = DataRepository.getReports();
    const totalExamined = reports.length;

    const indicatorMap = new Map<string, { abnormalCount: number; total: number }>();

    reports.forEach(report => {
      report.indicators.forEach(indicator => {
        if (!indicatorMap.has(indicator.name)) {
          indicatorMap.set(indicator.name, { abnormalCount: 0, total: 0 });
        }
        const entry = indicatorMap.get(indicator.name)!;
        entry.total += 1;
        if (indicator.status !== 'normal') {
          entry.abnormalCount += 1;
        }
      });
    });

    const indicators = Array.from(indicatorMap.entries())
      .map(([name, data]) => ({
        name,
        abnormalCount: data.abnormalCount,
        rate: data.total > 0
          ? Math.round((data.abnormalCount / data.total) * 1000) / 10
          : 0,
        rank: 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .map((item, index) => ({ ...item, rank: index + 1 }))
      .slice(0, 15);

    const departments = ['技术部', '市场部', '财务部', '人事部'];
    const byDeptMap = new Map<string, Map<string, { abnormal: number; total: number }>>();

    departments.forEach(dept => {
      byDeptMap.set(dept, new Map());
    });

    reports.forEach(report => {
      const employee = DataRepository.findUserById(report.employeeId);
      const dept = employee?.department;
      if (!dept || !byDeptMap.has(dept)) return;

      const deptMap = byDeptMap.get(dept)!;
      report.indicators.forEach(indicator => {
        if (!deptMap.has(indicator.name)) {
          deptMap.set(indicator.name, { abnormal: 0, total: 0 });
        }
        const entry = deptMap.get(indicator.name)!;
        entry.total += 1;
        if (indicator.status !== 'normal') {
          entry.abnormal += 1;
        }
      });
    });

    const topIndicators = indicators.slice(0, 5).map(i => i.name);
    const byDepartment: { department: string; indicator: string; rate: number }[] = [];

    topIndicators.forEach(indicator => {
      departments.forEach(dept => {
        const deptMap = byDeptMap.get(dept);
        const data = deptMap?.get(indicator);
        const rate = data && data.total > 0
          ? Math.round((data.abnormal / data.total) * 1000) / 10
          : 0;
        byDepartment.push({ department: dept, indicator, rate });
      });
    });

    const yearOverYear = [
      { year: '2024', indicator: '总胆固醇', rate: 18.5 },
      { year: '2024', indicator: '甘油三酯', rate: 15.2 },
      { year: '2024', indicator: '空腹血糖', rate: 8.3 },
      { year: '2024', indicator: 'BMI', rate: 22.1 },
      { year: '2025', indicator: '总胆固醇', rate: 21.3 },
      { year: '2025', indicator: '甘油三酯', rate: 17.8 },
      { year: '2025', indicator: '空腹血糖', rate: 9.5 },
      { year: '2025', indicator: 'BMI', rate: 25.6 },
      { year: '2026', indicator: '总胆固醇', rate: 25.0 },
      { year: '2026', indicator: '甘油三酯', rate: 20.5 },
      { year: '2026', indicator: '空腹血糖', rate: 11.2 },
      { year: '2026', indicator: 'BMI', rate: 28.4 },
    ];

    return {
      totalExamined,
      indicators,
      byDepartment,
      yearOverYear,
    };
  },
};
