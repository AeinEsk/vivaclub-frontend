import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { otpRequest } from '../../../api/otp';
import { useAuth } from '../../../contexts/Auth/AuthProvider';
import { PATHS } from '../../../routes/routes';
import { FaPaperPlane } from 'react-icons/fa6';

const OtpVerification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleLoginWithOtp, handleSignUp, loading } = useAuth();
    const { email, state, password } = location.state || {};
    const [isOtpSent, setIsOtpSent] = useState<boolean | null>(null);
    const [isSending, setIsSending] = useState<boolean>(true);
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [hasRetried, setHasRetried] = useState(false);
    const [hasRetriedActive, setHasRetriedActive] = useState(false);
    const [checkingActive, setCheckingActive] = useState(false);
    const [activeOtpSeconds, setActiveOtpSeconds] = useState<number | null>(null);

    const requestInFlightRef = useRef(false);
    const requestOtp = async () => {
        if (email !== undefined) {
            try {
                if (requestInFlightRef.current) return;
                requestInFlightRef.current = true;
                setIsSending(true);
                setMessage('');
                const { status, data } = await otpRequest(String(email).trim());
                if (status === 200) {
                    setIsOtpSent(true);
                    setHasRetried(false);
                    setActiveOtpSeconds(null);
                } else {
                    const apiMessage = data?.error;
                    if (!hasRetried && apiMessage === 'Failed to send OTP') {
                        setHasRetried(true);
                        setIsOtpSent(null);
                        setMessage('');
                        // Silent quick retry
                        setTimeout(() => {
                            requestOtp();
                        }, 1200);
                    } else {
                        // If API reports active OTP, do a one-time delayed recheck before showing error
                        const match = typeof apiMessage === 'string' ? apiMessage.match(/time left:\s*(\d+)\s*seconds/i) : null;
                        if (match && match[1] && !hasRetriedActive) {
                            setHasRetriedActive(true);
                            setCheckingActive(true);
                            setIsOtpSent(null);
                            setMessage('');
                            setTimeout(() => {
                                requestOtp();
                            }, 1500);
                        } else {
                            if (match && match[1]) {
                                const seconds = parseInt(match[1], 10);
                                setActiveOtpSeconds(Number.isFinite(seconds) ? seconds : null);
                            }
                            setMessage(apiMessage || 'Error sending OTP. Please try again.');
                            setIsOtpSent(false);
                            setCheckingActive(false);
                        }
                    }
                }
            } catch (error: any) {
                const apiMessage = error?.response?.data?.error;
                if (!hasRetried && apiMessage === 'Failed to send OTP') {
                    setHasRetried(true);
                    setIsOtpSent(null);
                    setMessage('');
                    setTimeout(() => {
                        requestOtp();
                    }, 1200);
                } else {
                    const match = typeof apiMessage === 'string' ? apiMessage.match(/time left:\s*(\d+)\s*seconds/i) : null;
                    if (match && match[1]) {
                        const seconds = parseInt(match[1], 10);
                        setActiveOtpSeconds(Number.isFinite(seconds) ? seconds : null);
                    }
                    setMessage(apiMessage || 'Error sending OTP. Please try again.');
                    setIsOtpSent(false);
                    setCheckingActive(false);
                }
            } finally {
                setIsSending(false);
                requestInFlightRef.current = false;
            }
        } else {
            navigate(PATHS.SIGNIN);
        }
    };

    // Ensure we request OTP only once on mount (even under StrictMode)
    const hasRequestedRef = useRef(false);
    useEffect(() => {
        if (hasRequestedRef.current) return;
        hasRequestedRef.current = true;
        (async () => {
            await requestOtp();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Countdown for active OTP time left
    useEffect(() => {
        if (activeOtpSeconds === null) return;
        if (activeOtpSeconds <= 0) {
            setActiveOtpSeconds(null);
            return;
        }
        const timer = setInterval(() => {
            setActiveOtpSeconds((prev) => {
                if (prev === null) return prev;
                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeOtpSeconds]);

    const verifyOtp = () => {
        if (state === 'login') {
            handleLoginWithOtp(email, otp)
                .then(() => {
                    setError('');
                    // After successful login with OTP (login flow), go to welcome
                    navigate(PATHS.WELCOME);
                })
                .catch((error: any) => {
                    setError(error);
                });
        } else if (state === 'register') {
            handleSignUp(email, password, otp)
                .then(() => {
                    setError('');
                    // After signup (pending approval), go back to signup page and show banner
                    navigate(PATHS.SIGNUP, { state: { registered: true } });
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
                        {isSending || checkingActive ? (
                            <>
                                <p className="text-lg font-bold mt-2">Sending code...</p>
                                <p className="text-sm font-medium text-gray-500 mb-5">Please wait a moment</p>
                            </>
                        ) : isOtpSent ? (
                            <>
                                <p className="text-lg font-bold mt-2">Please check your email!</p>
                                <p className="text-sm font-medium text-gray-500 mb-5">
                                    We've sent a code to {email}
                                </p>
                            </>
                        ) : (
                            <p className="text-red-500 text-sm my-5">
                                {activeOtpSeconds !== null
                                    ? `There is an active OTP, time left: ${activeOtpSeconds} seconds`
                                    : (message || 'Error sending OTP. Please try again.')}
                            </p>
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
                        <button
                            className="link disabled:text-gray-400"
                            onClick={requestOtp}
                            disabled={isSending || activeOtpSeconds !== null}
                        >
                            {activeOtpSeconds !== null ? `Resend available in ${activeOtpSeconds}s` : 'Click to resend.'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OtpVerification;
