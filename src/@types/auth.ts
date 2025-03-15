import { User } from './user';

export type Auth = {
    authToken?: boolean;
    currentUser?: User | null;
    handleLogin: (email: string, password: string) => Promise<string>;
    handleSignUp: (email: string, password: string, otp: string) => Promise<string>;
    handleLogout: () => Promise<void>;
    handleLoginWithGoogle: (email: string, token: string) => void;
    handleLoginWithOtp: (email: string, otp: string) => Promise<string>;
    handleResetPassword: (email: string, password: string, otp: string) => Promise<string>;
    loading: boolean;
};
