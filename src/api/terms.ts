import { axiosInstance } from '../utils/axios';

export const fetchTerms = (drawId?: string, membershipId?: string) => {
  const params: string[] = [];
  if (drawId) params.push(`drawId=${encodeURIComponent(drawId)}`);
  if (membershipId) params.push(`membershipId=${encodeURIComponent(membershipId)}`);
  const qs = params.length ? `?${params.join('&')}` : '';
  return axiosInstance.get(`/public/club-owner/terms${qs}`);
};

export const setGlobalTerms = (html: string) => {
  // Protected route; axiosInstance includes auth headers
  return axiosInstance.post(`/api/club-owner/terms`, { html });
};


