import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PATHS } from '../../routes/routes';
import Alert from '../../components/alert/Alert';
import { AlertProps } from '../../@types/alerts';

const CustomerSignIn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState<boolean>(false);
    const [message, setMessage] = useState<AlertProps>({
        message: '',
        type: 'alert-error'
    });
    const [isValid, setIsValid] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam && validateEmail(emailParam)) {
            setEmail(emailParam);
            setIsValid(true);
            navigate(`${PATHS.CUSTOMER_VERIFICATION}?email=${emailParam}`);
        }
    }, []);

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setIsValid(validateEmail(value));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValid) {
            setAlert(true);
            setMessage({
                message: 'Please enter a valid email address',
                type: 'alert-warning'
            });
            setTimeout(() => {
                setMessage({ message: '', type: 'simple' });
                setAlert(false);
            }, 3000);
            return;
        }
        navigate(`${PATHS.CUSTOMER_VERIFICATION}?email=${email}`);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
                <div className="mb-6">
                    <p className="text-lg font-bold mt-2">Customer Portal</p>
                    <p className="text-sm font-medium text-gray-500 mb-5">
                        Please enter your email to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter Email"
                        className="input input-bordered w-full mb-1"
                        required
                        value={email}
                        onChange={handleEmailChange}
                        disabled={loading}
                    />
                    
                    {alert && (
                        <Alert message={message.message} type={message.type} />
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-4"
                        disabled={!isValid || loading}
                    >
                        {loading ? (
                            <span className="loading loading-dots loading-md items-center"></span>
                        ) : (
                            'Continue'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CustomerSignIn;
