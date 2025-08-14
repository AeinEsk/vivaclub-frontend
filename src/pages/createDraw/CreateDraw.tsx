import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDraw, uploadImage, updateDraw, getDrawInfoById } from '../../api/draws';
import { PATHS } from '../../routes/routes';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { currency as currencyOptions, drawType, timeZone, discountTypes } from '../../@types/darw';
import Tooltip from '../../components/tooltip/Tooltip';
import Alert from '../../components/alert/Alert';
// import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { fetchTerms } from '../../api/terms';
import { FaPen, FaRegFileLines, FaTriangleExclamation } from 'react-icons/fa6';

const calculateEarnings = (entryCost: number) => {
    const participants = 10000;
    const grossRevenue = Math.round(entryCost * participants);
    const platformFee = Math.round(grossRevenue * 0.15);
    const netEarnings = grossRevenue - platformFee;

    return {
        participants,
        grossRevenue: grossRevenue.toLocaleString(),
        netEarnings: netEarnings.toLocaleString()
    };
};

const LoadingOverlay = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-10 backdrop-blur-[1px] z-50">
            <span className="loading loading-ring loading-lg"></span>
            <p className="pt-1 font-bold text-primary">Uploading image ...</p>
        </div>
    );
};

const schema = z.object({
    name: z.string().nonempty('Draw Name is required'),
    runAt: z.string().nonempty('Date is required'),
    prize: z.string().nonempty('Prize is required'),
    entryCost: z
        .number({
            invalid_type_error: 'Entry Cost must be a valid number'
        })
        .min(1, 'Entry Cost must be at least 1')
        .refine((value) => !Number.isNaN(value), {
            message: 'Please enter a valid Entry Cost'
        }),
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
    // numbers settings are auto-calculated by backend based on ticket cap
});

// Update validation schema
const validationSchema = schema.superRefine((data, ctx) => {
    const currentDiscount = data.discounts?.[0];
    if (currentDiscount?.type && !currentDiscount?.code) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Discount code is required when discount type is selected',
            path: ['discounts', 0, 'code']
        });
    }
});

type FormData = z.infer<typeof validationSchema>;

// Add this type definition

