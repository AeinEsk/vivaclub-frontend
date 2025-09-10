import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupPromotionalDraw } from '../../api/draws';
import { customerOtpRequest, verifyCustomerOtp } from '../../api/otp';
import { getDrawInfoById } from '../../api/draws';
import { FaInstagram, FaFacebook, FaTiktok, FaXTwitter, FaYoutube, FaGlobe, FaGoogle, FaUser, FaGift, FaRegCalendar } from 'react-icons/fa6';
import Alert from '../../components/alert/Alert';
import { HOST_API } from '../../api/config';
import { dateConverter } from '../../components/dateConverter/DateConverter';

const PromoDrawSignup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { drawId } = useParams<{ drawId: string }>();

    // OTP flow state
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSessionId, setOtpSessionId] = useState<string | null>(null);
    const [otpLoading, setOtpLoading] = useState(false);

    const [socials, setSocials] = useState<{ instagram?: string; facebook?: string; tiktok?: string; googleReview?: string; x?: string; youtube?: string; website?: string } | null>(null);
    const [drawInfo, setDrawInfo] = useState<{ name?: string; prize?: string | number; runAt?: string; imageId?: string; timezone?: string; promoPeriods?: Array<{ start: string; end: string; multiplier: number }> } | null>(null);
    const [promoPreview, setPromoPreview] = useState<{ multiplier: number; totalEntries: number } | null>(null);

    useEffect(() => {
        const fetchDraw = async () => {
            try {
                if (!drawId) return;
                const { data } = await getDrawInfoById(drawId);
                setSocials(data?.socials || null);
                setDrawInfo({ name: data?.name, prize: data?.prize, runAt: data?.runAt, imageId: data?.imageId, timezone: data?.timezone, promoPeriods: Array.isArray(data?.promoPeriods) ? data.promoPeriods : [] });
            } catch (e) {
                setSocials(null);
                setDrawInfo(null);
            }
        };
        fetchDraw();
    }, [drawId]);

    // Compute promo preview for base=1 using the draw's selected timezone and promo periods (ignore server API)
    useEffect(() => {
        let cancel = false;
        const compute = () => {
            if (!drawInfo) return;
            const tz = drawInfo.timezone;
            const periods = Array.isArray(drawInfo.promoPeriods) ? drawInfo.promoPeriods : [];
            // Helper: get comparable key in the selected timezone
            const toKey = (val: string | undefined): string => {
                if (!val) return '';
                const s = String(val);
                // If the value looks like a datetime-local (no timezone marker), trust it as wall-time key
                if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
                    return s.slice(0, 16);
                }
                // Otherwise, convert a true ISO with tz into the selected timezone key
                try {
                    const d = new Date(s);
                    const formatted = new Intl.DateTimeFormat('sv-SE', {
                        timeZone: tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(d);
                    return formatted.replace(' ', 'T');
                } catch {
                    return s.slice(0, 16);
                }
            };
            const nowKey = toKey(new Date().toISOString());
            const activePeriod = periods.find(p => toKey(p.start) <= nowKey && nowKey < toKey(p.end));
            const multiplier = Number(activePeriod?.multiplier ?? 1);
            const totalEntries = 1 * multiplier;
            if (!cancel) setPromoPreview({ multiplier, totalEntries });
        };
        compute();
        return () => {
            cancel = true;
        };
    }, [drawInfo]);

    const signupSchema = z.object({
        email: z.string().email('Please enter a valid email address'),
        phone: z.string().optional(),
        name: z.string().min(2, 'Please enter your full name'),
        agree: z.boolean().refine((v) => v, { message: 'You must agree to the Terms & Conditions' })
    });

    type SignupFormData = z.infer<typeof signupSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        mode: 'onChange'
    });

    const onSubmit = async (data: SignupFormData) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Step 1: send OTP to user's email, then show OTP entry step
            const emailNorm = data.email.trim().toLowerCase();
            const otpResp = await customerOtpRequest(emailNorm);
            if (otpResp.status === 200) {
                setIsOtpStep(true);
                setOtp('');
                setOtpSessionId(otpResp.data?.sessionId || null);
                setError('');
            } else {
                setError('Failed to send verification code. Please try again.');
            }
        } catch (e: any) {
            console.error('Signup error:', e);
            setError(e?.response?.data?.error || 'An error occurred while signing up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndSignup = async (formData: SignupFormData) => {
        if (!otpSessionId) {
            setError('Invalid session. Please resend the code.');
            return;
        }
        try {
            setOtpLoading(true);
            setError('');
            // Step 2: verify OTP
            const emailNorm = formData.email.trim().toLowerCase();
            const verifyResp = await verifyCustomerOtp(emailNorm, otp, otpSessionId);
            if (verifyResp.status !== 200) {
                setError(verifyResp.data?.error || 'Invalid code. Please try again.');
                setOtpLoading(false);
                return;
            }

            // Step 3: proceed with actual signup
            const response = await signupPromotionalDraw({
                drawId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });

            if (response.status === 201) {
                const total = Number(response.data?.entriesCreated ?? 1);
                const multiplier = Number(response.data?.multiplierApplied ?? 1);
                const breakdown = multiplier > 1 ? `Entries: 1 × ${multiplier} Promotional entries = ${total} total entries` : 'Entries: 1';
                setSuccess(`Successfully signed up for the promotional draw! ${breakdown}`);
            } else if (response.status === 200 && response.data?.alreadySigned) {
                setSuccess(response.data.message || 'You are in!');
            }

            // reset OTP step
            setIsOtpStep(false);
            setOtp('');
            setOtpSessionId(null);
        } catch (e: any) {
            setError(e?.response?.data?.error || 'Error verifying code. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="card p-0 w-full max-w-sm shadow-xl border border-border/30 bg-white overflow-hidden">
                <header className="bg-primary-gradient px-3 py-5 text-left">
                    <p className="text-white font-bold mb-1">Promotional Draw</p>
                    <p className="text-white text-xs">Complete your details to join</p>
                </header>
                <div className="p-4">
                    {drawInfo?.imageId && (
                        <div className="mb-6">
                            <div className="flex justify-center">
                                <img
                                    src={`${HOST_API}/public/download/${drawInfo.imageId}`}
                                    alt="Promotional draw"
                                    className="border border-gray-50 rounded-lg w-full h-[200px] object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Entries preview moved under phone number */}

                    {(drawInfo?.name || drawInfo?.prize || drawInfo?.runAt) && (
                        <div className="grid grid-cols-2 gap-5 mb-2">
                            {drawInfo?.name && (
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <div className="flex gap-1 items-center text-xs text-primary">
                                        <FaUser /> <span>Name</span>
                                    </div>
                                    <p className="text-xs mt-2 text-left">{drawInfo.name}</p>
                                </div>
                            )}
                            {drawInfo?.prize !== undefined && (
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <div className="flex gap-1 items-center text-xs text-primary">
                                        <FaGift /> <span>Prize</span>
                                    </div>
                                    <p className="text-xs mt-2 text-left">{String(drawInfo.prize)}</p>
                                </div>
                            )}
                            {drawInfo?.runAt && (
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <div className="flex gap-1 items-center text-xs text-primary">
                                        <FaRegCalendar /> <span>Draw Date</span>
                                    </div>
                                    <p className="text-xs mt-2 text-left">{dateConverter(drawInfo.runAt, 'YMD-HMS', 'long')}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {drawInfo?.runAt && new Date().toISOString() >= drawInfo.runAt ? (
                        <div className="mt-4">
                            {/* <Alert message="This promotional draw has expired." type="alert-warning" /> */}
                            <button className="btn btn-primary w-full mt-4" disabled>
                                Expired
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
                            <div className="space-y-4">
                                <div>
                                <label className="label">
                                    <span className="label-text">Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    className="input input-bordered border-gray-400 w-full"
                                    disabled={loading || isOtpStep}
                                    {...register('name')}
                                />
                                {errors.name && (
                                    <span className="label-text-alt text-red-600 font-semibold">{errors.name.message}</span>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text">Email Address</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="input input-bordered border-gray-400 w-full"
                                    disabled={loading || isOtpStep}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <span className="label-text-alt text-red-600 font-semibold">{errors.email.message}</span>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text">Phone Number (optional)</span>
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="input input-bordered border-gray-400 w-full"
                                    disabled={loading || isOtpStep}
                                    {...register('phone')}
                                />
                                {errors.phone && (
                                    <span className="label-text-alt text-red-600 font-semibold">{errors.phone.message}</span>
                                )}
                                {/* Promo / Final entries preview: show under phone number */}
                                <div className="mt-2 text-xs text-secondary text-right">
                                    <span className="font-medium">You will get: {promoPreview?.totalEntries ?? 1} subscriptions</span>
                                    {promoPreview && (promoPreview.multiplier || 1) > 1 && (
                                        <div className="text-[11px] text-gray-500">
                                            1 × ({promoPreview.multiplier} Promo) = {promoPreview.totalEntries} entries
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <div className="form-control mt-2">
                                <label className="flex gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-sm rounded-sm"
                                        disabled={loading}
                                        {...register('agree')}
                                    />
                                    <span className="label-text text-secondary ml-2">
                                        I agree to the{' '}
                                        <a
                                            href={`/terms${drawId ? `?drawId=${drawId}` : ''}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                            onClick={(e) => e.stopPropagation()}>
                                            Terms and Conditions
                                        </a>
                                    </span>
                                </label>
                                {errors.agree && (
                                    <span className="label-text-alt text-red-600 font-semibold">{errors.agree.message as string}</span>
                                )}
                            </div>

                            {error && <Alert message={error} type="alert-error" />}
                            {success && <Alert message={success} type="alert-success" />}

                            {socials && (socials.instagram || socials.facebook || socials.tiktok || socials.googleReview || socials.x || socials.youtube || socials.website) && (
                                <div className="flex items-center justify-center gap-4 mb-3">
                                    {socials.instagram && (
                                        <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                                            <FaInstagram className="text-lg text-pink-600" />
                                        </a>
                                    )}
                                    {socials.facebook && (
                                        <a href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                                            <FaFacebook className="text-lg text-blue-600" />
                                        </a>
                                    )}
                                    {socials.tiktok && (
                                        <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hover:opacity-80 transition-opacity">
                                            <FaTiktok className="text-lg text-black" />
                                        </a>
                                    )}
                                    {socials.googleReview && (
                                        <a href={socials.googleReview} target="_blank" rel="noopener noreferrer" aria-label="Google Reviews" className="hover:opacity-80 transition-opacity">
                                            <FaGoogle className="text-lg text-red-600" />
                                        </a>
                                    )}
                                    {socials.x && (
                                        <a href={socials.x} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:opacity-80 transition-opacity">
                                            <FaXTwitter className="text-lg" />
                                        </a>
                                    )}
                                    {socials.youtube && (
                                        <a href={socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:opacity-80 transition-opacity">
                                            <FaYoutube className="text-lg text-red-600" />
                                        </a>
                                    )}
                                    {socials.website && (
                                        <a href={socials.website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="hover:opacity-80 transition-opacity">
                                            <FaGlobe className="text-lg text-gray-700" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {drawInfo?.runAt && new Date().toISOString() >= drawInfo.runAt && (
                                <Alert message="This promotional draw has expired." type="alert-warning" />
                            )}

                            {isOtpStep ? (
                                <div className="mt-2">
                                    <label className="label">
                                        <span className="label-text">Enter verification code</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="6-digit code"
                                        className="input input-bordered border-gray-400 w-full"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.trim())}
                                        disabled={otpLoading}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-primary w-full mt-3"
                                        disabled={otpLoading || !/^\d{6}$/.test(otp)}
                                        onClick={() =>
                                            verifyOtpAndSignup({
                                                name: watch('name') || '',
                                                email: watch('email') || '',
                                                phone: watch('phone') || '',
                                                agree: watch('agree') || false
                                            })
                                        }>
                                        {otpLoading ? (
                                            <span className="loading loading-dots loading-md"></span>
                                        ) : (
                                            'Verify & Join'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn w-full mt-2"
                                        disabled={otpLoading}
                                        onClick={async () => {
                                            try {
                                                setOtpLoading(true);
                                                const resp = await customerOtpRequest(watch('email'));
                                                setOtpSessionId(resp.data?.sessionId || null);
                                                setError('');
                                            } catch (e: any) {
                                                setError(e?.response?.data?.error || 'Failed to resend code.');
                                            } finally {
                                                setOtpLoading(false);
                                            }
                                        }}>
                                        Resend code
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={
                                        loading ||
                                        !!success ||
                                        !watch('agree') ||
                                        // require non-empty full name and email
                                        !(watch('name') && watch('email')) ||
                                        // also require field-level validity
                                        !!errors.name ||
                                        !!errors.email ||
                                        // draw must be active
                                        !(drawInfo?.runAt && new Date().toISOString() < drawInfo.runAt)
                                    }>
                                    {loading ? (
                                        <span className="loading loading-dots loading-md"></span>
                                    ) : success ? (
                                        'Already Signed Up'
                                    ) : (
                                        'Join Draw'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                    )}
                </div>

                <div className="mt-1 mb-4 text-center">
                    <span className="text-xs text-gray-400">
                        Powered by{' '}
                        <a href="https://vivaclub.io" target="_blank" rel="noopener noreferrer" className="underline text-gray-400 hover:text-gray-500">
                            VivaClub
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PromoDrawSignup;
