import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { customerOtpRequest, verifyCustomerOtp } from '../../api/otp';
import { FaPaperPlane } from 'react-icons/fa6';
import { PATHS } from '../../routes/routes';

const CustomerVerification = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email');
    
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        console.log('Email from query params:', email);
        if (!email) {
            console.log('No email found, redirecting to signin');
            navigate(PATHS.CUSTOMER_SIGNIN);
            return;
        }
        requestOtp();
    }, []);

    const requestOtp = async () => {
        if (!email) return;

        try {
            setLoading(true);
            const response = await customerOtpRequest(email);
            console.log('OTP request response:', response.status);
            if (response.status === 200) {
                setIsOtpSent(true);
                setSessionId(response.data.sessionId);
                setError('');
                console.log('OTP sent successfully');
            } else {
                setError('Error sending OTP. Please try again.');
                setIsOtpSent(false);
                console.log('OTP request failed with status:', response.status);
            }
        } catch (error: any) {
            console.error('OTP request error:', error);
            setError(error.response?.data?.error || 'Error sending OTP. Please try again.');
            setIsOtpSent(false);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpAndRedirect = async () => {
        if (!email || !sessionId) return;

        try {
            setLoading(true);
            console.log('Verifying OTP with email:', email, 'and OTP:', otp, 'and sessionId:', sessionId);
            const response = await verifyCustomerOtp(email, otp, sessionId);
            console.log('OTP verification response:', response.status);
            console.log('O-----------------------------------------------');
            if (response.status === 200) {
                localStorage.setItem('customerToken', response.data.token);
                navigate(PATHS.CUSTOMER_PORTAL);
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'Error verifying OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerPortal = () => {
        navigate(PATHS.CUSTOMER_SIGNIN);
    };

    if (!email) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                <FaPaperPlane className="text-6xl text-primary mx-auto" />

                <div className="flex flex-col justify-center items-center">
                    {isOtpSent ? (
                        <>
                            <p className="text-lg font-bold mt-2">Please check your email!</p>
                            <p className="text-sm font-medium text-gray-500 mb-5">
                                We've sent a code to {email}
                            </p>
                        </>
                    ) : (
                        <p className="text-red-500 text-sm my-5">{error}</p>
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Enter OTP"
                    className="input input-bordered w-full mb-1"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />
                
                {error && (
                    <p className="text-red-500 text-left text-xs px-2">{error}</p>
                )}

                <button
                    type="button"
                    className="btn btn-primary w-full mt-4 disabled:bg-none disabled:bg-gray-200 disabled:text-gray-500"
                    onClick={verifyOtpAndRedirect}
                    disabled={!otp || loading}>
                    {loading ? (
                        <span className="loading loading-dots loading-md items-center"></span>
                    ) : (
                        'Verify OTP'
                    )}
                </button>

                <button
                    type="button"
                    className="btn btn-outline border-border w-full mt-2 relative hover:bg-gray-50 hover:text-black text-gray-700 font-medium transition-colors duration-200"
                    onClick={handleCustomerPortal}>
                    Customer Portal
                </button>

                <p className="text-sm text-gray-600 mt-3">
                    Didn't get the code?{' '}
                    <button 
                        className="link"
                        onClick={requestOtp}
                        disabled={loading}>
                        Click to resend.
                    </button>
                </p>
            </div>
        </div>
    );
};

export default CustomerVerification; 