const CreateDraw = () => {
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [imgLoading, setImgLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const today = new Date().toISOString().slice(0, 16);
    const navigate = useNavigate();
    const { drawId } = useParams<{ drawId: string }>();
    // Add state for discount codes
    const [discountItems, setDiscountItems] = useState<Array<{ type: string; code: string }>>([]);
    // Terms modal states
    const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
    const [termsContent, setTermsContent] = useState<string>('');
    const [termsLoading, setTermsLoading] = useState<boolean>(false);
    const [termsEdited, setTermsEdited] = useState<boolean>(false);

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
                setError('File size exceeds 1MB. Please select a smaller file.');
                console.error('File size exceeds 1MB. Please select a smaller file.');
                setValue('imageId', '', { shouldValidate: true });
                setImgLoading(false);
                return;
            }
            setError('');
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                const response = await uploadImage(formData);
                const imageId = response?.data?.id;
                setValue('imageId', imageId, { shouldValidate: true });
                setImgLoading(false);
            } catch (error) {
                setValue('imageId', '', { shouldValidate: true });
                console.error('Error uploading file:', error);
                setError(`Error uploading file: ${error}`);
                setImgLoading(false);
            }
        }
    };

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        watch,
        reset
    } = useForm<FormData>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            name: '',
            runAt: '',
            prize: '',
            entryCost: undefined,
            runMethod: '',
            imageId: undefined,
            timezone: 'Australia/Sydney',
            currency: 'AUD',
            ticketCap: undefined,
            emailWinner: true
        }
    });

    const entryCost = watch('entryCost');
    const currency = watch('currency');

    // Load draw if in edit mode
    useEffect(() => {
        const load = async () => {
            if (!drawId) return;
            try {
                setInitialLoading(true);
                const res = await getDrawInfoById(drawId);
                const d = res.data;
                const formattedRunAt = new Date(d.runAt).toISOString().slice(0, 16);
                reset({
                    name: d.name,
                    runAt: formattedRunAt,
                    prize: d.prize,
                    entryCost: Number(d.entryCost),
                    runMethod: d.runMethod,
                    imageId: d.imageId ?? undefined,
                    timezone: d.timezone,
                    currency: d.currency,
                    ticketCap: d.ticketCap ?? undefined,
                    emailWinner: d.emailWinner !== false,
                    discounts: d.discounts || []
                });
                setIsLocked(((d.noOfPartic ?? 0) > 0) || !!d.deactivatedAt);
                // preload discounts and terms UI state
                if (Array.isArray(d.discounts)) {
                    setDiscountItems(d.discounts);
                }
                if (d.termsHtml) {
                    setTermsContent(d.termsHtml);
                    setTermsEdited(true);
                }
            } catch (e) {
                setError('Failed to load draw');
            } finally {
                setInitialLoading(false);
            }
        };
        load();
    }, [drawId, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            setError('');

            const formDataWithDiscounts: any = {
                ...data,
                discounts: discountItems,
                termsHtml: termsEdited ? termsContent : undefined
            };
            // Avoid clearing image unless a new one is uploaded
            if (drawId && !data.imageId) {
                delete formDataWithDiscounts.imageId;
            }

            const response = drawId
                ? await updateDraw(drawId, formDataWithDiscounts)
                : await createDraw(formDataWithDiscounts);

            if (response && response.data) {
                navigate(drawId ? PATHS.DRAW_LIST : PATHS.WELCOME);
            } else {
                setError(drawId ? 'Failed to update draw. Please try again.' : 'Failed to create draw. Please try again.');
                setLoading(false);
            }
        } catch (error: any) {
            console.error('Detailed error:', error);
            const message = error?.response?.data?.error || (drawId ? 'Draw cannot be edited.' : 'An error occurred while creating the draw');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Modify the add function to prevent form submission
    const handleAddDiscount = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        const type = watch('discounts.0.type');
        const code = watch('discounts.0.code');

        if (type && code) {
            setDiscountItems([...discountItems, { type, code }]);
            // Reset inputs
            setValue('discounts.0.type', '', { shouldValidate: true });
            setValue('discounts.0.code', '', { shouldValidate: true });
        }
    };

    const handleDeleteDiscount = (index: number) => {
        setDiscountItems(discountItems.filter((_, i) => i !== index));
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            {imgLoading && <LoadingOverlay />}
            <div className="w-full max-w-sm lg:max-w-[50%] shadow-xl py-10 px-5 rounded-2xl border border-border/30 bg-white">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {isLocked && (
                        <div className="mb-4">
                            <Alert type="simple-outline" message={'This draw can no longer be edited because tickets have been sold or a payment is in progress.'} />
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

                        <input
                            type="text"
                            placeholder="Enter draw name"
                            className="input input-bordered w-full"
                            disabled={loading || isLocked}
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
                            <input
                                type="datetime-local"
                                className="input input-bordered  w-full"
                                disabled={loading || isLocked}
                                min={today}
                                {...register('runAt')}
                            />
                            <label className="label">
                                {errors.runAt && (
                                    <span className="label-text-alt text-red-600 font-semibold">
                                        {errors.runAt.message}
                                    </span>
                                )}
                            </label>
                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text text-sm">Timezone</span>
                            </label>
                            <select
                                className="select select-bordered  w-full"
                                disabled={loading || isLocked}
                                {...register('timezone')}>
                                <option value="" disabled>
                                    Choose Timezone
                                </option>
                                {timeZone.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <label className="label">
                                {errors.timezone && (
                                    <span className="label-text-alt text-red-600 font-semibold">
                                        {errors.timezone.message}
                                    </span>
                                )}
                            </label>
                        </div>
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
                        <textarea
                            placeholder="Enter draw prize"
                            className="textarea input-bordered  w-full"
                            disabled={loading || isLocked}
                            {...register('prize')}
                        />
                        <label className="label">
                            {errors.prize && (
                                <span className="label-text-alt font-semibold text-red-600">
                                    {errors.prize.message}
                                </span>
                            )}
                        </label>
                    </div>
                    <div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="label">
                                    <span className="label-text text-sm">
                                        Entry Cost{' '}
                                        <Tooltip
                                            text="Set how much it costs to enter the draw. Consider your target audience and the prize value when setting this amount. This directly affects your potential earnings."
                                            direction="tooltip-left"
                                        />
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter entry cost"
                                    step="any"
                                    className="input input-bordered w-full"
                                    disabled={loading || isLocked}
                                    {...register('entryCost', { valueAsNumber: true })}
                                    min={0}
                                />
                                <label className="label">
                                    {errors.entryCost && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.entryCost.message}
                                        </span>
                                    )}
                                </label>
                            </div>

                            <div className="col-span-1">
                                <label className="label">
                                    <span className="label-text text-sm">Currency</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    disabled={loading || isLocked}
                                    defaultValue="AUD"
                                    {...register('currency')}>
                                    <option value="" disabled>
                                        Choose currency
                                    </option>
                                    {currencyOptions.map((option: string, index: number) => (
                                        <option key={index} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <label className="label">
                                    {errors.currency && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.currency.message}
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Earnings calculator below both fields */}
                        {entryCost > 0 && (
                            <div className="mt-2">
                                <Alert
                                    type="simple-outline"
                                    message={`If only 10% of your 100k followers enter your draw:
Your potential earnings would be ${currency} ${calculateEarnings(entryCost).netEarnings} (after 15% platform fee) from a total revenue of ${currency} ${calculateEarnings(entryCost).grossRevenue}`}
                                />
                            </div>
                        )}
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
                        <select
                            className="select select-bordered  w-full"
                            disabled={loading || isLocked}
                            {...register('runMethod')}>
                            <option value="" disabled>
                                Choose Draw Type
                            </option>
                            {drawType.map((option, index) => (
                                <option key={index} value={option.value}>
                                    {option.option}
                                </option>
                            ))}
                        </select>
                        <label className="label">
                            {errors.runMethod && (
                                <span className="label-text-alt text-red-600 font-semibold">
                                    {errors.runMethod.message}
                                </span>
                            )}
                        </label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label className="label">
                                <span className="label-text text-sm">Number of Ticket(s)</span>
                            </label>
                            <input
                                type="number"
                                placeholder="e.g. 1000"
                                className="input input-bordered w-full"
                                disabled={loading || isLocked}
                                {...register('ticketCap', { valueAsNumber: true })}
                                min={1}
                            />
                            <label className="label">
                                {errors.ticketCap && (
                                    <span className="label-text-alt text-red-600 font-semibold">
                                        {errors.ticketCap.message}
                                    </span>
                                )}
                            </label>
                        </div>

                        <div className="col-span-2"></div>
                    </div>

                    {/* Divider above */}
                    <div className="primary-divider"></div>

                    {/* Heading for discount section */}
                    <div className="flex items-center justify-between text-base font-bold text-left mb-5">
                        <span>Exclusive Discounts and Perks</span>

                    </div>

                    <div className="grid grid-cols-6 gap-2">
                        <div className="col-span-2">
                            <label className="label h-7 mb-0">
                                <span className="label-text text-sm">
                                    Type
                                    <Tooltip
                                        text="Choose what kind of special offer to provide. Strategic discounts can help boost participation and reward specific groups."
                                        direction="tooltip-left"
                                    />
                                </span>
                            </label>
                            <select
                                className="select select-bordered w-full h-9 min-h-[36px] text-sm"
                                disabled={loading || isLocked}
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
                                    placeholder="Enter website code"
                                    className="w-full input input-bordered flex-1 h-9 min-h-[36px] text-sm"
                                    disabled={!watch('discounts.0.type') || loading || isLocked}
                                    {...register('discounts.0.code')}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddDiscount}
                                    className={`btn h-9 min-h-[36px] ${watch('discounts.0.type') && watch('discounts.0.code')
                                        ? 'btn-primary'
                                        : 'btn-disabled'
                                        }`}
                                    disabled={!watch('discounts.0.type') || !watch('discounts.0.code') || loading || isLocked}>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Display added discount codes */}
                    <div className="mt-4 space-y-2">
                        {discountItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg group hover:bg-gray-100 transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium capitalize">
                                        {item.type}:
                                    </span>
                                    <span className="text-sm">{item.code}</span>
                                </div>
                                <button
                                    type="button"
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

                    {/* Divider below */}
                    <div className="primary-divider"></div>

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
                        <div className="label">
                            {!error ? (
                                <span className="label-text-alt">
                                    jpeg, pdf or jpg files only. Max size: 1MB
                                </span>
                            ) : (
                                <span className="label-text-alt text-red-600 font-semibold">
                                    {error}
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
                            <span className="label-text text-sm">
                                Email Winner{' '}
                                <Tooltip
                                    text="Choose whether to automatically email the winner when the draw is completed. You can always contact them manually if needed."
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
                                'You can edit this draw until the first ticket is sold or a payment is in progress. After that, only cancellation is allowed.'
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
                                    disabled={isLocked}
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

                    {/* Add error display */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full rounded-btn font-normal mt-4 bottom-0"
                        disabled={loading || isLocked}>
                        {loading ? (
                            <span className="loading loading-dots loading-md items-center"></span>
                        ) : (
                            drawId ? 'Update Draw' : 'Publish'
                        )}
                    </button>
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

export default CreateDraw;
