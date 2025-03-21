import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { drawPaymentRequest, packagePaymentRequest } from '../../api/payment';
import { DrawPayment, PackagePayment } from '../../@types/payment';
import card from '../../assets/card.svg';
import paypal from '../../assets/paypal.svg';
import { FaRegEnvelope } from 'react-icons/fa6';

const Total = () => {
    const location = useLocation();
    const { mode, drawId, numTickets, totalCost, currency, tireId } = location.state || {};
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(true);
    const [activeBtn, setActiveBtn] = useState<number>(0);
    const [toast, setToast] = useState<boolean>(false);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        setIsValid(validateEmail(value));
    };

    const handleCreatePayment = async () => {
        try {
            setLoading(true);
            setMessage('');

            if (mode === 'draw') {
                const paymentData: DrawPayment = {
                    count: numTickets,
                    drawId: drawId,
                    email: email,
                    paymentMethod: paymentMethod
                };
                const { data } = await drawPaymentRequest(paymentData);
                if (data?.paymentUrl) {
                    window.location.replace(data?.paymentUrl);
                } else {
                    setToast(true);
                    setTimeout(() => setToast(false), 3000);
                }
            } else if (mode === 'package') {
                const paymentData: PackagePayment = {
                    membershipTireId: tireId,
                    email: email,
                    paymentMethod: paymentMethod
                };
                const { data } = await packagePaymentRequest(paymentData);
                if (data?.paymentUrl) {
                    window.location.replace(data?.paymentUrl);
                } else {
                    setToast(true);
                    setTimeout(() => setToast(false), 3000);
                }
            }
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            setMessage(error?.response?.data?.error || 'An unexpected error occurred');
            console.error(error.response);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            {totalCost ? (
                <div className="w-full max-w-sm">
                    <div className="shadow-xl rounded-2xl border border-border/30 bg-white overflow-hidden">
                        <header className="bg-primary-gradient px-3 py-5 text-left">
                            <p className="text-white font-bold mb-1">Payment Details</p>
                            <p className="text-white text-xs">Complete your purchase securely</p>
                        </header>
                        <div className="p-5">
                            <div className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl">
                                <div>Total Amount</div>
                                <div className="text-primary font-bold text-[28px]">
                                    <span className="text-secondary text-xs font-semibold">
                                        {currency}
                                    </span>{' '}
                                    {totalCost}
                                </div>
                            </div>

                            <h4 className="font-bold text-sm text-left my-5">
                                Select Payment Method
                            </h4>
                            {message && <p className="text-red-500 text-sm mt-2">{message}</p>}

                            <div className="w-full mt-5 flex flex-col gap-3">
                                <button
                                    className={`btn ${activeBtn === 1 ? 'bg-primary/5 border-primary/20 text-[#6D28D9]' : 'btn-outline'} w-full rounded-btn border-border flex justify-start relative hover:bg-primary/20 hover:text-black`}
                                    onClick={() => {
                                        setActiveBtn(1);
                                        setPaymentMethod('card');
                                    }}
                                    disabled={loading}>
                                    <img
                                        src={card}
                                        alt="credit card"
                                        className="w-6 h-6 m-0 flex mr-2"
                                    />
                                    <span>Credit Card</span>
                                </button>
                                <button
                                    className={`btn ${activeBtn === 2 ? 'bg-primary/5 border-primary/20 text-[#6D28D9]' : 'btn-outline'} w-full rounded-btn border-border flex justify-start relative hover:bg-primary/20 hover:text-black`}
                                    onClick={() => {
                                        setActiveBtn(2);
                                        setPaymentMethod('paypal');
                                    }}
                                    disabled={loading}>
                                    <img
                                        src={paypal}
                                        alt="paypal"
                                        className="w-6 h-6 m-0 flex mr-2"
                                    />
                                    <span>PayPal</span>
                                </button>
                            </div>

                            <div className="mt-5">
                                <div className="mb-2 text-left">
                                    <span className="text-left">Email Address</span>
                                </div>
                                <label className="input input-bordered flex items-center gap-2">
                                    <FaRegEnvelope className="text-gray-400" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="grow"
                                        value={email}
                                        onChange={handleEmailChange}
                                        disabled={activeBtn === 0}
                                    />
                                </label>

                                <div className="label">
                                    <span className="label-text-alt text-left text-red-500 flex flex-col">
                                        <p>{!isValid && `Please enter a valid email address.`}</p>
                                        <p>{message !== '' && message}</p>
                                    </span>
                                </div>

                                <div className="form-control mt-4">
                                    <label className="flex gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-sm rounded-sm"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        />
                                        <span className="label-text text-secondary ml-2">
                                            I agree to the{' '}
                                            <a
                                                href="https://vivaclub.io/terms-conditions"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                                onClick={(e) => e.stopPropagation()}>
                                                Terms and Conditions
                                            </a>
                                        </span>
                                    </label>
                                </div>

                                <button
                                    disabled={
                                        !isValid ||
                                        email === '' ||
                                        activeBtn === 0 ||
                                        !acceptedTerms
                                    }
                                    type="button"
                                    className="btn btn-primary w-full mt-4"
                                    onClick={handleCreatePayment}>
                                    {loading ? (
                                        <span className="loading loading-dots loading-md items-center"></span>
                                    ) : (
                                        'Complete Payment'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-xl">Error !</div>
            )}
            {toast && (
                <div className="toast toast-start">
                    <div className="alert alert-warning">
                        <span>Warning: Try again later</span>
                    </div>
                </div>
            )}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="loading loading-spinner loading-lg text-white"></div>
                </div>
            )}
        </div>
    );
};

export default Total;
