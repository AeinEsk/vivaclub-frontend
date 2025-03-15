import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/Auth/AuthProvider';
import { PATHS } from '../../../routes/routes';
import { AlertProps } from '../../../@types/alerts';
import Alert from '../../../components/alert/Alert';
import eyeSVG from '../../../assets/eye.svg';
import eyeHideSVG from '../../../assets/eyeHide.svg';
import { otpRequest } from '../../../api/otp';

const ResetPassword = () => {
    const { loading, handleResetPassword } = useAuth();
    const { email } = useParams<{ email: string }>();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [alert, setAlert] = useState<boolean>(false);
    const [otp, setOtp] = useState<string>('');
    const [isOtpSent, setIsOtpSent] = useState(true);
    const [message, setMessage] = useState<AlertProps>({
        message: '',
        type: 'alert-error'
    });

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const requestOtp = async () => {
        if (email !== undefined) {
            try {
                const { status } = await otpRequest(email);
                if (status === 200) {
                    setIsOtpSent(true);
                } else {
                    setAlert(true);
                    setMessage({
                        message: 'Error sending OTP. Please try again.',
                        type: 'alert-warning'
                    });
                    setTimeout(() => {
                        setMessage({ message: '', type: 'simple' });
                        setAlert(false);
                    }, 4000);
                    setIsOtpSent(false);
                }
            } catch (error) {
                setAlert(true);

                setMessage({
                    message: 'Error sending OTP. Please try again.',
                    type: 'alert-warning'
                });
                setTimeout(() => {
                    setMessage({ message: '', type: 'simple' });
                    setAlert(false);
                }, 4000);
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password === confirmPassword && email) {
            setAlert(false);
            handleResetPassword(email, password, otp)
                .then(() => {
                    navigate(PATHS.WELCOME);
                })
                .catch((error: any) => {
                    setAlert(true);
                    setMessage({ message: error, type: 'alert-error' });
                    setTimeout(() => {
                        setMessage({ message: '', type: 'simple' });
                        setAlert(false);
                    }, 3000);
                });
        } else {
            setAlert(true);
            setMessage({
                message: 'Password and Confirm Pass must be match.',
                type: 'alert-warning'
            });
            setTimeout(() => {
                setMessage({ message: '', type: 'simple' });
                setAlert(false);
            }, 3000);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-center ">
                <div className="w-full max-w-sm shadow-xl py-10 px-5 rounded-2xl border border-border/30 bg-white">
                    <article className="prose">
                        <form className="mb-8" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="label">
                                    <span className="label-text text-base text-neutral">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    className="input input-bordered w-full"
                                    required
                                    defaultValue={email}
                                    readOnly
                                />
                            </div>
                            <div className="mb-3">
                                <label className="label ">
                                    <span className="label-text text-base text-neutral">
                                        Password
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Password"
                                        className="input input-bordered w-full"
                                        required
                                        defaultValue={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="btn btn-link absolute inset-y-0 right-0 flex items-center pr-3">
                                        <img
                                            src={showPassword ? eyeHideSVG : eyeSVG}
                                            alt="google logo"
                                            className="w-7 h-7 m-0"
                                        />
                                    </button>
                                </div>
                                <div className="label">
                                    <span className="label-text-alt text-xs text-neutral-400">
                                        Password must be at least 8 characters long.
                                    </span>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="label ">
                                    <span className="label-text text-base text-neutral">
                                        Confirm Password
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Password"
                                        className="input input-bordered w-full"
                                        required
                                        defaultValue={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="btn btn-link absolute inset-y-0 right-0 flex items-center pr-3">
                                        <img
                                            src={showPassword ? eyeHideSVG : eyeSVG}
                                            alt="google logo"
                                            className="w-7 h-7 m-0"
                                        />
                                    </button>
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="label ">
                                    <span className="label-text text-base text-neutral">
                                        Enter OTP code
                                    </span>
                                    {isOtpSent ? (
                                        <span className="label-text-alt text-xs text-neutral-400">
                                            We've sent a code to your Email
                                        </span>
                                    ) : undefined}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="input input-bordered w-full mb-1"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            {alert ? (
                                <div className="mb-5">
                                    <Alert message={message.message} type={message.type} />
                                </div>
                            ) : undefined}

                            <button
                                type="submit"
                                className="btn btn-neutral w-full rounded-btn font-normal"
                                disabled={
                                    password === '' ||
                                    email === '' ||
                                    confirmPassword === '' ||
                                    password.length < 8 ||
                                    otp === ''
                                }>
                                {loading ? (
                                    <span className="loading loading-dots loading-md items-center"></span>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>
                        </form>
                    </article>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
