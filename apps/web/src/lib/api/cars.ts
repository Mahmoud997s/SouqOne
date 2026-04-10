import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface CarBrand {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  isPopular: boolean;
  modelCount: number;
}

export interface CarModelItem {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  yearCount: number;
}

export interface CarYearItem {
  id: string;
  year: number;
}

export function useBrands(popular?: boolean) {
  const params = popular !== undefined ? `?popular=${popular}` : '';
  return useQuery<CarBrand[]>({
    queryKey: ['car-brands', popular],
    queryFn: () => apiRequest<CarBrand[]>(`/cars/brands${params}`),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useSearchBrands(q: string) {
  return useQuery<CarBrand[]>({
    queryKey: ['car-brands-search', q],
    queryFn: () => apiRequest<CarBrand[]>(`/cars/brands/search?q=${encodeURIComponent(q)}&limit=15`),
    enabled: q.length >= 2,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCarModels(brandId: string) {
  return useQuery<CarModelItem[]>({
    queryKey: ['car-models', brandId],
    queryFn: () => apiRequest<CarModelItem[]>(`/cars/brands/${brandId}/models`),
    enabled: !!brandId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useCarYears(modelId: string) {
  return useQuery<CarYearItem[]>({
    queryKey: ['car-years', modelId],
    queryFn: () => apiRequest<CarYearItem[]>(`/cars/models/${modelId}/years`),
    enabled: !!modelId,
    staleTime: 60 * 60 * 1000,
  });
}
