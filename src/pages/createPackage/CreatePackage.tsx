import { useEffect, useRef, useState } from 'react';
import { PackageFormData } from '../../@types/packageForm';
import { useNavigate, useParams } from 'react-router-dom';
import { createMembership, getMembershipDetailsById, updateMembership } from '../../api/packages';
import Alert from '../../components/alert/Alert';
import AccordionPackage from '../../components/accordionCard/AccordionPackage';
import { PATHS } from '../../routes/routes';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Popup from '../../components/alert/Popup';
import Tooltip from '../../components/tooltip/Tooltip';
import { timeZone, discountTypes } from '../../@types/darw';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import { FaRegFileLines, FaPen, FaTriangleExclamation } from 'react-icons/fa6';
import { currency as currencyOptions } from '../../@types/darw';
import { validatePromoPeriods, getNowInTimezone } from '../../utils/validation';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchTerms } from '../../api/terms';

const validateNumber = (minValue: number, errorMessage: string) =>
    z
        .number({
            invalid_type_error: 'Must be a valid number'
        })
        .min(minValue, errorMessage)
        .refine((value) => !Number.isNaN(value), {
            message: 'Please enter a valid number'
        });

// Separate schemas for tiers and discounts
const tierSchema = z.object({
    name: z.string().nonempty('Tier Name is required'),
    price: validateNumber(1, 'Price must be at least 1'),
    numberOfTicket: validateNumber(1, 'Number of Ticket must be at least 1'),
    highlight: z.string().optional(),
    recurringEntry: validateNumber(0, 'Recurring Entry must be at least 0'),
    currency: z.string().nonempty('Currency is required').default('AUD')
});

const schema = tierSchema.extend({
    discounts: z.array(z.object({
        type: z.string(),
        code: z.string()
    })).optional().default([])
});

type TierFormData = z.infer<typeof schema>;

const calculateEarnings = (price: number) => {
    const participants = 10000;
    const grossRevenue = Math.round(price * participants);
    const platformFee = Math.round(grossRevenue * 0.15);
    const netEarnings = grossRevenue - platformFee;

    return {
        participants,
        grossRevenue: grossRevenue.toLocaleString(),
        netEarnings: netEarnings.toLocaleString()
    };
};

