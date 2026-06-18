import { DataRepository } from '../data/repository.js';
import type { Appointment } from '../../shared/types.js';

export const AppointmentService = {
  getAll(filters?: {
    status?: string;
    institutionId?: string;
    employeeId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Appointment[] {
    let appointments = DataRepository.getAppointments();

    if (filters?.status) {
      appointments = appointments.filter(a => a.status === filters.status);
    }
    if (filters?.institutionId) {
      appointments = appointments.filter(a => a.institutionId === filters.institutionId);
    }
    if (filters?.employeeId) {
      appointments = appointments.filter(a => a.employeeId === filters.employeeId);
    }
    if (filters?.dateFrom) {
      appointments = appointments.filter(a => a.appointmentDate >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      appointments = appointments.filter(a => a.appointmentDate <= filters.dateTo!);
    }

    return appointments.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string): Appointment | null {
    return DataRepository.getAppointmentById(id) || null;
  },

  getByEmployee(employeeId: string): Appointment[] {
    return DataRepository.getAppointmentsByEmployee(employeeId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getByInstitution(institutionId: string): Appointment[] {
    return DataRepository.getAppointmentsByInstitution(institutionId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  create(data: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Appointment {
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    } as Appointment;
    DataRepository.addAppointment(newAppointment);
    return newAppointment;
  },

  cancel(id: string): Appointment | null {
    const appointment = DataRepository.getAppointmentById(id);
    if (!appointment) return null;
    DataRepository.updateAppointment(id, { status: 'cancelled' });
    return DataRepository.getAppointmentById(id) || null;
  },

  confirm(id: string): Appointment | null {
    const appointment = DataRepository.getAppointmentById(id);
    if (!appointment) return null;
    DataRepository.updateAppointment(id, { status: 'confirmed' });
    return DataRepository.getAppointmentById(id) || null;
  },

  complete(id: string, reportId: string): Appointment | null {
    const appointment = DataRepository.getAppointmentById(id);
    if (!appointment) return null;
    DataRepository.updateAppointment(id, { status: 'completed', reportId });
    return DataRepository.getAppointmentById(id) || null;
  },
};
