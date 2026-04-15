import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface ListingItem {
  id: string;
  title: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: string;
  currency: string;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  condition: string | null;
  governorate: string | null;
  bodyType: string | null;
  exteriorColor: string | null;
  interior: string | null;
  features: string[];
  engineSize: string | null;
  horsepower: number | null;
  doors: number | null;
  seats: number | null;
  driveType: string | null;
  description: string;
  isPriceNegotiable: boolean;
  listingType?: 'SALE' | 'RENTAL' | 'WANTED';
  dailyPrice?: string | null;
  weeklyPrice?: string | null;
  monthlyPrice?: string | null;
  minRentalDays?: number | null;
  depositAmount?: string | null;
  kmLimitPerDay?: number | null;
  withDriver?: boolean;
  deliveryAvailable?: boolean;
  insuranceIncluded?: boolean;
  cancellationPolicy?: string | null;
  availableFrom?: string | null;
  availableTo?: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  isPremium?: boolean;
  featuredUntil?: string | null;
  viewCount: number;
  status: string;
  createdAt: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  seller: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    phone: string | null;
    governorate: string | null;
    isVerified: boolean;
    createdAt: string;
  };
}

export interface ListingsResponse {
  items: ListingItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useListings(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  return useQuery<ListingsResponse>({
    queryKey: ['listings', params],
    queryFn: () => apiRequest<ListingsResponse>(`/listings?${searchParams.toString()}`),
  });
}

export function useMyListings(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  return useQuery<ListingsResponse>({
    queryKey: ['my-listings', params],
    queryFn: () => apiRequest<ListingsResponse>(`/listings/my?${searchParams.toString()}`),
  });
}

export function useListing(id: string) {
  return useQuery<ListingItem>({
    queryKey: ['listing', id],
    queryFn: () => apiRequest<ListingItem>(`/listings/${id}`),
    enabled: !!id,
  });
}

export function useListingBySlug(slug: string) {
  return useQuery<ListingItem>({
    queryKey: ['listing', 'slug', slug],
    queryFn: () => apiRequest<ListingItem>(`/listings/slug/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<ListingItem>('/listings', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}

export function useUpdateListing(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<ListingItem>(`/listings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['listing', id] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/listings/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}
