import { axiosInstance } from '../utils/axios';

export const fetchTerms = (drawId?: string) => {
  const qs = drawId ? `?drawId=${encodeURIComponent(drawId)}` : '';
  return axiosInstance.get(`/public/club-owner/terms${qs}`);
};

export const setGlobalTerms = (html: string) => {
  // Protected route; axiosInstance includes auth headers
  return axiosInstance.post(`/api/club-owner/terms`, { html });
};


