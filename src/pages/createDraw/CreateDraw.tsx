import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDraw, uploadImage } from '../../api/draws';
import { PATHS } from '../../routes/routes';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { currency as currencyOptions, drawType, timeZone, discountTypes } from '../../@types/darw';
import Tooltip from '../../components/tooltip/Tooltip';
import Alert from '../../components/alert/Alert';

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
    imageId: z.string().optional(),
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
    numbersLength: z
        .number({ invalid_type_error: 'Numbers drawn must be a number' })
        .int('Must be an integer')
        .min(1, 'At least 1 number')
        .max(20, 'Too many numbers')
        .optional(),
    numbersFrom: z
        .number({ invalid_type_error: 'From must be a number' })
        .int('Must be an integer')
        .min(0, 'Min is 0')
        .optional(),
    numbersTo: z
        .number({ invalid_type_error: 'To must be a number' })
        .int('Must be an integer')
        .min(1, 'Min is 1')
        .optional()
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
    const today = new Date().toISOString().slice(0, 16);
    const navigate = useNavigate();
    // Add state for discount codes
    const [discountItems, setDiscountItems] = useState<Array<{ type: string; code: string }>>([]);

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
        watch
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
            numbersLength: 7,
            numbersFrom: 0,
            numbersTo: 13
        }
    });

    const entryCost = watch('entryCost');
    const currency = watch('currency');

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            setError('');

            // Add discount items to the form data
            const formDataWithDiscounts = {
                ...data,
                discounts: discountItems
            };


            const response = await createDraw(formDataWithDiscounts);

            if (response && response.data) {
                navigate(PATHS.WELCOME);
            } else {
                setError('Failed to create draw. Please try again.');
                setLoading(false);
            }
        } catch (error: any) {
            console.error('Detailed error:', error);
            setLoading(false);
            // const errorMessage = error.response?.data?.message || 'An error occurred while creating the draw';
            // setError(errorMessage);
            console.error('Error creating draw:', error);
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

    return (
        <div className="flex items-center justify-center">
            {imgLoading && <LoadingOverlay />}
            <div className="w-full max-w-sm lg:max-w-[50%] shadow-xl py-10 px-5 rounded-2xl border border-border/30 bg-white">
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                            disabled={loading}
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
                                disabled={loading}
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
                                disabled={loading}
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
                            disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                            disabled={loading}
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
                                disabled={loading}
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

                        <div className="col-span-2">
                            <label className="label">
                                <span className="label-text text-sm">Numbers Drawn (odds)</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="label h-6 mb-1">
                                    <span className="label-text text-xs">Numbers drawn per ticket</span>
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="Length"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    {...register('numbersLength', { valueAsNumber: true })}
                                    min={1}
                                    max={20}
                                  />
                                </div>
                                <div>
                                  <label className="label h-6 mb-1">
                                    <span className="label-text text-xs">Range start (From)</span>
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="From"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    {...register('numbersFrom', { valueAsNumber: true })}
                                    min={0}
                                  />
                                </div>
                                <div>
                                  <label className="label h-6 mb-1">
                                    <span className="label-text text-xs">Range end (To)</span>
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="To"
                                    className="input input-bordered w-full"
                                    disabled={loading}
                                    {...register('numbersTo', { valueAsNumber: true })}
                                    min={1}
                                  />
                                </div>
                            </div>
                            <label className="label">
                                {(errors.numbersLength || errors.numbersFrom || errors.numbersTo) && (
                                    <span className="label-text-alt text-red-600 font-semibold">
                                        {(errors.numbersLength?.message || errors.numbersFrom?.message || errors.numbersTo?.message) as string}
                                    </span>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Divider above */}
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
                                        text="Choose what kind of special offer to provide. Strategic discounts can help boost participation and reward specific groups."
                                        direction="tooltip-left"
                                    />
                                </span>
                            </label>
                            <select
                                className="select select-bordered w-full h-9 min-h-[36px] text-sm"
                                disabled={loading}
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
                            disabled={loading}
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

                    <div className="mt-4 mb-5 ">
                        <Alert
                            message={
                                "The draw can't be edited after creation, only canceled. All entries will be refunded if the draw is canceled"
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

                    {/* Add error display */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full rounded-btn font-normal mt-4 bottom-0"
                        disabled={loading}>
                        {loading ? (
                            <span className="loading loading-dots loading-md items-center"></span>
                        ) : (
                            'Publish'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateDraw;
