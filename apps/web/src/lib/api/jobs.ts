import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

interface JobUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone?: string | null;
  governorate?: string | null;
  createdAt?: string;
}

export interface JobItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  jobType: 'OFFERING' | 'HIRING';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT';
  salary?: string | null;
  salaryPeriod?: 'DAILY' | 'MONTHLY' | 'YEARLY' | 'NEGOTIABLE' | null;
  currency: string;
  licenseTypes: string[];
  experienceYears?: number | null;
  minAge?: number | null;
  maxAge?: number | null;
  languages: string[];
  nationality?: string | null;
  vehicleTypes: string[];
  hasOwnVehicle: boolean;
  governorate: string;
  city?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  whatsapp?: string | null;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  user: JobUser;
  _count?: { applications: number };
}

export interface JobsResponse {
  items: JobItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface JobApplicationItem {
  id: string;
  message?: string | null;
  resumeUrl?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  jobId: string;
  applicantId: string;
  applicant: JobUser;
  createdAt: string;
}

export function useJobs(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  return useQuery<JobsResponse>({
    queryKey: ['jobs', params],
    queryFn: () => apiRequest<JobsResponse>(`/jobs?${searchParams.toString()}`),
  });
}

export function useJob(id: string) {
  return useQuery<JobItem>({
    queryKey: ['job', id],
    queryFn: () => apiRequest<JobItem>(`/jobs/${id}`),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) =>
      apiRequest<JobItem>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, any>) =>
      apiRequest<JobItem>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/jobs/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); },
  });
}

export function useMyJobs() {
  return useQuery<JobItem[]>({
    queryKey: ['jobs', 'my'],
    queryFn: () => apiRequest<JobItem[]>('/jobs/my'),
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, ...data }: { jobId: string; message?: string; resumeUrl?: string }) =>
      apiRequest<JobApplicationItem>(`/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); },
  });
}

export function useJobApplications(jobId: string) {
  return useQuery<JobApplicationItem[]>({
    queryKey: ['job-applications', jobId],
    queryFn: () => apiRequest<JobApplicationItem[]>(`/jobs/${jobId}/applications`),
    enabled: !!jobId,
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: string }) =>
      apiRequest(`/jobs/applications/${applicationId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['job-applications'] }); },
  });
}
