import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupPromotionalDraw } from '../../api/draws';
import { getDrawInfoById } from '../../api/draws';
import { FaInstagram, FaFacebook, FaTiktok, FaXTwitter, FaYoutube, FaGlobe, FaGoogle } from 'react-icons/fa6';
import Alert from '../../components/alert/Alert';
import { HOST_API } from '../../api/config';

const PromoDrawSignup = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { drawId } = useParams<{ drawId: string }>();

    const [socials, setSocials] = useState<{ instagram?: string; facebook?: string; tiktok?: string; googleReview?: string; x?: string; youtube?: string; website?: string } | null>(null);
    const [drawInfo, setDrawInfo] = useState<{ name?: string; imageId?: string } | null>(null);

    useEffect(() => {
        const fetchDraw = async () => {
            try {
                if (!drawId) return;
                const { data } = await getDrawInfoById(drawId);
                setSocials(data?.socials || null);
                setDrawInfo({ name: data?.name, imageId: data?.imageId });
            } catch (e) {
                setSocials(null);
                setDrawInfo(null);
            }
        };
        fetchDraw();
    }, [drawId]);

    const signupSchema = z.object({
        email: z.string().email('Please enter a valid email address'),
        phone: z.string().optional(),
        name: z.string().min(2, 'Please enter your full name')
    });

    type SignupFormData = z.infer<typeof signupSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema)
    });

    const onSubmit = async (data: SignupFormData) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            // Submit to the promotional draw signup API
            const response = await signupPromotionalDraw({
                drawId,
                ...data
            });

            if (response.status === 201) {
                setSuccess('Successfully signed up for the promotional draw!');
                // Optionally redirect or show success state
            } else if (response.status === 200 && response.data?.alreadySigned) {
                setSuccess(response.data.message || 'You are in!');
            }
        } catch (e: any) {
            console.error('Signup error:', e);
            setError(e?.response?.data?.error || 'An error occurred while signing up. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-10 bg-gray-50">
            <div className="w-full max-w-md shadow-xl py-6 px-6 rounded-2xl border border-border/30 bg-white">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Join the Promotional Draw</h2>
                    <p className="text-gray-600 mt-2">Enter your details to participate</p>
                </div>

                {/* Draw Image - under title */}
                {drawInfo?.imageId && (
                    <div className="mb-6 text-center">
                        <img
                            src={`${HOST_API}/public/download/${drawInfo.imageId}`}
                            alt="Promotional draw"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                    </div>
                )}

                {/* Social icons (use same icons/colors as create-promo-draw) will be rendered above the Join Draw button below */}

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="space-y-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Full Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="input input-bordered w-full"
                                disabled={loading}
                                {...register('name')}
                            />
                            {errors.name && (
                                <span className="label-text-alt text-red-600 font-semibold">
                                    {errors.name.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Email Address</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input input-bordered w-full"
                                disabled={loading}
                                {...register('email')}
                            />
                            {errors.email && (
                                <span className="label-text-alt text-red-600 font-semibold">
                                    {errors.email.message}
                                </span>
                            )}
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">Phone Number (optional)</span>
                            </label>
                            <input
                                type="tel"
                                placeholder="Enter your phone number"
                                className="input input-bordered w-full"
                                disabled={loading}
                                {...register('phone')}
                            />
                            {errors.phone && (
                                <span className="label-text-alt text-red-600 font-semibold">
                                    {errors.phone.message}
                                </span>
                            )}
                        </div>

                        {error && (
                            <Alert message={error} type="alert-error" />
                        )}

                        {success && (
                            <Alert message={success} type="alert-success" />
                        )}

                        {socials && (socials.instagram || socials.facebook || socials.tiktok || socials.googleReview || socials.x || socials.youtube || socials.website) && (
                            <div className="flex items-center justify-center gap-4 mb-3">
                                {socials.instagram && (
                                    <a
                                        href={socials.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Instagram"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FaInstagram className="text-lg text-pink-600" />
                                    </a>
                                )}
                                {socials.facebook && (
                                    <a
                                        href={socials.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Facebook"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FaFacebook className="text-lg text-blue-600" />
                                    </a>
                                )}
                                {socials.tiktok && (
                                    <a
                                        href={socials.tiktok}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="TikTok"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FaTiktok className="text-lg text-black" />
                                    </a>
                                )}
                                {socials.googleReview && (
                                    <a
                                        href={socials.googleReview}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Google Reviews"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FaGoogle className="text-lg text-red-600" />
                                    </a>
                                )}
                                {socials.x && (
                                    <a
                                        href={socials.x}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="X (Twitter)"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FaXTwitter className="text-lg" />
                                    </a>
                                )}
                                {socials.youtube && (
                                    <a
                                        href={socials.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="YouTube"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FaYoutube className="text-lg text-red-600" />
                                    </a>
                                )}
                                {socials.website && (
                                    <a
                                        href={socials.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Website"
                                        className="hover:opacity-80 transition-opacity"
                                    >
                                        <FaGlobe className="text-lg text-gray-700" />
                                    </a>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading || !!success}
                        >
                            {loading ? (
                                <span className="loading loading-dots loading-md"></span>
                            ) : success ? (
                                'Already Signed Up'
                            ) : (
                                'Join Draw'
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <span className="text-xs text-gray-400">
                        Powered by{' '}
                        <a
                            href="https://vivaclub.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-gray-400 hover:text-gray-500"
                        >
                            VivaClub
                        </a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PromoDrawSignup;
