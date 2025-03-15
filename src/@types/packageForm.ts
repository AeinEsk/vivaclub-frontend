export type Tier = {
    id?: number;
    name: string;
    price: number | null;
    chanceOfWin: number | null;
    highlight?: string;
    recurringEntry: number | null;
    deactivatedAt?: string | null;
    drawDate?: string;
    frequency?: string;
    currency?: string;
    nextDrawIn?: string;
};

export interface DiscountData {
    type: string;
    code: string;
}

export type PackageFormData = {
    name: string;
    frequency: string;
    drawDate: string;
    nextDrawIn?: string;
    currency: string;
    timezone: string;
    tiers: Tier[];
    discounts: DiscountData[];
};

export type CollapseCard = {
    name: string;
    price: number | null;
    highlight?: string;
};

export type PackageInputProps = {
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: any;
};

export type CreatePackageProps = {
    editMode: boolean;
};

export type MembershipTier = {
    id: string;
    name: string | null;
    price: number | null;
    highlight: string | null;
    ownerID: string;
    membershipID: string;
    deactivatedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type Membership = {
    id: string;
    name: string;
    ownerID: string;
    frequency: string;
    drawDate: string;
    nextDrawIn: string;
    publishedAt: string | null;
    deactivatedAt: string | null;
    createdAt: string;
    updatedAt: string;
    tiers: Tier[];
    membersCount: number;
};

export type PackageListFilter = {
    page?: number;
    pageSize?: number;
    membershipName?: string;
    frequency?: string;
    startDate?: string;
    endDate?: string;
};

export type PackageMembersFilter = {
    email?: string;
    tierName?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
};
