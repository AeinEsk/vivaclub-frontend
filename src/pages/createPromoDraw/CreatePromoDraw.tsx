import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPromotionalDraw, uploadImage, getDrawInfoById, updateDraw } from '../../api/draws';
import { PATHS } from '../../routes/routes';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { currency as currencyOptions, timeZone, drawType } from '../../@types/darw';
import Tooltip from '../../components/tooltip/Tooltip';
import Alert from '../../components/alert/Alert';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchTerms } from '../../api/terms';
import { FaPen, FaRegFileLines, FaTriangleExclamation, FaInstagram, FaFacebook, FaTiktok, FaXTwitter, FaYoutube, FaGlobe, FaGoogle, FaTrash, FaPlus, FaXmark } from 'react-icons/fa6';
import { HOST_API } from '../../api/config';
import { validatePromoPeriods, getNowInTimezone } from '../../utils/validation';

// Create separate promotional draw pages
// 1. Promotional Draw Signup Page



const promoSchema = z.object({
    name: z.string().nonempty('Draw Name is required'),
    runAt: z.string().nonempty('Date is required'),
    prize: z.string().nonempty('Prize is required'),
    entryCost: z.number().min(0).default(0),
    runMethod: z.string().nonempty('Draw Type is required'),
    imageId: z.string().nullable().optional(),
    timezone: z.string().nonempty('Required'),
    currency: z.string().nonempty('Required'),
    discounts: z.array(z.object({
        type: z.string(),
        code: z.string()
    })).optional(),
    ticketCap: z
        .number({ invalid_type_error: 'Number of Ticket(s) must be a number' })
        .int('Must be an integer')
        .positive('Must be greater than 0')
        .optional(),
    emailWinner: z.boolean().optional(),
    termsHtml: z.string().optional(),
    socials: z.object({
        instagram: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
        facebook: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
        tiktok: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
        googleReview: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
        x: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
        youtube: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
        website: z.string().url('Must be a valid URL').or(z.literal('')).optional()
    }).optional()
}).superRefine((data, ctx) => {
    const currentDiscount = data.discounts?.[0];
    if (currentDiscount?.type && !currentDiscount?.code) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Discount code is required when discount type is selected',
            path: ['discounts', 0, 'code']
        });
    }
});

type FormData = z.infer<typeof promoSchema>;

const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-10 backdrop-blur-[1px] z-50">
            <span className="loading loading-ring loading-lg"></span>
            <p className="pt-1 font-bold text-primary">Uploading image ...</p>
        </div>
    );
};

