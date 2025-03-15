import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { otpRequest } from '../../../api/otp';
import { useAuth } from '../../../contexts/Auth/AuthProvider';
import { PATHS } from '../../../routes/routes';
import { FaPaperPlane } from 'react-icons/fa6';

const OtpVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleLoginWithOtp, handleSignUp, loading } = useAuth();
    const { email, state, password } = location.state || {};
    const [isOtpSent, setIsOtpSent] = useState(true);
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const requestOtp = async () => {
        if (email !== undefined) {
            try {
                const { status } = await otpRequest(email);
                if (status === 200) {
                    setIsOtpSent(true);
                } else {
                    setMessage('Error sending OTP. Please try again.');
                    setIsOtpSent(false);
                }
            } catch (error) {
                setMessage('Error sending OTP. Please try again.');
                setIsOtpSent(false);
            }
        } else {
            navigate(PATHS.SIGNIN);
        }
    };

    useEffect(() => {
        (async () => {
            await requestOtp();
        })();
    }, [email]);

    const verifyOtp = () => {
        if (state === 'login') {
            handleLoginWithOtp(email, otp)
                .then(() => {
                    setError('');
                })
                .catch((error: any) => {
                    setError(error);
                });
        } else if (state === 'register') {
            handleSignUp(email, password, otp)
                .then(() => {
                    setError('');
                })
                .catch((error: any) => {
                    setError(error);
                });
        }
    };

    return (
        <div className="main flex flex-col items-center justify-center bg-page-body h-screen">
            <div className="card w-full max-w-sm shadow-xl py-10 px-5 rounded-2xl border border-border/30 bg-white">
                <div>
                    <div className="flex flex-col justify-center items-center">
                        {/* <img src={emailSvg} alt="email" width={100} /> */}
                        <FaPaperPlane className="text-6xl text-primary" />
                        {isOtpSent ? (
                            <>
                                <p className="text-lg font-bold mt-2">Please check your email!</p>
                                <p className="text-sm font-medium text-gray-500 mb-5">
                                    We've sent a code to {email}
                                </p>
                            </>
                        ) : (
                            <p className="text-red-500 text-sm my-5">{message}</p>
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Enter OTP"
                        className="input input-bordered w-full mb-1"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <p className="text-red-500 text-left text-xs px-2">{error}</p>
                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4 disabled:bg-none disabled:bg-gray-200 disabled:text-gray-500"
                        onClick={verifyOtp}
                        disabled={otp === ''}>
                        {loading ? (
                            <span className="loading loading-dots loading-md items-center"></span>
                        ) : (
                            'Verify OTP'
                        )}
                    </button>
                    <p className="text-sm text-gray-600 mt-3">
                        Didn't get the code?{' '}
                        <button className="link" onClick={requestOtp}>
                            Click to resend.
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