const CreatePackage = () => {
    const today = new Date().toISOString().slice(0, 16);

    const [showPopup, setShowPopup] = useState({
        state: false,
        text: ''
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    // const [initialLoading, setInitialLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isInactive, setIsInactive] = useState(false);
    const { packageId } = useParams<{ packageId: string }>();
    const [packageData, setPackageData] = useState<PackageFormData & { termsHtml?: string }>({
        name: '',
        frequency: 'Weekly',
        drawDate: '',
        currency: 'AUD',
        timezone: 'Australia/Sydney',
        tiers: [],
        discounts: [],
        termsHtml: '',
        emailWinner: true
    });
    const membershipFrequency = ['Weekly', 'Fortnightly', 'Monthly', 'Yearly'];
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [promoPeriods, setPromoPeriods] = useState<Array<{ start: string; end: string; multiplier: number }>>([]);
    const [promoPeriodsError, setPromoPeriodsError] = useState<string>('');
    const promoPeriodsRef = useRef<HTMLDivElement>(null);
    const initialDrawDateRef = useRef<string>('');
    // const [showTermsEditor, setShowTermsEditor] = useState<boolean>(false);
    // const [loadingTerms, setLoadingTerms] = useState<boolean>(false);
    // Terms modal state (like CreateDraw)
    const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
    const [termsModalLoading, setTermsModalLoading] = useState<boolean>(false);
    const [termsContent, setTermsContent] = useState<string>('');
    const [termsEdited, setTermsEdited] = useState<boolean>(false);
    const inputRefs: any = {
        name: useRef<HTMLInputElement>(null),
        frequency: useRef<HTMLInputElement>(null),
        drawDate: useRef<HTMLInputElement>(null),
        currency: useRef<HTMLInputElement>(null),
        timezone: useRef<HTMLInputElement>(null)
    };

    const validateFields = () => {
        const errors: { [key: string]: string } = {};
        if (!packageData.name.trim()) errors.name = 'Name is required';
        if (!packageData.frequency.trim()) errors.frequency = 'Frequency is required';
        if (!packageData.drawDate.trim()) errors.drawDate = 'Date is required';
        if (!packageData.currency.trim()) errors.currency = 'Currency is required';
        if (!packageData.timezone.trim()) errors.timezone = 'Timezone is required';
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            const firstErrorKey = Object.keys(errors)[0];
            inputRefs[firstErrorKey]?.current?.focus();
            return false;
        }
        return true;
    };

    const {
        handleSubmit,
        register,
        watch,
        formState: { errors },
        reset,
        getValues,
        setValue
    } = useForm<TierFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            price: undefined,
            numberOfTicket: undefined,
            recurringEntry: undefined,
            highlight: '',
            discounts: [],
        }
    });

    // Terms modal handlers
    const openTermsModal = async () => {
        try {
            setShowTermsModal(true);
            setTermsModalLoading(true);
            const draftKey = 'terms:membership:draft';
            const draftEditedKey = `${draftKey}Edited`;
            const draft = localStorage.getItem(draftKey) || '';
            const draftEdited = localStorage.getItem(draftEditedKey) === '1';

            if (draftEdited && draft) {
                setTermsContent(draft);
                setTermsEdited(true);
                return;
            }

            // Otherwise load from API: membership-specific if editing, otherwise global
            const { data } = await fetchTerms(undefined, packageId || undefined);
            setTermsContent(data?.html || '');
            setTermsEdited(!!data?.html);
        } catch (e) {
            setTermsContent('');
            setTermsEdited(false);
        } finally {
            setTermsModalLoading(false);
        }
    };

    const closeTermsModal = () => {
        setShowTermsModal(false);
    };

    const saveTermsModal = () => {
        const draftKey = 'terms:membership:draft';
        const draftEditedKey = `${draftKey}Edited`;
        try {
            localStorage.setItem(draftKey, termsContent || '');
            localStorage.setItem(draftEditedKey, '1');
            setTermsEdited(true);
            // Reflect into current form state so previews or validations can use it
            setPackageData((prev) => ({ ...prev, termsHtml: termsContent || '' }));
            setShowTermsModal(false);
        } catch (e) {
            // ignore storage failures
            setShowTermsModal(false);
        }
    };

    const addNewTier = (data: TierFormData) => {
        const tierData = {
            name: data.name,
            price: data.price,
            numberOfTicket: data.numberOfTicket,
            recurringEntry: data.recurringEntry,
            highlight: data.highlight || '',
            currency: data.currency
        };

        // Only validate tier fields
        const result = tierSchema.safeParse(tierData);

        if (!result.success) {
            setShowPopup({
                state: true,
                text: 'Please fill in all required tier fields'
            });
            return;
        }

        setPackageData((prev) => ({
            ...prev,
            tiers: [...prev.tiers, tierData]
        }));

        // Reset with undefined values instead of 1
        const currentDiscounts = getValues('discounts');
        reset({
            name: '',
            price: undefined,
            numberOfTicket: 0,
            recurringEntry: undefined,
            highlight: '',
            discounts: currentDiscounts,
            currency: 'AUD'
        });
    };

    const handleAddDiscount = (e: React.MouseEvent) => {
        e.preventDefault();
        const type = getValues('discounts.0.type');
        const code = getValues('discounts.0.code');

        if (type && code) {
            setPackageData((prev) => ({
                ...prev,
                discounts: [...prev.discounts, { type, code }]
            }));
            // Reset inputs
            setValue('discounts.0.type', '', { shouldValidate: true });
            setValue('discounts.0.code', '', { shouldValidate: true });
        }
    };

    const handleDeleteDiscount = (index: number) => {
        setPackageData((prev) => ({
            ...prev,
            discounts: prev.discounts.filter((_, i) => i !== index)
        }));
    };

    const handleDeleteTier = (index: number) => {
        // Prevent event bubbling
        event?.preventDefault();
        event?.stopPropagation();

        setPackageData(prev => ({
            ...prev,
            tiers: prev.tiers.filter((_, i) => i !== index)
        }));
    };

    const validatePromoPeriodsLocal = () => {
        const isUpdateMode = !!packageId;
        const validation = validatePromoPeriods(promoPeriods, { 
            drawDate: packageData.drawDate,
            timezone: packageData.timezone,
            // On create, enforce future dates; on edit, allow past periods to remain
            validateNotInPast: !isUpdateMode,
            isUpdateMode
        });
        
        if (!validation.isValid && validation.errorMessage) {
            setPromoPeriodsError(validation.errorMessage);
            // Scroll to promotional periods section
            promoPeriodsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }
        
        setPromoPeriodsError('');
        return true;
    };

    const publishData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateFields()) return;
        
        if (!validatePromoPeriodsLocal()) return;

        if (packageData.tiers.length === 0) {
            setShowPopup({
                state: true,
                text: 'You should add at least one Tier.'
            });
            return;
        }

        handleCreatePackage(packageData);
    };

    const handleCreatePackage = async (packageVal: PackageFormData & { termsHtml?: string }) => {
        try {
            setLoading(true);

            // attach promo periods with ISO strings
            // attach terms draft if exists for membership context
            const draftKey = 'terms:membership:draft';
            const draftEditedKey = `${draftKey}Edited`;
            const draft = localStorage.getItem(draftKey);
            const draftEdited = localStorage.getItem(draftEditedKey) === '1';

            const packageWithPromoPeriods: any = {
                ...packageVal,
                termsHtml: draftEdited ? (draft || '') : (packageVal.termsHtml || ''),
                promoPeriods: (promoPeriods || [])
                    .filter(p => p.start && p.end && Number(p.multiplier) >= 1)
                    .map(p => ({ start: p.start, end: p.end, multiplier: Math.max(1, Math.floor(Number(p.multiplier))) }))
            };
            // If editing and drawDate has not changed from initial, omit it
            if (packageId && packageData.drawDate === initialDrawDateRef.current) {
                delete packageWithPromoPeriods.drawDate;
            }

            if (packageId) {
                let payload: any;
                if (isLocked) {
                    payload = { promoPeriods: packageWithPromoPeriods.promoPeriods };
                } else {
                    payload = packageWithPromoPeriods;
                }
                const res = await updateMembership(packageId, payload);
                if (res && res.data) {
                    // clear draft after successful save
                    localStorage.removeItem(draftKey);
                    localStorage.removeItem(draftEditedKey);
                    navigate(PATHS.WELCOME);
                } else {
                    setShowPopup({ state: true, text: 'Failed to update membership' });
                }
            } else {
                await createMembership(packageWithPromoPeriods as any);
                // clear draft after successful create
                localStorage.removeItem(draftKey);
                localStorage.removeItem(draftEditedKey);
                navigate(PATHS.WELCOME);
            }
        } catch (error: any) {
            setLoading(false);
            const apiMessage = error?.response?.data?.error || 'Failed to create membership';
            console.error('Create membership failed:', error?.response || error);
            setShowPopup({ state: true, text: apiMessage });
        }
    };

    const closePopup = (): void => {
        setShowPopup({ state: false, text: '' });
    };

    const price = watch('price');
    const currency = watch('currency');

    // Load package for editing; set lock states and termsHtml
    useEffect(() => {
        const load = async () => {
            console.log('CreatePackage useEffect triggered, packageId:', packageId);
            if (!packageId) {
                console.log('No packageId, loading default/global terms to prefill');
                try {
                    setLoadingTerms(true);
                    const { data } = await fetchTerms();
                    setPackageData((prev) => ({ ...prev, termsHtml: data?.html || '' }));
                } catch (e) {
                    // ignore
                } finally {
                    setLoadingTerms(false);
                }
                return;
            }
            try {
                console.log('Loading membership details for packageId:', packageId);
                const { data } = await getMembershipDetailsById(packageId);
                console.log('Loaded membership data:', data);
                setPackageData({
                    name: data.name || '',
                    frequency: data.frequency || 'Weekly',
                    drawDate: data.drawDate ? new Date(data.drawDate).toISOString().slice(0, 16) : '',
                    currency: data.currency || 'AUD',
                    timezone: data.timezone || 'Australia/Sydney',
                    tiers: Array.isArray(data.tiers) ? data.tiers : [],
                    discounts: Array.isArray(data.discounts) ? data.discounts : [],
                    termsHtml: data.termsHtml || '',
                    emailWinner: data.emailWinner !== false
                });
                initialDrawDateRef.current = data.drawDate ? new Date(data.drawDate).toISOString().slice(0, 16) : '';
                if (Array.isArray(data.promoPeriods)) {
                    setPromoPeriods(
                        data.promoPeriods.map((p: any) => ({
                            start: p.start ? p.start.slice(0, 16) : '',
                            end: p.end ? p.end.slice(0, 16) : '',
                            multiplier: Number(p.multiplier) || 1
                        }))
                    );
                }
                const membersCount = Number(data.membersCount || 0);
                setIsLocked(membersCount > 0);
                const nowIso = new Date().toISOString();
                const expired = !!data.drawDate && new Date(data.drawDate).toISOString() <= nowIso;
                setIsInactive(!!data.deactivatedAt || expired);
                console.log('Set lock states - isLocked:', membersCount > 0, 'isInactive:', !!data.deactivatedAt || expired);
            } catch (e) {
                console.error('Error loading membership details:', e);
            }
        };
        load();
    }, [packageId]);

    console.log('CreatePackage render - packageId:', packageId, 'packageData:', packageData, 'isLocked:', isLocked, 'isInactive:', isInactive);
    
    return (
        <>
            <div className="flex items-center justify-center">
                <div className="w-full max-w-sm lg:max-w-[50%] shadow-xl py-10 px-5 rounded-2xl border border-border/30 bg-white">
                    <form onSubmit={publishData}>
                        <div className="mb-3">
                            <label className="label">
                                <span className="label-text text-sm text-neutral">
                                    Club Name{' '}
                                    <Tooltip
                                        text="Enter a distinctive name for your membership club. This name will be prominently displayed to all participants and should reflect your club's identity."
                                        direction="tooltip-left"
                                    />
                                </span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter Package name"
                                className="input input-bordered w-full"
                                value={packageData.name}
                                ref={inputRefs.name}
                                onChange={(e) =>
                                    setPackageData({ ...packageData, name: e.target.value })
                                }
                                disabled={loading || isLocked || isInactive}
                            />
                            {fieldErrors.name && packageData.name === '' && (
                                <label className="label">
                                    <span className="label-text-alt text-red-600 font-semibold">
                                        {fieldErrors.name}
                                    </span>
                                </label>
                            )}
                        </div>
                        <div className="mb-3 grid grid-cols-1 xl:grid-cols-3 gap-2">
                            <div className="">
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">
                                        Membership Frequency{' '}
                                        <Tooltip text={'Specify how often the draw occurs.'} />
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={packageData.frequency}
                                    ref={inputRefs.frequency}
                                    onChange={(e) =>
                                        setPackageData({
                                            ...packageData,
                                            frequency: e.target.value
                                        })
                                    }
                                    disabled={loading || isLocked || isInactive}>
                                    <option value="" disabled>
                                        Choose membership frequency
                                    </option>
                                    {membershipFrequency.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.frequency && packageData.frequency === '' && (
                                    <label className="label">
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {fieldErrors.frequency}
                                        </span>
                                    </label>
                                )}
                            </div>
                            <div className="">
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">
                                        Currency
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    disabled={loading || isLocked || isInactive}
                                    value={packageData.currency}
                                    onChange={(e) =>
                                        setPackageData({
                                            ...packageData,
                                            currency: e.target.value
                                        })
                                    }>
                                    <option value="" disabled>Choose currency</option>
                                    {currencyOptions.map((option: string, index: number) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                {fieldErrors.currency && packageData.currency === '' && (
                                    <label className="label">
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {fieldErrors.currency}
                                        </span>
                                    </label>
                                )}
                            </div>
                            <div className="">
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">
                                        Timezone
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={packageData.timezone}
                                    ref={inputRefs.timezone}
                                    onChange={(e) =>
                                        setPackageData({
                                            ...packageData,
                                            timezone: e.target.value
                                        })
                                    }
                                    disabled={loading || isLocked || isInactive}>
                                    <option value="" disabled>
                                        Choose Timezone
                                    </option>
                                    {timeZone.map((option, index) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                {fieldErrors.timezone && packageData.timezone === '' && (
                                    <label className="label">
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {fieldErrors.timezone}
                                        </span>
                                    </label>
                                )}


                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="label">
                                <span className="label-text text-sm">
                                    Draw Date & Time{' '}
                                    <Tooltip
                                        text="Set when your recurring draws will take place. This schedule will be used for all future draws in this membership package."
                                        direction="tooltip-left"
                                    />
                                </span>
                            </label>
                            <input
                                type="datetime-local"
                                className="input input-bordered w-full"
                                value={packageData.drawDate}
                                onChange={(e) => setPackageData({ ...packageData, drawDate: e.target.value })}
                                disabled={loading || isLocked || isInactive}
                                min={today}
                                ref={inputRefs.drawDate}
                            />
                            {fieldErrors.drawDate && packageData.drawDate === '' && (
                                <label className="label">
                                    <span className="label-text-alt text-red-600 font-semibold">
                                        {fieldErrors.drawDate}
                                    </span>
                                </label>
                            )}

                            {/* Promotional periods */}
                            <div className="mt-4 mb-4" ref={promoPeriodsRef}>
                                <div className="flex items-center justify-between">
                                    <label className="label">
                                        <span className="label-text">Promotional periods{' '}
                                            <Tooltip
                                                text="Boost entries for a set period. e.g. ‘Every ticket = 2 entries’ or ‘Every $1 = 2 entries."
                                                direction="tooltip-left"
                                            />
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                                        disabled={loading || isInactive}
                                        onClick={() => {
                                            const drawDateVal = packageData.drawDate;
                                            const timezone = packageData.timezone;
                                            const nowIso = getNowInTimezone(timezone);
                                            // Default start 15 minutes from now
                                            const nowPlus15 = (() => {
                                                const d = new Date();
                                                d.setMinutes(d.getMinutes() + 15);
                                                return new Intl.DateTimeFormat('sv-SE', {
                                                    timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }).format(d).replace(' ', 'T');
                                            })();
                                            const existing = (promoPeriods || []).filter(p => p.start && p.end);
                                            const lastEnd = existing.length
                                                ? existing
                                                    .slice()
                                                    .sort((a, b) => (a.start || '').localeCompare(b.start || ''))
                                                    .at(-1)!.end
                                                : '';
                                            const start = lastEnd && lastEnd > nowPlus15 ? lastEnd : nowPlus15;
                                            const end = drawDateVal && drawDateVal > start ? drawDateVal : start;
                                            const newPeriod = { start, end, multiplier: 1 };
                                            setPromoPeriods([...(promoPeriods || []), newPeriod]);
                                        }}
                                    >
                                        <FaPlus className="w-4 h-4 mr-1" />
                                        Add period
                                    </button>
                                </div>
                                {(promoPeriods || []).map((p, idx) => {
                                    const drawDateVal = packageData.drawDate;
                                    const timezone = packageData.timezone;
                                    const nowIso = getNowInTimezone(timezone);
                                    const startInvalid = !!p.start && !!p.end && p.start >= p.end;
                                    const afterDraw = !!drawDateVal && (!!p.end && p.end > drawDateVal);

                                    // Live range disabling (like CreateDraw/CreatePromoDraw)
                                    const sorted = (promoPeriods || [])
                                        .map((pp, i) => ({ i, s: pp.start || '' }))
                                        .sort((a, b) => a.s.localeCompare(b.s));
                                    const pos = sorted.findIndex(x => x.i === idx);
                                    const prevEnd = (promoPeriods[idx - 1]?.end) || '';
                                    const nextStart = pos >= 0 && pos < sorted.length - 1 ? (promoPeriods[sorted[pos + 1].i]?.start || '') : '';
                                    const startMinBase = prevEnd && prevEnd > nowIso ? prevEnd : nowIso;
                                    const startMin = (() => {
                                        try {
                                            const d = new Date(startMinBase);
                                            d.setMinutes(d.getMinutes() + 1);
                                            return d.toISOString().slice(0, 16);
                                        } catch {
                                            return startMinBase;
                                        }
                                    })();
                                    const startMax = nextStart || drawDateVal || undefined;
                                    const endMin = p.start || startMin;
                                    const endMax = nextStart || drawDateVal || undefined;

                                    return (
                                        <div key={idx} className="mt-2 p-3 border border-gray-200 rounded-lg">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                                <div className="md:col-span-4">
                                                    <label className="label"><span className="label-text text-sm">Start</span></label>
                                                    <input
                                                        type="datetime-local"
                                                        className="input input-bordered w-full"
                                                        disabled={loading || isInactive}
                                                        value={p.start}
                                                        min={packageId ? undefined : startMin}
                                                        max={startMax}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            const copy = [...promoPeriods];
                                                            copy[idx] = { ...copy[idx], start: v };
                                                            setPromoPeriods(copy);
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-4">
                                                    <label className="label"><span className="label-text text-sm">End</span></label>
                                                    <input
                                                        type="datetime-local"
                                                        className="input input-bordered w-full"
                                                        disabled={loading || isInactive}
                                                        value={p.end}
                                                        min={endMin}
                                                        max={endMax}
                                                        onChange={(e) => {
                                                            const v = e.target.value;
                                                            const copy = [...promoPeriods];
                                                            copy[idx] = { ...copy[idx], end: v };
                                                            setPromoPeriods(copy);
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="label"><span className="label-text text-sm">Multiplier</span></label>
                                                    <input
                                                        type="number"
                                                        className="input input-bordered w-full"
                                                        min={1}
                                                        disabled={loading || isInactive}
                                                        value={p.multiplier}
                                                        onChange={(e) => {
                                                            const v = Math.max(1, Math.floor(Number(e.target.value || 1)));
                                                            const copy = [...promoPeriods];
                                                            copy[idx] = { ...copy[idx], multiplier: v };
                                                            setPromoPeriods(copy);
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-2 flex items-end">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline btn-error w-full"
                                                        disabled={loading || isInactive}
                                                        onClick={() => setPromoPeriods(promoPeriods.filter((_, i) => i !== idx))}
                                                        aria-label={`Remove period ${idx + 1}`}
                                                    >
                                                        <span className="md:hidden">Remove</span>
                                                        <span className="hidden md:flex items-center justify-center">
                                                            <FaXmark className="w-4 h-4 lg:mr-2" />
                                                            <span className="hidden lg:inline">Remove</span>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                            {(startInvalid || afterDraw) && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-red-600">
                                                        {startInvalid ? 'Start must be before End.' : 'End must be before draw date.'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {promoPeriodsError && (
                                <label className="label">
                                    <span className="label-text-alt text-red-600 font-semibold">
                                        {promoPeriodsError}
                                    </span>
                                </label>
                            )}
                        </div>


                        <div className="primary-divider"></div>
                        {/* Heading for discount section */}
                        <div className="text-base font-bold text-left mb-5">
                            Exclusive Discounts and Perks

                        </div>

                        <div className="grid grid-cols-6 gap-2">
                            <div className="col-span-2">
                                <label className="label h-7 mb-0">
                                    <span className="label-text text-sm">
                                        Type
                                        <Tooltip
                                            text="Choose the type of special offer to provide. This can help attract new members or reward specific groups."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full h-9 min-h-[36px] text-sm"
                                    disabled={loading || isLocked || isInactive}
                                    {...register('discounts.0.type')}>
                                    <option value="">Select</option>
                                    {discountTypes.map((type, index) => (
                                        <option key={index} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-span-4">
                                <label className="label h-7 mb-0">
                                    <span className="label-text text-sm">Code</span>
                                </label>
                                <div className="flex gap-1">
                                    <input
                                        type="text"
                                        placeholder="Enter website and the code"
                                        className="w-full input input-bordered flex-1 h-9 min-h-[36px] text-sm"
                                        disabled={!watch('discounts.0.type') || loading}
                                        {...register('discounts.0.code')}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddDiscount}
                                        className={`btn h-9 min-h-[36px] ${watch('discounts.0.type') && watch('discounts.0.code')
                                            ? 'btn-primary'
                                            : 'btn-disabled'
                                            }`}
                                        disabled={
                                            !watch('discounts.0.type') || !watch('discounts.0.code') || loading
                                        }>
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Display added discount codes */}

                        <div className="mt-4 space-y-2">
                            {packageData.discounts.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg group hover:bg-gray-100 transition-colors duration-200">
                                    <div>
                                        <span className="font-medium">{item.type}</span>
                                        <span className="mx-2">-</span>
                                        <span className="text-gray-600">{item.code}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDiscount(index);
                                        }}
                                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                                        aria-label="Delete discount">
                                        <span className="text-lg font-bold">&times;</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="primary-divider"></div>

                        <div className="flex justify-between">
                            <div className="text-base font-bold text-left mb-5">
                                Membership Tiers
                            </div>
                            <span className="text-secondary text-sm">
                                {packageData?.tiers?.length || 0} tiers added
                            </span>
                        </div>

                        <div className="mb-5 lg:grid lg:grid-cols-2 gap-x-5 p-5 rounded-2xl bg-secondary/5">
                            {price > 0 && (
                                <div className="col-span-2 mb-4">
                                    <Alert
                                        type="simple-outline"
                                        message={`If only 10% of your 100k followers enter your draw:
Your potential earnings would be ${currency} ${calculateEarnings(price).netEarnings} (after 15% platform fee) from a total revenue of ${currency} ${calculateEarnings(price).grossRevenue}`}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">
                                        Tier Name{' '}
                                        <Tooltip
                                            text="Give your tier a memorable name (e.g., 'Gold', 'Platinum', 'VIP'). Higher tiers typically offer better benefits and higher chances of winning."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    placeholder="Enter tier name"
                                    disabled={loading || isLocked || isInactive}
                                    {...register('name')}
                                />
                                <label className="label">
                                    {errors.name && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.name.message}
                                        </span>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">
                                        Tier Price{' '}
                                        <Tooltip
                                            text="Set the membership price for this tier. Higher-priced tiers should offer better perks and increased winning chances to provide more value."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter tier price"
                                    className="input input-bordered w-full"
                                    step="any"
                                    min={0}
                                    disabled={loading || isLocked || isInactive}
                                    {...register('price', { valueAsNumber: true })}
                                />
                                <label className="label">
                                    {errors.price && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.price.message}
                                        </span>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm">
                                        Number of Tickets{' '}
                                        <Tooltip
                                            text="Set how many entries this tier receives per draw. Higher tiers typically get more entries, increasing their chances of winning."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>

                                <input
                                    type="number"
                                    placeholder="Number of Tickets"
                                    className="input input-bordered w-full"
                                    min={0}
                                    disabled={loading || isLocked || isInactive}
                                    {...register('numberOfTicket', { valueAsNumber: true })}
                                />
                                <label className="label">
                                    {errors.numberOfTicket && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.numberOfTicket.message}
                                        </span>
                                    )}
                                </label>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">
                                        Accumulate Entries{' '}
                                        <Tooltip
                                            text="Specify how many automatic entries this tier receives for each recurring draw. Higher numbers mean better value for members."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter accumulate entries"
                                    className="input input-bordered border-gray-400 w-full"
                                    min={0}
                                    disabled={loading || isLocked || isInactive}
                                    {...register('recurringEntry', { valueAsNumber: true })}
                                />
                                <label className="label">
                                    {errors.recurringEntry && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.recurringEntry.message}
                                        </span>
                                    )}
                                </label>
                            </div>

                            <div className="col-span-2">
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">
                                        Tier Highlight{' '}
                                        <Tooltip
                                            text="Write key features or special aspects of this prize tier to make it stand out"
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <textarea
                                    className="textarea input-bordered w-full"
                                    placeholder="Enter tier highlight.(Add hyphen - for every line)"
                                    disabled={loading || isLocked || isInactive}
                                    {...register('highlight')}
                                />
                                <label className="label">
                                    {errors.highlight && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.highlight.message}
                                        </span>
                                    )}
                                </label>
                            </div>

                            <button
                                type="button"
                                className="col-span-2 btn bg-primary/10 text-primary w-full hover:bg-primary/20"
                                onClick={handleSubmit(addNewTier)}
                                disabled={loading || isLocked || isInactive}>
                                <FaPlus className="text-[18px]" />
                                Add Tier
                            </button>
                        </div>

                        <div>
                            <div className="mb-3 flex flex-col">
                                {packageData.tiers.length !== 0 ? (
                                    <div className="divider mb-6 text-sm">Your Current Tiers</div>
                                ) : undefined}

                                {packageData.tiers.map((tier, index) => (
                                    <div key={index}>
                                        <AccordionPackage
                                            name={tier.name}
                                            price={tier.price ?? 0}
                                            numberOfTicket={tier.numberOfTicket ?? 0}
                                            recurringEntry={tier.recurringEntry ?? 0}
                                            highlight={tier.highlight}
                                            disabled={loading || isLocked || isInactive}
                                            onDelete={(e) => {
                                                e?.preventDefault();
                                                handleDeleteTier(index);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Winner Selection Information */}
                            <div className="mb-6">
                                <div className="mb-5">
                                    <Alert
                                        message={
                                            'Winners will be automatically selected from the pool of entry tickets at each draw date. The selection is random and transparent, ensuring fair play for all participants.'
                                        }
                                        type="simple-outline"
                                    />
                                    <br />
                                    <Alert
                                        message={
                                            "If your prize money is over $30,000 please contact us at hello@vivaclub.io to to arrange your trade promotional license."
                                        }
                                        type="simple-outline"
                                    />
                                </div>
                            </div>

                            {/* Email Winner Section */}
                            <div className="mb-6">
                                <label className="label">
                                    <span className="label-text text-sm">
                                        Email Winner{' '}
                                        <Tooltip
                                            text="Choose whether to automatically email the winner when the draw is completed."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={packageData.emailWinner !== false}
                                        onChange={(e) => setPackageData(prev => ({ ...prev, emailWinner: e.target.checked }))}
                                        disabled={loading || isLocked || isInactive}
                                    />
                                    <span className="text-sm text-gray-600">
                                        Automatically email the winner when draw is completed
                                    </span>
                                </div>
                            </div>

                            {/* Terms block - exactly like CreateDraw */}
                            <div className="rounded-xl border border-gray-200 bg-white p-5">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 rounded-xl bg-purple-100 text-purple-600 p-3">
                                        <FaRegFileLines className="text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-left">Membership Terms &amp; Conditions</p>
                                        <p className="mt-1 text-sm text-gray-600 text-left">
                                            The default VivaClub terms will be applied to your membership. You can edit them here to add or remove any clauses specific to this membership.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 text-left">
                                    <button
                                        type="button"
                                        onClick={openTermsModal}
                                        className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                                        disabled={isLocked || loading || isInactive}
                                    >
                                        <FaPen /> Edit Terms
                                    </button>
                                </div>
                                <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2">
                                    <FaTriangleExclamation className="mt-0.5 text-yellow-600" />
                                    <p className="text-xs text-gray-700 text-left">
                                        Once published, terms cannot be edited—only canceled.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full rounded-btn font-semibold mt-4"
                                disabled={loading || isInactive}>
                                {loading ? (
                                    <span className="loading loading-dots loading-md items-center"></span>
                                ) : (
                                    packageId ? 'Update Membership' : 'Create Membership'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Popup
                isOpen={showPopup.state}
                text={showPopup.text}
                button1={{ name: 'OK', onClick: closePopup, mode: 'btn-primary w-20 text-white' }}
            />
        {/* Terms & Conditions Modal */}
        {showTermsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-hidden">
                <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-4 max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                        <h3 className="text-lg font-semibold">{termsEdited ? 'Edit Terms & Conditions (this membership)' : 'New Terms & Conditions (this membership)'}</h3>
                        <button onClick={closeTermsModal} className="btn btn-sm">✕</button>
                    </div>
                    <div className="border rounded-lg flex-1 overflow-y-scroll">
                        {termsModalLoading ? (
                            <div className="flex items-center justify-center h-full"><span className="loading loading-dots loading-md"></span></div>
                        ) : (
                            <div className="h-full overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={termsContent}
                                    onChange={setTermsContent}
                                    style={{ height: '100%' }}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            [{ 'color': [] }, { 'background': [] }],
                                            [{ 'align': [] }],
                                            ['link', 'blockquote', 'code-block'],
                                            ['clean']
                                        ],
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-3 flex-shrink-0">
                        <button className="btn" onClick={closeTermsModal}>Cancel</button>
                        <button className="btn btn-primary" onClick={saveTermsModal}>Save</button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default CreatePackage;
