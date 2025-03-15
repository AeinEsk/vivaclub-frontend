import facebookSVG from '../../../assets/facebook.svg';
import eyeSVG from '../../../assets/eye.svg';
import eyeHideSVG from '../../../assets/eyeHide.svg';

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../contexts/Auth/AuthProvider';
import Alert from '../../../components/alert/Alert';
import { UserLogin } from '../../../@types/user';
import { PATHS } from '../../../routes/routes';
import GoogleAuthBtn from '../../../components/auth/GoogleAuthBtn';
import { AlertProps } from '../../../@types/alerts';

const SignIn = () => {
    const { handleLogin, loading } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState<boolean>(false);
    const [message, setMessage] = useState<AlertProps>({
        message: '',
        type: 'alert-error'
    });
    const [isValid, setIsValid] = useState<boolean>(false);
    const [signInForm, setSigninForm] = useState<UserLogin>({
        username: '',
        password: ''
    });

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleChanges = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        data: string
    ) => {
        setSigninForm((prevFormData) => ({
            ...prevFormData,
            [data]: e.target.value
        }));
        if (data === 'username') {
            setIsValid(validateEmail(e.target.value));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAlert(false);
        handleLogin(signInForm.username, signInForm.password)
            .then(() => {
                setAlert(false);
                setMessage({ message: '', type: 'simple' });
                navigate(PATHS.WELCOME);
            })
            .catch((error: any) => {
                setAlert(true);
                setMessage({ message: error, type: 'alert-error' });
                console.error('Login failed:', error);
                setTimeout(() => {
                    setMessage({ message: '', type: 'simple' });
                    setAlert(false);
                }, 3000);
            });
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleOtpButton = (email: string, btn: string) => {
        if (!isValid) {
            setMessage({
                message: 'Enter your Email address first',
                type: 'alert-warning'
            }),
                setAlert(true);
            setTimeout(() => {
                setMessage({ message: '', type: 'simple' });
                setAlert(false);
            }, 3000);
            return;
        } else if (btn === 'otp') {
            navigate(PATHS.OTP, { state: { email, state: 'login' } });
        } else if (btn === 'resetPass') {
            navigate(PATHS.RESET_PASS.replace(':email', email));
        }
    };

    return (
        <>
            <div className="flex items-center justify-center main bg-page-body min-h-screen">
                <div className="my-10 w-full max-w-sm rounded-2xl p-10 bg-white shadow-[0_0_50px_0_rgba(0,0,0,0.1)]">
                    <article className="prose">
                        <h3 className="text-center mb-1 text-primary">Sign In</h3>
                        <p className="text-center mb-[18px] text-sm font-normal text-secondary">
                            Please enter your details
                        </p>
                        <form className="mb-8" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="label">
                                    <span className="label-text font-light text-sm text-neutral">
                                        Email
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    className="appearance-none block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                    defaultValue={signInForm.username}
                                    onChange={(e) => handleChanges(e, 'username')}
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="label ">
                                    <span className="label-text font-light text-sm text-neutral">
                                        Password
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Password"
                                        className="appearance-none block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        defaultValue={signInForm.password}
                                        onChange={(e) => handleChanges(e, 'password')}
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

                            <div className="flex justify-between px-2">
                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary p-0"
                                    onClick={() =>
                                        handleOtpButton(signInForm.username, 'resetPass')
                                    }>
                                    Forgot password?
                                </button>

                                <button
                                    type="button"
                                    className="text-sm font-medium text-primary p-0"
                                    onClick={() => handleOtpButton(signInForm.username, 'otp')}>
                                    Login with OTP
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-8"
                                disabled={
                                    signInForm.password === '' ||
                                    signInForm.username === '' ||
                                    signInForm.password.length < 8
                                }>
                                {loading ? (
                                    <span className="loading loading-dots loading-md items-center"></span>
                                ) : (
                                    'Sign in'
                                )}
                            </button>

                            {alert ? (
                                <div className="mt-5">
                                    <Alert message={message.message} type={message.type} />
                                </div>
                            ) : undefined}
                        </form>

                        <div className="divider mb-4">OR</div>

                        <GoogleAuthBtn />

                        <button className="btn btn-outline border-border w-full mb-8 relative hover:bg-gray-50 hover:text-black text-gray-700 font-medium transition-colors duration-200">
                            <img
                                src={facebookSVG}
                                alt="facebook logo"
                                className="w-6 h-6 m-0 flex mr-2 absolute left-4"
                            />
                            <span>Continue with Facebook</span>
                        </button>

                        <div className="flex justify-center">
                            <p className="font-normal text-[gray]">
                                Don't have an account?
                                <Link to="/signup" className="mx-1 no-underline text-primary">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
};

export default SignIn;
