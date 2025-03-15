import { getMe, login, resetPassword } from '../../api/auth';
import { User } from '../../@types/user';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../utils/axios';
import { Auth } from '../../@types/auth';
import { PATHS } from '../../routes/routes';
import { otpLogin, otpRegister } from '../../api/otp';

const AuthContext = createContext<Auth | undefined>(undefined);

type AuthProviderProps = PropsWithChildren;

export default function AuthProvider({ children }: AuthProviderProps) {
    const navigate = useNavigate();
    const [authToken, setAuthToken] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<User | null>();
    const [loading, setLoading] = useState(true);

    const handleSetAuthToken = (email: string, token: string) => {
        const authToken = 'Bearer ' + token;
        setAuthToken(!!token);
        axiosInstance.defaults.headers.common['Authorization'] = authToken;
        localStorage.setItem('Token', authToken);
        localStorage.setItem('UserEmail', email);
        setCurrentUser({
            email: email,
            isAuthenticated: true,
            imageUrl: '',
            isStipeConnected: true,
            stripeId: '',
            stripeData: undefined
        });
    };

    // when user Refresh the page :
    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);
            const token = localStorage.getItem('Token');

            if (token) {
                axiosInstance.defaults.headers.common['Authorization'] = token;
                setAuthToken(!!token);

                try {
                    const { data, status } = await getMe();
                    if (status === 200) {
                        setCurrentUser({
                            email: data?.username,
                            isAuthenticated: data?.isVerified,
                            imageUrl: data?.picture,
                            isStipeConnected: data?.isStipeConnected,
                            stripeId: data?.stripeId,
                            stripeData: data?.stripeData
                        });
                    } else {
                        handleLogout();
                    }
                } catch (error: any) {
                    console.error('Error fetching user data:', error.response || error);
                    handleLogout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, [authToken]);

    const handleLogin = async (email: string, password: string): Promise<string> => {
        try {
            setLoading(true);
            const { data, status } = await login(email, password);
            if (status === 200) {
                handleSetAuthToken(email, data?.token);
                setLoading(false);
                return 'success';
            } else {
                setLoading(false);
                return 'Error';
            }
        } catch (error: any) {
            setLoading(false);
            setAuthToken(false);
            setCurrentUser({
                email: '',
                isAuthenticated: false,
                imageUrl: '',
                isStipeConnected: false,
                stripeId: '',
                stripeData: undefined
            });
            if (!error?.response) {
                return Promise.reject('No Server Response');
            } else if (error.response?.status === 400) {
                return Promise.reject('Invalid email or password');
            } else if (error.response?.status === 401) {
                return Promise.reject('Invalid username or password');
            } else {
                return Promise.reject('Login Failed');
            }
        }
    };

    const handleLoginWithGoogle = async (email: string, token: string) => {
        try {
            setLoading(true);
            handleSetAuthToken(email, token);
            navigate(PATHS.WELCOME);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            //
        }
    };

    const handleLoginWithOtp = async (email: string, otp: string): Promise<string> => {
        try {
            setLoading(true);
            const { status, data } = await otpLogin(email, otp);
            if (status === 200) {
                handleSetAuthToken(email, data?.token);
                navigate(PATHS.WELCOME);
                setLoading(false);
            }
            return 'success';
        } catch (error: any) {
            setLoading(false);
            console.error(error);
            if (!error?.response) {
                return Promise.reject('No Server Response');
            } else if (error.response?.status === 401) {
                return Promise.reject('Invalid OTP!');
            } else {
                return Promise.reject('Login Failed');
            }
        }
    };

    const handleSignUp = async (email: string, password: string, otp: string): Promise<string> => {
        try {
            setLoading(true);
            const { status, data } = await otpRegister(email, password, otp);
            if (status === 200) {
                handleSetAuthToken(email, data?.token);
                navigate(PATHS.WELCOME);
                setLoading(false);
            }
            return 'success';
        } catch (error: any) {
            setLoading(false);
            setAuthToken(false);
            setCurrentUser({
                email: '',
                isAuthenticated: false,
                imageUrl: '',
                isStipeConnected: false,
                stripeId: '',
                stripeData: undefined
            });
            if (!error?.response) {
                return Promise.reject('No Server Response');
            } else if (error.response?.status === 401) {
                return Promise.reject('Invalid OTP!');
            } else {
                return Promise.reject('SignUp Failed');
            }
        }
    };

    const handleResetPassword = async (
        username: string,
        password: string,
        otp: string
    ): Promise<string> => {
        try {
            setLoading(true);
            const { status, data } = await resetPassword(username, password, otp);
            if (status === 200) {
                handleSetAuthToken(username, data?.token);
                navigate(PATHS.WELCOME);
                setLoading(false);
            }
            return 'success';
        } catch (error: any) {
            setLoading(false);
            console.error(error);
            if (!error?.response) {
                return Promise.reject('No Server Response');
            } else if (error.response?.status === 401) {
                return Promise.reject('Invalid OTP!');
            } else {
                return Promise.reject('Resset Password Failed');
            }
        }
    };

    async function handleLogout() {
        setAuthToken(false);
        localStorage.removeItem('Token');
        localStorage.removeItem('UserEmail');
        delete axiosInstance.defaults.headers.common['Authorization'];
        setCurrentUser({
            email: '',
            isAuthenticated: false,
            imageUrl: '',
            isStipeConnected: false,
            stripeId: '',
            stripeData: undefined
        });
        navigate(PATHS.SIGNIN);
    }

    return (
        <AuthContext.Provider
            value={{
                authToken,
                currentUser,
                handleLogin,
                handleLogout,
                handleSignUp,
                handleLoginWithGoogle,
                handleLoginWithOtp,
                handleResetPassword,
                loading
            }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used inside of a AuthProvider');
    }

    return context;
}