const CreatePromoDraw = () => {
    const [loading, setLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileError, setFileError] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [isInactive, setIsInactive] = useState(false);
    const navigate = useNavigate();
    const { drawId } = useParams<{ drawId: string }>();
    const isEditMode = !!drawId;
    const today = new Date().toISOString().slice(0, 16);
    // Terms modal states
    const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
    const [termsContent, setTermsContent] = useState<string>('');
    const [termsLoading, setTermsLoading] = useState<boolean>(false);
    const [termsEdited, setTermsEdited] = useState<boolean>(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
    const [promoPeriods, setPromoPeriods] = useState<Array<{ start: string; end: string; multiplier: number }>>([]);
    const [promoPeriodsError, setPromoPeriodsError] = useState<string>('');
    const promoPeriodsRef = useRef<HTMLDivElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, dirtyFields },
        watch
    } = useForm<FormData>({
        resolver: zodResolver(promoSchema),
        defaultValues: {
            name: '',
            runAt: '',
            prize: '',
            entryCost: 0,
            runMethod: '',
            imageId: undefined,
            timezone: 'Australia/Sydney',
            currency: 'AUD',
            discounts: [],
            ticketCap: undefined,
            emailWinner: true,
            termsHtml: undefined,
            socials: {
                instagram: '',
                facebook: '',
                tiktok: '',
                googleReview: '',
                x: '',
                youtube: '',
                website: ''
            }
        }
    });

    useEffect(() => {
        setValue('entryCost', 0, { shouldValidate: true });
    }, [setValue]);

    // Use server-provided ISO substring to avoid any timezone conversion shifting hours
    const toInputFromServerIso = (iso?: string) => (iso ? String(iso).slice(0, 16) : '');

    // Fetch draw data for editing
    useEffect(() => {
        const fetchDrawData = async () => {
            if (!isEditMode || !drawId) return;

            try {
                setLoading(true);
                const response = await getDrawInfoById(drawId);
                const drawData = response.data;

                // Format the date for the datetime-local input
                const formattedDate = toInputFromServerIso(drawData.runAt);

                // Populate form with existing data
                setValue('name', drawData.name);
                setValue('runAt', formattedDate);
                setValue('prize', drawData.prize);
                setValue('runMethod', drawData.runMethod);
                setValue('timezone', drawData.timezone);
                setValue('currency', drawData.currency);
                setValue('imageId', drawData.imageId);
                // Only set ticketCap if greater than 0 to avoid validation blocking when hidden
                if (Number(drawData.ticketCap) > 0) {
                    setValue('ticketCap', drawData.ticketCap);
                }
                setValue('emailWinner', drawData.emailWinner !== false);

                // Set terms content if exists
                if (drawData.termsHtml) {
                    setTermsContent(drawData.termsHtml);
                    setTermsEdited(true);
                }

                // Set social links if they exist
                if (drawData.socials) {
                    setValue('socials.instagram', drawData.socials.instagram || '');
                    setValue('socials.facebook', drawData.socials.facebook || '');
                    setValue('socials.tiktok', drawData.socials.tiktok || '');
                    setValue('socials.googleReview', drawData.socials.googleReview || '');
                    setValue('socials.x', drawData.socials.x || '');
                    setValue('socials.youtube', drawData.socials.youtube || '');
                    setValue('socials.website', drawData.socials.website || '');
                }

                // Set current image URL if exists
                if (drawData.imageId) {
                    setCurrentImageUrl(`${HOST_API}/public/download/${drawData.imageId}`);
                }

                // Set promotional periods if they exist
                if (Array.isArray(drawData.promoPeriods)) {
                    setPromoPeriods(
                        drawData.promoPeriods.map((p: any) => ({
                            start: p.start ? p.start.slice(0, 16) : '',
                            end: p.end ? p.end.slice(0, 16) : '',
                            multiplier: Number(p.multiplier) || 1
                        }))
                    );
                }

                // Determine lock state for promo draws: allow promo period edits when active, lock all when inactive
                const participants = Number(drawData.noOfPartic || 0);
                const nowIso = new Date().toISOString();
                const expired = !!drawData.runAt && nowIso >= drawData.runAt;
                setIsLocked(participants > 0);
                setIsInactive(!!drawData.deactivatedAt || expired);

            } catch (error: any) {
                console.error('Error fetching draw data:', error);
                setError('Failed to load draw data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchDrawData();
    }, [drawId, isEditMode, setValue]);

    const openTermsModal = async () => {
        try {
            setTermsLoading(true);
            setShowTermsModal(true);
            if (!termsEdited) {
                const { data } = await fetchTerms();
                setTermsContent(data?.html || '');
            }
        } catch (e) {
            setTermsContent('');
        } finally {
            setTermsLoading(false);
        }
    };
    const closeTermsModal = () => setShowTermsModal(false);
    const saveTermsModal = () => {
        setTermsEdited(true);
        setShowTermsModal(false);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setImgLoading(true);
            // Check file size (1MB)
            if (selectedFile.size > 1 * 1024 * 1024) {
                setFileError('File size exceeds 1MB. Please select a smaller file.');
                console.error('File size exceeds 1MB. Please select a smaller file.');
                setValue('imageId', '', { shouldValidate: true });
                setImgLoading(false);
                return;
            }
            setFileError('');
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                const response = await uploadImage(formData);
                const imageId = response?.data?.id;
                setValue('imageId', imageId, { shouldValidate: true });
                // Update current image URL
                if (imageId) {
                    setCurrentImageUrl(`${HOST_API}/public/download/${imageId}`);
                }
                setImgLoading(false);
            } catch (error) {
                setValue('imageId', '', { shouldValidate: true });
                console.error('Error uploading file:', error);
                setFileError(`Error uploading file`);
                setImgLoading(false);
            }
        }
    };

    const handleRemoveImage = () => {
        setValue('imageId', undefined, { shouldValidate: true });
        setCurrentImageUrl('');
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const validatePromoPeriodsLocal = () => {
        const validation = validatePromoPeriods(promoPeriods, { 
            runAt: watch('runAt'),
            timezone: watch('timezone'),
            isUpdateMode: isEditMode,
            // On create enforce future dates; on edit allow past periods to remain
            validateNotInPast: !isEditMode
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

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            setError('');

            // Validate promotional periods before submission
            if (!validatePromoPeriodsLocal()) {
                setLoading(false);
                return;
            }

            // Build promo periods payload once
            const promoPeriodsPayload = (promoPeriods || [])
                .filter(p => p.start && p.end && Number(p.multiplier) >= 1)
                .map(p => ({ start: p.start, end: p.end, multiplier: Math.max(1, Math.floor(Number(p.multiplier))) }));

            // If locked in edit mode, only submit promoPeriods
            if (isEditMode && isLocked && drawId) {
                const payload = { promoPeriods: promoPeriodsPayload } as any;
                const response = await updateDraw(drawId, payload);
                if (response && response.data) {
                    navigate(PATHS.WELCOME);
                } else {
                    setError('Failed to update promotional periods. Please try again.');
                }
                return;
            }

            const formDataWithDiscounts: any = {
                ...data,
                termsHtml: termsEdited ? termsContent : undefined,
                entryCost: 0,
                promoPeriods: promoPeriodsPayload
            };

            // Ensure ticketCap is omitted if not provided or invalid
            if (!data.ticketCap || !Number.isFinite(Number(data.ticketCap))) {
                delete formDataWithDiscounts.ticketCap;
            }

            // Handle image removal: send null to remove image, or keep current value
            if (isEditMode && drawId) {
                if (data.imageId === undefined) {
                    // User removed the image, send null to delete it
                    formDataWithDiscounts.imageId = null;
                } else if (!data.imageId) {
                    // No new image uploaded, don't send imageId field to keep existing
                    delete formDataWithDiscounts.imageId;
                }
            }

            // Ensure socials are properly formatted
            if (data.socials) {
                formDataWithDiscounts.socials = {};
                if (data.socials.instagram) formDataWithDiscounts.socials.instagram = data.socials.instagram;
                if (data.socials.facebook) formDataWithDiscounts.socials.facebook = data.socials.facebook;
                if (data.socials.tiktok) formDataWithDiscounts.socials.tiktok = data.socials.tiktok;
                if (data.socials.googleReview) formDataWithDiscounts.socials.googleReview = data.socials.googleReview;
                if (data.socials.x) formDataWithDiscounts.socials.x = data.socials.x;
                if (data.socials.youtube) formDataWithDiscounts.socials.youtube = data.socials.youtube;
                if (data.socials.website) formDataWithDiscounts.socials.website = data.socials.website;
            }

            let response;
            if (isEditMode && drawId) {
                // Update existing draw
                const payload = { ...formDataWithDiscounts } as any;
                if (!(dirtyFields as any)?.runAt) {
                    delete payload.runAt;
                }
                response = await updateDraw(drawId, payload);
                if (response && response.data) {
                    navigate(PATHS.WELCOME);
                } else {
                    setError('Failed to update promotional draw. Please try again.');
                }
            } else {
                // Create new draw
                response = await createPromotionalDraw(formDataWithDiscounts);
                if (response && response.data) {
                    navigate(PATHS.WELCOME);
                } else {
                    setError('Failed to create promotional draw. Please try again.');
                }
            }
        } catch (e: any) {
            const action = isEditMode ? 'updating' : 'creating';
            // Tailor lock message for promo draws (signups-based)
            const status = e?.response?.status;
            const reason = e?.response?.data?.reason;
            if (status === 409 && reason === 'LOCKED') {
                setError('This promotional draw cannot be edited after the first signup or after deactivation.');
            } else {
                setError(e?.response?.data?.error || `An error occurred while ${action} the promotional draw`);
            }
        } finally {
            setLoading(false);
        }
    };

    const onInvalid = (formErrors?: any) => {
        // Don't force a global error if only image field has a message
        const keys = Object.keys(formErrors || {});
        if (keys.length === 1 && keys[0] === 'imageId') return;
        setError('Please fix the highlighted fields and try again.');
    };

    return (
        <div className="flex items-center justify-center">
            {imgLoading && <LoadingOverlay />}
            <div className="w-full max-w-sm lg:max-w-[50%] shadow-xl py-10 px-5 rounded-2xl border border-border/30 bg-white">
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
                    {isEditMode && isLocked && (
                        <div className="mb-4">
                            <Alert type="simple-outline" message={'This promotional draw is locked due to existing signups or deactivation. Only Promotional periods can be edited.'} />
                        </div>
                    )}
                    <div>
                        <label className="label">
                            <span className="label-text">
                                Draw Name{' '}
                                <Tooltip
                                    text="Give your draw a clear, descriptive name that helps participants understand what they're entering. This will be prominently displayed."
                                    direction="tooltip-left"
                                />
                            </span>
                        </label>
                        <input type="text" placeholder="Enter draw name" className="input input-bordered w-full" disabled={loading || isLocked} {...register('name')} />
                        <label className="label">{errors.name && <span className="label-text-alt text-red-600 font-semibold">{errors.name.message}</span>}</label>
                    </div>

                    <div className="grid grid-cols-3">
                        <div className="col-span-2 mr-3">
                            <label className="label">
                                <span className="label-text text-sm">
                                    Draw Date & Time{' '}
                                    <Tooltip
                                        text="Set when the draw will take place. Choose a time that maximizes participation and gives enough time for promotion."
                                        direction="tooltip-left"
                                    />
                                </span>
                            </label>
                            <input type="datetime-local" placeholder="Select date and time" className="input input-bordered  w-full" disabled={loading || isLocked} min={today} {...register('runAt')} />
                            <label className="label">{errors.runAt && <span className="label-text-alt text-red-600 font-semibold">{errors.runAt.message}</span>}</label>

                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text text-sm">Timezone</span>
                            </label>
                            <select className="select select-bordered  w-full" disabled={loading || isLocked} {...register('timezone')}>
                                <option value="" disabled>Choose Timezone</option>
                                {timeZone.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                            <label className="label">{errors.timezone && <span className="label-text-alt text-red-600 font-semibold">{errors.timezone.message}</span>}</label>
                        </div>
                    </div>

                    <div>
                        {/* Promotional periods */}
                        <div className="mt-4 mb-4" ref={promoPeriodsRef}>
                            <div className="flex items-center justify-between">
                                <label className="label">
                                    <span className="label-text">Promotional periods{' '}
                                        <Tooltip
                                            text="Boost entries for a set period. e.g. ‘Every ticket = 2 entries’ or ‘Every sign up = 2 entries."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                                    disabled={loading || isInactive}
                                    onClick={() => {
                                        const runAtVal = watch('runAt');
                                        const timezone = watch('timezone');
                                        // Default start 15 minutes from now to avoid immediate past on submit
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
                                        const end = runAtVal && runAtVal > start ? runAtVal : start;
                                        const newPeriod = { start, end, multiplier: 1 };
                                        setPromoPeriods([...(promoPeriods || []), newPeriod]);
                                    }}
                                >
                                    <FaPlus className="w-4 h-4 mr-1" />
                                    Add period
                                </button>
                            </div>
                            {(promoPeriods || []).map((p, idx) => {
                                const runAtVal = watch('runAt');
                                const timezone = watch('timezone');
                                const nowIso = getNowInTimezone(timezone);
                                const startInvalid = !!p.start && !!p.end && p.start >= p.end;
                                const afterRun = !!runAtVal && (!!p.end && p.end > runAtVal);

                                // Live overlap guards: compute adjacent bounds based on sorted periods
                                const sorted = (promoPeriods || [])
                                    .map((pp, i) => ({ i, s: pp.start || '' }))
                                    .sort((a, b) => a.s.localeCompare(b.s));
                                const pos = sorted.findIndex(x => x.i === idx);
                                const prevEnd = pos > 0 ? (promoPeriods[sorted[pos - 1].i]?.end || '') : '';
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
                                const startMax = nextStart || runAtVal || undefined;
                                const endMin = p.start || startMin;
                                const endMax = nextStart || runAtVal || undefined;

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
                                                    min={isEditMode ? undefined : startMin}
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
                                        {(startInvalid || afterRun) && (
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
                        {/* Controls under Timezone */}

                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text text-sm">
                                Prize{' '}
                                <Tooltip
                                    text="Describe the prize in detail, including its value and any specific conditions. Be clear and transparent about what winners will receive."
                                    direction="tooltip-left"
                                />
                            </span>
                        </label>
                        <textarea placeholder="Describe the prize" className="textarea input-bordered  w-full" disabled={loading || isLocked} {...register('prize')} />
                        <label className="label">{errors.prize && <span className="label-text-alt font-semibold text-red-600">{errors.prize.message}</span>}</label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="label"><span className="label-text text-sm">Entry Cost</span></label>
                            <input type="number" step="any" placeholder="0" className="input input-bordered w-full" disabled value={0} />
                        </div>
                        <div className="col-span-1">
                            <label className="label"><span className="label-text text-sm">Currency</span></label>
                            <select className="select select-bordered w-full" disabled={loading || isLocked} defaultValue="AUD" {...register('currency')}>
                                <option value="" disabled>Choose currency</option>
                                {currencyOptions.map((option: string, index: number) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text text-sm">
                                Draw Type{' '}
                                <Tooltip
                                    text="Choose how winners will be selected. This determines the draw mechanism and affects how participants are chosen."
                                    direction="tooltip-left"
                                />
                            </span>
                        </label>
                        <select className="select select-bordered  w-full" disabled={loading || isLocked} {...register('runMethod')}>
                            <option value="" disabled>Choose Draw Type</option>
                            {drawType
                                .filter((option) => option.value !== 'COMPUTER_PICKED_NO_WINNER')
                                .map((option, index) => (
                                    <option key={index} value={option.value}>{option.option}</option>
                                ))}
                        </select>
                        <label className="label">{errors.runMethod && <span className="label-text-alt text-red-600 font-semibold">{errors.runMethod.message}</span>}</label>
                    </div>

                    {/* Number of Ticket(s) hidden for promo draw - no field registered to avoid validation blocking */}

                    {/* Divider above */}
                    {/* Removed: Exclusive Discounts and Perks section for promo draws */}

                    <div>
                        <label className="label">
                            <span className="label-text text-sm">
                                Social Links (optional)
                                <Tooltip
                                    text="Add your social media links so participants can follow you for more updates and promotions."
                                    direction="tooltip-left"
                                />
                            </span>
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FaInstagram className="text-lg text-pink-600" />
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="Instagram URL (e.g., https://instagram.com/yourusername)"
                                        className="input input-bordered w-full"
                                        disabled={loading || isLocked}
                                        {...register('socials.instagram')}
                                    />
                                    {errors.socials?.instagram && (
                                        <label className="label h-5 mt-1">
                                            <span className="label-text-alt text-red-600 font-semibold">
                                                {errors.socials.instagram.message as string}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaFacebook className="text-lg text-blue-600" />
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="Facebook URL (e.g., https://facebook.com/yourpage)"
                                        className="input input-bordered w-full"
                                        disabled={loading || isLocked}
                                        {...register('socials.facebook')}
                                    />
                                    {errors.socials?.facebook && (
                                        <label className="label h-5 mt-1">
                                            <span className="label-text-alt text-red-600 font-semibold">
                                                {errors.socials.facebook.message as string}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaTiktok className="text-lg text-black" />
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="TikTok URL (e.g., https://tiktok.com/@yourusername)"
                                        className="input input-bordered w-full"
                                        disabled={loading || isLocked}
                                        {...register('socials.tiktok')}
                                    />
                                    {errors.socials?.tiktok && (
                                        <label className="label h-5 mt-1">
                                            <span className="label-text-alt text-red-600 font-semibold">
                                                {errors.socials.tiktok.message as string}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaGoogle className="text-lg text-red-600" />
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="Google Reviews URL (e.g., https://g.page/yourbusiness)"
                                        className="input input-bordered w-full"
                                        disabled={loading || isLocked}
                                        {...register('socials.googleReview')}
                                    />
                                    {errors.socials?.googleReview && (
                                        <label className="label h-5 mt-1">
                                            <span className="label-text-alt text-red-600 font-semibold">
                                                {errors.socials.googleReview.message as string}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaXTwitter className="text-lg" />
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="X (Twitter) URL (e.g., https://x.com/yourusername)"
                                        className="input input-bordered w-full"
                                        disabled={loading || isLocked}
                                        {...register('socials.x')}
                                    />
                                    {errors.socials?.x && (
                                        <label className="label h-5 mt-1">
                                            <span className="label-text-alt text-red-600 font-semibold">
                                                {errors.socials.x.message as string}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaYoutube className="text-lg text-red-600" />
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="YouTube URL (e.g., https://youtube.com/@yourchannel)"
                                        className="input input-bordered w-full"
                                        disabled={loading || isLocked}
                                        {...register('socials.youtube')}
                                    />
                                    {errors.socials?.youtube && (
                                        <label className="label h-5 mt-1">
                                            <span className="label-text-alt text-red-600 font-semibold">
                                                {errors.socials.youtube.message as string}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaGlobe className="text-lg text-gray-700" />
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        placeholder="Website URL (e.g., https://yourwebsite.com)"
                                        className="input input-bordered w-full"
                                        disabled={loading || isLocked}
                                        {...register('socials.website')}
                                    />
                                    {errors.socials?.website && (
                                        <label className="label h-5 mt-1">
                                            <span className="label-text-alt text-red-600 font-semibold">
                                                {errors.socials.website.message as string}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text text-sm">
                                Promotional Image{' '}
                                <Tooltip
                                    text="Upload an eye-catching image that represents your draw. High-quality visuals can increase participation rates."
                                    direction="tooltip-left"
                                />
                            </span>
                        </label>
                        <input
                            type="file"
                            className="file-input file:bg-primary/10 file:text-primary file:border-none file-input-bordered w-full"
                            accept=".jpeg, .jpg, .png"
                            onChange={handleFileChange}
                            disabled={loading || isLocked}
                        />

                        {/* Current Image Display */}
                        {currentImageUrl && (
                            <div className="mt-4">
                                <div className="relative inline-block">
                                    <img
                                        src={currentImageUrl}
                                        alt="Current promotional draw image"
                                        className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg"
                                        title="Remove image"
                                        disabled={loading || isLocked}
                                    >
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="label">
                            {!fileError ? (
                                <span className="label-text-alt">
                                    jpeg, jpg or png files only. Max size: 1MB
                                </span>
                            ) : (
                                <span className="label-text-alt text-red-600 font-semibold">
                                    {fileError}
                                </span>
                            )}
                            {errors.imageId && (
                                <span className="label-text-alt text-red-600 font-semibold">
                                    {errors.imageId.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text text sm">
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
                                checked={watch('emailWinner') !== false}
                                onChange={(e) => setValue('emailWinner', e.target.checked)}
                                disabled={loading || isLocked}
                            />
                            <span className="text-sm text-gray-600">
                                Automatically email the winner when draw is completed
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 mb-5 space-y-4">
                        <Alert
                            message={
                                'You can edit this promotional draw until the first signup occurs. After the first signup or if you deactivate the draw, editing is locked and only cancellation is allowed.'
                            }
                            type="simple-outline"
                        />
                        <Alert
                            message={
                                'If your prize money is over $30,000 please contact us at hello@vivaclub.io to arrange your trade promotional license.'
                            }
                            type="simple-outline"
                        />

                        {/* Terms block */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 rounded-xl bg-purple-100 text-purple-600 p-3">
                                    <FaRegFileLines className="text-lg" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-left">Draw Terms &amp; Conditions</p>
                                    <p className="mt-1 text-sm text-gray-600 text-left">
                                        The default VivaClub terms will be applied to your draw. You can edit them here to add or remove any clauses specific to this draw.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 text-left">
                                <button
                                    type="button"
                                    onClick={openTermsModal}
                                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                                    disabled={loading || isLocked}
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
                    </div>

                    {error && (<Alert message={error} type="alert-error" />)}

                    <button type="submit" className="btn btn-primary w-full rounded-btn font-normal mt-4" disabled={loading || isInactive}>
                        {loading ? (<span className="loading loading-dots loading-md items-center"></span>) : (isEditMode ? 'Update Promotional Draw' : 'Publish Promotional Draw')}
                    </button>

                    <div className="mt-4 text-center text-sm text-gray-600">
                        <p>After publishing, you'll get a unique QR code and link for participants to sign up</p>
                    </div>
                </form>
            </div>

            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-hidden">
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-4 max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-2 flex-shrink-0">
                            <h3 className="text-lg font-semibold">{termsEdited ? 'Edit Terms & Conditions (this draw)' : 'New Terms & Conditions (this draw)'}</h3>
                            <button onClick={closeTermsModal} className="btn btn-sm">✕</button>
                        </div>
                        <div className="border rounded-lg flex-1 overflow-y-scroll">
                            {termsLoading ? (
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
        </div>
    );
};

export default CreatePromoDraw;


