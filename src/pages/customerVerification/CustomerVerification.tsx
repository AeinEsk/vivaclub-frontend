import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { customerOtpRequest, verifyCustomerOtp } from '../../api/otp';
import emailSvg from '../../assets/email-check.svg';
import { PATHS } from '../../routes/routes';
import Alert from '../../components/alert/Alert';

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
        if (!email) {
            navigate(PATHS.SIGNIN);
            return;
        }
        requestOtp();
    }, [email]);

    const requestOtp = async () => {
        if (!email) return;

        try {
            setLoading(true);
            const response = await customerOtpRequest(email);
            if (response.status === 200) {
                setIsOtpSent(true);
                setSessionId(response.data.sessionId);
                setError('');
            } else {
                setError('Error sending OTP. Please try again.');
                setIsOtpSent(false);
            }
        } catch (error: any) {
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
            const response = await verifyCustomerOtp(email, otp, sessionId);
            
            if (response.status === 200) {
                // Only redirect if OTP is verified
                navigate(PATHS.CUSTOMER_PORTAL, { 
                    state: { email, verified: true }
                });
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'Error verifying OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!email) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                <img src={emailSvg} alt="Email Verification" className="w-24 h-24 mx-auto mb-4" />

                <div className="mb-6">
                    {isOtpSent ? (
                        <>
                            <p className="text-lg font-bold mt-2">Please check your email!</p>
                            <p className="text-sm font-medium text-gray-500 mb-5">
                                We've sent a code to {email}
                            </p>
                        </>
                    ) : (
                        <p className="text-red-500 my-5">{error}</p>
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
                    <Alert message={error} type="alert-error" />
                )}

                <button
                    type="button"
                    className="btn btn-primary w-full mt-4"
                    onClick={verifyOtpAndRedirect}
                    disabled={!otp || loading}>
                    {loading ? (
                        <span className="loading loading-dots loading-md items-center"></span>
                    ) : (
                        'Verify OTP'
                    )}
                </button>

                <p className="text-sm text-gray-600 mt-3 text-center">
                    Didn't get the code?{' '}
                    <button 
                        className="link"
                        onClick={requestOtp}
                        disabled={loading}>
                        Click to resend
                    </button>
                </p>
            </div>
        </div>
    );
};

export default CustomerVerification; 