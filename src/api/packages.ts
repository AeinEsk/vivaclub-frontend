import { PackageFormData, PackageListFilter } from '../@types/packageForm';
import { axiosInstance } from '../utils/axios';

const CREATE_MEMBERSHIP = '/api/club-owner/membership/';
const PACKAGE_LIST = '/api/club-owner/membership';
const MEMBERSHIP_BY_ID = '/public/club-owner/membership/';
const MEMBERSHIP_DETAILS_BY_ID = '/api/club-owner/membership/';
const PACKAGE_MEMBERSHIPS = '/api/club-owner/club-members/';
const DELETE_PACKAGE = '/api/club-owner/membership/';

const buildQueryString = (filters: Record<string, any>) => {
    return Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
};

export const createMembership = (membershipData: PackageFormData) => {
    console.log(membershipData);
    const payload = {
        name: membershipData.name,
        frequency: membershipData.frequency,
        drawDate: membershipData.drawDate,
        currency: membershipData.currency,
        timezone: membershipData.timezone,
        termsHtml: (membershipData as any).termsHtml,
        emailWinner: membershipData.emailWinner,
        tiers: (membershipData.tiers || []).map((t: any) => ({
            name: t.name,
            price: t.price,
            numberOfTicket: t.numberOfTicket,
            highlight: t.highlight,
            recurringEntry: t.recurringEntry
        })),
        discounts: (membershipData.discounts || []).map((d: any) => ({ type: d.type, code: d.code })),
        promoPeriods: membershipData.promoPeriods
    };
    return axiosInstance.post(CREATE_MEMBERSHIP, payload);
};

export const getMemberships = (packageFilters: Partial<PackageListFilter>) => {
    const queryString = buildQueryString(packageFilters);
    const endpoint = `${PACKAGE_LIST}?${queryString}`;
    return axiosInstance.get(endpoint);
};

// Public API
export const getMembershipById = (id: string) => {
    return axiosInstance.get(`${MEMBERSHIP_BY_ID}${id}`);
};

export const getPackageMembeships = (packageId: string, membersFilter: PackageListFilter) => {
    const queryString = buildQueryString(membersFilter);
    const endpoint = `${PACKAGE_MEMBERSHIPS}${packageId}?${queryString}`;
    return axiosInstance.get(endpoint);
};

// Private API
export const getMembershipDetailsById = (id: string) => {
    return axiosInstance.get(`${MEMBERSHIP_DETAILS_BY_ID}${id}`);
};

export const cancelPackage = (packageId: string) => {
    return axiosInstance.delete(`${DELETE_PACKAGE}${packageId}`);
};

export const updateMembership = (id: string, membershipData: Partial<PackageFormData>) => {
    const payload: any = {};
    if (membershipData.name !== undefined) payload.name = membershipData.name;
    if (membershipData.frequency !== undefined) payload.frequency = membershipData.frequency;
    if (membershipData.drawDate !== undefined) payload.drawDate = membershipData.drawDate;
    if (membershipData.currency !== undefined) payload.currency = membershipData.currency;
    if (membershipData.timezone !== undefined) payload.timezone = membershipData.timezone;
    if ((membershipData as any).termsHtml !== undefined) payload.termsHtml = (membershipData as any).termsHtml;
    if (membershipData.emailWinner !== undefined) payload.emailWinner = membershipData.emailWinner;
    if (membershipData.tiers !== undefined) {
        payload.tiers = (membershipData.tiers || []).map((t: any) => ({
            name: t.name,
            price: t.price,
            numberOfTicket: t.numberOfTicket,
            highlight: t.highlight,
            recurringEntry: t.recurringEntry
        }));
    }
    if (membershipData.discounts !== undefined) {
        payload.discounts = (membershipData.discounts || []).map((d: any) => ({ type: d.type, code: d.code }));
    }
    if (membershipData.promoPeriods !== undefined) payload.promoPeriods = membershipData.promoPeriods;
    return axiosInstance.put(`${MEMBERSHIP_DETAILS_BY_ID}${id}`, payload);
};
