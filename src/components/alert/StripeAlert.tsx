import { useState } from 'react';
import { createStripe } from '../../api/auth';

const StripeAlert = () => {
    const [loading, setLoading] = useState(false);

    const handleStripe = async () => {
        setLoading(true);
        try {
            const response = await createStripe();
            window.location.replace(response?.data?.url);
        } catch (err) {
            setLoading(false);
            console.error(err);
        }
    };

    return (
        <div className="bg-purple-600 text-white rounded-lg mb-6 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-purple-500/30 p-2 rounded-full">
                <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24">
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                </svg>
            </div>
            <div>
            <h3 className="font-medium text-base text-left">Complete your onboarding</h3>
            <p className="text-purple-100 text-sm">Please create your stripe account to start accepting payments</p>
            </div>
        </div>


            {loading ? (
                <div className="flex items-center">
                    <span className="loading loading-spinner loading-sm items-center text-white mr-1"></span>
                    <p className="text-sm text-white ">Loading ...</p>
                </div>
            ) : (
                <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors flex items-center gap-2" onClick={handleStripe}>
                Create Account
                <span className="text-sm">→</span>
            </button>

            )}
    </div>
    );
};

export default StripeAlert;
