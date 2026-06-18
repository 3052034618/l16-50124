import { DataRepository } from '../data/repository.js';
import type { Institution, Store } from '../../shared/types.js';

export const InstitutionService = {
  getAll(includeInactive = false): Institution[] {
    const institutions = DataRepository.getInstitutions();
    if (includeInactive) {
      return institutions;
    }
    return institutions.filter(i => i.status === 'active');
  },

  getById(id: string): Institution | null {
    const institution = DataRepository.getInstitutionById(id);
    return institution || null;
  },

  getStores(institutionId: string): Store[] {
    const institution = DataRepository.getInstitutionById(institutionId);
    return institution?.stores || [];
  },

  create(data: Omit<Institution, 'id' | 'createdAt'>): Institution {
    const newInstitution: Institution = {
      ...data,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as Institution;
    DataRepository.addInstitution(newInstitution);
    return newInstitution;
  },

  update(id: string, data: Partial<Institution>): Institution | null {
    const existing = DataRepository.getInstitutionById(id);
    if (!existing) return null;
    DataRepository.updateInstitution(id, data);
    return DataRepository.getInstitutionById(id) || null;
  },

  remove(id: string): boolean {
    const existing = DataRepository.getInstitutionById(id);
    if (!existing) return false;
    DataRepository.deleteInstitution(id);
    return true;
  },
};
