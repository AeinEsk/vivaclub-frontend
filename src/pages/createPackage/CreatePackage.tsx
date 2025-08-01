import { useRef, useState } from 'react';
import { PackageFormData } from '../../@types/packageForm';
import { useNavigate } from 'react-router-dom';
import { createMembership } from '../../api/packages';
import Alert from '../../components/alert/Alert';
import AccordionPackage from '../../components/accordionCard/AccordionPackage';
import { PATHS } from '../../routes/routes';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Popup from '../../components/alert/Popup';
import Tooltip from '../../components/tooltip/Tooltip';
import {  timeZone, discountTypes } from '../../@types/darw';
import { FaPlus } from 'react-icons/fa6';
import { currency as currencyOptions } from '../../@types/darw';

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
    chanceOfWin: validateNumber(1, 'Chance of Win must be at least 1'),
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
    const [packageData, setPackageData] = useState<PackageFormData>({
        name: '',
        frequency: 'Weekly',
        drawDate: '',
        currency: 'AUD',
        timezone: 'Australia/Sydney',
        tiers: [],
        discounts: []
    });
    const membershipFrequency = ['Weekly', 'Fortnightly', 'Monthly', 'Yearly'];
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
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
            chanceOfWin: undefined,
            recurringEntry: undefined,
            highlight: '',
            discounts: [],
        }
    });

    const addNewTier = (data: TierFormData) => {
        const tierData = {
            name: data.name,
            price: data.price,
            chanceOfWin: data.chanceOfWin,
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
            chanceOfWin: 0,
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

    const publishData = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateFields()) return;

        if (packageData.tiers.length === 0) {
            setShowPopup({
                state: true,
                text: 'You should add at least one Tier.'
            });
            return;
        }

        handleCreatePackage(packageData);
    };

    const handleCreatePackage = async (packageVal: PackageFormData) => {
        try {
            setLoading(true);
            await createMembership(packageVal);
            navigate(PATHS.WELCOME);
        } catch (error: any) {
            setLoading(false);
            console.error(error.response);
        }
    };

    const closePopup = (): void => {
        setShowPopup({ state: false, text: '' });
    };

    const price = watch('price');
    const currency = watch('currency');

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
                                className="input input-bordered border-gray-400 w-full"
                                value={packageData.name}
                                ref={inputRefs.name}
                                onChange={(e) =>
                                    setPackageData({ ...packageData, name: e.target.value })
                                }
                                disabled={loading}
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
                                    className="select select-bordered border-gray-400 w-full"
                                    value={packageData.frequency}
                                    ref={inputRefs.frequency}
                                    onChange={(e) =>
                                        setPackageData({
                                            ...packageData,
                                            frequency: e.target.value
                                        })
                                    }
                                    disabled={loading}>
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
                                    disabled={loading}
                                    defaultValue="AUD"
                                    {...register('currency')}>
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
                                    className="select select-bordered border-gray-400 w-full"
                                    defaultValue="Australia/Sydney"
                                    ref={inputRefs.timezone}
                                    onChange={(e) =>
                                        setPackageData({
                                            ...packageData,
                                            timezone: e.target.value
                                        })
                                    }
                                    disabled={loading}>
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
                                className="input input-bordered border-gray-400 w-full"
                                value={packageData.drawDate}
                                onChange={(e) =>
                                    setPackageData({ ...packageData, drawDate: e.target.value })
                                }
                                disabled={loading}
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
                                    className="input input-bordered border-gray-400 w-full"
                                    placeholder="Enter tier name"
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
                                    className="input input-bordered border-gray-400 w-full"
                                    step="any"
                                    min={0}
                                    disabled={loading}
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
                                    className="input input-bordered border-gray-400 w-full"
                                    min={0}
                                    disabled={loading}
                                    {...register('chanceOfWin', { valueAsNumber: true })}
                                />
                                <label className="label">
                                    {errors.chanceOfWin && (
                                        <span className="label-text-alt text-red-600 font-semibold">
                                            {errors.chanceOfWin.message}
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
                                    disabled={loading}
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
                                    className="textarea input-bordered border-gray-400 w-full"
                                    placeholder="Enter tier highlight.(Add hyphen - for every line)"
                                    disabled={loading}
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
                                onClick={handleSubmit(addNewTier)}>
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
                                            chanceOfWin={tier.chanceOfWin ?? 0}
                                            recurringEntry={tier.recurringEntry ?? 0}
                                            highlight={tier.highlight}
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

                            <button
                                type="submit"
                                className="btn btn-primary w-full rounded-btn font-semibold mt-4">
                                {loading ? (
                                    <span className="loading loading-dots loading-md items-center"></span>
                                ) : (
                                    'Create Membership'
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
        </>
    );
};

export default CreatePackage;
