// import googleSVG from '../../../assets/google.svg';
import facebookSVG from '../../../assets/facebook.svg';
import eyeSVG from '../../../assets/eye.svg';
import eyeHideSVG from '../../../assets/eyeHide.svg';

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../../contexts/Auth/AuthProvider';
import Alert from '../../../components/alert/Alert';
import { PATHS } from '../../../routes/routes';
import GoogleAuthBtn from '../../../components/auth/GoogleAuthBtn';

const signUp = () => {
    const { loading } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [alert, setAlert] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleChanges = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        data: string
    ) => {
        if (data === 'email') {
            setEmail(e.target.value);
        }
        if (data === 'password') {
            setPassword(e.target.value);
        }
        if (data === 'confirmPassword') {
            setConfirmPassword(e.target.value);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setAlert(false);
            navigate(PATHS.OTP, { state: { email, password, state: 'register' } });
        } else {
            setAlert(true);
            setMessage('Passwords do not match!');
        }
    };

    return (
        <>
            <div className="flex items-center justify-center main bg-page-body min-h-screen">
            <div className="my-10 w-full max-w-sm rounded-2xl p-10 bg-white shadow-[0_0_50px_0_rgba(0,0,0,0.1)]">
            <article className="prose">
                        <h3 className="text-center text-primary mb-1">Sign Up</h3>
                        <p className="text-center mb-[18px] text-sm font-normal text-secondary">
                            Please enter your details
                        </p>
                        <form className="mb-8" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="label">
                                    <span className="label-text text-sm text-neutral">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    className="appearance-none block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                    defaultValue={email}
                                    onChange={(e) => handleChanges(e, 'email')}
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="label ">
                                    <span className="label-text text-sm text-neutral">
                                        Password
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Password"
                                        className="appearance-none block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        defaultValue={password}
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
                                <div className="label">
                                    <span className="label-text-alt text-xs text-neutral-400">
                                        Password must be at least 8 characters long.
                                    </span>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="label ">
                                    <span className="label-text text-sm text-neutral">
                                        Confirm Password
                                    </span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Password"
                                        className="appearance-none block w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        defaultValue={confirmPassword}
                                        onChange={(e) => handleChanges(e, 'confirmPassword')}
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
                            {alert ? (
                                <div className="mb-5">
                                    <Alert message={message} type={'alert-warning'} />
                                </div>
                            ) : undefined}

                            <button
                                type="submit"
                                className="btn btn-primary disabled:bg-none disabled:bg-gray-200 w-full"
                                disabled={
                                    password === '' ||
                                    email === '' ||
                                    confirmPassword === '' ||
                                    password.length < 8
                                }>
                                {loading ? (
                                    <span className="loading loading-dots loading-md items-center"></span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
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
                                Already have an account?
                                <Link to={PATHS.SIGNIN} className="mx-1 text-primary no-underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
};

export default signUp;
