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
        tiers: membershipData.tiers,
        discounts: membershipData.discounts
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
