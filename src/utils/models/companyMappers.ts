
import type { CompanyInfo } from '@/data/initialData';
import { DbCompanyInfo } from './types';

export function mapDbCompanyInfoToCompanyInfo(dbInfo: DbCompanyInfo): CompanyInfo {
  return {
    name: dbInfo.name,
    logo: dbInfo.logo_url || '/placeholder.svg',
    slogan: dbInfo.slogan || '',
    about: dbInfo.about || '',
    contact: {
      address: '',
      phone: '',
      email: '',
      socialMedia: {}
    },
    exchangeRate: 1460
  };
}

export function mapCompanyInfoToDbCompanyInfo(info: Partial<CompanyInfo>): Partial<DbCompanyInfo> {
  return {
    name: info.name,
    slogan: info.slogan,
    about: info.about,
    logo_url: info.logo !== '/placeholder.svg' ? info.logo : null
  };
}
