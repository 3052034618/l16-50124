import { DataRepository } from '../data/repository.js';
import type { Package } from '../../shared/types.js';

export const PackageService = {
  getAllPackages(includeInactive = false): Package[] {
    const packages = DataRepository.getPackages();
    if (includeInactive) {
      return packages;
    }
    return packages.filter(p => p.status === 'active');
  },

  getPackageById(id: string): Package | null {
    const pkg = DataRepository.getPackageById(id);
    return pkg || null;
  },

  createPackage(data: Omit<Package, 'id' | 'createdAt'> & { id?: string }): Package {
    const newPackage: Package = {
      ...data,
      id: data.id || `pkg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    } as Package;
    DataRepository.addPackage(newPackage);
    return newPackage;
  },

  updatePackage(id: string, data: Partial<Package>): Package | null {
    const existing = DataRepository.getPackageById(id);
    if (!existing) return null;
    DataRepository.updatePackage(id, data);
    return DataRepository.getPackageById(id) || null;
  },

  deletePackage(id: string): boolean {
    const existing = DataRepository.getPackageById(id);
    if (!existing) return false;
    DataRepository.deletePackage(id);
    return true;
  },
};
