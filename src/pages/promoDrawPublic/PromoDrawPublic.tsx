import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa6';
import PromoDrawSignup from '../promoDrawSignup/PromoDrawSignup';

const PromoDrawPublic = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [drawData, setDrawData] = useState<any>(null);
    const { drawId } = useParams<{ drawId: string }>();

    // Mock data for now - in real implementation, fetch based on drawId
    useEffect(() => {
        const fetchDrawData = async () => {
            try {
                setLoading(true);

                // In real implementation, you would fetch from API:
                // const response = await getPromotionalDrawById(drawId);

                // Mock data for demonstration
                setDrawData({
                    id: drawId,
                    name: 'Summer Giveaway',
                    prize: 'iPhone 15 Pro',
                    description: 'Join our summer promotional draw for a chance to win an iPhone 15 Pro!',
                    runAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    imageId: null,
                    socials: {
                        instagram: 'https://instagram.com/example',
                        facebook: 'https://facebook.com/example',
                        tiktok: 'https://tiktok.com/@example'
                    }
                });

            } catch (err) {
                setError('Failed to load draw information');
            } finally {
                setLoading(false);
            }
        };

        if (drawId) {
            fetchDrawData();
        }
    }, [drawId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-ring loading-lg"></span>
            </div>
        );
    }

    if (error || !drawData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Draw Not Found</h2>
                    <p className="text-gray-600 mt-2">The promotional draw you're looking for doesn't exist or has expired.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-center text-gray-800">{drawData.name}</h1>
                    <p className="text-center text-gray-600 mt-2">{drawData.description}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Draw Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Prize</h2>
                        <div className="text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-2xl font-bold text-purple-600">{drawData.prize}</h3>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    📅
                                </div>
                                <div>
                                    <p className="font-semibold">Draw Date</p>
                                    <p className="text-gray-600">
                                        {new Date(drawData.runAt).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {drawData.socials && (
                            <div className="mt-6">
                                <p className="font-semibold mb-3">Follow Us</p>
                                <div className="flex gap-4">
                                    {drawData.socials.instagram && (
                                        <a
                                            href={drawData.socials.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-white hover:opacity-80 transition-opacity"
                                        >
                                            <FaInstagram />
                                        </a>
                                    )}
                                    {drawData.socials.facebook && (
                                        <a
                                            href={drawData.socials.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full text-white hover:opacity-80 transition-opacity"
                                        >
                                            <FaFacebook />
                                        </a>
                                    )}
                                    {drawData.socials.tiktok && (
                                        <a
                                            href={drawData.socials.tiktok}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-12 h-12 bg-black rounded-full text-white hover:opacity-80 transition-opacity"
                                        >
                                            <FaTiktok />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Signup Form with social icons above when available */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        {drawData.socials && (drawData.socials.instagram || drawData.socials.facebook || drawData.socials.tiktok) && (
                            <div className="flex items-center justify-center gap-4 mb-4">
                                {drawData.socials.instagram && (
                                    <a
                                        href={drawData.socials.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full text-white hover:opacity-80 transition-opacity"
                                        aria-label="Instagram"
                                    >
                                        <FaInstagram />
                                    </a>
                                )}
                                {drawData.socials.facebook && (
                                    <a
                                        href={drawData.socials.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white hover:opacity-80 transition-opacity"
                                        aria-label="Facebook"
                                    >
                                        <FaFacebook />
                                    </a>
                                )}
                                {drawData.socials.tiktok && (
                                    <a
                                        href={drawData.socials.tiktok}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-10 h-10 bg-black rounded-full text-white hover:opacity-80 transition-opacity"
                                        aria-label="TikTok"
                                    >
                                        <FaTiktok />
                                    </a>
                                )}
                            </div>
                        )}
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enter the Draw</h2>
                        <PromoDrawSignup />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoDrawPublic;
