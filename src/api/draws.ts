import { DrawFormData, DrawListFilter, DrawMembersFilter } from '../@types/darw';
import { axiosInstance } from '../utils/axios';

const CREATE_DRAW = '/api/club-owner/draw/';
const DRAW_LIST = '/api/club-owner/draw';
const DRAW_BY_ID = '/public/club-owner/draw/';
const DRAW_STATS = '/api/club-owner/draw/';
const UPLOAD_IMAGE = '/api/upload/';
const DRAW_MEMBERSHIPS = '/api/club-owner/draw/membership/';
const DELETE_DRAW = '/api/club-owner/draw/';

const buildQueryString = (filters: Record<string, any>) => {
    return Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
};

export const createDraw = (drawData: DrawFormData) => {
    const payload = {
        name: drawData.name,
        runAt: drawData.runAt,
        timezone: drawData.timezone,
        prize: drawData.prize,
        entryCost: Number(drawData.entryCost),
        runMethod: drawData.runMethod,
        currency: drawData.currency,
        imageId: drawData.imageId,
        discounts: drawData.discounts,
        ticketCap: drawData.ticketCap,
        numbersLength: drawData.numbersLength,
        numbersFrom: drawData.numbersFrom,
        numbersTo: drawData.numbersTo
    };

    return axiosInstance.post(CREATE_DRAW, payload);
};

export const getDrawsList = (drawFilters: Partial<DrawListFilter>) => {
    const queryString = buildQueryString(drawFilters);
    const endpoint = `${DRAW_LIST}?${queryString}`;
    return axiosInstance.get(endpoint);
};

export const getDrawInfoById = (drawId: string) => {
    return axiosInstance.get(`${DRAW_BY_ID}${drawId}`);
};

export const getDrawStats = (drawId: string) => {
    return axiosInstance.get(`${DRAW_STATS}${drawId}/stats`);
};

export const uploadImage = (file: FormData) => {
    const payload = file;
    return axiosInstance.post(UPLOAD_IMAGE, payload);
};

export const getDrawMembeships = (drawId: string, membersFilter: DrawMembersFilter) => {
    const queryString = buildQueryString(membersFilter);
    const endpoint = `${DRAW_MEMBERSHIPS}${drawId}?${queryString}`;
    return axiosInstance.get(endpoint);
};

export const cancelDraw = (drawId: string) => {
    return axiosInstance.delete(`${DELETE_DRAW}${drawId}`);
};
